import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { getPriceIdForPlan, createCheckoutSession } from '../../../lib/billing.js';
import {
  methodNotAllowed,
  sendUnauthorized,
  sendInvalidRequest,
  sendInternalError,
} from '../../../lib/errors.js';
import type { Plan } from '../../../lib/types.js';

const PAID_PLANS = new Set<Exclude<Plan, 'free'>>(['starter', 'pro', 'scale']);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (methodNotAllowed(req, res, ['POST'])) return;

  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const auth = await authenticateRequest(req);
  if (!auth.ok) {
    sendUnauthorized(res, auth.message);
    return;
  }

  // ── 2. Validate body ──────────────────────────────────────────────────────
  const { plan } = (req.body ?? {}) as { plan?: string };

  if (!plan) {
    sendInvalidRequest(res, 'Missing required field: plan');
    return;
  }

  if (!PAID_PLANS.has(plan as Exclude<Plan, 'free'>)) {
    sendInvalidRequest(res, `Invalid plan. Must be one of: ${[...PAID_PLANS].join(', ')}`);
    return;
  }

  // ── 3. Create checkout session ────────────────────────────────────────────
  try {
    const priceId = getPriceIdForPlan(plan as Exclude<Plan, 'free'>);
    const url = await createCheckoutSession(auth.user.id, priceId);
    res.status(200).json({ url });
  } catch (err) {
    sendInternalError(res, err);
  }
}
