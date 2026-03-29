import { type NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getPriceIdForPlan, createCheckoutSession } from '@/lib/billing';
import {
  errorUnauthorized,
  errorInvalidRequest,
  errorInternal,
} from '@/lib/errors';
import { captureException } from '@/lib/sentry';
import type { Plan } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAID_PLANS = new Set<Exclude<Plan, 'free'>>(['starter', 'pro', 'scale']);

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const auth = await authenticateRequest(request);
  if (!auth.ok) return errorUnauthorized(auth.message);

  // ── 2. Validate body ──────────────────────────────────────────────────────
  let body: { plan?: string };
  try {
    body = await request.json() as { plan?: string };
  } catch {
    return errorInvalidRequest('Invalid JSON body');
  }

  const { plan } = body;

  if (!plan) {
    return errorInvalidRequest('Missing required field: plan');
  }

  if (!PAID_PLANS.has(plan as Exclude<Plan, 'free'>)) {
    return errorInvalidRequest(`Invalid plan. Must be one of: ${Array.from(PAID_PLANS).join(', ')}`);
  }

  // ── 3. Create checkout session ────────────────────────────────────────────
  try {
    const priceId = getPriceIdForPlan(plan as Exclude<Plan, 'free'>);
    const url = await createCheckoutSession(auth.user.id, priceId);
    return NextResponse.json({ url });
  } catch (err) {
    captureException(err);
    return errorInternal(err);
  }
}
