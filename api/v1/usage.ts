import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../lib/auth.js';
import { methodNotAllowed, sendUnauthorized, sendInternalError } from '../../lib/errors.js';
import type { UsageResponse } from '../../lib/types.js';

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (methodNotAllowed(req, res, ['GET'])) return;

  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const auth = await authenticateRequest(req);
  if (!auth.ok) {
    sendUnauthorized(res, auth.message);
    return;
  }
  const { user } = auth;

  // ── 2. Query usage count for current billing period ───────────────────────
  try {
    const now = new Date();
    // Period start: 1st of the current month
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    // Period end: 1st of next month (exclusive)
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const { count, error } = await getSupabaseAdmin()
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'success')
      .gte('created_at', periodStart.toISOString())
      .lt('created_at', periodEnd.toISOString());

    if (error) {
      sendInternalError(res, error);
      return;
    }

    const response: UsageResponse = {
      used: count ?? 0,
      limit: user.monthly_limit,
      plan: user.plan,
      period_end: periodEnd.toISOString().split('T')[0] ?? periodEnd.toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    sendInternalError(res, err);
  }
}
