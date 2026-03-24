import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed } from '../../lib/errors.js';
import type { HealthResponse } from '../../lib/types.js';

const VERSION = '1.0.0';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (methodNotAllowed(req, res, ['GET'])) return;

  const body: HealthResponse = { status: 'ok', version: VERSION };
  res.status(200).json(body);
}
