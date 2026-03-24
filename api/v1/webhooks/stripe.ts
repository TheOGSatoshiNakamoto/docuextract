import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, sendInternalError } from '../../../lib/errors.js';

// TODO (Phase 3): implement Stripe webhook handler
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (methodNotAllowed(req, res, ['POST'])) return;
  sendInternalError(res, 'stripe webhook not yet implemented');
}
