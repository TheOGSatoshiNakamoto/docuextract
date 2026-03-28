import { type NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, rateLimitHeaders } from '@/lib/ratelimit';
import { processDocumentInput, ValidationError } from '@/lib/documents/input';
import { detectDocumentType } from '@/lib/documents/detect';
import { logUsage } from '@/lib/usage';
import {
  errorResponse,
  errorUnauthorized,
  errorRateLimited,
  errorInvalidRequest,
  errorInternal,
} from '@/lib/errors';
import type { DetectRequest } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestStart = Date.now();
  const endpoint = '/v1/detect';

  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const auth = await authenticateRequest(request);
  if (!auth.ok) return errorUnauthorized(auth.message);
  const { user } = auth;

  // ── 2. Rate limiting ─────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(user.id, user.plan);
  const rlHeaders = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    void logUsage({
      user_id: user.id, endpoint, document_type: null, model_used: 'claude-haiku-4-5-20251001',
      input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
      confidence_score: null, status: 'rate_limited', error_message: 'Rate limit exceeded',
    });
    const resp = errorRateLimited(60);
    Object.entries(rlHeaders).forEach(([k, v]) => resp.headers.set(k, v));
    return resp;
  }

  // ── 3. Parse body ─────────────────────────────────────────────────────────
  let body: Partial<DetectRequest>;
  try {
    body = await request.json() as Partial<DetectRequest>;
  } catch {
    return errorInvalidRequest('Invalid JSON body');
  }

  if (!body?.document) {
    return errorInvalidRequest('Missing required field: document');
  }

  // ── 4. Process document input ─────────────────────────────────────────────
  let processed;
  try {
    processed = await processDocumentInput(body.document);
  } catch (err) {
    if (err instanceof ValidationError) {
      void logUsage({
        user_id: user.id, endpoint, document_type: null, model_used: 'claude-haiku-4-5-20251001',
        input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
        confidence_score: null, status: 'error', error_message: err.message,
      });
      return errorResponse(err.code, err.message);
    }
    return errorInternal(err);
  }

  // ── 5. Detect type ────────────────────────────────────────────────────────
  const detection = await detectDocumentType(processed);

  void logUsage({
    user_id: user.id, endpoint, document_type: detection.type,
    model_used: 'claude-haiku-4-5-20251001',
    input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
    confidence_score: detection.confidence, status: 'success', error_message: null,
  });

  const resp = NextResponse.json({ type: detection.type, confidence: detection.confidence });
  Object.entries(rlHeaders).forEach(([k, v]) => resp.headers.set(k, v));
  return resp;
}
