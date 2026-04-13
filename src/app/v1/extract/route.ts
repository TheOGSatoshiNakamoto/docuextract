import { type NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, rateLimitHeaders } from '@/lib/ratelimit';
import { processDocumentInput, ValidationError } from '@/lib/documents/input';
import { detectDocumentType } from '@/lib/documents/detect';
import { extractDocument, ExtractionError } from '@/lib/extraction/engine';
import { logUsage, getMonthlyUsageCount, checkUsageThresholds } from '@/lib/usage';
import { reportUsageToStripe } from '@/lib/billing';
import {
  errorResponse,
  errorUnauthorized,
  errorRateLimited,
  errorInvalidRequest,
  errorInternal,
} from '@/lib/errors';
import { captureException } from '@/lib/sentry';
import { inngest } from '@/inngest/client';
import type { ExtractRequest, DocumentType, ModelMode } from '@/lib/types';
import { PLANS, SONNET_MULTIPLIER } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Output sanitization ─────────────────────────────────────────────────────
// Claude's extracted JSON goes directly to developers. Sanitize to prevent:
// - XSS vectors in string values (developers might render without escaping)
// - Internal/debug fields leaking prompt details
// - Excessive nesting that could crash downstream parsers
// - Non-finite numbers (NaN, Infinity)

const BLOCKED_KEYS = new Set(['_debug', '_prompt', '_system', '_internal', 'system_prompt']);
const MAX_DEPTH = 10;

function sanitizeExtractionOutput(data: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > MAX_DEPTH) return {};
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (BLOCKED_KEYS.has(key.toLowerCase())) continue;

    if (value === null || value === undefined) {
      result[key] = null;
    } else if (typeof value === 'string') {
      // Strip HTML tags to prevent XSS when developers render extracted text
      result[key] = value.replace(/<[^>]*>/g, '');
    } else if (typeof value === 'number') {
      result[key] = Number.isFinite(value) ? value : null;
    } else if (typeof value === 'boolean') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (item != null && typeof item === 'object' && !Array.isArray(item)) {
          return sanitizeExtractionOutput(item as Record<string, unknown>, depth + 1);
        }
        if (typeof item === 'string') return item.replace(/<[^>]*>/g, '');
        if (typeof item === 'number') return Number.isFinite(item) ? item : null;
        return item;
      });
    } else if (typeof value === 'object') {
      result[key] = sanitizeExtractionOutput(value as Record<string, unknown>, depth + 1);
    }
  }
  return result;
}

