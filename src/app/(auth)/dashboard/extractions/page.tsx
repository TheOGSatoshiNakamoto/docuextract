'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import ExtractionsEmptyState from '@/components/dashboard/extractions/EmptyState';
import SummaryStats from '@/components/dashboard/extractions/SummaryStats';
import FilterBar, { type Filters } from '@/components/dashboard/extractions/FilterBar';
import ExtractionDetailPanel from '@/components/dashboard/extractions/ExtractionDetailPanel';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Extraction {
  id: string;
  document_type: string | null;
  status: string;
  processing_time_ms: number | null;
  confidence_score: number | null;
  created_at: string;
  model_used: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  error_message: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  invoice: 'bg-blue-400/10 text-blue-400',
  receipt: 'bg-purple-400/10 text-purple-400',
  resume: 'bg-green-400/10 text-green-400',
  bank_statement: 'bg-amber-400/10 text-amber-400',
  contract: 'bg-cyan-400/10 text-cyan-400',
  form: 'bg-pink-400/10 text-pink-400',
  id_document: 'bg-teal-400/10 text-teal-400',
  business_card: 'bg-orange-400/10 text-orange-400',
  generic: 'bg-slate-400/10 text-slate-400',
};

const DEFAULT_FILTERS: Filters = {
  docType: 'All Types',
  status: 'All',
  confidence: 'All',
  dateRange: 'Last 7 days',
  model: 'All Models',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExtractionsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const PAGE_SIZE = 25;

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data: userData } = await supabase
        .from('users')
        .select('api_key')
        .eq('id', session.user.id)
        .single();
      if (userData?.api_key) setApiKey(userData.api_key);

      try {
        const { data } = await supabase
          .from('api_usage')
          .select('id, document_type, status, processing_time_ms, confidence_score, created_at, model_used, input_tokens, output_tokens, error_message')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(500);
        setExtractions(data ?? []);
      } catch { /* non-blocking */ }
      finally { setLoading(false); }
    });
  }, []);

  // Apply client-side filters
  const filtered = useMemo(() => {
    let result = [...extractions];

    if (filters.docType !== 'All Types') {
      const type = filters.docType.toLowerCase().replace(' ', '_');
      result = result.filter((e) => e.document_type === type);
    }
    if (filters.status === 'Successful') result = result.filter((e) => e.status === 'success');
    if (filters.status === 'Failed') result = result.filter((e) => e.status !== 'success');
    if (filters.confidence === '> 95%') result = result.filter((e) => e.confidence_score != null && e.confidence_score >= 0.95);
    if (filters.confidence === '> 90%') result = result.filter((e) => e.confidence_score != null && e.confidence_score >= 0.90);
    if (filters.confidence === '< 85%') result = result.filter((e) => e.confidence_score != null && e.confidence_score < 0.85);
    if (filters.model === 'Haiku 4.5') result = result.filter((e) => e.model_used?.includes('haiku'));
    if (filters.model === 'Sonnet 4.6') result = result.filter((e) => e.model_used?.includes('sonnet'));

    if (filters.dateRange !== 'Last 7 days') {
      const now = Date.now();
      if (filters.dateRange === 'Today') result = result.filter((e) => now - new Date(e.created_at).getTime() < 86400000);
      if (filters.dateRange === 'Last 30 days') result = result.filter((e) => now - new Date(e.created_at).getTime() < 30 * 86400000);
    }

    // Sort
    result.sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      if (sortCol === 'created_at') { va = a.created_at; vb = b.created_at; }
      else if (sortCol === 'confidence') { va = a.confidence_score ?? 0; vb = b.confidence_score ?? 0; }
      else if (sortCol === 'latency') { va = a.processing_time_ms ?? 0; vb = b.processing_time_ms ?? 0; }
      else if (sortCol === 'type') { va = a.document_type ?? ''; vb = b.document_type ?? ''; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [extractions, filters, sortCol, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Summary stats from ALL extractions (unfiltered)
  const totalExtractions = extractions.length;
  const successCount = extractions.filter((e) => e.status === 'success').length;
  const successRate = totalExtractions > 0 ? (successCount / totalExtractions) * 100 : null;
  const confidenceArr = extractions.filter((e) => e.confidence_score != null).map((e) => e.confidence_score! * 100);
  const avgConfidence = confidenceArr.length > 0 ? confidenceArr.reduce((a, b) => a + b, 0) / confidenceArr.length : null;
  const latencyArr = extractions.filter((e) => e.processing_time_ms != null).map((e) => e.processing_time_ms!);
  const avgLatency = latencyArr.length > 0 ? latencyArr.reduce((a, b) => a + b, 0) / latencyArr.length : null;

  const selectedExtraction = selectedId ? extractions.find((e) => e.id === selectedId) ?? null : null;

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortCol !== col) return null;
    return <span className="material-symbols-outlined text-xs ml-1">{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>;
  }

  function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  // Empty state
  if (!loading && extractions.length === 0) {
    return <ExtractionsEmptyState apiKey={apiKey} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Extractions</h2>
        <p className="text-on-surface-variant">Browse, filter, and inspect all your document extractions.</p>
      </div>

      {/* Summary Stats */}
      <SummaryStats
        totalExtractions={totalExtractions}
        successRate={successRate}
        avgConfidence={avgConfidence}
        avgLatency={avgLatency}
        loading={loading}
      />

      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />

      {/* Table */}
      <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-surface-container-highest rounded animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                    <Th col="created_at" onClick={toggleSort}>Timestamp<SortIcon col="created_at" /></Th>
                    <Th col="type" onClick={toggleSort}>Document Type<SortIcon col="type" /></Th>
                    <th className="p-4 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50 font-medium">Status</th>
                    <Th col="confidence" onClick={toggleSort}>Confidence<SortIcon col="confidence" /></Th>
                    <Th col="latency" onClick={toggleSort}>Latency<SortIcon col="latency" /></Th>
                    <th className="p-4 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50 font-medium">Model</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {paginated.map((ex) => {
                    const typeKey = ex.document_type ?? 'generic';
                    const typeColor = TYPE_COLORS[typeKey] || TYPE_COLORS.generic;
                    const conf = ex.confidence_score != null ? ex.confidence_score * 100 : null;
                    const confBar = conf != null ? (conf >= 90 ? 'bg-primary' : conf >= 75 ? 'bg-amber-500' : 'bg-error') : '';
                    const modelName = ex.model_used?.includes('sonnet') ? 'Sonnet 4.6' : ex.model_used?.includes('haiku') ? 'Haiku 4.5' : ex.model_used ?? '—';

                    return (
                      <tr
                        key={ex.id}
                        onClick={() => setSelectedId(ex.id)}
                        className="hover:bg-surface-container/50 transition-colors group cursor-pointer border-r-2 border-transparent hover:border-primary"
                      >
                        <td className="p-4">
                          <div className="text-xs text-on-surface">{relativeTime(ex.created_at)}</div>
                          <div className="text-[10px] text-on-surface-variant/50 font-mono">
                            {new Date(ex.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                            {typeKey.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${ex.status === 'success' ? 'bg-green-500' : 'bg-error'}`} />
                            <span className="text-xs font-mono text-on-surface">{ex.status === 'success' ? '200 OK' : '422 Error'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {conf != null ? (
                            <div className="w-32">
                              <div className="flex justify-between mb-1">
                                <span className="text-[10px] font-mono text-on-surface">{conf.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                                <div className={`${confBar} h-full`} style={{ width: `${conf}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant/40">—</span>
                          )}
                        </td>
                        <td className="p-4 text-xs font-mono text-on-surface-variant">
                          {ex.processing_time_ms != null ? `${ex.processing_time_ms}ms` : '—'}
                        </td>
                        <td className="p-4 text-xs text-on-surface-variant/60">{modelName}</td>
                        <td className="p-4 text-right">
                          <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">chevron_right</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-surface-container-high/30 flex justify-between items-center border-t border-outline-variant/10">
              <span className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/50">
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} extractions
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Detail Panel */}
      {selectedExtraction && (
        <ExtractionDetailPanel
          extraction={selectedExtraction}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

// ── Sortable table header ─────────────────────────────────────────────────────

function Th({ col, onClick, children }: { col: string; onClick: (col: string) => void; children: React.ReactNode }) {
  return (
    <th
      className="p-4 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50 font-medium cursor-pointer hover:text-on-surface-variant select-none"
      onClick={() => onClick(col)}
    >
      <span className="inline-flex items-center">{children}</span>
    </th>
  );
}
