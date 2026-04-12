import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/usage/current
 *
 * Returns the authoritative usage count for the current billing period.
 * Uses the same counting logic as billing (successful extractions only)
 * to ensure consistency across dashboard, billing, and webhook triggers.
 *
 * Authenticated via Supabase session cookies (dashboard auth).
 */
export async function GET(): Promise<NextResponse> {
  // Auth via session cookie
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* read-only in route handlers */ },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role for counting (bypasses RLS for accurate counts)
  const admin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const userId = session.user.id;

  // Get user plan info
  const { data: userData, error: userError } = await admin
    .from('users')
    .select('plan, monthly_limit')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Count successful extractions for current billing period (matches getMonthlyUsageCount)
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const { count: successCount, error: countError } = await admin
    .from('api_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', periodStart.toISOString())
    .lt('created_at', periodEnd.toISOString());

  if (countError) {
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }

  // Also count failed requests for the secondary display
  const { count: failedCount } = await admin
    .from('api_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'success')
    .gte('created_at', periodStart.toISOString())
    .lt('created_at', periodEnd.toISOString());

  return NextResponse.json({
    count: successCount ?? 0,
    failed: failedCount ?? 0,
    limit: userData.monthly_limit,
    plan: userData.plan,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
  });
}
