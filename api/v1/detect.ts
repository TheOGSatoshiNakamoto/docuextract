import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../lib/auth.js';
import { checkRateLimit, rateLimitHeaders } from '../../lib/ratelimit.js';
import { processDocumentInput, ValidationError } from '../../lib/documents/input.js';
import { detectDocumentType } from '../../lib/documents/detect.js';
import { logUsage } from '../../lib/usage.js';
import {
  methodNotAllowed,
  sendError,
  sendUnauthorized,
  sendRateLimited,
  sendInvalidRequest,
  sendInternalError,
} from '../../lib/errors.js';
import type { DetectRequest } from '../../lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (methodNotAllowed(req, res, ['POST'])) return;

  const requestStart = Date.now();
  const endpoint = '/v1/detect';

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
      user_id: user.id, endpoint, document_type: null, model_used: 'claude-haiku-4-5-20251001',
      input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
      confidence_score: null, status: 'rate_limited', error_message: 'Rate limit exceeded',
    });
    sendRateLimited(res, 60);
    return;
  }

  // ── 3. Parse body ─────────────────────────────────────────────────────────
  const body = req.body as Partial<DetectRequest> | undefined;
  if (!body?.document) {
    sendInvalidRequest(res, 'Missing required field: document');
    return;
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
      sendError(res, err.code, err.message);
      return;
    }
    sendInternalError(res, err);
    return;
  }

  // ── 5. Detect type ────────────────────────────────────────────────────────
  const detection = await detectDocumentType(processed);

  void logUsage({
    user_id: user.id, endpoint, document_type: detection.type,
    model_used: 'claude-haiku-4-5-20251001',
    input_tokens: null, output_tokens: null, processing_time_ms: Date.now() - requestStart,
    confidence_score: detection.confidence, status: 'success', error_message: null,
  });

  res.status(200).json({ type: detection.type, confidence: detection.confidence });
}
