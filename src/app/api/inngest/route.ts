import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { dispatchWebhook } from '@/inngest/functions/webhook-dispatch';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dispatchWebhook],
});
