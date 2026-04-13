'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const ALL_EVENTS = [
  'extraction.completed',
  'extraction.failed',
  'usage.limit.approaching',
  'usage.limit.reached',
  'subscription.created',
  'subscription.updated',
  'subscription.cancelled',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
];

const SAMPLE_PAYLOAD = `{
  "id": "wh_evt_a1b2c3d4e5f6",
  "event": "extraction.completed",
  "created": 1775059200,
  "data": {
    "extraction_id": "ext_9z8y7x",
    "status": "success",
    "confidence": 0.9942
  }
}`;

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 max-w-2xl mx-auto text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 bg-surface-container border border-outline-variant/20 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary">webhook</span>
        </div>
      </div>

      <h2 className="text-3xl font-headline font-bold text-on-surface mb-4 tracking-tight">Configure Webhooks</h2>
      <p className="text-on-surface-variant max-w-lg mb-10 leading-relaxed">
        Receive real-time HTTP POST notifications when extractions complete, usage limits approach, or payments process. HMAC-SHA256 signed for security.
      </p>

      {/* Payload preview */}
      <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-left mb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/40" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/30">payload_preview.json</span>
        </div>
        <pre className="font-mono text-sm leading-relaxed text-secondary overflow-x-auto">{SAMPLE_PAYLOAD}</pre>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={onAdd}
          className="bg-primary-container text-white px-8 py-3 rounded-lg font-headline font-bold text-sm hover:brightness-110 transition-all"
        >
          Add your first endpoint
        </button>
        <Link href="/docs#webhooks" className="flex items-center gap-2 text-primary font-label text-xs uppercase tracking-[0.15em] hover:underline">
          Read webhook documentation
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

// ── Add/Edit Endpoint Panel ───────────────────────────────────────────────────

function AddEndpointPanel({ onClose, onSave }: { onClose: () => void; onSave: (endpoint: WebhookEndpoint, secret: string) => void }) {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleEvent(event: string) {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  }

  function toggleAll() {
    setSelectedEvents(prev => prev.length === ALL_EVENTS.length ? [] : [...ALL_EVENTS]);
  }

  async function handleSave() {
    setError('');
    if (!url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }
    if (selectedEvents.length === 0) {
      setError('Select at least one event');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description, events: selectedEvents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create endpoint');
        return;
      }
      onSave(data.endpoint, data.signing_secret);
    } catch {
      setError('Network error. Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#0a0c12] shadow-2xl z-50 border-l border-outline-variant/10 flex flex-col">
        <header className="p-6 border-b border-outline-variant/10 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-lg font-bold text-on-surface">Add Webhook Endpoint</h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/5 border border-error/20 rounded-lg">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          {/* URL */}
          <div>
            <label className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/50 block mb-2">Endpoint URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg px-4 py-3 text-sm text-on-surface focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/50 block mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Production extraction handler"
              className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary rounded-t-lg px-4 py-3 text-sm text-on-surface focus:outline-none transition-colors"
            />
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/50">Events to subscribe</label>
              <button onClick={toggleAll} className="text-[10px] text-primary font-headline uppercase tracking-[0.1em] hover:underline">
                {selectedEvents.length === ALL_EVENTS.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="space-y-2">
              {ALL_EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-container-high/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container-lowest text-primary-container focus:ring-primary/50"
                  />
                  <code className="text-xs font-mono text-on-surface-variant">{event}</code>
                </label>
              ))}
            </div>
          </div>
        </div>

        <footer className="p-6 border-t border-outline-variant/10 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-outline-variant/20 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-primary-container text-white rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Save Endpoint'}
          </button>
        </footer>
      </aside>
    </>
  );
}

// ── Secret Display Modal ──────────────────────────────────────────────────────

