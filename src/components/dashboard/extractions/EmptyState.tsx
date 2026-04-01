'use client';

import Link from 'next/link';

export default function ExtractionsEmptyState({ apiKey }: { apiKey: string | null }) {
  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -F "file=@invoice.pdf" \\
  -F "type=invoice"`;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 max-w-2xl mx-auto text-center">
      {/* Glowing icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(180,197,255,0.15)]">
        <span className="material-symbols-outlined text-3xl text-primary">description</span>
      </div>

      <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">No extractions yet</h2>
      <p className="text-on-surface-variant text-sm max-w-md mb-8">
        Every document you process through the API appears here with the full extracted data,
        confidence scores, and processing details.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Code block */}
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/20 text-left">
          <div className="bg-surface-container-highest px-4 py-2 border-b border-outline-variant/20 flex justify-between items-center">
            <span className="text-[10px] uppercase font-headline font-bold text-on-surface-variant/40 tracking-[0.15em]">
              Shell / cURL
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(curlCmd).catch(() => {})}
              className="text-on-surface-variant/40 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="font-mono text-[11px] leading-relaxed text-secondary whitespace-pre-wrap">{curlCmd}</pre>
          </div>
        </div>

        {/* Next steps */}
        <div className="text-left space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline text-[10px] font-bold shrink-0 mt-0.5">01</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Copy your API Key from the API Keys page</p>
              <p className="text-xs text-on-surface-variant/50 mt-0.5">Authenticate all extraction requests</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline text-[10px] font-bold shrink-0 mt-0.5">02</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Choose a document type or let auto-detection handle it</p>
              <p className="text-xs text-on-surface-variant/50 mt-0.5">Supports invoices, receipts, resumes, and more</p>
            </div>
          </div>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all mt-2"
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            Make your first extraction
          </Link>
          <div>
            <Link href="/docs" className="text-xs text-primary hover:underline font-headline uppercase tracking-[0.15em]">
              Read the quickstart docs &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
