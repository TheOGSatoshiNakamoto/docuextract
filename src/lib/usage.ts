import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { UsageDayBreakdown, UsageRecord, UsageResponse } from './types';
import type { User } from './types';

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Returns usage stats for the current billing period plus a per-day breakdown.
 */
export async function getUsageStats(user: User): Promise<UsageResponse> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const { data, count, error } = await supabase
    .from('api_usage')
    .select('created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'success')
    .gte('created_at', periodStart.toISOString())
    .lt('created_at', periodEnd.toISOString());

  if (error) throw error;

  // Aggregate per day from the returned rows
  const dayMap = new Map<string, number>();
  for (const row of data ?? []) {
    const day = (row.created_at as string).slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const breakdown: UsageDayBreakdown[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    used: count ?? 0,
    limit: user.monthly_limit,
    plan: user.plan,
    period_end: periodEnd.toISOString().split('T')[0] ?? periodEnd.toISOString(),
    breakdown,
  };
}

/**
 * Returns the count of successful extractions for the current calendar month.
 * Used to determine whether the next extraction is an overage.
 */
export async function getMonthlyUsageCount(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const { count, error } = await supabase
    .from('api_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', periodStart.toISOString())
    .lt('created_at', periodEnd.toISOString());

  if (error) throw error;
  return count ?? 0;
}

/**
 * Inserts a usage record into the api_usage table.
 *
 * This is intentionally fire-and-forget on the request path — failures are
 * logged but never propagated to the caller. A missing usage record is better
 * than a failed API response.
 */
export async function logUsage(record: UsageRecord): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin().from('api_usage').insert(record);
    if (error) {
      console.error(
        JSON.stringify({ level: 'error', message: 'Failed to log usage', error: error.message, userId: record.user_id }),
      );
    }
  } catch (err) {
    console.error(
      JSON.stringify({ level: 'error', message: 'Usage logging exception', error: String(err), userId: record.user_id }),
    );
  }
}
