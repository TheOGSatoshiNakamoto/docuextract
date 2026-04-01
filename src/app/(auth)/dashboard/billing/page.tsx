'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

// ── Plan definitions (static, correction #14: added rate limits) ──────────────

const PLANS = [
  { key: 'free', label: 'Free', subtitle: 'Entry', price: 0, calls: 100, rateLimit: '10/min', model: 'AI-Powered Extraction (Haiku)', features: ['100 API Calls / Mo', 'AI-Powered Extraction (Haiku)', '10 req/min rate limit'], cta: 'current' },
  { key: 'starter', label: 'Starter', subtitle: 'Growth', price: 49, calls: 2500, rateLimit: '30/min', model: 'All AI Models (Haiku + Sonnet)', features: ['2,500 API Calls / Mo', 'All AI Models (Haiku + Sonnet)', '30 req/min rate limit', 'Priority Email Support', 'Webhook Integration'], cta: 'upgrade' },
  { key: 'pro', label: 'Pro', subtitle: 'Production', price: 99, calls: 10000, rateLimit: '60/min', model: 'All AI Models (Haiku + Sonnet)', features: ['10,000 API Calls / Mo', 'All AI Models (Haiku + Sonnet)', '60 req/min rate limit', 'Priority Email Support', 'Webhook Integration'], cta: 'upgrade', popular: true },
  { key: 'scale', label: 'Scale', subtitle: 'Volume', price: 249, calls: 50000, rateLimit: '120/min', model: 'All AI Models + Priority Processing', features: ['50,000 API Calls / Mo', 'All AI Models + Priority Processing', '120 req/min rate limit', 'Priority Processing + Dedicated Support', 'Custom Rate Limits'], cta: 'upgrade' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [userPlan, setUserPlan] = useState('free');
  const [usageCount, setUsageCount] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(100);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data } = await supabase
        .from('users')
        .select('plan, monthly_limit')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUserPlan(data.plan ?? 'free');
        setMonthlyLimit(data.monthly_limit ?? 100);
      }

      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count } = await supabase
          .from('api_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .gte('created_at', monthStart);
        setUsageCount(count ?? 0);
      } catch { /* non-blocking */ }
      finally { setLoading(false); }
    });
  }, []);

  const usagePct = Math.min(100, (usageCount / monthlyLimit) * 100);
  const barColor = usagePct >= 95 ? 'bg-error' : usagePct >= 80 ? 'bg-amber-500' : 'bg-primary-container';

  async function handleCheckout(planKey: string) {
    setCheckoutLoading(planKey);
    try {
      const res = await fetch('/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { /* error handling */ }
    finally { setCheckoutLoading(null); }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch('/v1/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { /* error handling */ }
    finally { setPortalLoading(false); }
  }

  // Billing period
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / 86400000));
  const periodStr = `${periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const currentPlanDef = PLANS.find(p => p.key === userPlan) ?? PLANS[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Billing</h2>
        <p className="text-on-surface-variant">Manage your subscription, usage, and payment details.</p>
      </div>

      {/* Current Plan Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Plan card */}
        <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-primary/10 text-primary font-label text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded mb-2 inline-block">
                  Subscription Status: Active
                </span>
                <h3 className="text-4xl font-headline font-bold text-on-surface capitalize">{currentPlanDef.label} Plan</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-headline font-bold text-on-surface">
                  ${currentPlanDef.price}<span className="text-sm text-on-surface-variant font-normal">/month</span>
                </p>
                <p className="text-[10px] font-label uppercase text-on-surface-variant/50 tracking-[0.15em]">Billed Monthly</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant/60 mb-8">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span className="text-sm">{periodStr} <span className="text-primary font-semibold ml-2">({daysRemaining} days remaining)</span></span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end text-sm">
              <span className="font-label uppercase tracking-[0.15em] text-[11px] text-on-surface-variant/50">API Usage Progress</span>
              <span className="font-headline font-bold text-on-surface">{usageCount.toLocaleString()} / {monthlyLimit.toLocaleString()} calls</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${usagePct}%` }} />
            </div>
          </div>
        </div>

        {/* Manage subscription */}
        <div className="bg-surface-container-high p-8 rounded-xl flex flex-col justify-center gap-6">
          <div className="space-y-2">
            <h4 className="font-headline font-bold text-xl text-on-surface">Manage Subscription</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Update your billing details, download tax invoices, or switch your payment method.
            </p>
          </div>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="w-full py-3 bg-primary-container text-white font-headline font-bold rounded-lg hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">open_in_new</span>
            {portalLoading ? 'Opening...' : 'Customer Portal'}
          </button>
        </div>
      </section>

      {/* Plan Comparison Grid — corrections #5-10, #14 applied */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-headline font-bold text-on-surface">Choose Your Plan</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-sm leading-relaxed">
            Upgrade to increase your extraction limits and unlock advanced AI models.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === userPlan;
            const isPopular = plan.popular;
            return (
              <div
                key={plan.key}
                className={`p-6 rounded-xl flex flex-col relative ${
                  isPopular
                    ? 'bg-surface-container border-2 border-primary-container scale-[1.02] shadow-2xl shadow-primary-container/10'
                    : 'bg-surface-container-low border border-outline-variant/10 hover:border-outline-variant/30 transition-all'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-container text-white px-4 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-[0.15em]">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/50 mb-1">{plan.subtitle}</p>
                  <h4 className="text-xl font-headline font-bold text-on-surface">{plan.label}</h4>
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-headline font-bold text-on-surface">
                    ${plan.price}<span className="text-sm font-normal text-on-surface-variant">/mo</span>
                  </p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-on-surface">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button disabled className="w-full py-3 bg-surface-container-highest text-on-surface font-label uppercase tracking-[0.15em] text-[10px] rounded opacity-50 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={checkoutLoading === plan.key}
                    className={`w-full py-3 rounded font-label uppercase tracking-[0.15em] text-[10px] font-bold transition-all ${
                      isPopular
                        ? 'bg-primary-container text-white hover:brightness-110'
                        : 'border border-outline-variant/30 text-primary hover:bg-surface-container-high'
                    } disabled:opacity-50`}
                  >
                    {checkoutLoading === plan.key ? 'Loading...' : `Upgrade to ${plan.label}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Cancellation — corrections #12, #13 */}
      {userPlan !== 'free' && (
        <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
          <h3 className="font-headline font-bold text-sm mb-2 text-on-surface">Cancel Subscription</h3>
          <p className="text-xs text-on-surface-variant/60 mb-4 max-w-xl">
            Cancelling your subscription will revert you to the Free plan at the end of your current billing period.
            This will revoke API access beyond the free tier and delete all extraction history. Account deletion is a separate action in Settings.
          </p>
          <button
            onClick={handlePortal}
            className="px-4 py-2 border border-error/30 text-error text-xs font-headline uppercase tracking-[0.15em] rounded hover:bg-error/5 transition-colors"
          >
            Cancel Subscription
          </button>
        </section>
      )}
    </div>
  );
}
