'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ExtractionDetail {
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

interface Props {
  extraction: ExtractionDetail;
  onClose: () => void;
}

type Tab = 'data' | 'request' | 'error';

export default function ExtractionDetailPanel({ extraction, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('data');
  const isFailed = extraction.status !== 'success';
  const confidence = extraction.confidence_score ? (extraction.confidence_score * 100).toFixed(1) : null;

  const sampleJson = `{
  "document_type": "${extraction.document_type ?? 'generic'}",
  "confidence": ${confidence ?? 'null'},
  "extracted_data": {
    "fields": "...",
    "metadata": "..."
  }
}`;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'data', label: 'Extracted Data', show: true },
    { id: 'request', label: 'Request Details', show: true },
    { id: 'error', label: 'Error Details', show: isFailed },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#0a0c12] shadow-2xl z-50 border-l border-outline-variant/10 flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-outline-variant/10 shrink-0">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">description</span>
              Extraction Detail
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex gap-4">
            {tabs.filter(t => t.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-headline uppercase tracking-[0.1em] text-[11px] font-bold pb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'data' && (
            <>
              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
                  <p className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface-variant/50 mb-1">Doc Type</p>
                  <p className="text-xs font-bold text-on-surface capitalize">{(extraction.document_type ?? 'Generic').replace('_', ' ')}</p>
                </div>
                <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
                  <p className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface-variant/50 mb-1">Confidence Score</p>
                  <p className={`text-xs font-bold ${confidence && parseFloat(confidence) >= 90 ? 'text-green-400' : 'text-on-surface'}`}>
                    {confidence ? `${confidence}%` : '—'}
                  </p>
                </div>
              </div>

              {/* JSON Preview */}
              <div className="bg-surface-container-lowest rounded-lg p-5 border border-outline-variant/10 relative group">
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigator.clipboard.writeText(sampleJson).catch(() => {})}
                    className="bg-surface-container-highest p-1.5 rounded hover:brightness-125 transition-all"
                    title="Copy JSON"
                  >
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">content_copy</span>
                  </button>
                </div>
                <pre className="font-mono text-xs leading-relaxed text-secondary overflow-x-auto">{sampleJson}</pre>
              </div>

              {/* System Insights */}
              <div className="space-y-3">
                <h4 className="font-headline text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant/50">System Insights</h4>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-sm">info</span>
                  <p className="text-[11px] text-on-surface-variant">
                    {confidence && parseFloat(confidence) >= 95
                      ? 'All fields above 95% confidence. No manual review needed.'
                      : 'Some fields below 95% confidence. Manual review recommended.'}
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'request' && (
            <div className="space-y-4">
              {[
                { label: 'Request ID', value: extraction.id },
                { label: 'Endpoint', value: 'POST /v1/extract' },
                { label: 'Status', value: `${extraction.status === 'success' ? '200 OK' : '422 Error'}` },
                { label: 'Model', value: extraction.model_used ?? 'Haiku 4.5' },
                { label: 'Input Tokens', value: extraction.input_tokens?.toLocaleString() ?? '—' },
                { label: 'Output Tokens', value: extraction.output_tokens?.toLocaleString() ?? '—' },
                { label: 'Latency', value: extraction.processing_time_ms ? `${extraction.processing_time_ms}ms` : '—' },
                { label: 'Timestamp', value: new Date(extraction.created_at).toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container p-4 rounded border border-outline-variant/10">
                  <p className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface-variant/50 mb-1">{item.label}</p>
                  <p className="text-xs font-mono text-on-surface">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'error' && isFailed && (
            <div className="space-y-4">
              <div className="bg-error/5 border border-error/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-error text-sm">error</span>
                  <p className="text-sm font-bold text-error">Extraction Failed</p>
                </div>
                <p className="text-xs text-on-surface-variant">{extraction.error_message ?? 'An unknown error occurred during extraction.'}</p>
              </div>
              <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
                <p className="font-label text-[9px] uppercase tracking-[0.15em] text-on-surface-variant/50 mb-1">Suggestion</p>
                <p className="text-xs text-on-surface-variant">Check that the document is a valid PDF, PNG, JPG, or WEBP under 10MB. If the issue persists, try with a higher quality scan.</p>
              </div>
              <Link href="/docs#errors" className="text-xs text-primary hover:underline font-headline uppercase tracking-[0.15em]">
                View error documentation &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-outline-variant/10 bg-surface-container-low/50 shrink-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-outline-variant/20 hover:bg-surface-container-high py-2.5 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] transition-all text-on-surface">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Retry
            </button>
            <Link
              href="/playground"
              className="flex items-center justify-center gap-2 border border-outline-variant/20 hover:bg-surface-container-high py-2.5 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] transition-all text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">terminal</span>
              Playground
            </Link>
          </div>
          <button
            onClick={() => {
              const blob = new Blob([sampleJson], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `extraction-${extraction.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full bg-primary-container text-white py-2.5 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
          >
            Download Full JSON
          </button>
        </footer>
      </aside>
    </>
  );
}
