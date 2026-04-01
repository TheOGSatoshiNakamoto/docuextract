'use client';

import Link from 'next/link';

export default function UsageEmptyState({ apiKey }: { apiKey: string | null }) {
  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -F "file=@invoice.pdf" \\
  -F "type=invoice"`;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 max-w-2xl mx-auto text-center">
      <div className="mb-8 relative">
        <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full" />
        <div className="relative w-24 h-24 bg-surface-container border border-outline-variant/20 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary/50">bar_chart</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold font-headline text-on-surface mb-4 tracking-tight">No usage data yet</h2>
      <p className="text-on-surface-variant max-w-lg mb-10 leading-relaxed">
        Once you make your first API call, this page will show your usage trends, document type breakdown, success rates, and more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
        {/* Code block */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6 text-left overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <p className="font-headline uppercase text-[10px] tracking-[0.15em] text-primary font-bold">Sample cURL Command</p>
            <span className="text-[10px] text-on-surface-variant/30 font-mono">POST /v1/extract</span>
          </div>
          <div className="bg-black/40 rounded-lg p-5 font-mono text-sm text-secondary leading-relaxed relative">
            <pre className="whitespace-pre-wrap break-all">{curlCmd}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(curlCmd).catch(() => {})}
              className="absolute top-4 right-4 text-on-surface-variant/30 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </div>
        </div>

        {/* Next steps */}
        <div className="flex flex-col gap-6 text-left h-full justify-center">
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold tracking-[0.15em] uppercase text-on-surface-variant/40">Suggested Next Steps</h4>
            <div className="space-y-3">
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-5 h-5 shrink-0 bg-surface-container-highest rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">01</span>
                </div>
                <p className="text-xs text-on-surface-variant">Copy your <span className="text-primary">API Key</span> from the API Keys page.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-5 h-5 shrink-0 bg-surface-container-highest rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">02</span>
                </div>
                <p className="text-xs text-on-surface-variant">Choose a document type or let <span className="text-primary">auto-detection</span> handle it.</p>
              </div>
            </div>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/playground"
              className="bg-primary-container hover:brightness-110 text-white font-headline uppercase text-[11px] font-bold tracking-[0.15em] px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              Make your first extraction
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link href="/docs" className="text-center font-headline uppercase text-[11px] font-bold tracking-[0.15em] text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
              Read the quickstart docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
