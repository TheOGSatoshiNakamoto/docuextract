import { createClient } from '@supabase/supabase-js';
import type { UsageRecord } from './types.js';

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
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
