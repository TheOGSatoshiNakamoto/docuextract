import { type NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { errorUnauthorized, errorInternal } from '@/lib/errors';
import { getUsageStats } from '@/lib/usage';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth.ok) return errorUnauthorized(auth.message);

  try {
    const stats = await getUsageStats(auth.user);
    return NextResponse.json(stats);
  } catch (err) {
    return errorInternal(err);
  }
}
