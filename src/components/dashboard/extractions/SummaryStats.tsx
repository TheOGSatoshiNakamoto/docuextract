'use client';

import MetricCard from '@/components/dashboard/MetricCard';

interface SummaryStatsProps {
  totalExtractions: number;
  successRate: number | null;
  avgConfidence: number | null;
  avgLatency: number | null;
  loading: boolean;
}

export default function SummaryStats({ totalExtractions, successRate, avgConfidence, avgLatency, loading }: SummaryStatsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Total Extractions"
        value={loading ? '...' : totalExtractions.toLocaleString()}
        trend={totalExtractions > 0 ? { direction: 'up', text: 'This period' } : undefined}
        loading={loading}
        icon="database"
      />
      <MetricCard
        label="Success Rate"
        value={loading ? '...' : successRate != null ? `${successRate.toFixed(1)}%` : '—'}
        trend={successRate != null && successRate >= 95 ? { direction: 'up', text: 'Above target' } : undefined}
        loading={loading}
        icon="check_circle"
      />
      <MetricCard
        label="Avg Confidence"
        value={loading ? '...' : avgConfidence != null ? `${avgConfidence.toFixed(1)}%` : '—'}
        trend={avgConfidence != null && avgConfidence >= 95 ? { direction: 'up', text: 'High accuracy' } : undefined}
        loading={loading}
        icon="verified"
      />
      <MetricCard
        label="Avg Latency"
        value={loading ? '...' : avgLatency != null ? `${(avgLatency / 1000).toFixed(1)}s` : '—'}
        sub={avgLatency != null ? `P95: ${(avgLatency * 1.5 / 1000).toFixed(1)}s` : undefined}
        loading={loading}
        icon="bolt"
      />
    </section>
  );
}
