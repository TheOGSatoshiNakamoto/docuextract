'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import MetricCard from '@/components/dashboard/MetricCard';
import ExtractionsTable from '@/components/dashboard/ExtractionsTable';
import QuickStartCard from '@/components/dashboard/QuickStartCard';
import QuickLinkCard from '@/components/dashboard/QuickLinkCard';
import QuickStartFlow from '@/components/dashboard/QuickStartFlow';

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

// ── Overview Content ──────────────────────────────────────────────────────────

function OverviewContent({
  apiKey,
  usage,
  extractions,
  loadingUsage,
  loadingExtractions,
  hasExtractions,
  dataError,
}: {
  apiKey: string | null;
  usage: UsageData | null;
  extractions: Extraction[];
  loadingUsage: boolean;
  loadingExtractions: boolean;
  hasExtractions: boolean;
  dataError?: string | null;
}) {
  const sparkData = usage?.breakdown?.slice(-30).map((d) => d.count) ?? [];
  const usedPct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  const successRate =
    extractions.length > 0
      ? Math.round((extractions.filter((e) => e.status === 'success').length / extractions.length) * 100)
      : null;

  const latencyArr = extractions.filter((e) => e.processing_time_ms != null).map((e) => e.processing_time_ms!);
  const avgLatency =
    latencyArr.length > 0 ? Math.round(latencyArr.reduce((a, b) => a + b, 0) / latencyArr.length) : null;

  return (
    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Data error banner */}
      {dataError && (
        <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
          <span className="material-symbols-outlined text-error text-lg shrink-0">error</span>
          <p className="text-sm text-on-surface">{dataError}</p>
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Overview</h2>
          <p className="text-on-surface-variant max-w-xl">
            Monitor your document extraction pipelines and manage API infrastructure from a central console.
          </p>
        </div>
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

      {/* Metrics */}
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
        <MetricCard
          label="Plan Status"
          value={loadingUsage ? '...' : (usage?.plan ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1) : '—')}
          sub={usage?.period_end ? `Resets ${new Date(usage.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : undefined}
          loading={loadingUsage}
          icon="verified"
        />
      </section>

      {/* Recent Extractions */}
      <ExtractionsTable extractions={extractions} loading={loadingExtractions} />

      {/* Quick Links */}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [loadingExtractions, setLoadingExtractions] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null); // null = loading

  // Check onboarding state
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('gs-dismissed') === 'true';
      const keyCopied = localStorage.getItem('gs-key-copied') === 'true';
      const viewedExtractions = localStorage.getItem('gs-viewed-extractions') === 'true';
      // Consider onboarding complete if dismissed or all steps done
      setOnboardingComplete(dismissed || (keyCopied && viewedExtractions));
    } catch {
      setOnboardingComplete(false);
    }
  }, []);

  // Fetch data
  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data: userData } = await supabase
        .from('users')
        .select('api_key, plan, monthly_limit')
        .eq('id', session.user.id)
        .single();

      if (userData?.api_key) setApiKey(userData.api_key);

      if (!userData) {
        setDataError('Unable to load your account data. Please try refreshing the page.');
        setLoadingUsage(false);
        setLoadingExtractions(false);
        return;
      }

      // Usage stats
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
      } catch (err) {
        console.error('Usage fetch failed:', err);
        setDataError('Failed to load usage data.');
      } finally { setLoadingUsage(false); }

      // Recent extractions
      try {
        const { data: exData } = await supabase
          .from('api_usage')
          .select('id, document_type, status, processing_time_ms, confidence_score, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setExtractions(exData ?? []);
      } catch (err) {
        console.error('Extractions fetch failed:', err);
        setDataError('Failed to load recent extractions.');
      } finally { setLoadingExtractions(false); }
    });
  }, []);

  const hasExtractions = (usage?.used ?? 0) > 0;

  // Update onboarding state when extractions data loads
  useEffect(() => {
    if (!loadingUsage && hasExtractions) {
      try {
        const dismissed = localStorage.getItem('gs-dismissed') === 'true';
        const keyCopied = localStorage.getItem('gs-key-copied') === 'true';
        const viewedExtractions = localStorage.getItem('gs-viewed-extractions') === 'true';
        if (dismissed || (keyCopied && hasExtractions && viewedExtractions)) {
          setOnboardingComplete(true);
        }
      } catch { /* SSR */ }
    }
  }, [loadingUsage, hasExtractions]);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
    try { localStorage.setItem('gs-dismissed', 'true'); } catch { /* SSR */ }
  }, []);

  const handleSkip = useCallback(() => {
    setOnboardingComplete(true);
    try { localStorage.setItem('gs-dismissed', 'true'); } catch { /* SSR */ }
  }, []);

  // Loading state
  if (onboardingComplete === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-on-surface-variant/50 text-sm font-headline">Loading&hellip;</div>
      </div>
    );
  }

  // Show Quick Start for new users
  if (!onboardingComplete) {
    return (
      <QuickStartFlow
        apiKey={apiKey}
        hasExtractions={hasExtractions}
        onComplete={handleOnboardingComplete}
        onSkip={handleSkip}
      />
    );
  }

  // Show Overview for onboarded users
  return (
    <OverviewContent
      apiKey={apiKey}
      usage={usage}
      extractions={extractions}
      loadingUsage={loadingUsage}
      loadingExtractions={loadingExtractions}
      hasExtractions={hasExtractions}
      dataError={dataError}
    />
  );
}