const VALID_TYPES = new Set<DocumentType>([
  'invoice', 'receipt', 'bank_statement', 'resume',
  'contract', 'form', 'id_document', 'unknown',
]);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestStart = Date.now();
  const endpoint = '/v1/extract';

  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const auth = await authenticateRequest(request);
  if (!auth.ok) return errorUnauthorized(auth.message);
  const { user } = auth;

  // ── 2. Rate limiting ─────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(user.id, user.plan);
  const rlHeaders = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    void logUsage({
      user_id: user.id, endpoint, document_type: null, model_used: 'none',
      input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
      confidence_score: null, status: 'rate_limited', error_message: 'Rate limit exceeded',
    });

    // Distinguish monthly cap (free users hard-blocked) from per-minute rate limit
    const isMonthlyLimit = rateLimit.remainingMonth <= 0;
    const rlPlanConfig = PLANS[user.plan as keyof typeof PLANS];
    const message = isMonthlyLimit && user.plan === 'free'
      ? `You've reached your ${rlPlanConfig.extractions} extraction limit for this month. Upgrade to Starter for ${PLANS.starter.extractions.toLocaleString()} monthly extractions.`
      : `Rate limit exceeded: ${rlPlanConfig.rateLimit} requests per minute on your ${rlPlanConfig.name} plan.`;

    const resp = errorRateLimited(60, message);
    Object.entries(rlHeaders).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  // ── 3. Parse request body ─────────────────────────────────────────────────
  let body: Partial<ExtractRequest>;
  try {
    body = await request.json() as Partial<ExtractRequest>;
  } catch {
    return errorInvalidRequest('Invalid JSON body');
  }

  if (!body?.document) {
    return errorInvalidRequest('Missing required field: document');
  }

  const modelMode: ModelMode = body.model === 'accurate' ? 'accurate' : 'fast';

  // Block free users from Sonnet
  const planConfig = PLANS[user.plan as keyof typeof PLANS];

  // Block free users from Sonnet
  if (modelMode === 'accurate' && !planConfig.sonnetAccess) {
    return errorResponse(
      'forbidden',
      'Sonnet model is not available on the Free plan. Upgrade to Starter ($49/mo) for Sonnet access.',
    );
  }

  if (body.type !== undefined && !VALID_TYPES.has(body.type)) {
    return errorInvalidRequest(
      `Invalid document type: "${body.type}". Valid values: ${Array.from(VALID_TYPES).join(', ')}`,
    );
  }

  // ── 4. Process document input ─────────────────────────────────────────────
  let processed;
  try {
    processed = await processDocumentInput(body.document);
  } catch (err) {
    if (err instanceof ValidationError) {
      void logUsage({
        user_id: user.id, endpoint, document_type: null, model_used: 'none',
        input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
        confidence_score: null, status: 'error', error_message: err.message,
      });
      return errorResponse(err.code, err.message);
    }
    captureException(err);
    return errorInternal(err);
  }

  // ── 5. Detect document type (if caller did not specify) ───────────────────
  let documentType: DocumentType;
  if (body.type) {
    documentType = body.type;
  } else {
    const detection = await detectDocumentType(processed);
    documentType = detection.type;
  }

  // ── 6. Extract ────────────────────────────────────────────────────────────
  let result;
  try {
    result = await extractDocument(processed, {
      model: modelMode,
      type: documentType,
      customSchema: body.schema,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    void logUsage({
      user_id: user.id, endpoint, document_type: documentType,
      model_used: modelMode === 'accurate' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
      input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
      confidence_score: null, status: 'error', error_message: errMsg,
    });
    void inngest.send({
      name: 'docuextract/extraction.failed',
      data: { userId: user.id, status: 'failed', error: errMsg, documentType },
    }).catch(() => {});
    if (err instanceof ExtractionError) {
      return errorResponse('extraction_failed', 'Document extraction failed. Please try again.');
    }
    captureException(err);
    return errorInternal(err);
  }

  // ── 7. Log successful usage and report overage to Stripe ─────────────────
  // Await logUsage for success to get the external_id for the API response.
  const externalId = await logUsage({
    user_id: user.id, endpoint, document_type: documentType,
    model_used: result.modelUsed,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    processing_time_ms: result.processingTimeMs,
    confidence_score: result.confidence,
    status: 'success',
    error_message: null,
  });

  // Emit webhook event via Inngest (~5ms, non-blocking queue)
  void inngest.send({
    name: 'docuextract/extraction.completed',
    data: {
      userId: user.id,
      extractionId: externalId,
      status: 'success',
      confidence: result.confidence,
      documentType,
    },
  }).catch((err) => {
    console.error(JSON.stringify({ level: 'error', message: 'Inngest send failed', error: String(err) }));
  });

  // Check usage thresholds for webhook notifications (fire-and-forget)
  void checkUsageThresholds(user.id, user.monthly_limit);

  // Sonnet calls deduct 3 extractions from the plan allocation
  const usageDeduction = modelMode === 'accurate' ? SONNET_MULTIPLIER : 1;

  // Overage reporting: fire-and-forget, never blocks the response.
  // Free users are hard-blocked at their cap — no Stripe reporting needed.
  if (user.plan !== 'free' && user.stripe_customer_id) {
    void (async () => {
      try {
        const monthlyCount = await getMonthlyUsageCount(user.id);
        if (monthlyCount >= user.monthly_limit) {
          // Report overage quantity (Sonnet overage = 3x base overage rate)
          await reportUsageToStripe(user.stripe_customer_id as string, usageDeduction);
        }
      } catch (err) {
        console.error(JSON.stringify({
          level: 'error', message: 'Overage check failed', userId: user.id, error: String(err),
        }));
      }
    })();
  }

  // ── 8. Sanitize output and respond ─────────────────────────────────────────
  // Claude is an LLM — its JSON output can contain anything. Sanitize before
  // sending to developers to prevent prompt leakage, XSS vectors in extracted
  // text, and out-of-range metadata values.
  const sanitizedData = sanitizeExtractionOutput(result.data);
  const clampedConfidence = Math.max(0, Math.min(1, Math.round(result.confidence * 1000) / 1000));
  const safeProcessingTime = Number.isFinite(result.processingTimeMs) ? result.processingTimeMs : 0;

  const resp = NextResponse.json({
    data: sanitizedData,
    metadata: {
      extraction_id: externalId ?? undefined,
      type: documentType,
      confidence: clampedConfidence,
      model: result.modelUsed,
      processing_time_ms: safeProcessingTime,
      page_count: 1,
    },
  });
  Object.entries(rlHeaders).forEach(([k, v]) => resp.headers.set(k, v));
  resp.headers.set('X-Plan-Limit', String(user.monthly_limit));
  if (modelMode === 'accurate') {
    resp.headers.set('X-Sonnet-Multiplier', String(SONNET_MULTIPLIER));
  }
  return resp;
}
