'use client';

import Script from 'next/script';
import type { Metadata } from 'next';

// Note: metadata export doesn't work in 'use client' components.
// Title is set via the root layout's default or overridden with a Head approach.
// For now the page title is handled by the root layout default.

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-dim: #3d5099;
  --accent-hover: #5a7ef0; --green: #4ade80; --green-bg: rgba(74,222,128,0.1);
  --red: #f87171; --red-bg: rgba(248,113,113,0.1); --yellow: #facc15; --orange: #fb923c;
  --purple: #c084fc; --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 15px; min-height: 100vh; }
nav { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 0 24px; height: 56px; display: flex; align-items: center; gap: 32px; position: sticky; top: 0; z-index: 100; }
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 700; font-size: 16px; color: var(--text); flex-shrink: 0; }
.logo-icon { width: 28px; height: 28px; background: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.nav-links { display: flex; gap: 4px; list-style: none; }
.nav-links a { padding: 6px 12px; border-radius: 6px; text-decoration: none; color: var(--text-muted); font-size: 14px; transition: color 0.15s, background 0.15s; }
.nav-links a:hover { color: var(--text); background: rgba(255,255,255,0.06); }
.nav-links a.active { color: var(--accent); background: rgba(108,142,245,0.12); }
.nav-cta { margin-left: auto; padding: 7px 16px; background: var(--accent); color: #fff; border-radius: 7px; text-decoration: none; font-size: 13px; font-weight: 600; transition: background 0.15s; white-space: nowrap; }
.nav-cta:hover { background: var(--accent-hover); }
main { max-width: 900px; margin: 0 auto; padding: 48px 24px 80px; }
.hero { margin-bottom: 36px; }
.hero h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
.hero h1 span { color: var(--accent); }
.hero p { color: var(--text-muted); font-size: 15px; max-width: 560px; }
.usage-bar { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
.usage-label { font-size: 13px; color: var(--text-muted); white-space: nowrap; }
.usage-track { width: 100px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.usage-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }
.usage-fill.warn { background: var(--yellow); }
.usage-fill.full { background: var(--red); }
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.tab-bar { display: flex; border-bottom: 1px solid var(--border); }
.tab-btn { flex: 1; padding: 12px 16px; background: none; border: none; color: var(--text-muted); font-size: 14px; font-family: var(--font-sans); cursor: pointer; transition: color 0.15s, background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.tab-btn.active { color: var(--text); background: rgba(255,255,255,0.04); box-shadow: inset 0 -2px 0 var(--accent); }
.tab-btn:hover:not(.active) { color: var(--text); }
.upload-zone { padding: 32px; border: 2px dashed var(--border); border-radius: 10px; margin: 20px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
.upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); background: rgba(108,142,245,0.04); }
.upload-zone.has-file { border-color: var(--green); background: var(--green-bg); }
.upload-icon { font-size: 32px; }
.upload-title { font-size: 15px; font-weight: 500; color: var(--text); }
.upload-sub { font-size: 13px; color: var(--text-muted); }
.file-info { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--green); }
.upload-input { display: none; }
.url-panel { padding: 20px; }
.url-label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.url-input { width: 100%; padding: 11px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; font-family: var(--font-mono); transition: border-color 0.15s; outline: none; }
.url-input::placeholder { color: var(--text-muted); }
.url-input:focus { border-color: var(--accent); }
.options-row { display: flex; gap: 12px; padding: 16px 20px 20px; flex-wrap: wrap; }
.opt-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 140px; }
.opt-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.opt-select { padding: 9px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; font-family: var(--font-sans); cursor: pointer; outline: none; transition: border-color 0.15s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238892a4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
.opt-select:focus { border-color: var(--accent); }
.opt-select option { background: #1e2435; }
.submit-wrap { padding: 0 20px 20px; }
.btn-extract { width: 100%; padding: 13px 24px; background: var(--accent); color: #fff; border: none; border-radius: 9px; font-size: 15px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: background 0.15s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-extract:hover:not(:disabled) { background: var(--accent-hover); }
.btn-extract:active:not(:disabled) { transform: scale(0.99); }
.btn-extract:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-extract.loading { background: var(--accent-dim); }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
.results-wrap { margin-top: 24px; display: none; }
.results-wrap.visible { display: block; }
.meta-bar { display: flex; gap: 10px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--border); align-items: center; }
.meta-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.meta-badge.type { background: rgba(108,142,245,0.15); color: var(--accent); }
.meta-badge.confidence { background: var(--green-bg); color: var(--green); }
.meta-badge.confidence.low { background: rgba(250,204,21,0.1); color: var(--yellow); }
.meta-badge.time { background: rgba(255,255,255,0.06); color: var(--text-muted); }
.meta-badge.model { background: rgba(192,132,252,0.12); color: var(--purple); }
.results-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 0; }
.results-title { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.copy-btn { padding: 5px 12px; background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: 6px; color: var(--text-muted); font-size: 12px; font-family: var(--font-sans); cursor: pointer; transition: color 0.15s, background 0.15s; }
.copy-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
.copy-btn.copied { color: var(--green); border-color: var(--green); }
pre.json-out { margin: 12px 20px 20px; background: var(--bg-code); border: 1px solid var(--border); border-radius: 9px; padding: 16px 18px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; max-height: 500px; overflow-y: auto; }
.json-key { color: #7dd3fc; }
.json-str { color: #86efac; }
.json-num { color: #fdba74; }
.json-bool { color: #c084fc; }
.json-null { color: #f87171; }
.error-panel { margin: 16px 20px 20px; padding: 14px 16px; background: var(--red-bg); border: 1px solid rgba(248,113,113,0.3); border-radius: 9px; display: flex; align-items: flex-start; gap: 10px; color: var(--red); font-size: 14px; }
.error-icon { font-size: 16px; flex-shrink: 0; }
.cta-banner { margin-top: 28px; background: linear-gradient(135deg, rgba(108,142,245,0.12), rgba(192,132,252,0.08)); border: 1px solid rgba(108,142,245,0.25); border-radius: 12px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.cta-text h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.cta-text p { color: var(--text-muted); font-size: 14px; }
.cta-actions { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
.btn-primary { padding: 10px 20px; background: var(--accent); color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.15s; white-space: nowrap; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary { padding: 10px 20px; background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.15s; white-space: nowrap; }
.btn-secondary:hover { background: rgba(255,255,255,0.1); }
.limit-warning { margin-top: 24px; padding: 16px 20px; background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.25); border-radius: 10px; display: none; align-items: flex-start; gap: 12px; }
.limit-warning.visible { display: flex; }
.limit-warning-icon { font-size: 20px; flex-shrink: 0; }
.limit-warning-text h4 { font-size: 14px; font-weight: 600; color: var(--yellow); margin-bottom: 4px; }
.limit-warning-text p { font-size: 13px; color: var(--text-muted); }
.limit-warning-text a { color: var(--accent); text-decoration: none; }
.limit-warning-text a:hover { text-decoration: underline; }
.hidden { display: none !important; }
@media (max-width: 600px) {
  main { padding: 28px 16px 60px; }
  .hero h1 { font-size: 22px; }
  .upload-zone { padding: 24px 16px; min-height: 130px; }
  .cta-banner { padding: 20px; }
  nav { padding: 0 16px; gap: 16px; }
  .nav-links { display: none; }
}
`;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://docuextract-azure.vercel.app';

export default function PlaygroundPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav>
        <a href="/" className="nav-logo">
          <div className="logo-icon">📄</div>
          DocuExtract
        </a>
        <ul className="nav-links">
          <li><a href="/playground" className="active">Playground</a></li>
          <li><a href="/docs">Docs</a></li>
          <li><a href="/docs#pricing">Pricing</a></li>
        </ul>
        <a href="/dashboard" className="nav-cta">Get API Key →</a>
      </nav>

      <main>
        <div className="hero">
          <h1>API <span>Playground</span></h1>
          <p>Try DocuExtract live — upload any invoice, receipt, resume, or contract and see the extracted JSON in seconds. No API key needed.</p>
          <div className="usage-bar">
            <span className="usage-label" id="usage-label">0 / 5 free extractions used</span>
            <div className="usage-track">
              <div className="usage-fill" id="usage-fill" style={{width:'0%'}}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="tab-bar">
            <button className="tab-btn active" id="tab-file">📁 Upload File</button>
            <button className="tab-btn" id="tab-url">🔗 Paste URL</button>
          </div>

          <div id="panel-file">
            <div className="upload-zone" id="drop-zone">
              <input type="file" className="upload-input" id="file-input" accept="image/*,.pdf" />
              <span className="upload-icon" id="upload-icon">📄</span>
              <div id="upload-default">
                <div className="upload-title">Drop your document here</div>
                <div className="upload-sub">or click to browse · PNG, JPG, WEBP, PDF · max 5 MB</div>
              </div>
              <div id="file-info" className="file-info hidden">
                <span id="file-name"></span>
                <span id="file-size" style={{color:'var(--text-muted)',fontWeight:400,fontSize:'12px'}}></span>
              </div>
            </div>
          </div>

          <div id="panel-url" className="url-panel hidden">
            <div className="url-label">Document URL</div>
            <input type="url" className="url-input" id="url-input" placeholder="https://example.com/invoice.pdf" />
          </div>

          <div className="options-row">
            <div className="opt-group">
              <label className="opt-label" htmlFor="type-select">Document Type</label>
              <select className="opt-select" id="type-select">
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
              <label className="opt-label" htmlFor="model-select">Extraction Mode</label>
              <select className="opt-select" id="model-select">
                <option value="fast">Fast (Claude Haiku)</option>
                <option value="accurate">Accurate (Claude Sonnet)</option>
              </select>
            </div>
          </div>

          <div className="submit-wrap">
            <button className="btn-extract" id="extract-btn" disabled>
              <span id="btn-icon">⚡</span>
              <span id="btn-text">Extract Document</span>
            </button>
          </div>
        </div>

        <div className="limit-warning" id="limit-warning">
          <span className="limit-warning-icon">⚠️</span>
          <div className="limit-warning-text">
            <h4>You&apos;ve used all 5 free playground extractions</h4>
            <p><a href="/dashboard">Get a free API key</a> to continue — 100 extractions/month included. Takes about 2 minutes.</p>
          </div>
        </div>

        <div className="results-wrap card" id="results-wrap">
          <div className="meta-bar" id="meta-bar"></div>
          <div className="results-header">
            <span className="results-title">Extracted Data</span>
            <button className="copy-btn" id="copy-btn">Copy JSON</button>
          </div>
          <pre className="json-out" id="json-out"></pre>
          <div className="error-panel hidden" id="error-panel">
            <span className="error-icon">⚠️</span>
            <span id="error-msg"></span>
          </div>
        </div>

        <div className="cta-banner hidden" id="cta-banner">
          <div className="cta-text">
            <h3>Ready to integrate DocuExtract?</h3>
            <p>Get your API key and make your first real call in under 5 minutes. 100 free extractions/month on the Free plan.</p>
          </div>
          <div className="cta-actions">
            <a href="/dashboard" className="btn-primary">Get API Key — Free</a>
            <a href="/docs" className="btn-secondary">Read the Docs</a>
          </div>
        </div>
      </main>

      <Script id="playground-js" strategy="afterInteractive">{`
        var MAX_FREE = 5;
        var STORAGE_KEY = 'dex_playground_used';
        var activeTab = 'file';
        var selectedFile = null;
        var resultJson = null;

        function getUsed() { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10); }
        function incrementUsed() { var n = getUsed() + 1; localStorage.setItem(STORAGE_KEY, String(n)); updateUsageBar(); return n; }

        function updateUsageBar() {
          var used = getUsed();
          var pct = Math.min(100, (used / MAX_FREE) * 100);
          var fill = document.getElementById('usage-fill');
          var label = document.getElementById('usage-label');
          label.textContent = used + ' / ' + MAX_FREE + ' free extractions used';
          fill.style.width = pct + '%';
          fill.className = 'usage-fill' + (used >= MAX_FREE ? ' full' : used >= MAX_FREE - 1 ? ' warn' : '');
          if (used >= MAX_FREE) {
            document.getElementById('limit-warning').classList.add('visible');
            document.getElementById('extract-btn').disabled = true;
          }
        }

        function switchTab(tab) {
          activeTab = tab;
          document.getElementById('tab-file').classList.toggle('active', tab === 'file');
          document.getElementById('tab-url').classList.toggle('active', tab === 'url');
          document.getElementById('panel-file').classList.toggle('hidden', tab !== 'file');
          document.getElementById('panel-url').classList.toggle('hidden', tab !== 'url');
          updateExtractBtn();
        }

        document.getElementById('tab-file').addEventListener('click', function() { switchTab('file'); });
        document.getElementById('tab-url').addEventListener('click', function() { switchTab('url'); });

        var dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('click', function() { document.getElementById('file-input').click(); });
        dropZone.addEventListener('dragover', function(e) { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', function() { dropZone.classList.remove('drag-over'); });
        dropZone.addEventListener('drop', function(e) { e.preventDefault(); dropZone.classList.remove('drag-over'); var file = e.dataTransfer.files[0]; if (file) applyFile(file); });
        document.getElementById('file-input').addEventListener('change', function(e) { var file = e.target.files[0]; if (file) applyFile(file); });

        function applyFile(file) {
          if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5 MB for playground.'); return; }
          selectedFile = file;
          dropZone.classList.add('has-file');
          document.getElementById('upload-icon').textContent = '✅';
          document.getElementById('upload-default').classList.add('hidden');
          document.getElementById('file-info').classList.remove('hidden');
          document.getElementById('file-name').textContent = file.name;
          var bytes = file.size;
          document.getElementById('file-size').textContent = bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes/1024).toFixed(1) + ' KB' : (bytes/1048576).toFixed(1) + ' MB';
          updateExtractBtn();
        }

        document.getElementById('url-input').addEventListener('input', function() { updateExtractBtn(); });

        function updateExtractBtn() {
          if (getUsed() >= MAX_FREE) return;
          var btn = document.getElementById('extract-btn');
          var ready = activeTab === 'file' ? selectedFile !== null : document.getElementById('url-input').value.trim().startsWith('http');
          btn.disabled = !ready;
        }

        function fileToBase64(file) {
          return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        function hideResults() {
          document.getElementById('results-wrap').classList.remove('visible');
          document.getElementById('json-out').innerHTML = '';
          document.getElementById('error-panel').classList.add('hidden');
        }

        function showResult(data) {
          resultJson = data;
          var wrap = document.getElementById('results-wrap');
          wrap.classList.add('visible');
          var meta = data.metadata || {};
          var bar = document.getElementById('meta-bar');
          var conf = Math.round((meta.confidence || 0) * 100);
          var confClass = conf >= 80 ? 'confidence' : 'confidence low';
          var modelLabel = meta.model ? (meta.model.includes('haiku') ? 'Haiku' : meta.model.includes('sonnet') ? 'Sonnet' : meta.model) : '';
          var fmt = function(t) { return t.replace(/_/g,' ').replace(/\\b\\w/g,function(c){return c.toUpperCase();}); };
          bar.innerHTML = '<span class="meta-badge type">📄 ' + fmt(meta.type || 'unknown') + '</span>' +
            '<span class="meta-badge ' + confClass + '">✓ ' + conf + '% confidence</span>' +
            '<span class="meta-badge time">⏱ ' + (meta.processing_time_ms || 0) + ' ms</span>' +
            (modelLabel ? '<span class="meta-badge model">🤖 ' + modelLabel + '</span>' : '');
          document.getElementById('json-out').innerHTML = syntaxHighlight(data.data || data);
          document.getElementById('error-panel').classList.add('hidden');
          wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function showError(msg) {
          var wrap = document.getElementById('results-wrap');
          wrap.classList.add('visible');
          document.getElementById('json-out').innerHTML = '';
          document.getElementById('meta-bar').innerHTML = '';
          var ep = document.getElementById('error-panel');
          ep.classList.remove('hidden');
          document.getElementById('error-msg').textContent = msg;
          wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function syntaxHighlight(json) {
          var str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
          var escaped = str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          return escaped.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function(match) {
            var cls = 'json-num';
            if (/^"/.test(match)) { cls = /:$/.test(match) ? 'json-key' : 'json-str'; }
            else if (/true|false/.test(match)) { cls = 'json-bool'; }
            else if (/null/.test(match)) { cls = 'json-null'; }
            return '<span class="' + cls + '">' + match + '</span>';
          });
        }

        document.getElementById('extract-btn').addEventListener('click', async function() {
          if (getUsed() >= MAX_FREE) return;
          var btn = document.getElementById('extract-btn');
          btn.disabled = true;
          btn.classList.add('loading');
          document.getElementById('btn-text').textContent = 'Extracting…';
          document.getElementById('btn-icon').innerHTML = '<div class="spinner"></div>';
          hideResults();
          try {
            var documentPayload;
            if (activeTab === 'file') {
              documentPayload = await fileToBase64(selectedFile);
            } else {
              documentPayload = document.getElementById('url-input').value.trim();
            }
            var type = document.getElementById('type-select').value || undefined;
            var model = document.getElementById('model-select').value;
            var resp = await fetch('/api/playground', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ document: documentPayload, type: type, model: model }),
            });
            var data = await resp.json();
            if (!resp.ok) {
              showError(data.message || 'Request failed (' + resp.status + ')');
            } else {
              incrementUsed();
              showResult(data);
              document.getElementById('cta-banner').classList.remove('hidden');
            }
          } catch(err) {
            showError('Network error — please check your connection and try again.');
          } finally {
            btn.classList.remove('loading');
            document.getElementById('btn-icon').textContent = '⚡';
            document.getElementById('btn-text').textContent = 'Extract Document';
            if (getUsed() < MAX_FREE) {
              var ready = activeTab === 'file' ? selectedFile !== null : document.getElementById('url-input').value.trim().startsWith('http');
              btn.disabled = !ready;
            }
          }
        });

        document.getElementById('copy-btn').addEventListener('click', function() {
          if (!resultJson) return;
          var text = JSON.stringify(resultJson.data || resultJson, null, 2);
          navigator.clipboard.writeText(text).then(function() {
            var btn = document.getElementById('copy-btn');
            btn.textContent = '✓ Copied!';
            btn.classList.add('copied');
            setTimeout(function() { btn.textContent = 'Copy JSON'; btn.classList.remove('copied'); }, 2000);
          });
        });

        updateUsageBar();
      `}</Script>
    </>
  );
}
