'use client';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; text: string };
  sparkData?: number[];
  loading?: boolean;
  accent?: string;
  icon?: string;
}

function MiniSparkBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const bars = data.slice(-5);

  return (
    <div className="w-16 h-8 flex items-end gap-[2px]">
      {bars.map((v, i) => {
        const pct = Math.max(10, (v / max) * 100);
        const opacity = 0.2 + (i / (bars.length - 1)) * 0.8;
        return (
          <div
            key={i}
            className="bg-primary w-full rounded-t-sm"
            style={{ height: `${pct}%`, opacity }}
          />
        );
      })}
    </div>
  );
}

export default function MetricCard({ label, value, sub, trend, sparkData, loading, icon }: MetricCardProps) {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5 relative overflow-hidden group">
      {/* Ghost icon watermark */}
      {icon && (
        <span className="material-symbols-outlined absolute top-3 right-3 text-4xl text-on-surface/5 group-hover:text-on-surface/10 transition-colors">
          {icon}
        </span>
      )}
      <p className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50 mb-2">{label}</p>
      {loading ? (
        <div className="h-8 bg-surface-container-highest rounded animate-pulse mt-2 w-24" />
      ) : (
        <div className="flex items-end justify-between">
          <h4 className="text-3xl font-bold font-headline text-on-surface">{value}</h4>
          {sparkData && sparkData.length > 1 && <MiniSparkBars data={sparkData} />}
        </div>
      )}
      {!loading && sub && (
        <p className="text-[10px] text-on-surface-variant/50 mt-2">{sub}</p>
      )}
      {!loading && trend && (
        <p className={`text-[10px] mt-2 flex items-center gap-1 ${
          trend.direction === 'up' ? 'text-green-400' : trend.direction === 'down' ? 'text-error' : 'text-on-surface-variant/50'
        }`}>
          {trend.direction === 'up' && <span className="material-symbols-outlined text-xs">trending_up</span>}
          {trend.direction === 'down' && <span className="material-symbols-outlined text-xs">trending_down</span>}
          {trend.text}
        </p>
      )}
    </div>
  );
}
