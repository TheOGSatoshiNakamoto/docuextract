'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';


interface Plan {
  name: string;
  price: string;
  extractions: string;
  rateLimit: string;
  model: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$49',
    extractions: '2,500',
    rateLimit: '30/min',
    model: 'Haiku + Sonnet',
  },
  {
    name: 'Pro',
    price: '$99',
    extractions: '10,000',
    rateLimit: '60/min',
    model: 'Haiku + Sonnet',
    popular: true,
  },
  {
    name: 'Scale',
    price: '$249',
    extractions: '50,000',
    rateLimit: '120/min',
    model: 'Haiku + Sonnet + Priority',
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data } = await supabase
        .from('users')
        .select('api_key, plan')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setApiKey(data.api_key);
        setCurrentPlan(data.plan ?? 'free');
      }
    });
  }, []);

  async function handleCheckout(planName: string) {
    if (!apiKey) return;
    setCheckoutLoading(planName);
    setError('');

    try {
      const res = await fetch('/v1/billing/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.message ?? 'Checkout failed.');
      }
    } catch {
      setError('Could not reach billing API.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function openPortal() {
    if (!apiKey) return;
    setLoadingPortal(true);
    setError('');

    try {
      const res = await fetch('/v1/billing/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.message ?? 'Portal unavailable.');
      }
    } catch {
      setError('Could not reach billing API.');
    } finally {
      setLoadingPortal(false);
    }
  }

  const isOnPaidPlan = currentPlan !== 'free';

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Billing</h1>
            <p className="text-gray-400 text-sm">
              Current plan: <span className="text-white capitalize font-medium">{currentPlan}</span>
            </p>
          </div>
          {isOnPaidPlan && (
            <button
              onClick={openPortal}
              disabled={loadingPortal}
              className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
            >
              {loadingPortal ? 'Opening…' : 'Manage subscription →'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {!isOnPaidPlan && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">You&apos;re on the Free plan</p>
              <p className="text-gray-500 text-xs mt-1">100 extractions/month · Haiku only · 10 req/min</p>
            </div>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">Free</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();
            const isLoading = checkoutLoading === plan.name;

            return (
              <div
                key={plan.name}
                className={`bg-gray-900 border rounded-xl p-5 relative flex flex-col ${
                  plan.popular ? 'border-indigo-600' : 'border-gray-800'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-0.5 rounded-full font-medium">
                    Most popular
                  </span>
                )}
                <div className="mb-4">
                  <p className="text-white font-semibold">{plan.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {plan.price}
                    <span className="text-sm text-gray-500 font-normal">/mo</span>
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-gray-400 flex-1 mb-5">
                  <li>✓ {plan.extractions} extractions/mo</li>
                  <li>✓ {plan.rateLimit} rate limit</li>
                  <li>✓ {plan.model}</li>
                  <li>✓ $0.05/extraction overage</li>
                </ul>
                {isCurrent ? (
                  <div className="text-center text-sm text-gray-500 py-2">Current plan</div>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.name)}
                    disabled={isLoading || !!checkoutLoading}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'
                        : 'bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {isLoading ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">
          All plans include overages at $0.05/extraction · Cancel anytime · Billed monthly
        </p>
    </div>
  );
}
