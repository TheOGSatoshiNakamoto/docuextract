import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ENDPOINTS = 5;

const VALID_EVENTS = [
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

  const events = (body.events ?? []).filter(e => VALID_EVENTS.includes(e));
  if (events.length === 0) {
    return NextResponse.json({ error: 'At least one valid event must be selected' }, { status: 400 });
  }

  // Check endpoint limit
  const { count } = await supabase
    .from('webhook_endpoints')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if ((count ?? 0) >= MAX_ENDPOINTS) {
    return NextResponse.json({ error: `Maximum ${MAX_ENDPOINTS} endpoints allowed` }, { status: 400 });
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
