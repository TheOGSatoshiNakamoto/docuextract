'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UsageData {
  used: number;
  limit: number;
  plan: string;
  period_end: string;
  breakdown: Array<{ date: string; count: number }>;
}

interface Extraction {
  id: string;
  document_type: string | null;
  status: string;
  processing_time_ms: number | null;
  confidence_score: number | null;
  created_at: string;
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#6c8ef5' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 160;
  const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  // Fill area
  const area = `0,${h} ${polyline} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sg)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Getting Started ───────────────────────────────────────────────────────────

function GettingStarted({
  apiKey,
  hasExtractions,
}: {
  apiKey: string | null;
  hasExtractions: boolean;
}) {
  const [keyCopied, setKeyCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Track step 1 completion in localStorage
  const [step1Done, setStep1Done] = useState(false);

  useEffect(() => {
    try {
      setStep1Done(localStorage.getItem('gs-key-copied') === 'true');
      setDismissed(localStorage.getItem('gs-dismissed') === 'true');
    } catch { /* SSR */ }
  }, []);

  const step2Done = hasExtractions;
  const step3Done = hasExtractions;
  const allDone = step1Done && step2Done && step3Done;

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setKeyCopied(true);
    setStep1Done(true);
    try { localStorage.setItem('gs-key-copied', 'true'); } catch { /* SSR */ }
    setTimeout(() => setKeyCopied(false), 2000);
  }

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem('gs-dismissed', 'true'); } catch { /* SSR */ }
  }

  if (dismissed || allDone) return null;

  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"document": "https://example.com/invoice.pdf", "type": "invoice"}'`;

