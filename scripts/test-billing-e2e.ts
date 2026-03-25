/**
 * End-to-end billing integration test script.
 *
 * Prerequisites:
 *   - .env.local configured with real Supabase + Stripe test-mode credentials
 *   - Stripe CLI installed: https://stripe.com/docs/stripe-cli
 *   - API deployed to Vercel (or running locally via `vercel dev`)
 *
 * Usage:
 *   npx ts-node scripts/test-billing-e2e.ts [API_BASE_URL]
 *
 * Example:
 *   npx ts-node scripts/test-billing-e2e.ts https://docuextract-azure.vercel.app
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const API_BASE = process.argv[2] ?? 'http://localhost:3000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not set — source .env.local first');
  return createClient(url, key, { auth: { persistSession: false } });
}

function log(step: string, msg: string) {
  console.log(`[${step}] ${msg}`);
}

function pass(step: string) {
  console.log(`  ✅ ${step}`);
}

function fail(step: string, err: unknown) {
  console.error(`  ❌ ${step}: ${String(err)}`);
  process.exitCode = 1;
}

// ─── Step 1: Create test user ─────────────────────────────────────────────────

async function createTestUser(): Promise<{ userId: string; apiKey: string }> {
  log('1', 'Creating test user via Supabase Auth...');
  const supabase = getSupabaseAdmin();

  const email = `test-billing-${Date.now()}@example.com`;
  const password = crypto.randomBytes(16).toString('hex');

  // Create the auth.users entry (trigger in migration 005 may auto-create
  // public.users, but we upsert explicitly below so we always have a known key)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) throw new Error(`auth.admin.createUser failed: ${authError.message}`);

  const userId = authData.user.id;
  const apiKey = `dk_test_${crypto.randomBytes(24).toString('hex')}`;

  // Explicit upsert so the test always has a known API key regardless of
  // whether the trigger fired (ON CONFLICT updates the key if trigger ran first)
  const { error: upsertError } = await supabase.rpc('create_user_with_api_key', {
    p_user_id: userId,
    p_email: email,
    p_api_key: apiKey,
  });
  if (upsertError) throw new Error(`public.users upsert failed: ${upsertError.message}`);

  pass(`User created: ${userId}`);
  return { userId, apiKey };
}

// ─── Step 2: Verify /v1/health ────────────────────────────────────────────────

async function checkHealth() {
  log('2', `Checking health at ${API_BASE}/v1/health...`);
  const res = await fetch(`${API_BASE}/v1/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  const body = await res.json() as { status: string };
  if (body.status !== 'ok') throw new Error(`Unexpected health status: ${body.status}`);
  pass(`Health: ${JSON.stringify(body)}`);
}

// ─── Step 3: Verify /v1/usage (unauthenticated → 401) ────────────────────────

async function checkUsageUnauth() {
  log('3', 'Verifying unauthenticated /v1/usage returns 401...');
  const res = await fetch(`${API_BASE}/v1/usage`);
  if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  pass('401 returned for missing API key');
}

// ─── Step 4: Verify /v1/usage with API key ────────────────────────────────────

async function checkUsageAuth(apiKey: string) {
  log('4', 'Checking /v1/usage with valid API key...');
  const res = await fetch(`${API_BASE}/v1/usage`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Usage check failed: ${res.status}`);
  const body = await res.json() as { plan: string; used: number; limit: number };
  if (body.plan !== 'free') throw new Error(`Expected plan=free, got ${body.plan}`);
  if (body.limit !== 100) throw new Error(`Expected limit=100, got ${body.limit}`);
  pass(`Usage: plan=${body.plan}, used=${body.used}, limit=${body.limit}`);
}

// ─── Step 5: Checkout endpoint ────────────────────────────────────────────────

async function checkCheckout(apiKey: string) {
  log('5', 'Testing POST /v1/billing/checkout...');

  // Invalid plan → 400
  const badRes = await fetch(`${API_BASE}/v1/billing/checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'enterprise' }),
  });
  if (badRes.status !== 400) throw new Error(`Expected 400 for invalid plan, got ${badRes.status}`);
  pass('Invalid plan returns 400');

  // Valid plan → checkout URL
  const res = await fetch(`${API_BASE}/v1/billing/checkout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'starter' }),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status} ${await res.text()}`);
  const body = await res.json() as { url: string };
  if (!body.url?.startsWith('https://checkout.stripe.com')) {
    throw new Error(`Expected Stripe checkout URL, got: ${body.url}`);
  }
  pass(`Checkout URL returned: ${body.url.slice(0, 60)}...`);
}

// ─── Step 6: Portal endpoint (no Stripe customer yet → 400) ──────────────────

async function checkPortalNoCustomer(apiKey: string) {
  log('6', 'Testing POST /v1/billing/portal without subscription (expects 400)...');
  const res = await fetch(`${API_BASE}/v1/billing/portal`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  pass('Portal returns 400 when no Stripe customer exists');
}

// ─── Step 7: Simulate subscription webhook ────────────────────────────────────

async function simulateSubscriptionWebhook(userId: string) {
  log('7', 'Simulating subscription webhook via Stripe CLI...');
  console.log('');
  console.log('  ⚠️  MANUAL STEP REQUIRED');
  console.log('  Run the following Stripe CLI command to simulate a subscription:');
  console.log('');
  console.log(`    stripe trigger customer.subscription.created \\`);
  console.log(`      --add customer.subscription.created:customer=<cus_id> \\`);
  console.log(`      --add customer.subscription.created:items[0][price]=${process.env['STRIPE_PRICE_STARTER']}`);
  console.log('');
  console.log('  Then verify in Supabase:');
  console.log(`    SELECT plan, monthly_limit, stripe_subscription_id FROM users WHERE id = '${userId}';`);
  console.log('  Expected: plan=starter, monthly_limit=2500');
  console.log('');
}

// ─── Step 8: Verify Supabase plan after webhook ───────────────────────────────

async function checkPlanInDb(userId: string, expectedPlan: string) {
  log('8', `Checking user plan in Supabase (expected: ${expectedPlan})...`);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('plan, monthly_limit')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  const user = data as { plan: string; monthly_limit: number };
  if (user.plan !== expectedPlan) {
    console.log(`  ⚠️  Plan is still '${user.plan}' (webhook may not have fired yet)`);
  } else {
    pass(`Plan in DB: ${user.plan}, monthly_limit: ${user.monthly_limit}`);
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanupTestUser(userId: string) {
  log('cleanup', `Removing test user ${userId}...`);
  const supabase = getSupabaseAdmin();
  await supabase.from('api_usage').delete().eq('user_id', userId);
  await supabase.from('rate_limits').delete().eq('user_id', userId);
  await supabase.from('users').delete().eq('id', userId);
  // Remove the auth.users entry created in step 1
  await supabase.auth.admin.deleteUser(userId);
  pass('Test user removed');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  DocuExtract — Billing E2E Test');
  console.log(`  API: ${API_BASE}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  let userId = '';
  let apiKey = '';

  try {
    ({ userId, apiKey } = await createTestUser());
  } catch (err) {
    fail('create test user', err);
    console.log('\n  Note: If create_user_with_api_key RPC is not available, create the user manually in Supabase.');
    return;
  }

  const steps: Array<() => Promise<void>> = [
    () => checkHealth(),
    () => checkUsageUnauth(),
    () => checkUsageAuth(apiKey),
    () => checkCheckout(apiKey),
    () => checkPortalNoCustomer(apiKey),
    () => simulateSubscriptionWebhook(userId),
    () => checkPlanInDb(userId, 'free'), // free until webhook is manually triggered
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
    console.log('  RESULT: Automated checks passed ✅');
    console.log('  Complete the manual Stripe CLI steps above to verify webhook + overage flow.');
  }
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  await cleanupTestUser(userId);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
