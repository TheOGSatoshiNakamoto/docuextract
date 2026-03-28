import 'server-only';
import { NextResponse } from 'next/server';
import type { ApiError, ErrorCode } from './types';

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
 * Returns a standardized error NextResponse. All API errors MUST go through this.
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(makeError(code, message, details), { status: STATUS_MAP[code] });
}

/**
 * Convenience: 401 Unauthorized response.
 */
export function errorUnauthorized(message = 'Invalid or missing API key'): NextResponse {
  return errorResponse('unauthorized', message);
}

/**
 * Convenience: 429 Too Many Requests with Retry-After header.
 */
export function errorRateLimited(
  retryAfterSeconds: number,
  message = 'Rate limit exceeded',
): NextResponse {
  const response = errorResponse('rate_limited', message);
  response.headers.set('Retry-After', String(retryAfterSeconds));
  return response;
}

/**
 * Convenience: 400 Invalid Request response.
 */
export function errorInvalidRequest(
  message: string,
  details?: Record<string, unknown>,
): NextResponse {
  return errorResponse('invalid_request', message, details);
}

/**
 * Convenience: 500 Internal Server Error.
 * Logs the original error but never exposes internals to callers.
 */
export function errorInternal(err?: unknown): NextResponse {
  if (err !== undefined) {
    console.error(JSON.stringify({ level: 'error', message: 'Unhandled error', error: String(err) }));
  }
  return errorResponse('internal_error', 'An unexpected error occurred. Please try again.');
}
