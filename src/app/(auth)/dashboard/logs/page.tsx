'use client';

import { useEffect, useState, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { sanitizeApiUsageRows, type SafeApiUsageRow } from '@/lib/sanitize';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | '2xx' | '4xx' | '5xx';
type TimeRange = 'live' | '15m' | '1h' | '24h' | '7d';

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ apiKey }: { apiKey: string | null }) {
  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : 'dk_live_...';
  const lines = [
    { n: '01', code: <><span className="text-primary">curl</span> -X POST <span className="text-on-surface-variant/60">&quot;https://docuextract.dev/v1/extract&quot;</span> \</> },
    { n: '02', code: <>{'  '}-H <span className="text-on-surface-variant/60">&quot;Authorization: Bearer <span className="text-primary">{maskedKey}</span>&quot;</span> \</> },
    { n: '03', code: <>{'  '}-H <span className="text-on-surface-variant/60">&quot;Content-Type: application/json&quot;</span> \</> },
    { n: '04', code: <>{'  '}-d <span className="text-on-surface-variant/60">&apos;{'{'} &quot;document&quot;: &quot;https://example.com/invoice.pdf&quot;, &quot;type&quot;: &quot;invoice&quot; {'}'}&apos;</span></> },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 max-w-4xl mx-auto text-center">
      {/* Stacked/rotated icons */}
      <div className="relative mb-12 flex justify-center">
        <div className="w-24 h-24 bg-surface-container-low border border-outline-variant/20 flex items-center justify-center rounded-xl -rotate-6 shadow-2xl">
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
        </div>
        <div className="absolute -bottom-2 right-1/3 w-16 h-16 bg-surface-container-high border border-outline-variant/20 flex items-center justify-center rounded-lg rotate-12">
          <span className="material-symbols-outlined text-3xl text-secondary">database</span>
        </div>
      </div>

      <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-4">No API activity yet</h2>
      <p className="text-on-surface-variant max-w-xl mx-auto leading-relaxed mb-12">
        Every API request you make shows up here in real-time — the full request, response, headers, and timing.
      </p>

      {/* Code block with window dots and grid background */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-8 mb-12 border border-outline-variant/10 text-left relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/40" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
              <div className="w-2 h-2 rounded-full bg-green-500/40" />
            </div>
            <span className="ml-4 font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/30">Quick Start Terminal</span>
          </div>
        </div>
        <div className="font-mono text-sm leading-relaxed space-y-1">
          {lines.map(l => (
            <div key={l.n} className="flex gap-4">
              <span className="text-on-surface-variant/20 select-none w-5 text-right">{l.n}</span>
              <code className="text-on-surface">{l.code}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <Link href="/playground" className="px-8 py-3 bg-primary-container text-white rounded-lg font-headline font-bold text-sm hover:brightness-110 transition-all">
          Make your first request
        </Link>
        <Link href="/docs" className="flex items-center gap-2 font-label text-xs uppercase tracking-[0.15em] text-on-surface-variant/50 hover:text-primary transition-colors">
          Read the API reference
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

// ── Inspector Panel ───────────────────────────────────────────────────────────

function InspectorPanel({ row, onClose }: { row: SafeApiUsageRow; onClose: () => void }) {
  const [tab, setTab] = useState<'request' | 'response'>('request');
  const modelName = row.model_used?.includes('sonnet') ? 'Sonnet 4.6' : 'Haiku 4.5';
  const maskedKey = 'dk_live_••••••••' + (row.id?.slice(-4) ?? '****');

  const requestBody = JSON.stringify({
    document: 'https://...',
    type: row.document_type ?? 'auto',
    model: row.model_used?.includes('sonnet') ? 'accurate' : 'fast',
  }, null, 2);

  const responseBody = row.status === 'success'
    ? JSON.stringify({
        data: { '...': 'extracted fields' },
        metadata: {
          type: row.document_type,
          confidence: row.confidence_score,
          model: row.model_used,
          processing_time_ms: row.processing_time_ms,
        },
      }, null, 2)
    : JSON.stringify({
        error: { code: 'extraction_failed', message: row.error_message ?? 'Extraction failed' },
      }, null, 2);

  return (
    <div className="border-l border-outline-variant/10 bg-surface-container-low flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center shrink-0">
        <div className="flex gap-4">
          {(['request', 'response'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`font-headline uppercase tracking-[0.1em] text-[11px] font-bold pb-1 ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'}`}>
              {t === 'request' ? 'Request' : 'Response'}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-on-surface-variant/40 hover:text-on-surface-variant"><span className="material-symbols-outlined text-sm">close</span></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'request' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Request ID', value: row.id.slice(0, 8) },
                { label: 'Model', value: modelName },
                { label: 'Auth', value: maskedKey },
                { label: 'Tokens', value: `${row.input_tokens ?? '—'} in / ${row.output_tokens ?? '—'} out` },
              ].map(item => (
                <div key={item.label} className="bg-surface-container p-3 rounded border border-outline-variant/10">
                  <p className="text-[9px] font-label uppercase tracking-[0.15em] text-on-surface-variant/40 mb-1">{item.label}</p>
                  <p className="text-[11px] font-mono text-on-surface truncate">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 relative group">
              <button onClick={() => navigator.clipboard.writeText(requestBody).catch(() => {})} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/40 hover:text-primary">
                <span className="material-symbols-outlined text-xs">content_copy</span>
              </button>
              <pre className="font-mono text-[11px] leading-relaxed text-secondary overflow-x-auto">{requestBody}</pre>
            </div>
          </>
        )}
        {tab === 'response' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Status', value: row.status === 'success' ? '200 OK' : '422 Error' },
                { label: 'Latency', value: row.processing_time_ms ? `${row.processing_time_ms}ms` : '—' },
              ].map(item => (
                <div key={item.label} className="bg-surface-container p-3 rounded border border-outline-variant/10">
                  <p className="text-[9px] font-label uppercase tracking-[0.15em] text-on-surface-variant/40 mb-1">{item.label}</p>
                  <p className="text-[11px] font-mono text-on-surface">{item.value}</p>
                </div>
              ))}
            </div>
            {row.status !== 'success' && row.error_message && (
              <div className="flex items-start gap-2 p-3 bg-error/5 border border-error/20 rounded-lg">
                <span className="material-symbols-outlined text-error text-sm shrink-0 mt-0.5">error</span>
                <div>
                  <p className="text-xs text-error font-bold mb-1">Error</p>
                  <p className="text-[11px] text-on-surface-variant">{row.error_message}</p>
                  <Link href="/docs#errors" className="text-[10px] text-primary hover:underline mt-1 block">View error docs &rarr;</Link>
                </div>
              </div>
            )}
            <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 relative group">
              <button onClick={() => navigator.clipboard.writeText(responseBody).catch(() => {})} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/40 hover:text-primary">
                <span className="material-symbols-outlined text-xs">content_copy</span>
              </button>
              <pre className="font-mono text-[11px] leading-relaxed text-secondary overflow-x-auto">{responseBody}</pre>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-outline-variant/10 shrink-0 grid grid-cols-3 gap-2">
        <button onClick={() => navigator.clipboard.writeText(tab === 'request' ? requestBody : responseBody).catch(() => {})} className="py-2 border border-outline-variant/20 rounded text-[10px] font-headline uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-xs">content_copy</span> Copy
        </button>
        <Link href="/playground" className="py-2 border border-outline-variant/20 rounded text-[10px] font-headline uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-xs">terminal</span> Playground
        </Link>
        <button className="py-2 border border-outline-variant/20 rounded text-[10px] font-headline uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-xs">refresh</span> Retry
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [rows, setRows] = useState<SafeApiUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [endpointFilter, setEndpointFilter] = useState('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data: userData } = await supabase.from('users').select('api_key').eq('id', session.user.id).single();
      if (userData?.api_key) setApiKey(userData.api_key);

      try {
        const { data } = await supabase
          .from('api_usage')
          .select('id, document_type, status, processing_time_ms, confidence_score, created_at, model_used, input_tokens, output_tokens, error_message')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(500);
        setRows(sanitizeApiUsageRows(data ?? []));
      } catch { /* non-blocking */ }
      finally { setLoading(false); }
    });
  }, []);

  // Live polling
  useEffect(() => {
    if (!live) return;
    const interval = setInterval(async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const lastTs = rows[0]?.created_at;
      let query = supabase
        .from('api_usage')
        .select('id, document_type, status, processing_time_ms, confidence_score, created_at, model_used, input_tokens, output_tokens, error_message')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (lastTs) query = query.gt('created_at', lastTs);
      const { data } = await query;
      if (data && data.length > 0) {
        setRows(prev => [...sanitizeApiUsageRows(data), ...prev].slice(0, 500));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [live, rows]);

  const filtered = useMemo(() => {
    let result = [...rows];

    // Time range
    const now = Date.now();
    if (timeRange === '15m') result = result.filter(r => now - new Date(r.created_at).getTime() < 15 * 60000);
    else if (timeRange === '1h') result = result.filter(r => now - new Date(r.created_at).getTime() < 3600000);
    else if (timeRange === '24h') result = result.filter(r => now - new Date(r.created_at).getTime() < 86400000);
    else if (timeRange === '7d') result = result.filter(r => now - new Date(r.created_at).getTime() < 7 * 86400000);

    // Status
    if (statusFilter === '2xx') result = result.filter(r => r.status === 'success');
    else if (statusFilter === '4xx') result = result.filter(r => r.status === 'error');
    else if (statusFilter === '5xx') result = result.filter(r => r.status === 'rate_limited');

    // Endpoint
    if (endpointFilter !== 'all') {
      result = result.filter(r => r.document_type === endpointFilter || endpointFilter === '/v1/health');
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.id.toLowerCase().includes(q) || (r.document_type ?? '').includes(q) || (r.error_message ?? '').toLowerCase().includes(q));
    }

    return result;
  }, [rows, statusFilter, endpointFilter, timeRange, searchQuery]);

  const selectedRow = selectedId ? rows.find(r => r.id === selectedId) ?? null : null;

  const statusCounts = useMemo(() => ({
    all: rows.length,
    '2xx': rows.filter(r => r.status === 'success').length,
    '4xx': rows.filter(r => r.status === 'error').length,
    '5xx': rows.filter(r => r.status === 'rate_limited').length,
  }), [rows]);

  // Empty state
  if (!loading && rows.length === 0) return <EmptyState apiKey={apiKey} />;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Filter bar */}
      <div className="p-4 border-b border-outline-variant/10 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-sm">search</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search request IDs, types, errors..."
              className="w-full bg-surface-container-lowest border-none text-xs text-on-surface pl-9 pr-4 py-2 rounded-lg focus:ring-1 focus:ring-primary/50 focus:outline-none"
            />
          </div>

          {/* Status tabs */}
          <div className="flex p-0.5 bg-surface-container-low rounded-lg border border-outline-variant/10">
            {(['all', '2xx', '4xx', '5xx'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-headline font-bold uppercase tracking-[0.1em] rounded-md transition-colors ${
                  statusFilter === s ? 'bg-primary-container text-white' : 'text-on-surface-variant/40 hover:text-on-surface-variant'
                }`}
              >
                {s === 'all' ? 'All' : s} <span className="opacity-60 ml-1">{statusCounts[s]}</span>
              </button>
            ))}
          </div>

          {/* Endpoint filter */}
          <select
            value={endpointFilter}
            onChange={e => setEndpointFilter(e.target.value)}
            className="bg-surface-container-high border-none rounded text-xs text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All Endpoints</option>
            <option value="invoice">/v1/extract</option>
            <option value="/v1/health">/v1/health</option>
          </select>

          {/* Time range */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as TimeRange)}
            className="bg-surface-container-high border-none rounded text-xs text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary/50"
          >
            <option value="live">Live</option>
            <option value="15m">Last 15 min</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>

          {/* Live toggle */}
          <button
            onClick={() => setLive(l => !l)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-headline font-bold uppercase tracking-[0.1em] border transition-colors ${
              live ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-surface-container-high border-outline-variant/10 text-on-surface-variant/40'
            }`}
          >
            {live && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            {live ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Content: table + inspector */}
      <div className="flex-1 flex min-h-0">
        {/* Log feed */}
        <div className={`${selectedRow ? 'w-1/2' : 'w-full'} overflow-y-auto transition-all`}>
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-surface-container-low rounded animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-surface-container-high/80 backdrop-blur-sm border-b border-outline-variant/10 text-[10px] font-label uppercase tracking-[0.12em] text-on-surface-variant/40">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-3 py-3 font-medium">Method</th>
                  <th className="px-3 py-3 font-medium">Endpoint</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Latency</th>
                  {!selectedRow && <th className="px-3 py-3 font-medium">Type</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filtered.map(row => {
                  const isError = row.status !== 'success';
                  const isSelected = row.id === selectedId;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(isSelected ? null : row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5' : isError ? 'bg-error/3 border-l-2 border-l-error/30' : 'hover:bg-surface-container/50'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-[11px] font-mono text-on-surface-variant">
                        {new Date(row.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-mono font-bold text-primary">POST</span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-mono text-on-surface-variant/60">/v1/extract</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'success' ? 'bg-green-500' : 'bg-error'}`} />
                          <span className="text-[11px] font-mono">{row.status === 'success' ? '200' : '422'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-mono text-on-surface-variant/50">
                        {row.processing_time_ms ? `${row.processing_time_ms}ms` : '—'}
                      </td>
                      {!selectedRow && (
                        <td className="px-3 py-2.5">
                          {row.document_type && (
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-[9px] font-mono text-on-surface-variant/50 uppercase">
                              {row.document_type.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-on-surface-variant/40">No logs match your filters</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Inspector */}
        {selectedRow && (
          <div className="w-1/2 border-l border-outline-variant/10">
            <InspectorPanel row={selectedRow} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
