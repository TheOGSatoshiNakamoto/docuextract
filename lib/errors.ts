import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiError, ErrorCode } from './types.js';

// ─── Error builders ───────────────────────────────────────────────────────────

export function makeError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ApiError {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}

// ─── HTTP status map ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<ErrorCode, number> = {
  unauthorized:       401,
  forbidden:          403,
  not_found:          404,
  rate_limited:       429,
  invalid_request:    400,
  file_too_large:     413,
  unsupported_format: 415,
  extraction_failed:  422,
  internal_error:     500,
};

// ─── Response helpers ─────────────────────────────────────────────────────────

/**
 * Send a standardized error response. All API errors MUST go through this.
 */
export function sendError(
  res: VercelResponse,
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): void {
  res.status(STATUS_MAP[code]).json(makeError(code, message, details));
}

/**
 * Convenience: send a 401 Unauthorized response.
 */
export function sendUnauthorized(res: VercelResponse, message = 'Invalid or missing API key'): void {
  sendError(res, 'unauthorized', message);
}

/**
 * Convenience: send a 429 Too Many Requests response with rate-limit headers.
 */
export function sendRateLimited(
  res: VercelResponse,
  retryAfterSeconds: number,
  message = 'Rate limit exceeded',
): void {
  res.setHeader('Retry-After', String(retryAfterSeconds));
  sendError(res, 'rate_limited', message);
}

/**
 * Convenience: send a 400 Invalid Request response.
 */
export function sendInvalidRequest(
  res: VercelResponse,
  message: string,
  details?: Record<string, unknown>,
): void {
  sendError(res, 'invalid_request', message, details);
}

/**
 * Convenience: send a 500 Internal Server Error response.
 * Logs the original error but never exposes internals to callers.
 */
export function sendInternalError(res: VercelResponse, err?: unknown): void {
  if (err !== undefined) {
    // Structured log picked up by Vercel observability
    console.error(JSON.stringify({ level: 'error', message: 'Unhandled error', error: String(err) }));
  }
  sendError(res, 'internal_error', 'An unexpected error occurred. Please try again.');
}

/**
 * Method-not-allowed helper. Use at the top of every handler.
 */
export function methodNotAllowed(req: VercelRequest, res: VercelResponse, allowed: string[]): boolean {
  if (!allowed.includes(req.method ?? '')) {
    res.setHeader('Allow', allowed.join(', '));
    sendError(res, 'invalid_request', `Method ${req.method} not allowed`);
    return true;
  }
  return false;
}
