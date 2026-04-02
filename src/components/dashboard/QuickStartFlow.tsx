'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import OnboardingStep from './OnboardingStep';

interface QuickStartFlowProps {
  apiKey: string | null;
  hasExtractions: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function QuickStartFlow({ apiKey, hasExtractions, onComplete, onSkip }: QuickStartFlowProps) {
  const [keyCopied, setKeyCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'dragging' | 'uploading' | 'done' | 'error'>('idle');
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [step1Done, setStep1Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  useEffect(() => {
    try {
      setStep1Done(localStorage.getItem('gs-key-copied') === 'true');
      setStep3Done(localStorage.getItem('gs-viewed-extractions') === 'true');
    } catch { /* SSR */ }
  }, []);

  const step2Done = hasExtractions;
  const allDone = step1Done && step2Done && step3Done;

  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(timer);
    }
  }, [allDone, onComplete]);

  // Determine active step
  const activeStep = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : 0;

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setKeyCopied(true);
    setStep1Done(true);
    try { localStorage.setItem('gs-key-copied', 'true'); } catch { /* SSR */ }
    setTimeout(() => setKeyCopied(false), 2000);
  }

  function markStep3() {
    setStep3Done(true);
    try { localStorage.setItem('gs-viewed-extractions', 'true'); } catch { /* SSR */ }
  }

  async function handleFileUpload(file: File) {
    if (!apiKey) {
      setUploadError('API key not loaded. Copy your key first (Step 1).');
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Upload a PDF, PNG, JPG, or WEBP.');
      return;
    }

    setUploadState('uploading');
    setUploadFileName(file.name);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'invoice');

      const res = await fetch('/v1/extract', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      });

      if (res.ok) {
        setUploadState('done');
      } else {
        const data = await res.json().catch(() => ({}));
        setUploadError(data?.error?.message ?? `Extraction failed (${res.status}). Try again.`);
        setUploadState('error');
      }
    } catch {
      setUploadError('Network error. Check your connection and try again.');
      setUploadState('error');
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setUploadState('idle');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  const maskedKey = apiKey ? `dk_live_${'•'.repeat(16)}${apiKey.slice(-4)}` : 'dk_live_••••••••••••••••••••';

  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -F "file=@invoice.pdf" \\
  -F "type=invoice"`;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-10 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-on-surface font-headline leading-tight tracking-tight">
            Welcome to DocuExtract
          </h1>
          <p className="text-sm text-on-surface-variant">Get up and running in under 3 minutes.</p>
        </div>
        <button
          onClick={onSkip}
          className="text-on-surface-variant/60 hover:text-primary transition-colors font-headline text-xs uppercase tracking-[0.15em]"
        >
          Skip setup
        </button>
      </header>

      {/* Steps */}
      <div className="space-y-8 relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-10 bottom-10 w-[1px] bg-outline-variant/30 hidden md:block" />

        {/* Step 1: Copy API Key */}
        <OnboardingStep
          step={1}
          title="Copy your API key"
          description="Use this key to authenticate your requests. Keep it secret."
          active={activeStep === 1}
          complete={step1Done}
        >
          <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant/20 flex items-center justify-between gap-4">
            <code className="text-primary font-mono text-sm tracking-wider truncate">{maskedKey}</code>
            <button
              onClick={copyKey}
              disabled={!apiKey}
              className="flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">{keyCopied ? 'check' : 'content_copy'}</span>
              {keyCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/50 font-headline">
            <span className="material-symbols-outlined text-sm">lock</span>
            Store this key securely — it authenticates all your API requests.
          </div>
        </OnboardingStep>

        {/* Step 2: Make Extraction */}
        <OnboardingStep
          step={2}
          title="Make your first extraction"
          description="Send a document to our API via cURL or upload directly."
          active={activeStep === 2}
          complete={step2Done}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/20">
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
                <div className="p-6 overflow-x-auto">
                  <pre className="font-mono text-sm leading-relaxed text-secondary whitespace-pre-wrap break-all">{curlCmd}</pre>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setUploadState('dragging'); }}
                onDragLeave={() => setUploadState('idle')}
                onDrop={handleDrop}
                className={`h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${
                  uploadState === 'dragging'
                    ? 'border-primary bg-primary/5'
                    : uploadState === 'uploading'
                    ? 'border-primary/40 bg-surface-container-lowest'
                    : uploadState === 'done'
                    ? 'border-green-500/40 bg-green-500/5'
                    : uploadState === 'error'
                    ? 'border-error/40 bg-error/5'
                    : 'border-outline-variant/30 bg-surface-container-lowest/50 hover:bg-surface-container-lowest hover:border-primary/40'
                }`}
              >
                {uploadState === 'uploading' ? (
                  <>
                    <span className="material-symbols-outlined text-primary mb-2 text-3xl animate-pulse">hourglass_top</span>
                    <span className="text-xs font-headline font-bold uppercase tracking-[0.15em] text-on-surface mb-1">Extracting...</span>
                    <span className="text-[10px] text-on-surface-variant/50">{uploadFileName}</span>
                  </>
                ) : uploadState === 'done' ? (
                  <>
                    <span className="material-symbols-outlined text-green-400 mb-2 text-3xl">check_circle</span>
                    <span className="text-xs font-headline font-bold uppercase tracking-[0.15em] text-green-400 mb-1">Extraction Complete</span>
                    <span className="text-[10px] text-on-surface-variant/50">{uploadFileName}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-primary mb-2 text-3xl">cloud_upload</span>
                    <span className="text-xs font-headline font-bold uppercase tracking-[0.15em] text-on-surface mb-1">Upload Document</span>
                    <span className="text-[10px] text-on-surface-variant/50">Drop PDF, PNG, or JPG</span>
                  </>
                )}
              </div>
              {uploadError && (
                <p className="text-xs text-error mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        </OnboardingStep>

        {/* Step 3: Review Results */}
        <OnboardingStep
          step={3}
          title="Review your results"
          description="See how DocuExtract structured your document data."
          active={activeStep === 3}
          complete={step3Done}
        >
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/extractions"
              onClick={markStep3}
              className="flex items-center gap-3 bg-surface-container-high px-5 py-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-all group/link"
            >
              <span className="material-symbols-outlined text-primary">data_object</span>
              <div className="text-left">
                <div className="text-[10px] font-headline font-bold uppercase tracking-[0.15em] text-primary">Live View</div>
                <div className="text-sm font-semibold text-on-surface">View Extractions</div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/30 ml-4 group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              href="/docs#sdks"
              className="flex items-center gap-3 bg-surface-container-high px-5 py-3 rounded-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-all group/link"
            >
              <span className="material-symbols-outlined text-secondary">sdk</span>
              <div className="text-left">
                <div className="text-[10px] font-headline font-bold uppercase tracking-[0.15em] text-secondary">SDKs</div>
                <div className="text-sm font-semibold text-on-surface">Install Python/Node</div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/30 ml-4 group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </OnboardingStep>
      </div>

      {/* All done celebration */}
      {allDone && (
        <div className="mt-8 text-center py-8">
          <span className="material-symbols-outlined text-primary text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            celebration
          </span>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-1">You&apos;re all set!</h3>
          <p className="text-sm text-on-surface-variant">Redirecting to your dashboard...</p>
        </div>
      )}

      {/* Footer */}
      {!allDone && (
        <footer className="mt-16 pt-8 border-t border-outline-variant/15 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/docs" className="flex items-center gap-2 text-on-surface-variant/50 hover:text-primary transition-colors text-xs font-headline font-bold uppercase tracking-[0.15em]">
              <span className="material-symbols-outlined text-sm">menu_book</span>
              Read the quickstart docs
            </Link>
            <Link href="/playground" className="flex items-center gap-2 text-on-surface-variant/50 hover:text-primary transition-colors text-xs font-headline font-bold uppercase tracking-[0.15em]">
              <span className="material-symbols-outlined text-sm">terminal</span>
              Try the playground
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-headline uppercase tracking-[0.15em] text-on-surface-variant/40">API Systems Operational</span>
          </div>
        </footer>
      )}

      {/* Background glow */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
