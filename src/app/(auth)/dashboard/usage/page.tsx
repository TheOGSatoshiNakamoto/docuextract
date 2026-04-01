'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import MetricCard from '@/components/dashboard/MetricCard';
import UsageEmptyState from '@/components/dashboard/usage/EmptyState';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiUsageRow {
  id: string;
  document_type: string | null;
  status: string;
  processing_time_ms: number | null;
  confidence_score: number | null;
  model_used: string | null;
  created_at: string;
}

interface UserData {
  api_key: string;
  plan: string;
  monthly_limit: number;
}

type TimeRange = 'billing' | '30d' | 'ytd';

// ── Chart component (SVG area chart) ──────────────────────────────────────────

function UsageChart({ data, limit }: { data: { date: string; count: number }[]; limit: number }) {
  if (data.length < 2) return <div className="h-[280px] flex items-center justify-center text-on-surface-variant/30 text-sm">Not enough data to display chart</div>;

  const maxVal = Math.max(...data.map(d => d.count), limit);
  const w = 1000;
  const h = 280;
  const padX = 0;
  const padY = 20;
  const chartH = h - padY * 2;
  const chartW = w - padX;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * chartW;
    const y = padY + chartH - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
  const limitY = padY + chartH - (limit / maxVal) * chartH;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[280px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c8ef5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6c8ef5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Plan limit line */}
        <line x1="0" y1={limitY} x2={w} y2={limitY} stroke="#434652" strokeDasharray="8,8" strokeWidth="1" />
        {/* Area */}
        <path d={areaPath} fill="url(#chartFill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#b4c5ff" strokeWidth="2" />
      </svg>
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-[0.15em] font-bold font-headline">Actual Usage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-[1px] border-t border-dashed border-outline-variant" />
          <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-[0.15em] font-bold font-headline">Plan Limit ({limit.toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
}

// ── Horizontal bar breakdown ──────────────────────────────────────────────────

