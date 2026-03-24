import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, sendInternalError } from '../../lib/errors.js';

// TODO (Phase 2): implement extraction engine
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (methodNotAllowed(req, res, ['POST'])) return;
  sendInternalError(res, 'extract endpoint not yet implemented');
}
