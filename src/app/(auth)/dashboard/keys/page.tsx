'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

// ── Plan rate limits ──────────────────────────────────────────────────────────

const RATE_LIMITS: Record<string, string> = {
  free: '10 req/min',
  starter: '30 req/min',
  pro: '60 req/min',
  scale: '120 req/min',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KeysPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');
  const [revealed, setRevealed] = useState(false);
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from('users')
        .select('api_key, plan, created_at')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setApiKey(data.api_key);
        setPlan(data.plan ?? 'free');
        setCreatedAt(data.created_at);
      }
      setLoading(false);
    });
  }, []);

  function copyKey(key?: string) {
    const k = key ?? apiKey;
    if (!k) return;
    navigator.clipboard.writeText(k).catch(() => {});
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  async function regenerateKey() {
    setRegenerating(true);
    setConfirmRegen(false);
    setErrorMsg('');

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('regenerate_my_api_key');
    if (error) {
      setErrorMsg(`Failed to regenerate key: ${error.message}`);
    } else if (data) {
      setApiKey(data);
      setRevealed(true);
      setNewKeyGenerated(data);
      setShowCreateModal(true);
      setSuccessMsg('New API key generated successfully.');
      setTimeout(() => setSuccessMsg(''), 6000);
    } else {
      setErrorMsg('Failed to regenerate key. Please try again.');
    }
    setRegenerating(false);
  }

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(20)}${apiKey.slice(-4)}` : '—';
  const rateLimit = RATE_LIMITS[plan] ?? '10 req/min';

  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"document": "https://example.com/invoice.pdf", "type": "invoice"}'`;

  // Empty state
  if (!loading && !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(180,197,255,0.15)]">
          <span className="material-symbols-outlined text-3xl text-primary">vpn_key</span>
        </div>
        <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Create your first API key</h2>
        <p className="text-on-surface-variant text-sm max-w-md mb-8">
          API keys authenticate your requests to the DocuExtract API. You need at least one key to start making extraction calls.
        </p>
        <button
          onClick={regenerateKey}
          disabled={regenerating}
          className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {regenerating ? 'Creating...' : 'Create your first API key'}
        </button>
        <Link href="/docs#authentication" className="mt-4 text-xs text-primary hover:underline font-headline uppercase tracking-[0.15em]">
          Read authentication docs &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-4xl font-headline font-bold tracking-tighter text-on-surface">API Keys</h2>
          <p className="text-on-surface-variant mt-1 max-w-lg">
            Manage secret keys that grant access to the DocuExtract API and document processing pipelines.
          </p>
        </div>
        <button
          onClick={() => { setConfirmRegen(false); regenerateKey(); }}
          disabled={regenerating}
          className="px-5 py-2.5 bg-primary-container text-white rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {regenerating ? 'Creating...' : 'Regenerate Key'}
        </button>
      </div>

      {/* Banners */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
          <p className="text-sm text-on-surface">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
          <span className="material-symbols-outlined text-error text-lg">error</span>
          <p className="text-sm text-on-surface flex-1">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="text-on-surface-variant/40 hover:text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Key management (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Keys */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant/60">Active Keys</h3>
            </div>
            {loading ? (
              <div className="h-24 bg-surface-container-low rounded-xl animate-pulse" />
            ) : (
              <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
                <div className="p-5 flex items-center justify-between gap-4 group hover:bg-surface-container/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface mb-1">Production Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-primary/70 tracking-wider truncate">
                        {revealed ? apiKey : maskedKey}
                      </code>
                      <span className={`w-1.5 h-1.5 rounded-full bg-green-500 shrink-0`} />
                    </div>
                    <p className="text-[10px] text-on-surface-variant/40 mt-1">
                      Created {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setRevealed(r => !r)}
                      className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
                      title={revealed ? 'Hide key' : 'Reveal key'}
                    >
                      <span className="material-symbols-outlined text-sm">{revealed ? 'visibility_off' : 'visibility'}</span>
                    </button>
                    <button
                      onClick={() => copyKey()}
                      className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
                      title="Copy key"
                    >
                      <span className="material-symbols-outlined text-sm">{copying ? 'check' : 'content_copy'}</span>
                    </button>
                    {confirmRevoke ? (
                      <div className="flex gap-1">
                        <button onClick={() => setConfirmRevoke(false)} className="px-2 py-1 text-[10px] text-on-surface-variant hover:text-on-surface bg-surface-container-high rounded">Cancel</button>
                        <button onClick={regenerateKey} className="px-2 py-1 text-[10px] text-error bg-error/10 rounded hover:bg-error/20">Confirm</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRevoke(true)}
                        className="p-2 hover:bg-error/10 rounded-lg transition-colors text-on-surface-variant hover:text-error"
                        title="Revoke & regenerate"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right: Quick Integration (1/3, sticky) */}
        <div className="lg:sticky lg:top-24 space-y-6 self-start">
          {/* Quick Integration */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/10">
              <h4 className="text-xs font-label uppercase tracking-[0.15em] text-on-surface-variant/60 font-bold">Quick Integration</h4>
            </div>
            <div className="p-4">
              <div className="bg-surface-container-lowest rounded-lg p-4 font-mono text-[11px] leading-relaxed text-secondary relative group overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">{curlCmd}</pre>
                <button
                  onClick={() => navigator.clipboard.writeText(curlCmd).catch(() => {})}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-surface-container-high rounded text-on-surface-variant/40 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security info */}
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">shield</span>
              <div>
                <p className="text-xs font-bold text-on-surface mb-1">Security Recommendation</p>
                <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
                  Never expose your API key in client-side code or public repositories. Use environment variables and server-side calls only.
                </p>
              </div>
            </div>
          </div>

          {/* Rate limit */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-4">
            <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/40 mb-2">Rate Limit</p>
            <p className="text-lg font-headline font-bold text-on-surface">{rateLimit}</p>
            <p className="text-[10px] text-on-surface-variant/40 mt-1 capitalize">{plan} plan</p>
          </div>

          {/* Docs link */}
          <Link
            href="/docs#authentication"
            className="flex items-center gap-2 text-xs text-primary hover:underline font-headline uppercase tracking-[0.15em] px-1"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            Full API Documentation
          </Link>
        </div>
      </div>

      {/* Create/Regenerate Modal */}
      {showCreateModal && newKeyGenerated && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl max-w-lg w-full p-8 relative">
              {/* Close */}
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-on-surface-variant/40 hover:text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface">API Key Generated</h3>
                <p className="text-sm text-on-surface-variant mt-1">Copy this key now. For security, we won&apos;t show the full key again.</p>
              </div>

              {/* Key display */}
              <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 mb-4">
                <code className="text-sm font-mono text-primary break-all select-all">{newKeyGenerated}</code>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-6">
                <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">warning</span>
                <p className="text-[11px] text-on-surface-variant">
                  This is the only time the full key will be displayed. If you lose it, you&apos;ll need to regenerate a new one, which will invalidate the current key.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyKey(newKeyGenerated)}
                  className="flex-1 py-3 border border-outline-variant/20 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.15em] hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">{copying ? 'check' : 'content_copy'}</span>
                  {copying ? 'Copied!' : 'Copy Key'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-primary-container text-white rounded-lg text-xs font-headline font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
