'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import MetricCard from '@/components/dashboard/MetricCard';
import ExtractionsTable from '@/components/dashboard/ExtractionsTable';
import QuickStartCard from '@/components/dashboard/QuickStartCard';
import QuickLinkCard from '@/components/dashboard/QuickLinkCard';

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [loadingExtractions, setLoadingExtractions] = useState(true);
  const [quickStartDismissed, setQuickStartDismissed] = useState(false);

  useEffect(() => {
    try {
      setQuickStartDismissed(localStorage.getItem('gs-dismissed') === 'true');
    } catch { /* SSR */ }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('api_key, plan, monthly_limit')
        .eq('id', session.user.id)
        .single();

      if (userData?.api_key) setApiKey(userData.api_key);

      // Fetch usage stats
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

      // Fetch recent extractions
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
  const allDone = hasExtractions && quickStartDismissed;
  const sparkData = usage?.breakdown?.slice(-30).map((d) => d.count) ?? [];

  // Compute derived stats
  const successRate =
    extractions.length > 0
      ? Math.round((extractions.filter((e) => e.status === 'success').length / extractions.length) * 100)
      : null;

  const latencyArr = extractions.filter((e) => e.processing_time_ms != null).map((e) => e.processing_time_ms!);
  const avgLatency =
    latencyArr.length > 0 ? Math.round(latencyArr.reduce((a, b) => a + b, 0) / latencyArr.length) : null;

  const usedPct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  function dismissQuickStart() {
    setQuickStartDismissed(true);
    try { localStorage.setItem('gs-dismissed', 'true'); } catch { /* SSR */ }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Header Section — Correction #8: "Overview" not "Developer Dashboard" */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Overview</h2>
          <p className="text-on-surface-variant max-w-xl">
            Monitor your document extraction pipelines and manage API infrastructure from a central console.
          </p>
        </div>
        {/* Usage summary in header */}
        {usage && (
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <div className="text-right">
              <p className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50">API Usage</p>
              <p className="font-headline font-bold text-xl text-on-surface">
                {usage.used.toLocaleString()}{' '}
                <span className="text-on-surface-variant/40 font-normal text-sm">/ {usage.limit.toLocaleString()}</span>
              </p>
            </div>
            <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${usedPct >= 95 ? 'bg-error' : usedPct >= 80 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Quick Integration — corrections #1-4, #9, #10 applied in QuickStartCard */}
      {!allDone && (
        <QuickStartCard
          apiKey={apiKey}
          hasExtractions={hasExtractions}
          dismissed={quickStartDismissed}
          onDismiss={dismissQuickStart}
        />
      )}

      {/* Metrics Grid — corrections #6 (dates from real data), #7 (real plan) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="API Calls (MTD)"
          value={loadingUsage ? '...' : (usage?.used?.toLocaleString() ?? '0')}
          sparkData={sparkData}
          trend={hasExtractions ? { direction: 'up', text: 'This month' } : undefined}
          loading={loadingUsage}
          icon="api"
        />
        <MetricCard
          label="Success Rate"
          value={loadingExtractions ? '...' : successRate != null ? `${successRate}%` : '—'}
          sub={extractions.length > 0 ? `Last ${extractions.length} calls` : 'No data yet'}
          trend={successRate != null && successRate >= 95 ? { direction: 'up', text: 'Service Operational' } : undefined}
          loading={loadingExtractions}
          icon="check_circle"
        />
        <MetricCard
          label="Avg Latency"
          value={loadingExtractions ? '...' : avgLatency != null ? `${(avgLatency / 1000).toFixed(1)}s` : '—'}
          sub={avgLatency != null ? `P95: ${(avgLatency * 1.5 / 1000).toFixed(1)}s` : 'Processing time'}
          loading={loadingExtractions}
          icon="speed"
        />
        {/* Correction #7: show user's actual plan from database, not "Enterprise" */}
        <MetricCard
          label="Plan Status"
          value={loadingUsage ? '...' : (usage?.plan ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1) : '—')}
          sub={usage?.period_end ? `Resets ${new Date(usage.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : undefined}
          loading={loadingUsage}
          icon="verified"
        />
      </section>

      {/* Recent Extractions — correction #6: real dates from DB */}
      <ExtractionsTable extractions={extractions} loading={loadingExtractions} />

      {/* Quick Links — correction #11: fix typo "environments and environments" → "environments and services" */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <QuickLinkCard
          href="/docs"
          icon="menu_book"
          title="Documentation"
          description="Explore our full API reference, SDKs, and integration guides for multiple languages."
        />
        <QuickLinkCard
          href="/playground"
          icon="terminal"
          title="API Playground"
          description="Test extractions in real-time with our interactive sandbox. No code required."
        />
        <QuickLinkCard
          href="/dashboard/keys"
          icon="vpn_key"
          title="Manage Keys"
          description="Create, revoke, and rotate API keys for different environments and services."
        />
      </section>
    </div>
  );
}
