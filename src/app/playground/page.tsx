'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

// ── Inline CSS ────────────────────────────────────────────────────────────────

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-dim: rgba(108,142,245,0.12);
  --accent-hover: #5a7ef0; --green: #4ade80; --green-bg: rgba(74,222,128,0.08);
  --red: #f87171; --red-bg: rgba(248,113,113,0.1); --yellow: #facc15; --orange: #fb923c;
  --purple: #c084fc; --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
  --max-w: 1200px; --radius: 10px;
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 15px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; }
.btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

/* ── LAYOUT ── */
.pg-hero { text-align: center; padding: 40px 24px 32px; }
.pg-hero h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; }
.pg-hero h1 .hl { color: var(--accent); }
.pg-hero p { color: var(--text-muted); font-size: 15px; max-width: 560px; margin: 0 auto; }

.samples-row { display: flex; gap: 10px; justify-content: center; margin: 24px auto 0; max-width: 500px; flex-wrap: wrap; }
.sample-btn { padding: 8px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; display: flex; align-items: center; gap: 6px; }
.sample-btn:hover { border-color: var(--accent); color: var(--accent); }
.sample-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.usage-row { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 16px; }
.usage-label { font-size: 12px; color: var(--text-muted); }
.usage-track { width: 80px; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.usage-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

.split-pane { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: var(--max-w); margin: 0 auto; padding: 0 24px 40px; }
.pane { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; min-height: 400px; display: flex; flex-direction: column; }
.pane-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-code); }
.pane-title { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.pane-body { flex: 1; padding: 16px; overflow: auto; }

/* ── INPUT PANE ── */
.tab-bar { display: flex; gap: 2px; }
.tab-btn { padding: 5px 10px; background: none; border: none; color: var(--text-muted); font-size: 12px; font-family: inherit; cursor: pointer; border-radius: 5px; transition: all 0.15s; }
.tab-btn.active { color: var(--accent); background: var(--accent-dim); }
.upload-zone { border: 2px dashed var(--border); border-radius: 10px; padding: 28px; text-align: center; cursor: pointer; transition: all 0.2s; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); background: rgba(108,142,245,0.04); }
.upload-zone.has-file { border-color: var(--green); background: var(--green-bg); }
.upload-sub { font-size: 12px; color: var(--text-muted); }
.url-input { width: 100%; padding: 10px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 13px; font-family: var(--font-mono); outline: none; transition: border-color 0.15s; }
.url-input:focus { border-color: var(--accent); }
.opts-row { display: flex; gap: 10px; margin-top: 12px; }
.opt-group { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.opt-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.opt-select { padding: 8px 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 7px; color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; outline: none; }
.opt-select option { background: var(--bg-code); }
.btn-extract { width: 100%; padding: 12px; background: var(--accent); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-extract:hover:not(:disabled) { background: var(--accent-hover); }
.btn-extract:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── OUTPUT PANE ── */
.output-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 8px; padding: 20px; }
.output-empty-icon { font-size: 28px; opacity: 0.4; }
.output-empty-text { font-size: 13px; color: var(--text-muted); }
.meta-bar { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.meta-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 500; }
.meta-badge.type { background: rgba(108,142,245,0.15); color: var(--accent); }
.meta-badge.conf { background: var(--green-bg); color: var(--green); }
.meta-badge.conf.low { background: rgba(250,204,21,0.1); color: var(--yellow); }
.meta-badge.time { background: rgba(255,255,255,0.06); color: var(--text-muted); }
.json-out { margin: 0; padding: 14px 16px; background: transparent; font-family: var(--font-mono); font-size: 12px; line-height: 1.7; overflow: auto; white-space: pre-wrap; word-break: break-all; flex: 1; border: none; }
.json-key { color: var(--purple); }
.json-str { color: var(--green); }
.json-num { color: var(--orange); }
.json-bool { color: var(--accent); }
.json-null { color: var(--red); }
.copy-btn { padding: 4px 10px; background: transparent; border: 1px solid var(--border); border-radius: 5px; color: var(--text-muted); font-size: 11px; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.copy-btn:hover { color: var(--text); border-color: var(--text-muted); }
.error-msg { padding: 14px 16px; background: var(--red-bg); border-radius: 8px; color: var(--red); font-size: 13px; margin: 12px 16px; }

/* ── EXTRACTING ANIMATION ── */
@keyframes pulse-border { 0%,100% { border-color: var(--accent); } 50% { border-color: rgba(108,142,245,0.3); } }
.pane.extracting { animation: pulse-border 1.2s ease-in-out infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

/* ── CODE SNIPPET ── */
.snippet-section { max-width: var(--max-w); margin: 0 auto 40px; padding: 0 24px; }
.snippet-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.snippet-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.snippet-title { font-size: 14px; font-weight: 600; color: var(--text); }
.snippet-tabs { display: flex; gap: 2px; }
.snippet-tab { padding: 4px 10px; border-radius: 5px; border: none; background: transparent; color: var(--text-muted); font-size: 12px; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.snippet-tab.active { color: var(--accent); background: var(--accent-dim); }
.snippet-code { padding: 16px; font-family: var(--font-mono); font-size: 12px; line-height: 1.7; color: var(--text-muted); overflow-x: auto; white-space: pre; }
.snippet-code .kw { color: var(--accent); }
.snippet-code .str { color: var(--green); }
.snippet-cta { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border); background: rgba(108,142,245,0.04); }
.snippet-cta-text { font-size: 13px; color: var(--text-muted); }

/* ── LIMIT WARNING ── */
.limit-banner { max-width: var(--max-w); margin: 0 auto 20px; padding: 0 24px; }
.limit-banner-inner { padding: 14px 20px; background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.2); border-radius: 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.limit-banner-text { flex: 1; font-size: 13px; color: var(--text-muted); min-width: 200px; }
.limit-banner-text strong { color: var(--yellow); }

/* ── CTA ── */
.cta-banner { max-width: var(--max-w); margin: 0 auto 40px; padding: 0 24px; }
.cta-inner { background: linear-gradient(135deg, rgba(108,142,245,0.1), rgba(192,132,252,0.06)); border: 1px solid rgba(108,142,245,0.2); border-radius: 12px; padding: 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.cta-inner h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.cta-inner p { color: var(--text-muted); font-size: 13px; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .split-pane { grid-template-columns: 1fr; }
  .pane { min-height: 300px; }
  .nav-links li:not(:last-child):not(:nth-last-child(2)) { display: none; }
  .samples-row { flex-direction: column; align-items: center; }
  .cta-inner { flex-direction: column; text-align: center; }
}
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExtractionResult {
  data: Record<string, unknown>;
  metadata: {
    type: string;
    confidence: number;
    model: string;
    processing_time_ms: number;
  };
}

const SAMPLES = [
  { label: '📄 Invoice', file: '/samples/sample-invoice.jpg', type: 'invoice' },
  { label: '🧾 Receipt', file: '/samples/sample-receipt.jpg', type: 'receipt' },
  { label: '📎 Resume', file: '/samples/sample-resume.pdf', type: 'resume' },
];

const MAX_FREE = 5;
const STORAGE_KEY = 'dex_playground_used';
const RESET_KEY = 'dex_playground_reset';
const RESET_DAYS = 30;

function checkReset(): void {
  try {
    const resetAt = localStorage.getItem(RESET_KEY);
    if (!resetAt) {
      localStorage.setItem(RESET_KEY, String(Date.now()));
      return;
    }
    const elapsed = Date.now() - parseInt(resetAt, 10);
    if (elapsed > RESET_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.setItem(STORAGE_KEY, '0');
      localStorage.setItem(RESET_KEY, String(Date.now()));
    }
  } catch { /* SSR safe */ }
}

function getUsed(): number {
  try { checkReset(); return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10); } catch { return 0; }
}

function incrementUsed(): number {
  const n = getUsed() + 1;
  try { localStorage.setItem(STORAGE_KEY, String(n)); } catch { /* SSR */ }
  return n;
}

function syntaxHighlight(json: unknown): string {
  const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
  const esc = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'json-key' : 'json-str';
      else if (/true|false/.test(match)) cls = 'json-bool';
      else if (/null/.test(match)) cls = 'json-null';
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchFileAsBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [tab, setTab] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [urlVal, setUrlVal] = useState('');
  const [docType, setDocType] = useState('');
  const [model, setModel] = useState('fast');
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [snippetLang, setSnippetLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [showCta, setShowCta] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUsed(getUsed()); }, []);

  const atLimit = used >= MAX_FREE;
  const usedPct = Math.min(100, (used / MAX_FREE) * 100);
  const barColor = atLimit ? 'var(--red)' : used >= MAX_FREE - 1 ? 'var(--yellow)' : 'var(--accent)';

  const canExtract = !extracting && !atLimit && (tab === 'file' ? file !== null : urlVal.trim().startsWith('http'));

  const doExtract = useCallback(async (docPayload: string, typeHint?: string) => {
    if (atLimit) return;
    setExtracting(true);
    setResult(null);
    setError('');

    try {
      const resp = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: docPayload,
          type: typeHint || docType || undefined,
          model,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.message || `Request failed (${resp.status})`);
      } else {
        const n = incrementUsed();
        setUsed(n);
        setResult(data);
        setShowCta(true);
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setExtracting(false);
    }
  }, [atLimit, docType, model]);

  async function handleExtract() {
    if (!canExtract) return;
    if (tab === 'file' && file) {
      const b64 = await fileToBase64(file);
      doExtract(b64);
    } else if (tab === 'url') {
      doExtract(urlVal.trim());
    }
  }

  async function handleSample(sample: typeof SAMPLES[number]) {
    if (atLimit || extracting) return;
    setDocType(sample.type);
    setTab('file');
    setFile(null);

    const b64 = await fetchFileAsBase64(sample.file);
    doExtract(b64, sample.type);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.size <= 5 * 1024 * 1024) setFile(f);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.size <= 5 * 1024 * 1024) setFile(f);
  }

  function copyJson() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Code snippet generation
  const extractedType = result?.metadata?.type || docType || 'invoice';
  const snippets = {
    curl: `curl -X POST https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer dk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"document": "https://example.com/doc.pdf", "type": "${extractedType}"}'`,
    javascript: `const resp = await fetch("https://docuextract.dev/v1/extract", {
  method: "POST",
  headers: {
    "Authorization": "Bearer dk_live_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    document: "https://example.com/doc.pdf",
    type: "${extractedType}",
  }),
});
const data = await resp.json();
console.log(data);`,
    python: `import requests

resp = requests.post(
    "https://docuextract.dev/v1/extract",
    headers={"Authorization": "Bearer dk_live_your_key_here"},
    json={
        "document": "https://example.com/doc.pdf",
        "type": "${extractedType}",
    },
)
data = resp.json()
print(data)`,
  };

  const conf = result ? Math.round((result.metadata.confidence || 0) * 100) : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <PublicNav />

      {/* HERO + SAMPLES */}
      <section className="pg-hero">
        <h1>API <span className="hl">Playground</span></h1>
        <p>Upload any document and see the extracted JSON in seconds. No API key needed — 5 free extractions to try it out.</p>

        <div className="samples-row">
          {SAMPLES.map((s) => (
            <button
              key={s.type}
              className="sample-btn"
              disabled={extracting || atLimit}
              onClick={() => handleSample(s)}
            >
              {s.label}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Try sample →</span>
            </button>
          ))}
        </div>

        <div className="usage-row">
          <span className="usage-label">{Math.max(0, MAX_FREE - used)} of {MAX_FREE} free tests remaining</span>
          <div className="usage-track">
            <div className="usage-fill" style={{ width: `${usedPct}%`, background: barColor }} />
          </div>
        </div>
      </section>

      {/* LIMIT WARNING */}
      {atLimit && (
        <div className="limit-banner">
          <div className="limit-banner-inner">
            <span style={{ fontSize: 18 }}>🔒</span>
            <div className="limit-banner-text">
              <strong>You&apos;ve used your {MAX_FREE} free tests.</strong> Sign up for a free account to continue — 50 more extractions per month, no credit card required.
            </div>
            <a href="/login?signup=1" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Sign up free →</a>
          </div>
        </div>
      )}

      {/* SPLIT PANE */}
      <div className="split-pane">
        {/* ── Input pane ── */}
        <div className={`pane ${extracting ? 'extracting' : ''}`}>
          <div className="pane-header">
            <span className="pane-title">Input</span>
            <div className="tab-bar">
              <button className={`tab-btn ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>📁 File</button>
              <button className={`tab-btn ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}>🔗 URL</button>
            </div>
          </div>
          <div className="pane-body">
            {/* File upload */}
            {tab === 'file' && (
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
              >
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                {file ? (
                  <>
                    <span style={{ fontSize: 24 }}>✅</span>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)' }}>{file.name}</div>
                    <div className="upload-sub">{(file.size / 1024).toFixed(0)} KB</div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 28 }}>📄</span>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Drop your document here</div>
                    <div className="upload-sub">or click to browse · PNG, JPG, WEBP, PDF · max 5 MB</div>
                  </>
                )}
              </div>
            )}

            {/* URL input */}
            {tab === 'url' && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>Document URL</div>
                <input
                  type="url"
                  className="url-input"
                  placeholder="https://example.com/invoice.pdf"
                  value={urlVal}
                  onChange={(e) => setUrlVal(e.target.value)}
                />
              </div>
            )}

            {/* Options */}
            <div className="opts-row">
              <div className="opt-group">
                <label className="opt-label">Document Type</label>
                <select className="opt-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="">Auto-detect</option>
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="resume">Resume / CV</option>
                  <option value="contract">Contract</option>
                  <option value="form">Form</option>
                  <option value="id_document">ID Document</option>
                </select>
              </div>
              <div className="opt-group">
                <label className="opt-label">Mode</label>
                <select className="opt-select" value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="fast">Fast (Haiku)</option>
                  <option value="accurate">Accurate (Sonnet)</option>
                </select>
              </div>
            </div>

            <button className="btn-extract" disabled={!canExtract} onClick={handleExtract}>
              {extracting ? (
                <><div className="spinner" /> Extracting...</>
              ) : (
                <>⚡ Extract Document</>
              )}
            </button>
          </div>
        </div>

        {/* ── Output pane ── */}
        <div className="pane">
          <div className="pane-header">
            <span className="pane-title">Output</span>
            {result && (
              <button className="copy-btn" onClick={copyJson}>
                {copied ? '✓ Copied' : 'Copy JSON'}
              </button>
            )}
          </div>

          {/* Meta badges */}
          {result && (
            <div className="meta-bar">
              <span className="meta-badge type">📄 {formatType(result.metadata.type)}</span>
              <span className={`meta-badge conf ${conf < 80 ? 'low' : ''}`}>✓ {conf}%</span>
              <span className="meta-badge time">⏱ {result.metadata.processing_time_ms}ms</span>
            </div>
          )}

          {/* Results / empty / error */}
          <div className="pane-body" style={{ display: 'flex', flexDirection: 'column' }}>
            {error && <div className="error-msg">⚠️ {error}</div>}

            {!result && !error && !extracting && (
              <div className="output-empty">
                <span className="output-empty-icon">✨</span>
                <span className="output-empty-text">Extracted JSON will appear here</span>
                <span className="output-empty-text">Upload a document or try a sample above</span>
              </div>
            )}

            {extracting && !result && (
              <div className="output-empty">
                <div className="spinner" style={{ width: 20, height: 20 }} />
                <span className="output-empty-text">Processing document...</span>
              </div>
            )}

            {result && (
              <pre
                className="json-out"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(result.data) }}
              />
            )}
          </div>
        </div>
      </div>

      {/* CODE SNIPPET BRIDGE */}
      {(result || showCta) && (
        <div className="snippet-section">
          <div className="snippet-card">
            <div className="snippet-header">
              <span className="snippet-title">Replicate this via API</span>
              <div className="snippet-tabs">
                {(['curl', 'javascript', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    className={`snippet-tab ${snippetLang === lang ? 'active' : ''}`}
                    onClick={() => setSnippetLang(lang)}
                  >
                    {lang === 'curl' ? 'curl' : lang === 'javascript' ? 'Node.js' : 'Python'}
                  </button>
                ))}
              </div>
            </div>
            <pre className="snippet-code">{snippets[snippetLang]}</pre>
            <div className="snippet-cta">
              <span className="snippet-cta-text">Want to use this in your app?</span>
              <a href="/login" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Get your API key →</a>
            </div>
          </div>
        </div>
      )}

      {/* CTA BANNER */}
      {showCta && (
        <div className="cta-banner">
          <div className="cta-inner">
            <div>
              <h3>Ready to integrate DocuExtract?</h3>
              <p>Get your API key and make your first call in under 5 minutes. 50 free extractions/month.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <a href="/login" className="btn btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>Get API Key — Free</a>
              <a href="/docs" className="btn btn-outline" style={{ fontSize: 13, padding: '10px 18px' }}>Read the Docs</a>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </>
  );
}
