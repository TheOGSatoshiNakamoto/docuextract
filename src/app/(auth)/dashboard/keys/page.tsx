'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  status: 'active' | 'revoked';
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

// ── Plan key limits (mirrors src/lib/plans.ts — client-safe subset) ─────────

const MAX_KEYS: Record<string, number> = {
  free: 2,
  starter: 5,
  pro: 10,
  scale: 25,
};

const RATE_LIMITS: Record<string, string> = {
  free: '5 req/min',
  starter: '30 req/min',
  pro: '60 req/min',
  scale: '120 req/min',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function maskPrefix(prefix: string): string {
  // Show first 8 chars + dots + last 4 chars of prefix
  if (prefix.length <= 12) {
    return `${prefix.slice(0, 8)}••••••••${prefix.slice(-4)}`;
  }
  return `${prefix.slice(0, 8)}••••••••${prefix.slice(-4)}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create key modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<'name' | 'result'>('name');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Revoke confirmation state
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeKeys = keys.filter(k => k.status === 'active');
  const revokedKeys = keys.filter(k => k.status === 'revoked');
  const maxKeys = MAX_KEYS[plan] ?? 2;
  const atLimit = activeKeys.length >= maxKeys;

  // ── Fetch keys ─────────────────────────────────────────────────────────────

  const fetchKeys = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [keysResult, userResult] = await Promise.all([
      supabase.rpc('list_my_api_keys'),
      supabase.from('users').select('plan').eq('id', session.user.id).single(),
    ]);

    if (keysResult.data) setKeys(keysResult.data as ApiKey[]);
    if (userResult.data) setPlan(userResult.data.plan ?? 'free');
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  // ── Create key ─────────────────────────────────────────────────────────────

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setErrorMsg('');

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('create_api_key', { key_name: newKeyName.trim() });

    if (error) {
      setErrorMsg(error.message);
      setCreating(false);
      setShowCreateModal(false);
      return;
    }

    setNewKeyGenerated(data);
    setCreateStep('result');
    setCreating(false);
    fetchKeys();
  }

  function openCreateModal() {
    setNewKeyName('');
    setNewKeyGenerated(null);
    setCreateStep('name');
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setNewKeyName('');
    setNewKeyGenerated(null);
    setCreateStep('name');
  }

  // ── Revoke key ─────────────────────────────────────────────────────────────

  async function revokeKey() {
    if (!revokeTarget) return;
    setRevoking(true);
    setErrorMsg('');

    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('revoke_api_key', { target_key_id: revokeTarget.id });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`Key "${revokeTarget.name}" has been revoked.`);
      setTimeout(() => setSuccessMsg(''), 6000);
      fetchKeys();
    }

    setRevoking(false);
    setRevokeTarget(null);
  }

  // ── Copy ───────────────────────────────────────────────────────────────────

  function copyToClipboard(text: string, id?: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id ?? '__modal__');
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Curl command ───────────────────────────────────────────────────────────

  const curlCmd = `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"document": "https://example.com/invoice.pdf", "type": "invoice"}'`;

  const rateLimit = RATE_LIMITS[plan] ?? '5 req/min';

  // ── Empty state ────────────────────────────────────────────────────────────

  if (!loading && keys.length === 0) {
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
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create your first API key
        </button>
        <Link href="/docs#authentication" className="mt-4 text-xs text-primary hover:underline font-headline uppercase tracking-[0.15em]">
          Read authentication docs &rarr;
        </Link>

        {/* Create modal (shared) */}
        {showCreateModal && renderCreateModal()}
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

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
          onClick={openCreateModal}
          disabled={atLimit}
          className="px-5 py-2.5 bg-primary-container text-white rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Key
        </button>
      </div>

      {/* Key limit indicator */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-on-surface-variant/60 font-label uppercase tracking-[0.15em]">
          {activeKeys.length} of {maxKeys} keys used
        </span>
        <div className="h-1 w-24 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${activeKeys.length >= maxKeys ? 'bg-error' : activeKeys.length >= maxKeys * 0.8 ? 'bg-amber-500' : 'bg-primary-container'}`}
            style={{ width: `${Math.min(100, (activeKeys.length / maxKeys) * 100)}%` }}
          />
        </div>
        {atLimit && (
          <Link href="/dashboard/billing" className="text-[10px] text-primary hover:underline font-headline uppercase tracking-[0.15em]">
            Upgrade for more &rarr;
          </Link>
        )}
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
        <div className="lg:col-span-2 space-y-10">
          {/* Active Keys */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-label uppercase tracking-[0.2em] text-primary">Active Keys</h3>
              <div className="h-[1px] flex-1 bg-outline-variant/10" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />)}
              </div>
            ) : activeKeys.length === 0 ? (
              <div className="p-8 bg-surface-container-low rounded-xl text-center">
                <p className="text-sm text-on-surface-variant/60">No active keys. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeKeys.map((key) => (
                  <div
                    key={key.id}
                    className="group bg-surface-container-low hover:bg-surface-container transition-colors p-5 rounded-xl border border-transparent hover:border-outline-variant/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-headline font-bold text-base text-on-surface">{key.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-label font-bold uppercase text-green-500 tracking-wider">Active</span>
                          <span className="text-[10px] text-on-surface-variant/40 uppercase ml-2">Created {formatDate(key.created_at)}</span>
                          {key.last_used_at && (
                            <span className="text-[10px] text-primary/70 ml-2">Last used {formatRelativeDate(key.last_used_at)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(key.key_prefix, key.id)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all"
                          title="Copy key prefix"
                        >
                          <span className="material-symbols-outlined text-sm">{copiedId === key.id ? 'check' : 'content_copy'}</span>
                        </button>
                        <button
                          onClick={() => setRevokeTarget(key)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                          title="Revoke key"
                        >
                          <span className="material-symbols-outlined text-sm">no_accounts</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant/10">
                      <code className="font-mono text-xs text-on-surface-variant/60 tracking-widest">
                        {maskPrefix(key.key_prefix)}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Revoked Keys */}
          {revokedKeys.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-on-surface-variant/30" />
                <h3 className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant/60">Revoked / Archived</h3>
                <div className="h-[1px] flex-1 bg-outline-variant/10" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant/40">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Key</th>
                      <th className="px-4 py-2">Last Used</th>
                      <th className="px-4 py-2 text-right">Date Revoked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revokedKeys.map((key) => (
                      <tr key={key.id} className="bg-surface-container-low/50 opacity-50 grayscale-[0.5] hover:bg-surface-container transition-all">
                        <td className="px-4 py-3 rounded-l-lg">
                          <p className="font-headline font-bold text-sm text-on-surface-variant/60">{key.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <code className="font-mono text-[10px] text-on-surface-variant/30">{key.key_prefix}••••</code>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant/40">{formatDate(key.last_used_at)}</td>
                        <td className="px-4 py-3 text-right rounded-r-lg">
                          <span className="px-2 py-0.5 bg-surface-container-high border border-outline-variant/10 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/40 rounded mr-2">
                            Revoked
                          </span>
                          <span className="text-xs text-on-surface-variant/40">{formatDate(key.revoked_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
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
                  onClick={() => copyToClipboard(curlCmd, '__curl__')}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-surface-container-high rounded text-on-surface-variant/40 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-xs">{copiedId === '__curl__' ? 'check' : 'content_copy'}</span>
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

      {/* Modals */}
      {showCreateModal && renderCreateModal()}
      {revokeTarget && renderRevokeModal()}
    </div>
  );

  // ── Create Key Modal ───────────────────────────────────────────────────────

  function renderCreateModal() {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={closeCreateModal} />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <h3 className="text-2xl font-headline font-bold text-on-surface">Create New Key</h3>
              <div className="mt-2 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: createStep === 'name' ? '50%' : '100%' }}
                />
              </div>
            </div>

            {createStep === 'name' ? (
              <>
                {/* Name input */}
                <div className="px-8 py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Key Name</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && newKeyName.trim() && createKey()}
                      placeholder="e.g. Production Backend, Staging, Stripe Integration"
                      autoFocus
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <p className="text-[11px] text-primary/60 italic font-body">
                      All keys carry the <code className="font-mono">dk_live_</code> prefix and have full API access.
                    </p>
                  </div>
                </div>
                {/* Footer */}
                <div className="px-8 py-5 bg-surface-container-highest/20 flex justify-end gap-3">
                  <button
                    onClick={closeCreateModal}
                    className="px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 text-on-surface text-xs font-headline font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-surface-container-highest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createKey}
                    disabled={!newKeyName.trim() || creating}
                    className="px-6 py-2.5 bg-primary-container text-white text-xs font-headline font-bold uppercase tracking-[0.15em] rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Generate Key'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Generated key result */}
                <div className="px-8 py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Key Name</label>
                    <div className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-lg text-on-surface text-sm opacity-80">
                      {newKeyName}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-label uppercase tracking-widest text-primary font-bold">Generated Secret Key</label>
                    <div className="group relative bg-surface-container-lowest border-2 border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all">
                      <div className="flex justify-between items-center gap-3">
                        <code className="font-mono text-sm text-primary tracking-tight select-all break-all">{newKeyGenerated}</code>
                        <button
                          onClick={() => newKeyGenerated && copyToClipboard(newKeyGenerated)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors shrink-0"
                          title="Copy Key"
                        >
                          <span className="material-symbols-outlined text-lg">{copiedId === '__modal__' ? 'check' : 'content_copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Security warning */}
                    <div className="flex gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
                      <span className="material-symbols-outlined text-error shrink-0">warning</span>
                      <div>
                        <h4 className="text-[10px] font-label font-bold text-error uppercase tracking-widest">Security Warning</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                          Copy this key now. For security, we won&apos;t show the full secret key again once you leave this page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-surface-container-highest/20 flex justify-end gap-3">
                  <button
                    onClick={() => newKeyGenerated && copyToClipboard(newKeyGenerated)}
                    className="px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 text-on-surface text-xs font-headline font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-surface-container-highest transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">{copiedId === '__modal__' ? 'check' : 'content_copy'}</span>
                    {copiedId === '__modal__' ? 'Copied!' : 'Copy Key'}
                  </button>
                  <button
                    onClick={closeCreateModal}
                    className="px-6 py-2.5 bg-primary-container text-white text-xs font-headline font-bold uppercase tracking-[0.15em] rounded-lg hover:brightness-110 transition-all"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Revoke Key Modal ───────────────────────────────────────────────────────

  function renderRevokeModal() {
    if (!revokeTarget) return null;
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setRevokeTarget(null)} />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl max-w-md w-full p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error text-xl">warning</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Revoke API Key</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Are you sure you want to revoke <strong>&quot;{revokeTarget.name}&quot;</strong>? Any applications using this key will immediately lose access.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-lg p-3 mb-6 border border-outline-variant/10">
              <code className="font-mono text-xs text-on-surface-variant/60">{maskPrefix(revokeTarget.key_prefix)}</code>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRevokeTarget(null)}
                className="px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 text-on-surface text-xs font-headline font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-surface-container-highest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={revokeKey}
                disabled={revoking}
                className="px-6 py-2.5 bg-error text-white text-xs font-headline font-bold uppercase tracking-[0.15em] rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {revoking ? 'Revoking...' : 'Revoke Key'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
