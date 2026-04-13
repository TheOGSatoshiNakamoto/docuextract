import { Inngest } from 'inngest';

// All webhook event types that can be dispatched
export type WebhookEventType =
  | 'docuextract/extraction.completed'
  | 'docuextract/extraction.failed'
  | 'docuextract/usage.limit.approaching'
  | 'docuextract/usage.limit.reached'
  | 'docuextract/subscription.created'
  | 'docuextract/subscription.updated'
  | 'docuextract/subscription.cancelled'
  | 'docuextract/invoice.payment_succeeded'
  | 'docuextract/invoice.payment_failed';

// Maps internal Inngest event names to public-facing event names
export const PUBLIC_EVENT_NAMES: Record<WebhookEventType, string> = {
  'docuextract/extraction.completed': 'extraction.completed',
  'docuextract/extraction.failed': 'extraction.failed',
  'docuextract/usage.limit.approaching': 'usage.limit.approaching',
  'docuextract/usage.limit.reached': 'usage.limit.reached',
  'docuextract/subscription.created': 'subscription.created',
  'docuextract/subscription.updated': 'subscription.updated',
  'docuextract/subscription.cancelled': 'subscription.cancelled',
  'docuextract/invoice.payment_succeeded': 'invoice.payment_succeeded',
  'docuextract/invoice.payment_failed': 'invoice.payment_failed',
};

export interface WebhookEventData {
  userId: string;
  [key: string]: unknown;
}

export const inngest = new Inngest({ id: 'docuextract' });
