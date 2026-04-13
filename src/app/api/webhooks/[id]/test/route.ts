import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { inngest } from '@/inngest/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/[id]/test
 *
 * Sends a test extraction.completed event to a specific webhook endpoint.
 * Uses Inngest to dispatch, same as production — but targets only this endpoint.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* read-only */ },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify endpoint belongs to user
  const { data: endpoint } = await supabase
    .from('webhook_endpoints')
    .select('id, url, enabled')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  }

  if (!endpoint.enabled) {
    return NextResponse.json({ error: 'Endpoint is disabled. Enable it first.' }, { status: 400 });
  }

  // Send test event via Inngest, targeting only this endpoint
  await inngest.send({
    name: 'docuextract/extraction.completed',
    data: {
      userId: session.user.id,
      targetEndpointId: endpoint.id,
      extractionId: 'ext_test1234',
      status: 'success',
      confidence: 0.9942,
      documentType: 'invoice',
    },
  });

  return NextResponse.json({ sent: true, endpoint_url: endpoint.url });
}