function DocTypeBreakdown({ data }: { data: { type: string; count: number; pct: number }[] }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
      <h3 className="text-sm font-bold font-headline mb-6 flex items-center gap-2 uppercase tracking-[0.15em]">
        <span className="material-symbols-outlined text-primary-container">insert_drive_file</span>
        Usage by Document Type
      </h3>
      <div className="space-y-5">
        {data.map((d) => (
          <div key={d.type}>
            <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-wider">
              <span className="text-on-surface-variant/60 capitalize">{d.type.replace('_', ' ')}</span>
              <span className="text-on-surface">{d.count} <span className="text-on-surface-variant/40 font-normal">({d.pct}%)</span></span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full">
              <div className="h-full bg-primary-container rounded-full" style={{ width: `${d.pct}%` }} />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-on-surface-variant/40">No data</p>}
      </div>
    </div>
  );
}

// ── Error breakdown ───────────────────────────────────────────────────────────

function ErrorBreakdown({ successCount, errorCounts }: { successCount: number; errorCounts: { code: string; count: number; color: string }[] }) {
  const all = [{ code: '200 OK', count: successCount, color: 'bg-primary' }, ...errorCounts];
  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
      <h3 className="text-sm font-bold font-headline mb-6 flex items-center gap-2 uppercase tracking-[0.15em]">
        <span className="material-symbols-outlined text-error">error_outline</span>
        Success vs Error Breakdown
      </h3>
      <div className="space-y-0">
        {all.map((item) => (
          <div key={item.code} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs font-bold text-on-surface-variant/60">{item.code}</span>
            </div>
            <span className="text-xs font-black text-on-surface">{item.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
      {errorCounts.some(e => e.code === '422 Unprocessable') && (
        <div className="mt-6 bg-surface-container-highest/30 p-4 rounded-lg border border-outline-variant/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <p className="text-[10px] text-on-surface-variant/60 leading-relaxed uppercase tracking-[0.1em] font-bold">
              Recommendation: Check 422 errors for malformed documents in the extraction log.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Model split ───────────────────────────────────────────────────────────────

function ModelSplit({ haiku, sonnet }: {
  haiku: { count: number; pct: number; avgLatency: number; avgConf: number };
  sonnet: { count: number; pct: number; avgLatency: number; avgConf: number };
}) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
      <h3 className="text-sm font-bold font-headline mb-6 flex items-center gap-2 uppercase tracking-[0.15em]">
        <span className="material-symbols-outlined text-primary">neurology</span>
        Model Usage Split
      </h3>
      <div className="space-y-6">
        {/* Haiku */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-black font-headline text-on-surface">HAIKU 4.5</span>
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">{haiku.count.toLocaleString()} calls ({haiku.pct}%)</span>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold mb-0.5">Latency</p>
              <p className="text-sm font-bold text-primary">{(haiku.avgLatency / 1000).toFixed(1)}s</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold mb-0.5">Confidence</p>
              <p className="text-sm font-bold text-primary">{haiku.avgConf.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        {/* Sonnet */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-black font-headline text-primary">SONNET 4.6</span>
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">{sonnet.count.toLocaleString()} calls ({sonnet.pct}%)</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold mb-0.5">Latency</p>
              <p className="text-sm font-bold text-primary">{(sonnet.avgLatency / 1000).toFixed(1)}s</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold mb-0.5">Confidence</p>
              <p className="text-sm font-bold text-primary">{sonnet.avgConf.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        {/* Segmented bar */}
        <div className="pt-4">
          <div className="h-3 w-full flex rounded-full overflow-hidden bg-surface-container-highest">
            <div className="h-full bg-primary" style={{ width: `${haiku.pct}%` }} />
            <div className="h-full bg-primary-container" style={{ width: `${sonnet.pct}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Haiku</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Sonnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plan usage bar ────────────────────────────────────────────────────────────

function PlanUsageBar({ used, limit, plan, daysRemaining, projectedUsage }: {
  used: number; limit: number; plan: string; daysRemaining: number; projectedUsage: number;
}) {
  const pct = Math.min(100, (used / limit) * 100);
  const barColor = pct >= 95 ? 'bg-error' : pct >= 80 ? 'bg-amber-500' : 'bg-primary-container';
  const overageCount = Math.max(0, projectedUsage - limit);
  const overageCost = (overageCount * 0.05).toFixed(2);
  const willExceed = projectedUsage > limit;

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold font-headline uppercase tracking-[0.15em]">Plan Usage &amp; Limits</h3>
        <span className="text-[10px] font-headline uppercase tracking-[0.15em] text-on-surface-variant/40 capitalize">{plan} Plan</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden mb-3">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs mb-6">
        <span className="text-on-surface font-bold">{used.toLocaleString()} / {limit.toLocaleString()} calls</span>
        <span className="text-on-surface-variant/50">{pct.toFixed(0)}% used &middot; {daysRemaining} days remaining</span>
      </div>

      {willExceed && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-4">
          <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">warning</span>
          <div>
            <p className="text-xs font-bold text-on-surface mb-1">Projected to exceed limit</p>
            <p className="text-[10px] text-on-surface-variant/60">
              On track to use ~{projectedUsage.toLocaleString()} calls. Overage: ~{overageCount.toLocaleString()} calls &times; $0.05 = ~${overageCost}
            </p>
          </div>
        </div>
      )}

      {plan === 'free' || plan === 'starter' ? (
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all"
        >
          Upgrade to {plan === 'free' ? 'Starter' : 'Pro'} for {plan === 'free' ? '25x' : '4x'} the calls
        </Link>
      ) : null}
    </div>
  );
}

// ── Recent activity table ─────────────────────────────────────────────────────

function RecentActivity({ rows }: { rows: ApiUsageRow[] }) {
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
      <div className="p-5 flex justify-between items-center border-b border-outline-variant/10">
        <h3 className="text-sm font-bold font-headline uppercase tracking-[0.15em]">Recent API Activity</h3>
        <Link href="/dashboard/extractions" className="text-[10px] text-primary font-bold font-headline uppercase tracking-[0.15em] hover:underline">
          View Full Log
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
              <th className="p-3 pl-5 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">Timestamp</th>
              <th className="p-3 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">Doc Type</th>
              <th className="p-3 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">Status</th>
              <th className="p-3 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">Latency</th>
              <th className="p-3 pr-5 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="p-3 pl-5 text-xs text-on-surface-variant font-mono">
                  {new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-bold uppercase text-primary capitalize">
                    {(r.document_type ?? 'generic').replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'success' ? 'bg-green-500' : 'bg-error'}`} />
                    <span className="text-xs text-on-surface capitalize">{r.status}</span>
                  </div>
                </td>
                <td className="p-3 text-xs text-on-surface-variant/50 font-mono">{r.processing_time_ms ? `${r.processing_time_ms}ms` : '—'}</td>
                <td className="p-3 pr-5 text-xs text-on-surface-variant/50">{r.confidence_score ? `${(r.confidence_score * 100).toFixed(0)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsagePage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rows, setRows] = useState<ApiUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('billing');

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data: ud } = await supabase
        .from('users')
        .select('api_key, plan, monthly_limit')
        .eq('id', session.user.id)
        .single();
      if (ud) { setUserData(ud as UserData); setApiKey(ud.api_key); }

      try {
        const { data } = await supabase
          .from('api_usage')
          .select('id, document_type, status, processing_time_ms, confidence_score, model_used, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true })
          .limit(2000);
        setRows(data ?? []);
      } catch { /* non-blocking */ }
      finally { setLoading(false); }
    });
  }, []);

  // Compute all derived stats
  const stats = useMemo(() => {
    if (rows.length === 0) return null;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInPeriod = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / 86400000);
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - monthStart.getTime()) / 86400000));
    const daysRemaining = Math.max(0, daysInPeriod - daysElapsed);

    // Filter by time range
    let filtered = rows;
    if (timeRange === '30d') {
      const cutoff = new Date(Date.now() - 30 * 86400000);
      filtered = rows.filter(r => new Date(r.created_at) >= cutoff);
    } else if (timeRange === 'ytd') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = rows.filter(r => new Date(r.created_at) >= yearStart);
    } else {
      filtered = rows.filter(r => new Date(r.created_at) >= monthStart);
    }

    const total = filtered.length;
    const successCount = filtered.filter(r => r.status === 'success').length;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    const confArr = filtered.filter(r => r.confidence_score != null).map(r => r.confidence_score! * 100);
    const avgConf = confArr.length > 0 ? confArr.reduce((a, b) => a + b, 0) / confArr.length : 0;

    const latArr = filtered.filter(r => r.processing_time_ms != null).map(r => r.processing_time_ms!);
    const avgLat = latArr.length > 0 ? latArr.reduce((a, b) => a + b, 0) / latArr.length : 0;

    // Daily chart data
    const dailyCounts: Record<string, number> = {};
    filtered.forEach(r => {
      const d = r.created_at.slice(0, 10);
      dailyCounts[d] = (dailyCounts[d] || 0) + 1;
    });
    const chartData = Object.entries(dailyCounts).sort().map(([date, count]) => ({ date, count }));

    // Doc type breakdown
    const typeCounts: Record<string, number> = {};
    filtered.forEach(r => {
      const t = r.document_type ?? 'generic';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const docTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Error breakdown
    const failedRows = filtered.filter(r => r.status !== 'success');
    const errorCounts = [
      { code: '422 Unprocessable', count: failedRows.length, color: 'bg-amber-400' },
    ];

    // Model split
    const haikuRows = filtered.filter(r => !r.model_used?.includes('sonnet'));
    const sonnetRows = filtered.filter(r => r.model_used?.includes('sonnet'));
    const haikuLat = haikuRows.filter(r => r.processing_time_ms != null).map(r => r.processing_time_ms!);
    const sonnetLat = sonnetRows.filter(r => r.processing_time_ms != null).map(r => r.processing_time_ms!);
    const haikuConf = haikuRows.filter(r => r.confidence_score != null).map(r => r.confidence_score! * 100);
    const sonnetConf = sonnetRows.filter(r => r.confidence_score != null).map(r => r.confidence_score! * 100);

    const haiku = {
      count: haikuRows.length,
      pct: total > 0 ? Math.round((haikuRows.length / total) * 100) : 0,
      avgLatency: haikuLat.length > 0 ? haikuLat.reduce((a, b) => a + b, 0) / haikuLat.length : 0,
      avgConf: haikuConf.length > 0 ? haikuConf.reduce((a, b) => a + b, 0) / haikuConf.length : 0,
    };
    const sonnet = {
      count: sonnetRows.length,
      pct: total > 0 ? Math.round((sonnetRows.length / total) * 100) : 0,
      avgLatency: sonnetLat.length > 0 ? sonnetLat.reduce((a, b) => a + b, 0) / sonnetLat.length : 0,
      avgConf: sonnetConf.length > 0 ? sonnetConf.reduce((a, b) => a + b, 0) / sonnetConf.length : 0,
    };

    // Projected usage
    const billingFiltered = rows.filter(r => new Date(r.created_at) >= monthStart);
    const projectedUsage = Math.round((billingFiltered.length / daysElapsed) * daysInPeriod);

    return {
      total, successCount, successRate, avgConf, avgLat,
      chartData, docTypes, errorCounts,
      haiku, sonnet,
      daysRemaining, projectedUsage,
      recentRows: [...filtered].reverse().slice(0, 10),
    };
  }, [rows, timeRange]);

  const plan = userData?.plan ?? 'free';
  const limit = userData?.monthly_limit ?? 100;

  // Empty state
  if (!loading && rows.length === 0) {
    return <UsageEmptyState apiKey={apiKey} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Usage Analytics</h2>
          <p className="text-on-surface-variant">API call volume, performance metrics, and plan utilization.</p>
        </div>
        <button
          onClick={() => {
            if (!stats) return;
            const csv = ['Date,Count', ...stats.chartData.map(d => `${d.date},${d.count}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'usage-export.csv'; a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant/20 rounded-lg text-xs font-bold font-headline uppercase tracking-[0.1em] hover:bg-surface-container-highest transition-colors text-on-surface"
        >
          <span className="material-symbols-outlined text-sm">download</span> Export Data
        </button>
      </div>

      {/* Time range */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 font-headline font-bold mb-2">Time Range</p>
        <div className="flex p-1 bg-surface-container-low rounded-lg border border-outline-variant/20 w-fit">
          {([['billing', 'This billing period'], ['30d', 'Last 30 days'], ['ytd', 'Year to date']] as [TimeRange, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTimeRange(val)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === val ? 'bg-primary-container text-white' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />)}
        </div>
      ) : stats && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Total API Calls" value={stats.total.toLocaleString()} sub={`/ ${limit.toLocaleString()}`} icon="api" />
            <MetricCard label="Success Rate" value={`${stats.successRate.toFixed(1)}%`} trend={stats.successRate >= 95 ? { direction: 'up', text: `+${(stats.successRate - 95).toFixed(1)}%` } : undefined} icon="check_circle" />
            <MetricCard label="Avg Confidence" value={`${stats.avgConf.toFixed(1)}%`} icon="verified" />
            <MetricCard label="Avg Latency" value={`${(stats.avgLat / 1000).toFixed(1)}s`} icon="bolt" />
            <MetricCard label="Docs Processed" value={stats.total.toLocaleString()} icon="description" />
          </div>

          {/* Chart */}
          <div className="bg-surface-container-low rounded-xl p-6 md:p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold font-headline mb-1">Usage Over Time</h3>
                <p className="text-xs text-on-surface-variant/50">API call volume relative to service plan capacity</p>
              </div>
            </div>
            <UsageChart data={stats.chartData} limit={limit} />
          </div>

          {/* Three-column breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DocTypeBreakdown data={stats.docTypes} />
            <ErrorBreakdown successCount={stats.successCount} errorCounts={stats.errorCounts} />
            <ModelSplit haiku={stats.haiku} sonnet={stats.sonnet} />
          </div>

          {/* Plan usage bar */}
          <PlanUsageBar
            used={stats.total}
            limit={limit}
            plan={plan}
            daysRemaining={stats.daysRemaining}
            projectedUsage={stats.projectedUsage}
          />

          {/* Recent activity */}
          <RecentActivity rows={stats.recentRows} />
        </>
      )}
    </div>
  );
}