function SecretModal({ secret, onClose }: { secret: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl max-w-lg w-full p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-400 text-2xl">lock</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Signing Secret</h3>
            <p className="text-sm text-on-surface-variant mt-1">Copy this secret now. It won&apos;t be shown again.</p>
          </div>
          <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 mb-4">
            <code className="text-sm font-mono text-primary break-all select-all">{secret}</code>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-6">
            <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">warning</span>
            <p className="text-[11px] text-on-surface-variant">
              Use this secret to verify webhook signatures. Store it securely in your server&apos;s environment variables.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { navigator.clipboard.writeText(secret).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex-1 py-3 border border-outline-variant/20 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy Secret'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-primary-container text-white rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] hover:brightness-110 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Endpoint Card ─────────────────────────────────────────────────────────────

function EndpointCard({ endpoint, onToggle, onDelete, onTest }: {
  endpoint: WebhookEndpoint;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 hover:border-outline-variant/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${endpoint.enabled ? 'bg-green-500 shadow-[0_0_6px_rgba(74,222,128,0.4)]' : 'bg-outline-variant/30'}`} />
            <code className="text-sm font-mono text-on-surface truncate">{endpoint.url}</code>
          </div>
          {endpoint.description && (
            <p className="text-xs text-on-surface-variant/50 ml-4">{endpoint.description}</p>
          )}
        </div>
        <button
          onClick={() => onToggle(endpoint.id, !endpoint.enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3 cursor-pointer ${endpoint.enabled ? 'bg-primary-container' : 'bg-surface-container-highest'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${endpoint.enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* Event badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {endpoint.events.map(e => (
          <span key={e} className="px-2 py-0.5 rounded bg-surface-container-highest text-[9px] font-mono text-on-surface-variant/60 uppercase">
            {e}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-on-surface-variant/40">
        <span>Created {new Date(endpoint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <div className="flex items-center gap-3">
          {endpoint.enabled && (
            <button
              onClick={() => onTest(endpoint.id)}
              className="text-primary hover:text-primary/80 transition-colors font-headline font-bold uppercase tracking-[0.1em]"
            >
              Send Test
            </button>
          )}
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="text-on-surface-variant hover:text-on-surface">Cancel</button>
              <button onClick={() => onDelete(endpoint.id)} className="text-error hover:text-error/80">Confirm Delete</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-on-surface-variant/40 hover:text-error transition-colors">
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  async function fetchEndpoints() {
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      setEndpoints(data.endpoints ?? []);
    } catch { /* non-blocking */ }
    finally { setLoading(false); }
  }

  async function toggleEndpoint(id: string, enabled: boolean) {
    await fetch(`/api/webhooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    setEndpoints(prev => prev.map(e => e.id === id ? { ...e, enabled } : e));
  }

  async function deleteEndpoint(id: string) {
    await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
    setEndpoints(prev => prev.filter(e => e.id !== id));
  }

  function handleEndpointCreated(endpoint: WebhookEndpoint, secret: string) {
    setShowAddPanel(false);
    setNewSecret(secret);
    setEndpoints(prev => [endpoint, ...prev]);
  }

  async function testEndpoint(id: string) {
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' });
      if (res.ok) {
        alert('Test event sent! Check your endpoint for the delivery.');
      } else {
        const data = await res.json();
        alert(`Test failed: ${data.error ?? 'Unknown error'}`);
      }
    } catch {
      alert('Failed to send test event. Please try again.');
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {[1, 2].map(i => <div key={i} className="h-32 bg-surface-container-low rounded-xl animate-pulse" />)}
      </div>
    );
  }

  // Empty state
  if (endpoints.length === 0 && !showAddPanel) {
    return (
      <>
        <EmptyState onAdd={() => setShowAddPanel(true)} />
        {showAddPanel && <AddEndpointPanel onClose={() => setShowAddPanel(false)} onSave={handleEndpointCreated} />}
      </>
    );
  }

  // Populated state
  return (
    <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Webhooks</h2>
          <p className="text-on-surface-variant mt-1">Receive real-time notifications when events occur.</p>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          className="px-5 py-2.5 bg-primary-container text-white rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Endpoint
        </button>
      </div>

      {/* Endpoint cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {endpoints.map(ep => (
          <EndpointCard
            key={ep.id}
            endpoint={ep}
            onToggle={toggleEndpoint}
            onDelete={deleteEndpoint}
            onTest={testEndpoint}
          />
        ))}
      </div>

      {/* Add panel */}
      {showAddPanel && <AddEndpointPanel onClose={() => setShowAddPanel(false)} onSave={handleEndpointCreated} />}

      {/* Secret modal */}
      {newSecret && <SecretModal secret={newSecret} onClose={() => setNewSecret(null)} />}
    </div>
  );
}
