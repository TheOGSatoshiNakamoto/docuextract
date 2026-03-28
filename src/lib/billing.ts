import 'server-only';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { Plan } from './types';

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

// ─── Plan → Price ID mapping ──────────────────────────────────────────────────

export function getPriceIdForPlan(plan: Exclude<Plan, 'free'>): string {
  const map: Record<Exclude<Plan, 'free'>, string | undefined> = {
    starter: process.env['STRIPE_PRICE_STARTER'],
    pro:     process.env['STRIPE_PRICE_PRO'],
    scale:   process.env['STRIPE_PRICE_SCALE'],
  };
  const priceId = map[plan];
  if (!priceId) throw new Error(`Price ID not configured for plan: ${plan}`);
  return priceId;
}

// ─── Customer management ──────────────────────────────────────────────────────

/**
 * Creates a Stripe customer for a new user and links it in Supabase.
 * Called on signup, or lazily on first checkout if signup predated billing.
 */
export async function createStripeCustomer(userId: string, email: string): Promise<string> {
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  await supabase.from('users').update({
    stripe_customer_id: customer.id,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);

  return customer.id;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for a plan subscription.
 * Lazily creates a Stripe customer if the user doesn't have one yet.
 * Returns the hosted checkout URL to redirect the user to.
 */
export async function createCheckoutSession(userId: string, priceId: string): Promise<string> {
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error || !user) throw new Error('User not found');

  // Lazily create Stripe customer if this user pre-dated billing setup
  let customerId = (user as { stripe_customer_id: string | null }).stripe_customer_id;
  if (!customerId) {
    customerId = await createStripeCustomer(userId, (user as { email: string }).email);
  }

  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://docuextract.dev';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${appUrl}/dashboard?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: { supabase_user_id: userId },
  });

  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return session.url;
}

// ─── Metered usage reporting ──────────────────────────────────────────────────

/**
 * Reports overage extraction usage to Stripe via the Billing Meters API.
 * Only call this when the user has already consumed their plan's included quota.
 *
 * Fire-and-forget on the request path — errors are logged but never thrown.
 * Free-tier users are never reported (rate-limited at the monthly cap instead).
 */
export async function reportUsageToStripe(
  stripeCustomerId: string,
  quantity: number,
): Promise<void> {
  try {
    const stripe = getStripe();
    await stripe.v2.billing.meterEvents.create({
      event_name: 'api_requests',
      payload: {
        stripe_customer_id: stripeCustomerId,
        value: String(quantity),
      },
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Failed to report overage usage to Stripe',
      stripeCustomerId,
      quantity,
      error: String(err),
    }));
  }
}

// ─── Billing portal ───────────────────────────────────────────────────────────

/**
 * Creates a Stripe Billing Portal session.
 * Allows the user to upgrade, downgrade, cancel, or update payment method.
 * Returns the portal URL to redirect the user to.
 */
export async function createBillingPortalSession(userId: string): Promise<string> {
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  const { data: user, error } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error || !user) throw new Error('User not found');

  const customerId = (user as { stripe_customer_id: string | null }).stripe_customer_id;
  if (!customerId) {
    throw new Error('No Stripe customer found. Subscribe to a plan first.');
  }

  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://docuextract.dev';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard`,
  });

  return session.url;
}
