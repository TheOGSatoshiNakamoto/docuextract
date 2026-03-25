/**
 * Webhook E2E test — verifies the full subscription webhook flow.
 *
 * Does NOT require the Stripe CLI. Instead it:
 *   1. Creates a real Supabase auth user
 *   2. Calls POST /v1/billing/checkout to lazy-create a Stripe customer
 *   3. Reads the stripe_customer_id back from Supabase
 *   4. Builds a customer.subscription.created webhook payload using that customer
 *   5. Signs the payload with STRIPE_WEBHOOK_SECRET (matches what Stripe sends)
 *   6. POSTs it directly to POST /v1/webhooks/stripe on the live deployment
 *   7. Verifies the user's plan updated to 'starter' in Supabase
 *   8. Cleans up the test user
 *
 * Usage:
 *   npx ts-node scripts/test-webhook-e2e.ts [API_BASE_URL]
 *
 * Example:
 *   npx ts-node scripts/test-webhook-e2e.ts https://docuextract-azure.vercel.app
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import crypto from 'crypto';

const API_BASE = process.argv[2] ?? 'http://localhost:3000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not set — source .env.local first');
  return createClient(url, key, { auth: { persistSession: false } });
}

function log(step: string, msg: string) { console.log(`[${step}] ${msg}`); }
function pass(msg: string) { console.log(`  ✅ ${msg}`); }
function fail(msg: string, err: unknown) {
  console.error(`  ❌ ${msg}: ${String(err)}`);
  process.exitCode = 1;
}

/**
 * Builds a Stripe-Signature header using the official Stripe SDK.
 * Using the SDK guarantees the algorithm matches exactly what Stripe produces
 * and what stripe.webhooks.constructEvent() expects on the server side.
 */
function buildStripeSignatureHeader(payload: string, secret: string): string {
  return Stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

// ─── Step 1: Create test user ─────────────────────────────────────────────────

async function createTestUser(): Promise<{ userId: string; apiKey: string }> {
  log('1', 'Creating test user via Supabase Auth...');
  const supabase = getSupabaseAdmin();
  const email = `test-webhook-${Date.now()}@example.com`;

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: crypto.randomBytes(16).toString('hex'),
    email_confirm: true,
  });
  if (authErr) throw new Error(`auth.admin.createUser failed: ${authErr.message}`);

  const userId = authData.user.id;
  const testKey = `dk_test_${crypto.randomBytes(24).toString('hex')}`;

  await supabase.rpc('create_user_with_api_key', {
    p_user_id: userId,
    p_email: email,
    p_api_key: testKey,
  });

  // Read actual key stored in DB (trigger may have stored its own key)
  const { data: row } = await supabase.from('users').select('api_key').eq('id', userId).single();
  const apiKey = (row as { api_key: string }).api_key;

  pass(`User created: ${userId}`);
  return { userId, apiKey };
}

// ─── Step 2: Trigger checkout to lazy-create Stripe customer ──────────────────

async function triggerCheckoutForCustomer(apiKey: string): Promise<string> {
  log('2', 'Calling POST /v1/billing/checkout to lazy-create Stripe customer...');

  const res = await fetch(`${API_BASE}/v1/billing/checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'starter' }),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status} ${await res.text()}`);
  pass('Checkout session created (Stripe customer lazy-created)');
  return '';
}

// ─── Step 3: Read stripe_customer_id from Supabase ────────────────────────────

async function getStripeCustomerId(userId: string): Promise<string> {
  log('3', 'Reading stripe_customer_id from Supabase...');
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  const customerId = (data as { stripe_customer_id: string | null }).stripe_customer_id;
  if (!customerId) throw new Error('stripe_customer_id is null — checkout may have failed to save it');

  pass(`Stripe customer ID: ${customerId}`);
  return customerId;
}

// ─── Step 4 + 5: Build, sign, and fire the webhook ────────────────────────────

async function fireSubscriptionWebhook(customerId: string, userId: string): Promise<void> {
  log('4', 'Building and signing customer.subscription.created webhook payload...');

  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not set — source .env.local first');

  const priceId = process.env['STRIPE_PRICE_STARTER'];
  if (!priceId) throw new Error('STRIPE_PRICE_STARTER not set');

  // Minimal payload that mirrors what Stripe sends for a new subscription
  const payload = JSON.stringify({
    id: `evt_test_${crypto.randomBytes(12).toString('hex')}`,
    type: 'customer.subscription.created',
    data: {
      object: {
        id: `sub_test_${crypto.randomBytes(12).toString('hex')}`,
        customer: customerId,
        status: 'active',
        items: {
          data: [{ price: { id: priceId } }],
        },
      },
    },
  });

  const stripeSignature = buildStripeSignatureHeader(payload, webhookSecret);
  pass('Webhook payload signed');

  log('5', `POSTing signed webhook to ${API_BASE}/v1/webhooks/stripe...`);
  const res = await fetch(`${API_BASE}/v1/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': stripeSignature,
    },
    body: payload,
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`Webhook endpoint returned ${res.status}: ${body}`);
  pass(`Webhook accepted: ${res.status} ${body}`);
}

// ─── Step 6: Verify plan updated in Supabase ──────────────────────────────────

async function verifyPlanUpdated(userId: string): Promise<void> {
  log('6', 'Verifying plan updated to starter in Supabase...');

  // Brief pause — webhook handler is async but should be near-instant on Vercel
  await new Promise(r => setTimeout(r, 2000));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('plan, monthly_limit, stripe_subscription_id')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  const user = data as { plan: string; monthly_limit: number; stripe_subscription_id: string | null };

  if (user.plan !== 'starter') {
    throw new Error(`Expected plan=starter, got plan=${user.plan}. Webhook may not have processed correctly.`);
  }
  if (user.monthly_limit !== 2500) {
    throw new Error(`Expected monthly_limit=2500, got ${user.monthly_limit}`);
  }
  pass(`Plan updated: plan=${user.plan}, monthly_limit=${user.monthly_limit}`);
  pass(`Subscription ID saved: ${user.stripe_subscription_id}`);
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanup(userId: string): Promise<void> {
  log('cleanup', `Removing test user ${userId}...`);
  const supabase = getSupabaseAdmin();
  await supabase.from('api_usage').delete().eq('user_id', userId);
  await supabase.from('rate_limits').delete().eq('user_id', userId);
  await supabase.from('users').delete().eq('id', userId);
  await supabase.auth.admin.deleteUser(userId);
  pass('Test user removed');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  DocuExtract — Webhook E2E Test');
  console.log(`  API: ${API_BASE}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  let userId = '';
  let apiKey = '';

  try {
    ({ userId, apiKey } = await createTestUser());
  } catch (err) {
    fail('create test user', err);
    return;
  }

  const steps: Array<() => Promise<void>> = [
    async () => { await triggerCheckoutForCustomer(apiKey); },
    async () => {
      const customerId = await getStripeCustomerId(userId);
      await fireSubscriptionWebhook(customerId, userId);
    },
    () => verifyPlanUpdated(userId),
  ];

  for (const step of steps) {
    try {
      await step();
    } catch (err) {
      fail('step', err);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  if (process.exitCode === 1) {
    console.log('  RESULT: Some checks failed — see ❌ above');
  } else {
    console.log('  RESULT: Webhook flow fully verified ✅');
  }
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  await cleanup(userId);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
