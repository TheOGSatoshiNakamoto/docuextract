import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../lib/auth.js';
import { checkRateLimit, rateLimitHeaders } from '../../lib/ratelimit.js';
import { processDocumentInput, ValidationError } from '../../lib/documents/input.js';
import { detectDocumentType } from '../../lib/documents/detect.js';
import { extractDocument, ExtractionError } from '../../lib/extraction/engine.js';
import { logUsage } from '../../lib/usage.js';
import {
  methodNotAllowed,
  sendError,
  sendUnauthorized,
  sendRateLimited,
  sendInvalidRequest,
  sendInternalError,
} from '../../lib/errors.js';
import type { ExtractRequest, DocumentType, ModelMode } from '../../lib/types.js';

const VALID_TYPES = new Set<DocumentType>([
  'invoice', 'receipt', 'bank_statement', 'resume',
  'contract', 'form', 'id_document', 'unknown',
]);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (methodNotAllowed(req, res, ['POST'])) return;

  const requestStart = Date.now();
  const endpoint = '/v1/extract';

  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const auth = await authenticateRequest(req);
  if (!auth.ok) {
    sendUnauthorized(res, auth.message);
    return;
  }
  const { user } = auth;

  // ── 2. Rate limiting ─────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(user.id, user.plan);
  Object.entries(rateLimitHeaders(rateLimit)).forEach(([k, v]) => res.setHeader(k, v));

  if (!rateLimit.allowed) {
    void logUsage({
      user_id: user.id, endpoint, document_type: null, model_used: 'none',
      input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
      confidence_score: null, status: 'rate_limited', error_message: 'Rate limit exceeded',
    });
    sendRateLimited(res, 60);
    return;
  }

  // ── 3. Parse request body ─────────────────────────────────────────────────
  const body = req.body as Partial<ExtractRequest> | undefined;

  if (!body?.document) {
    sendInvalidRequest(res, 'Missing required field: document');
    return;
  }

  const modelMode: ModelMode = body.model === 'accurate' ? 'accurate' : 'fast';

  if (body.type !== undefined && !VALID_TYPES.has(body.type)) {
    sendInvalidRequest(
      res,
      `Invalid document type: "${body.type}". Valid values: ${[...VALID_TYPES].join(', ')}`,
    );
    return;
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
      sendError(res, err.code, err.message);
      return;
    }
    sendInternalError(res, err);
    return;
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
    if (err instanceof ExtractionError) {
      sendError(res, 'extraction_failed', 'Document extraction failed. Please try again.');
    } else {
      sendInternalError(res, err);
    }
    return;
  }

  // ── 7. Log successful usage ───────────────────────────────────────────────
  void logUsage({
    user_id: user.id, endpoint, document_type: documentType,
    model_used: result.modelUsed,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    processing_time_ms: result.processingTimeMs,
    confidence_score: result.confidence,
    status: 'success',
    error_message: null,
  });

  // ── 8. Respond ────────────────────────────────────────────────────────────
  res.status(200).json({
    data: result.data,
    metadata: {
      type: documentType,
      confidence: result.confidence,
      model: result.modelUsed,
      processing_time_ms: result.processingTimeMs,
      page_count: 1,
    },
  });
}
