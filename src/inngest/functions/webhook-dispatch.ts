import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { inngest, PUBLIC_EVENT_NAMES, type WebhookEventType } from '../client';

// ── Supabase admin client ────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── HMAC-SHA256 signing ──────────────────────────────────────────────────────

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// ── Payload envelope builder ─────────────────────────────────────────────────

function buildEnvelope(eventName: WebhookEventType, data: Record<string, unknown>) {
  const { userId, ...rest } = data;
  return {
    id: `evt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    event: PUBLIC_EVENT_NAMES[eventName] ?? eventName,
    created: Math.floor(Date.now() / 1000),
    data: rest,
  };
}

// ── All event types this function handles ────────────────────────────────────

const ALL_EVENTS: WebhookEventType[] = [
  'docuextract/extraction.completed',
  'docuextract/extraction.failed',
  'docuextract/usage.limit.approaching',
  'docuextract/usage.limit.reached',
  'docuextract/subscription.created',
  'docuextract/subscription.updated',
  'docuextract/subscription.cancelled',
  'docuextract/invoice.payment_succeeded',
  'docuextract/invoice.payment_failed',
];

// ── Dispatch function ────────────────────────────────────────────────────────

export const dispatchWebhook = inngest.createFunction(
  {
    id: 'webhook-dispatch',
    retries: 3,
    concurrency: [{ limit: 5, key: 'event.data.endpointId' }],
    triggers: ALL_EVENTS.map(name => ({ event: name })),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: { event: any; step: any }) => {
    const eventName = event.name as WebhookEventType;
    const userId = event.data.userId as string;
    const publicEventName = PUBLIC_EVENT_NAMES[eventName] ?? eventName;

    // If this is a targeted test event, only deliver to that specific endpoint
    const targetEndpointId = event.data.targetEndpointId as string | undefined;

    // Step 1: Fetch matching enabled endpoints
    const endpoints = await step.run('fetch-endpoints', async () => {
      const supabase = getSupabaseAdmin();
      let query = supabase
        .from('webhook_endpoints')
        .select('id, url, signing_secret, events')
        .eq('user_id', userId)
        .eq('enabled', true)
        .contains('events', [publicEventName]);

      if (targetEndpointId) {
        query = query.eq('id', targetEndpointId);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch endpoints: ${error.message}`);
      return data ?? [];
    });

    if (endpoints.length === 0) return { delivered: 0 };

    // Step 2: Fan out delivery to each endpoint
    const results = await Promise.allSettled(
      endpoints.map((endpoint: { id: string; url: string; signing_secret: string; events: string[] }) =>
        step.run(`deliver-${endpoint.id}`, async () => {
          const supabase = getSupabaseAdmin();
          const envelope = buildEnvelope(eventName, event.data as Record<string, unknown>);
          const payloadStr = JSON.stringify(envelope);
          const signature = signPayload(payloadStr, endpoint.signing_secret);
          const deliveryId = crypto.randomUUID();

          let responseStatus = 0;
          let responseBody = '';
          let success = false;

          try {
            const response = await fetch(endpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-DocuExtract-Signature': `sha256=${signature}`,
                'X-DocuExtract-Event': publicEventName,
                'X-DocuExtract-Delivery': deliveryId,
                'User-Agent': 'DocuExtract-Webhooks/1.0',
              },
              body: payloadStr,
              signal: AbortSignal.timeout(10_000),
            });

            responseStatus = response.status;
            responseBody = await response.text().catch(() => '');
            success = response.ok;
          } catch (err) {
            responseBody = err instanceof Error ? err.message : String(err);
          }

          // Log to webhook_deliveries (NEVER api_usage)
          await supabase.from('webhook_deliveries').insert({
            endpoint_id: endpoint.id,
            event_type: publicEventName,
            payload: envelope,
            response_status: responseStatus || null,
            response_body: responseBody.slice(0, 4096),
            request_headers: {
              'X-DocuExtract-Signature': `sha256=${signature}`,
              'X-DocuExtract-Event': publicEventName,
              'X-DocuExtract-Delivery': deliveryId,
            },
            success,
          });

          if (!success) {
            throw new Error(`Delivery failed: ${responseStatus} ${responseBody.slice(0, 200)}`);
          }

          return { endpointId: endpoint.id, status: responseStatus, success };
        })
      )
    );

    return {
      delivered: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    };
  }
);
