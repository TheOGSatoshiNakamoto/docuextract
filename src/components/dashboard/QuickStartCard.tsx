'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuickStartCardProps {
  apiKey: string | null;
  hasExtractions: boolean;
  dismissed: boolean;
  onDismiss: () => void;
}

export default function QuickStartCard({ apiKey, hasExtractions, dismissed, onDismiss }: QuickStartCardProps) {
  const [keyCopied, setKeyCopied] = useState(false);

  if (dismissed) return null;

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(20)}${apiKey.slice(-4)}` : 'dk_live_••••••••••••••••••••';

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setKeyCopied(true);
    try { localStorage.setItem('gs-key-copied', 'true'); } catch { /* SSR */ }
    setTimeout(() => setKeyCopied(false), 2000);
  }

  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -F "file=@invoice.pdf" \\
  -F "type=invoice"`;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-12">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-sm uppercase tracking-[0.3em] text-primary">Quick Integration</h3>
          <button
            onClick={onDismiss}
            className="text-on-surface-variant/40 hover:text-on-surface-variant text-xs font-headline uppercase tracking-widest transition-colors"
          >
            Skip setup
          </button>
        </div>
      </div>

      {/* Step 1: API Key */}
      <div className="lg:col-span-4 bg-surface-container rounded-xl p-6 border border-outline-variant/10 hover:border-primary/20 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline text-xs font-bold">1</span>
            <h4 className="font-headline font-bold text-lg text-on-surface">Copy API Key</h4>
          </div>
          <p className="text-sm text-on-surface-variant mb-6">Your production key for authenticated requests to the v1 extraction endpoint.</p>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-3 flex items-center justify-between border border-outline-variant/10">
          <code className="text-xs font-mono text-primary/80 truncate">{maskedKey}</code>
          <button
            onClick={copyKey}
            disabled={!apiKey}
            className="p-1.5 hover:bg-primary/10 rounded-md transition-colors text-primary shrink-0 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">{keyCopied ? 'check' : 'content_copy'}</span>
          </button>
        </div>
      </div>

      {/* Step 2: First Extraction */}
      <div className="lg:col-span-5 bg-surface-container rounded-xl p-6 border border-outline-variant/10 hover:border-primary/20 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline text-xs font-bold">2</span>
          <h4 className="font-headline font-bold text-lg text-on-surface">First Extraction</h4>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10 font-mono text-[11px] leading-relaxed relative group">
          <div className="absolute top-3 right-3 text-[10px] text-on-surface-variant/30 uppercase font-headline">Bash</div>
          <pre className="text-secondary whitespace-pre-wrap break-all">{curlCmd}</pre>
          <button className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high p-2 rounded text-primary">
            <span className="material-symbols-outlined text-xs">content_copy</span>
          </button>
        </div>
      </div>

      {/* Step 3: Review Results */}
      <div className="lg:col-span-3 bg-surface-container rounded-xl p-6 border border-outline-variant/10 hover:border-primary/20 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline text-xs font-bold">3</span>
            <h4 className="font-headline font-bold text-lg text-on-surface">Review Results</h4>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">Analyze the JSON output and extracted entities in the extractions log.</p>
        </div>
        <Link
          href="/dashboard/extractions"
          className="w-full bg-surface-container-high hover:bg-primary/10 border border-outline-variant/20 py-2.5 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.15em] text-center transition-all block"
        >
          View Extractions
        </Link>
      </div>
    </section>
  );
}
