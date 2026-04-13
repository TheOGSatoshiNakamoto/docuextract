import 'server-only';

// ─── Centralized pricing constants ───────────────────────────────────────────
// Single source of truth for all plan data. Import from here — never hardcode.
// Matches the 💰 Pricing Model specification in Notion HQ.

export type Plan = 'free' | 'starter' | 'pro' | 'scale';

export interface PlanConfig {
  name: string;
  price: number;
  extractions: number;
  rateLimit: number;
  sonnetAccess: boolean;
  overage: number | null;
  maxKeys: number;
  webhookEndpoints: number;
  webhookEvents: string[] | '*';
}

// Core events available to all plans
const CORE_EVENTS = ['extraction.completed', 'extraction.failed'];
const USAGE_EVENTS = ['usage.limit.approaching', 'usage.limit.reached'];

export const PLANS: Record<Plan, PlanConfig> = {
  free:    { name: 'Free',    price: 0,   extractions: 50,    rateLimit: 5,   sonnetAccess: false, overage: null,  maxKeys: 2,  webhookEndpoints: 1,  webhookEvents: CORE_EVENTS },
  starter: { name: 'Starter', price: 49,  extractions: 1500,  rateLimit: 30,  sonnetAccess: true,  overage: 0.04,  maxKeys: 5,  webhookEndpoints: 3,  webhookEvents: [...CORE_EVENTS, ...USAGE_EVENTS] },
  pro:     { name: 'Pro',     price: 99,  extractions: 5000,  rateLimit: 60,  sonnetAccess: true,  overage: 0.025, maxKeys: 10, webhookEndpoints: 5,  webhookEvents: '*' },
  scale:   { name: 'Scale',   price: 249, extractions: 20000, rateLimit: 120, sonnetAccess: true,  overage: 0.015, maxKeys: 25, webhookEndpoints: 10, webhookEvents: '*' },
};

export const SONNET_MULTIPLIER = 3;

// Legacy-compatible shape used by ratelimit.ts
export const PLAN_LIMITS: Record<Plan, { perMinute: number; perMonth: number }> = {
  free:    { perMinute: PLANS.free.rateLimit,    perMonth: PLANS.free.extractions },
  starter: { perMinute: PLANS.starter.rateLimit, perMonth: PLANS.starter.extractions },
  pro:     { perMinute: PLANS.pro.rateLimit,     perMonth: PLANS.pro.extractions },
  scale:   { perMinute: PLANS.scale.rateLimit,   perMonth: PLANS.scale.extractions },
};
