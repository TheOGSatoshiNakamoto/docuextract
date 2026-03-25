import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../lib/auth.js';
import { methodNotAllowed, sendUnauthorized, sendInternalError } from '../../lib/errors.js';
import { getUsageStats } from '../../lib/usage.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (methodNotAllowed(req, res, ['GET'])) return;

  const auth = await authenticateRequest(req);
  if (!auth.ok) {
    sendUnauthorized(res, auth.message);
    return;
  }

  try {
    const stats = await getUsageStats(auth.user);
    res.status(200).json(stats);
  } catch (err) {
    sendInternalError(res, err);
  }
}
