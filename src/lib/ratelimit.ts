import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Plan, RateLimitResult } from './types';
import { PLAN_LIMITS } from './types';

// ─── Supabase client ──────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Rate limit check ─────────────────────────────────────────────────────────

/**
 * Atomically increments request counters and checks both rate limit windows.
 *
 * Checks the per-minute window first (cheapest rejection), then monthly.
 * Uses a single SQL upsert so there are no race conditions between read and write.
 *
 * Returns a RateLimitResult — caller must check `.allowed` before proceeding.
 */
export async function checkRateLimit(userId: string, plan: Plan): Promise<RateLimitResult> {
  const limits = PLAN_LIMITS[plan];
  const now = new Date();

  const { data, error } = await getSupabaseAdmin().rpc('check_and_increment_rate_limit', {
    p_user_id: userId,
    p_minute_limit: limits.perMinute,
    p_month_limit: limits.perMonth,
    p_now: now.toISOString(),
  });

  if (error) {
    // Fail open — don't block requests if rate limit DB is unavailable.
    console.error(JSON.stringify({ level: 'error', message: 'Rate limit check failed', error: error.message, userId }));
    return {
      allowed: true,
      limitMinute: limits.perMinute,
      remainingMinute: limits.perMinute,
      limitMonth: limits.perMonth,
      remainingMonth: limits.perMonth,
      resetMinuteAt: new Date(now.getTime() + 60_000).toISOString(),
      resetMonthAt: getMonthResetDate(now).toISOString(),
    };
  }

  const result = data as RateLimitRpcResult;

  return {
    allowed: result.allowed,
    limitMinute: limits.perMinute,
    remainingMinute: Math.max(0, limits.perMinute - result.requests_this_minute),
    limitMonth: limits.perMonth,
    remainingMonth: Math.max(0, limits.perMonth - result.requests_this_month),
    resetMinuteAt: result.minute_reset_at,
    resetMonthAt: result.month_reset_at,
  };
}

// ─── Response headers helper ──────────────────────────────────────────────────

/**
 * Returns the standard rate-limit headers to attach to every API response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit-Minute':     String(result.limitMinute),
    'X-RateLimit-Remaining-Minute': String(result.remainingMinute),
    'X-RateLimit-Limit-Month':      String(result.limitMonth),
    'X-RateLimit-Remaining-Month':  String(result.remainingMonth),
    'X-RateLimit-Reset-Minute':     result.resetMinuteAt,
    'X-RateLimit-Reset-Month':      result.resetMonthAt,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface RateLimitRpcResult {
  allowed: boolean;
  requests_this_minute: number;
  requests_this_month: number;
  minute_reset_at: string;
  month_reset_at: string;
}

function getMonthResetDate(from: Date): Date {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