  const steps = [
    {
      n: 1,
      done: step1Done,
      title: 'Copy your API key',
      content: (
        <div className="flex items-center gap-2 mt-2">
          <code className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono truncate">
            {apiKey ? `${apiKey.slice(0, 16)}${'•'.repeat(16)}` : '—'}
          </code>
          <button
            onClick={copyKey}
            disabled={!apiKey}
            className="shrink-0 px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-40"
          >
            {keyCopied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      ),
    },
    {
      n: 2,
      done: step2Done,
      title: 'Make your first extraction',
      content: (
        <pre className="mt-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-3 text-[11px] text-gray-300 font-mono overflow-x-auto leading-relaxed">
          {curlCmd}
        </pre>
      ),
    },
    {
      n: 3,
      done: step3Done,
      title: 'Review your results',
      content: (
        <p className="mt-2 text-sm text-gray-500">
          Once you&apos;ve made an extraction, view your results and logs in{' '}
          <a href="/dashboard/usage" className="text-indigo-400 hover:text-indigo-300">
            Extractions →
          </a>
        </p>
      ),
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold text-sm">Getting Started</h2>
          <p className="text-gray-500 text-xs mt-0.5">3 steps to your first extraction</p>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
        >
          Dismiss
        </button>
      </div>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.n} className={`${step.done ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  step.done ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/15 text-indigo-400'
                }`}
              >
                {step.done ? '✓' : step.n}
              </span>
              <span className={`text-sm font-medium ${step.done ? 'text-gray-500 line-through' : 'text-white'}`}>
                {step.title}
              </span>
            </div>
            {!step.done && step.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  trend,
  sparkData,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparkData?: number[];
  loading?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trend === 'up' ? 'text-green-400 bg-green-500/10' : trend === 'down' ? 'text-red-400 bg-red-500/10' : 'text-gray-500'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 bg-gray-800 rounded-lg animate-pulse mt-2 w-24" />
      ) : (
        <div className="text-2xl font-bold text-white tracking-tight mt-1">{value}</div>
      )}
      {sub && !loading && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
      {sparkData && sparkData.length > 1 && !loading && (
        <div className="mt-3 -mx-1">
          <Sparkline data={sparkData} />
        </div>
      )}
    </div>
  );
}

// ── Recent Extractions ────────────────────────────────────────────────────────

function RecentExtractions({ extractions, loading }: { extractions: Extraction[]; loading: boolean }) {
  const isEmpty = !loading && extractions.length === 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">Recent Extractions</h2>
        <a href="/dashboard/usage" className="text-xs text-indigo-400 hover:text-indigo-300">
          View all →
        </a>
      </div>

      {loading && (
        <div className="px-5 py-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-600 mb-3">No extractions yet. Make your first API call:</p>
          <pre className="inline-block bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-[11px] text-gray-400 font-mono text-left">
{`curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"document": "https://...", "type": "invoice"}'`}
          </pre>
        </div>
      )}

      {!loading && extractions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-gray-600 uppercase tracking-wide border-b border-gray-800">
                <th className="text-left px-5 py-2.5 font-medium">Time</th>
                <th className="text-left px-3 py-2.5 font-medium">Type</th>
                <th className="text-left px-3 py-2.5 font-medium">Status</th>
                <th className="text-right px-3 py-2.5 font-medium">Latency</th>
                <th className="text-right px-5 py-2.5 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {extractions.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(ex.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-400 capitalize">
                      {ex.document_type ?? 'generic'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        ex.status === 'success'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                    {ex.processing_time_ms != null ? `${ex.processing_time_ms}ms` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-500">
                    {ex.confidence_score != null
                      ? `${(ex.confidence_score * 100).toFixed(0)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [loadingExtractions, setLoadingExtractions] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      // Fetch API key and plan
      const { data: userData } = await supabase
        .from('users')
        .select('api_key, plan, monthly_limit')
        .eq('id', session.user.id)
        .single();

      if (userData?.api_key) {
        setApiKey(userData.api_key);
      }

      // Fetch usage stats directly from Supabase (avoids API key auth chain)
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const { count: usedCount } = await supabase
          .from('api_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const { data: dailyData } = await supabase
          .from('api_usage')
          .select('created_at')
          .eq('user_id', session.user.id)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true });

        const breakdown: Array<{ date: string; count: number }> = [];
        if (dailyData) {
          const counts: Record<string, number> = {};
          for (const row of dailyData) {
            const date = row.created_at.slice(0, 10);
            counts[date] = (counts[date] || 0) + 1;
          }
          for (const [date, count] of Object.entries(counts)) {
            breakdown.push({ date, count });
          }
        }

        setUsage({
          used: usedCount ?? 0,
          limit: userData?.monthly_limit ?? 100,
          plan: userData?.plan ?? 'free',
          period_end: monthEnd,
          breakdown,
        });
      } catch { /* non-blocking */ }
      finally { setLoadingUsage(false); }

      // Fetch recent extractions from Supabase directly
      try {
        const { data: exData } = await supabase
          .from('api_usage')
          .select('id, document_type, status, processing_time_ms, confidence_score, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setExtractions(exData ?? []);
      } catch { /* non-blocking */ }
      finally { setLoadingExtractions(false); }
    });
  }, []);

  const hasExtractions = (usage?.used ?? 0) > 0;
  const usedPct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const barColor = usedPct >= 95 ? 'bg-red-500' : usedPct >= 80 ? 'bg-amber-500' : 'bg-indigo-500';

  // Build 30-day sparkline from breakdown
  const sparkData = usage?.breakdown?.slice(-30).map((d) => d.count) ?? [];

  // Compute success rate from recent extractions
  const successRate =
    extractions.length > 0
      ? Math.round((extractions.filter((e) => e.status === 'success').length / extractions.length) * 100)
      : null;

  // Avg latency
  const latencyArr = extractions.filter((e) => e.processing_time_ms != null).map((e) => e.processing_time_ms!);
  const avgLatency =
    latencyArr.length > 0 ? Math.round(latencyArr.reduce((a, b) => a + b, 0) / latencyArr.length) : null;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your DocuExtract workspace</p>
      </div>

      {/* Getting Started */}
      <GettingStarted apiKey={apiKey} hasExtractions={hasExtractions} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="API Calls This Month"
          value={loadingUsage ? '…' : (usage?.used?.toLocaleString() ?? '0')}
          sub={usage ? `of ${usage.limit.toLocaleString()} limit` : undefined}
          trend={hasExtractions ? 'up' : undefined}
          sparkData={sparkData}
          loading={loadingUsage}
        />
        <StatCard
          label="Success Rate"
          value={loadingExtractions ? '…' : successRate != null ? `${successRate}%` : '—'}
          sub={extractions.length > 0 ? `last ${extractions.length} calls` : 'no data yet'}
          trend={successRate != null && successRate >= 95 ? 'up' : undefined}
          loading={loadingExtractions}
        />
        <StatCard
          label="Avg Latency"
          value={loadingExtractions ? '…' : avgLatency != null ? `${avgLatency}ms` : '—'}
          sub="processing time"
          loading={loadingExtractions}
        />
        <StatCard
          label="Plan"
          value={loadingUsage ? '…' : (usage?.plan ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1) : '—')}
          sub={usage?.period_end ? `Resets ${new Date(usage.period_end).toLocaleDateString()}` : undefined}
          loading={loadingUsage}
        />
      </div>

      {/* Usage bar */}
      {!loadingUsage && usage && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Monthly Usage</span>
            <span className="text-xs text-gray-500">
              {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} extractions
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">{usedPct.toFixed(0)}% used</span>
            {usedPct >= 80 && (
              <a href="/dashboard/billing" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                Upgrade for more →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recent extractions */}
      <RecentExtractions extractions={extractions} loading={loadingExtractions} />

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <a
          href="/docs"
          className="bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl p-4 text-sm text-gray-400 hover:text-white transition-all group"
        >
          <div className="text-indigo-400 mb-2 text-lg">📖</div>
          <div className="font-medium text-white">Documentation</div>
          <div className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-500">API reference & guides</div>
        </a>
        <a
          href="/playground"
          className="bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl p-4 text-sm text-gray-400 hover:text-white transition-all group"
        >
          <div className="text-indigo-400 mb-2 text-lg">🎮</div>
          <div className="font-medium text-white">Playground</div>
          <div className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-500">Test extractions interactively</div>
        </a>
        <a
          href="/dashboard/keys"
          className="bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl p-4 text-sm text-gray-400 hover:text-white transition-all group"
        >
          <div className="text-indigo-400 mb-2 text-lg">🔑</div>
          <div className="font-medium text-white">API Keys</div>
          <div className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-500">Manage & rotate keys</div>
        </a>
      </div>
    </div>
  );
}
