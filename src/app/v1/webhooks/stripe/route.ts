import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { invalidateAuthCache } from '@/lib/auth';
import { captureException } from '@/lib/sentry';
import type { Plan } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─── Clients ──────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Plan mapping ─────────────────────────────────────────────────────────────

function getPlanForPriceId(priceId: string): { plan: Plan; monthlyLimit: number } | null {
  const map: Record<string, { plan: Plan; monthlyLimit: number }> = {
    [process.env['STRIPE_PRICE_STARTER'] ?? '']: { plan: 'starter', monthlyLimit: 2_500 },
    [process.env['STRIPE_PRICE_PRO'] ?? '']:     { plan: 'pro',     monthlyLimit: 10_000 },
    [process.env['STRIPE_PRICE_SCALE'] ?? '']:   { plan: 'scale',   monthlyLimit: 50_000 },
  };
  return map[priceId] ?? null;
}

// ─── Event handlers ───────────────────────────────────────────────────────────

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

async function handleSubscriptionUpsert(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const planItem = subscription.items.data.find(
    item => item.price.id !== process.env['STRIPE_PRICE_OVERAGE'],
  );
  if (!planItem) {
    console.error(JSON.stringify({ level: 'warn', message: 'No plan price found in subscription', subscriptionId: subscription.id }));
    return;
  }

  const planInfo = getPlanForPriceId(planItem.price.id);
  if (!planInfo) {
    console.error(JSON.stringify({ level: 'warn', message: 'Unrecognised price ID', priceId: planItem.price.id }));
    return;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, api_key')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !user) {
    console.error(JSON.stringify({ level: 'error', message: 'User not found for Stripe customer', customerId }));
    return;
  }

  await supabase.from('users').update({
    plan: planInfo.plan,
    monthly_limit: planInfo.monthlyLimit,
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);

  invalidateAuthCache((user as { id: string; api_key: string }).api_key);
  console.log(JSON.stringify({ level: 'info', message: 'Plan updated', userId: user.id, plan: planInfo.plan }));
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseAdmin,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, api_key')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !user) {
    console.error(JSON.stringify({ level: 'error', message: 'User not found for subscription deletion', customerId }));
    return;
  }

  await supabase.from('users').update({
    plan: 'free',
    monthly_limit: 100,
    stripe_subscription_id: null,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);

  invalidateAuthCache((user as { id: string; api_key: string }).api_key);
  console.log(JSON.stringify({ level: 'info', message: 'Subscription cancelled — plan reverted to free', userId: user.id }));
}

// ─── Main handler ─────────────────────────────────────────────────────────────

// In Next.js App Router, the raw body is available via request.text()
// No need for bodyParser config — App Router doesn't pre-parse bodies.

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  if (!webhookSecret) {
    console.error(JSON.stringify({ level: 'error', message: 'STRIPE_WEBHOOK_SECRET not configured' }));
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // ── 1. Verify Stripe signature ───────────────────────────────────────────
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    // Use text() to get the raw body string for signature verification
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', message: 'Webhook signature verification failed', error: String(err) }));
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // ── 2. Idempotency — skip already-processed events ───────────────────────
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true });
  }

  // ── 3. Log event before processing ───────────────────────────────────────
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    processed: false,
    payload: event as unknown as Record<string, unknown>,
  });

  // ── 4. Route to handler ──────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_succeeded':
        console.log(JSON.stringify({
          level: 'info',
          message: 'Invoice payment succeeded',
          invoiceId: (event.data.object as Stripe.Invoice).id,
        }));
        break;

      case 'invoice.payment_failed':
        console.log(JSON.stringify({
          level: 'warn',
          message: 'Invoice payment failed',
          invoiceId: (event.data.object as Stripe.Invoice).id,
        }));
        break;

      default:
        console.log(JSON.stringify({ level: 'info', message: 'Unhandled event type', type: event.type }));
    }

    await supabase.from('webhook_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

  } catch (err) {
    // Log but return 200 — prevents Stripe from endlessly retrying.
    console.error(JSON.stringify({
      level: 'error',
      message: 'Error processing webhook event',
      eventId: event.id,
      eventType: event.type,
      error: String(err),
    }));
    captureException(err);
  }

  return NextResponse.json({ received: true });
}
