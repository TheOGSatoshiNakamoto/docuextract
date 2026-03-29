'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';


interface UsageBreakdown {
  date: string;
  count: number;
}

interface UsageData {
  used: number;
  limit: number;
  plan: string;
  period_end: string;
  breakdown: UsageBreakdown[];
}

export default function UsagePage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUser(session.user);

      const { data: userData } = await supabase
        .from('users')
        .select('api_key')
        .eq('id', session.user.id)
        .single();

      if (!userData?.api_key) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/v1/usage', {
          headers: { Authorization: `Bearer ${userData.api_key}` },
        });
        if (res.ok) {
          setUsage(await res.json());
        } else {
          setError('Failed to load usage data.');
        }
      } catch {
        setError('Could not reach API.');
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const usedPct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const maxBarValue = usage?.breakdown?.length
    ? Math.max(...usage.breakdown.map(b => b.count), 1)
    : 1;

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardNav user={user} activeTab="usage" />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Usage</h1>
        <p className="text-gray-400 text-sm mb-8">API extraction usage for the current billing period</p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl p-4">
            {error}
          </div>
        ) : usage ? (
          <>
            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Used</p>
                <p className="text-3xl font-bold text-white">{usage.used.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Limit</p>
                <p className="text-3xl font-bold text-white">{usage.limit.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Plan</p>
                <p className="text-3xl font-bold text-white capitalize">{usage.plan}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-300">
                  {usage.used.toLocaleString()} of {usage.limit.toLocaleString()} extractions used
                </span>
                <span className={`font-medium ${usedPct > 90 ? 'text-red-400' : usedPct > 75 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {usedPct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usedPct > 90 ? 'bg-red-500' : usedPct > 75 ? 'bg-yellow-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              {usage.period_end && (
                <p className="text-gray-600 text-xs mt-2">
                  Period ends {new Date(usage.period_end).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Daily breakdown chart */}
            {usage.breakdown && usage.breakdown.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-white font-medium mb-5">Daily usage</p>
                <div className="flex items-end gap-1 h-32">
                  {usage.breakdown.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-indigo-600 group-hover:bg-indigo-500 rounded-sm transition-colors"
                          style={{ height: `${(day.count / maxBarValue) * 100}%`, minHeight: day.count ? '2px' : '0' }}
                          title={`${day.date}: ${day.count}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{usage.breakdown[0]?.date?.slice(5)}</span>
                  <span>{usage.breakdown[usage.breakdown.length - 1]?.date?.slice(5)}</span>
                </div>
              </div>
            )}

            {usedPct > 80 && (
              <div className="mt-6 bg-yellow-900/30 border border-yellow-800 rounded-xl p-4 flex items-center justify-between">
                <p className="text-yellow-300 text-sm">
                  You&apos;ve used {usedPct.toFixed(0)}% of your plan. Upgrade to avoid interruption.
                </p>
                <a
                  href="/dashboard/billing"
                  className="text-sm text-yellow-300 font-medium hover:text-yellow-200 transition-colors ml-4 shrink-0"
                >
                  Upgrade →
                </a>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
