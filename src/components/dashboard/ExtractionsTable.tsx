'use client';

import Link from 'next/link';

interface Extraction {
  id: string;
  document_type: string | null;
  status: string;
  processing_time_ms: number | null;
  confidence_score: number | null;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  invoice: 'text-blue-300',
  receipt: 'text-purple-300',
  resume: 'text-green-300',
  contract: 'text-amber-300',
  id_document: 'text-cyan-300',
  bank_statement: 'text-orange-300',
  form: 'text-pink-300',
  business_card: 'text-teal-300',
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-amber-500' : 'bg-error';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-on-surface">{pct}%</span>
      <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ExtractionsTable({ extractions, loading }: { extractions: Extraction[]; loading: boolean }) {
  const isEmpty = !loading && extractions.length === 0;

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-headline font-bold text-lg text-on-surface">Recent Extractions</h3>
        <Link
          href="/dashboard/extractions"
          className="text-primary text-xs font-bold font-label uppercase tracking-[0.15em] hover:underline"
        >
          View All Logs
        </Link>
      </div>

      {loading && (
        <div className="px-6 py-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-surface-container-highest rounded animate-pulse" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-on-surface-variant/50 mb-4">No extractions yet. Make your first API call:</p>
          <pre className="inline-block bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-[11px] text-secondary font-mono text-left">
{`curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"document": "https://...", "type": "invoice"}'`}
          </pre>
        </div>
      )}

      {!loading && extractions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
                <th className="px-6 py-4 font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50">Timestamp</th>
                <th className="px-6 py-4 font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50">Doc Type</th>
                <th className="px-6 py-4 font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50">Status</th>
                <th className="px-6 py-4 font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50">Latency</th>
                <th className="px-6 py-4 font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50">Confidence</th>
                <th className="px-6 py-4 font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {extractions.map((ex) => {
                const typeColor = TYPE_COLORS[ex.document_type ?? ''] || 'text-blue-300';
                return (
                  <tr key={ex.id} className="hover:bg-surface-container/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">
                      {new Date(ex.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded bg-surface-container-highest text-[10px] font-bold uppercase tracking-tighter ${typeColor}`}>
                        {(ex.document_type ?? 'generic').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${ex.status === 'success' ? 'bg-green-500' : 'bg-error'}`} />
                        <span className="text-xs text-on-surface capitalize">{ex.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/50">
                      {ex.processing_time_ms != null ? `${(ex.processing_time_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {ex.confidence_score != null ? <ConfidenceBar score={ex.confidence_score} /> : <span className="text-xs text-on-surface-variant/50">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-on-surface-variant/30 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
