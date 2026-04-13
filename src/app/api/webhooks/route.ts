import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PLANS, type Plan } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALL_EVENTS = [
  'extraction.completed',
  'extraction.failed',
  'usage.limit.approaching',
  'usage.limit.reached',
  'subscription.created',
  'subscription.updated',
  'subscription.cancelled',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
];

function getAuthClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* read-only in route handlers */ },
      },
    }
  );
}

function generateSigningSecret(): string {
  const bytes = new Uint8Array(32);
  require('crypto').randomFillSync(bytes);
  return 'whsec_' + Buffer.from(bytes).toString('hex');
}

// ── GET: list user's webhook endpoints ──────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const supabase = getAuthClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('id, url, description, events, enabled, created_at, updated_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ endpoints: data ?? [] });
}

// ── POST: create a new webhook endpoint ─────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = getAuthClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { url?: string; description?: string; events?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.url || !body.url.startsWith('https://')) {
    return NextResponse.json({ error: 'URL must be a valid HTTPS URL' }, { status: 400 });
  }

  // Get user's plan for limit enforcement
  const adminClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: userData } = await adminClient.from('users').select('plan').eq('id', session.user.id).single();
  const plan = (userData?.plan ?? 'free') as Plan;
  const planConfig = PLANS[plan];

  // Validate events against plan access
  const allowedEvents = planConfig.webhookEvents === '*' ? ALL_EVENTS : planConfig.webhookEvents;
  const planEvents = planConfig.webhookEvents;
  const events = (body.events ?? []).filter(e => ALL_EVENTS.includes(e) && (planEvents === '*' || planEvents.includes(e)));
  if (events.length === 0) {
    return NextResponse.json({ error: 'At least one valid event must be selected. Some events may require a higher plan.' }, { status: 400 });
  }

  // Check endpoint limit based on plan
  const { count } = await supabase
    .from('webhook_endpoints')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  const maxEndpoints = planConfig.webhookEndpoints;
  if ((count ?? 0) >= maxEndpoints) {
    return NextResponse.json({ error: `Maximum ${maxEndpoints} endpoints allowed on the ${planConfig.name} plan. Upgrade for more.` }, { status: 400 });
  }

  const signingSecret = generateSigningSecret();

  const { data, error } = await supabase
    .from('webhook_endpoints')
    .insert({
      user_id: session.user.id,
      url: body.url,
      description: body.description || null,
      events,
      signing_secret: signingSecret,
    })
    .select('id, url, description, events, enabled, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return signing secret ONCE on creation
  return NextResponse.json({ endpoint: data, signing_secret: signingSecret }, { status: 201 });
}
