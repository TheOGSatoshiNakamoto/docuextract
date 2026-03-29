import 'server-only';
import * as Sentry from '@sentry/node';

// Initialize Sentry once at module load. Safe to call multiple times (idempotent).
// If SENTRY_DSN is not set, Sentry remains in no-op mode — no errors thrown.
if (process.env['SENTRY_DSN']) {
  Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    environment: process.env['NODE_ENV'] ?? 'production',
    // Capture 100% of errors (not transactions/performance tracing)
    tracesSampleRate: 0,
  });
}

/**
 * Report an error to Sentry. No-op if SENTRY_DSN is not configured.
 */
export function captureException(err: unknown): void {
  if (process.env['SENTRY_DSN']) {
    Sentry.captureException(err);
  }
}
