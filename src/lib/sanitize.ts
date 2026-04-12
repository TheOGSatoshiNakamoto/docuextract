/**
 * Data sanitization utilities for dashboard responses.
 *
 * These run at the boundary between Supabase queries and React components.
 * They ensure every field has a safe, renderable value — no NaN, no undefined,
 * no unexpected types that would crash math or .toLocaleString() calls.
 *
 * Not a validation library — just guard rails. If the data is wrong, we
 * surface safe defaults so the page renders, rather than crashing.
 */

// ── API Usage Row ─────────────────────────────────────────────────────────────

export interface SafeApiUsageRow {
  id: string;
  external_id: string | null;
  document_type: string;
  status: string;
  processing_time_ms: number | null;
  confidence_score: number | null;
  created_at: string;
  model_used: string;
  input_tokens: number | null;
  output_tokens: number | null;
  error_message: string | null;
}

export function sanitizeApiUsageRow(row: Record<string, unknown>): SafeApiUsageRow {
  return {
    id: String(row.id ?? ''),
    external_id: row.external_id != null ? String(row.external_id) : null,
    document_type: String(row.document_type ?? 'generic'),
    status: String(row.status ?? 'error'),
    processing_time_ms: safeNumber(row.processing_time_ms),
    confidence_score: safeConfidence(row.confidence_score),
    created_at: safeDate(row.created_at),
    model_used: String(row.model_used ?? 'haiku'),
    input_tokens: safeNumber(row.input_tokens),
    output_tokens: safeNumber(row.output_tokens),
    error_message: row.error_message != null ? String(row.error_message) : null,
  };
}

export function sanitizeApiUsageRows(rows: unknown[]): SafeApiUsageRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => sanitizeApiUsageRow(r as Record<string, unknown>));
}

// ── User Data ─────────────────────────────────────────────────────────────────

export interface SafeUserData {
  api_key: string | null;
  plan: string;
  monthly_limit: number;
  created_at: string | null;
}

const VALID_PLANS = ['free', 'starter', 'pro', 'scale'];

export function sanitizeUserData(data: Record<string, unknown> | null): SafeUserData | null {
  if (!data) return null;
  const plan = String(data.plan ?? 'free');
  return {
    api_key: data.api_key != null ? String(data.api_key) : null,
    plan: VALID_PLANS.includes(plan) ? plan : 'free',
    monthly_limit: safePositiveInt(data.monthly_limit, 100),
    created_at: data.created_at != null ? safeDate(data.created_at) : null,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a number or null. Never NaN, never Infinity. */
function safeNumber(val: unknown): number | null {
  if (val == null) return null;
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Confidence must be between 0 and 1. Handles both 0-1 and 0-100 formats. */
function safeConfidence(val: unknown): number | null {
  const n = safeNumber(val);
  if (n == null) return null;
  // If value is > 1, assume it's a percentage and normalize to 0-1
  if (n > 1 && n <= 100) return n / 100;
  if (n < 0 || n > 100) return null;
  return n;
}

/** Returns a positive integer, or a fallback. Protects against division by zero. */
function safePositiveInt(val: unknown, fallback: number): number {
  const n = safeNumber(val);
  if (n == null || n <= 0 || !Number.isInteger(n)) return fallback;
  return n;
}

/** Returns an ISO date string. Falls back to epoch if unparseable. */
function safeDate(val: unknown): string {
  if (typeof val === 'string' && val.length > 0) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return val;
  }
  return new Date(0).toISOString();
}
