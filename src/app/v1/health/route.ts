import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/lib/types';

const VERSION = '1.0.0';

export function GET(): NextResponse {
  const body: HealthResponse = { status: 'ok', version: VERSION };
  return NextResponse.json(body);
}
