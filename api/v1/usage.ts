import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, sendInternalError } from '../../lib/errors.js';

// TODO (Phase 3): implement usage stats endpoint
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (methodNotAllowed(req, res, ['GET'])) return;
  sendInternalError(res, 'usage endpoint not yet implemented');
}
