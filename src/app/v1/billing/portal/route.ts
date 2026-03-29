import { type NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createBillingPortalSession } from '@/lib/billing';
import {
  errorUnauthorized,
  errorInvalidRequest,
  errorInternal,
} from '@/lib/errors';
import { captureException } from '@/lib/sentry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const auth = await authenticateRequest(request);
  if (!auth.ok) return errorUnauthorized(auth.message);

  // ── 2. Create billing portal session ──────────────────────────────────────
  try {
    const url = await createBillingPortalSession(auth.user.id);
    return NextResponse.json({ url });
  } catch (err) {
    // Surface "no Stripe customer" as a 400, everything else as 500
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('No Stripe customer')) {
      return errorInvalidRequest(message);
    }
    captureException(err);
    return errorInternal(err);
  }
}
