import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { createBillingPortalSession } from '../../../lib/billing.js';
import {
  methodNotAllowed,
  sendUnauthorized,
  sendInvalidRequest,
  sendInternalError,
} from '../../../lib/errors.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (methodNotAllowed(req, res, ['POST'])) return;

  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const auth = await authenticateRequest(req);
  if (!auth.ok) {
    sendUnauthorized(res, auth.message);
    return;
  }

  // ── 2. Create billing portal session ──────────────────────────────────────
  try {
    const url = await createBillingPortalSession(auth.user.id);
    res.status(200).json({ url });
  } catch (err) {
    // Surface "no Stripe customer" as a 400, everything else as 500
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('No Stripe customer')) {
      sendInvalidRequest(res, message);
      return;
    }
    sendInternalError(res, err);
  }
}
