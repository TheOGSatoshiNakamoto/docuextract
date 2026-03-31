'use client';

import Script from 'next/script';

const css = `
*, *::before, *::after { box-sizing: border-box; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-dim: #3d5099;
  --green: #4ade80; --red: #f87171; --yellow: #facc15; --orange: #fb923c; --purple: #c084fc;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
}
.docs-layout { display: flex; height: 100vh; font-family: var(--font-sans); color: var(--text); font-size: 15px; line-height: 1.6; }
.docs-toc { width: 240px; border-right: 1px solid var(--border); position: fixed; top: 0; bottom: 0; overflow-y: auto; padding: 24px 0; flex-shrink: 0; background: var(--bg-card); z-index: 5; }
.docs-main-wrapper { flex: 1; margin-left: 240px; overflow-y: auto; height: 100vh; scroll-behavior: smooth; }
.docs-toc-logo { padding: 0 16px 16px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
.docs-toc-logo a { text-decoration: none; display: flex; align-items: center; gap: 10px; }
.docs-toc-logo .logo-icon { width: 28px; height: 28px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.docs-toc-logo .logo-text { font-size: 15px; font-weight: 700; color: var(--text); }
.docs-toc-logo .logo-badge { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.docs-nav-group { padding: 0 10px; margin-bottom: 8px; }
.docs-nav-group-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); padding: 6px 8px; margin-bottom: 2px; }
.docs-nav-link { display: block; padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--text-muted); font-size: 13px; transition: all 0.15s; }
.docs-nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); text-decoration: none; }
.docs-nav-link.active { color: var(--accent); background: rgba(108,142,245,0.1); }
.docs-nav-method { display: inline-block; font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-right: 6px; }
.method-get { background: rgba(74,222,128,0.15); color: var(--green); }
.method-post { background: rgba(108,142,245,0.15); color: var(--accent); }
.docs-main { max-width: 820px; padding: 40px 48px 100px; min-width: 0; }
.docs-main section { scroll-margin-top: 24px; }
.docs-main h1 { font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 12px; line-height: 1.2; }
.docs-main h2 { font-size: 20px; font-weight: 700; color: var(--text); margin: 36px 0 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.docs-main h3 { font-size: 15px; font-weight: 600; color: var(--text); margin: 24px 0 10px; }
.docs-main p { color: #b4bfcc; margin-bottom: 14px; line-height: 1.7; }
.docs-main a { color: var(--accent); text-decoration: none; }
.docs-main a:hover { text-decoration: underline; }
.callout { padding: 12px 16px; border-radius: 8px; margin: 18px 0; font-size: 14px; border-left: 3px solid; }
.callout-info { background: rgba(108,142,245,0.08); border-color: var(--accent); }
.callout-warn { background: rgba(250,204,21,0.08); border-color: var(--yellow); color: #d4ae20; }
.callout-tip { background: rgba(74,222,128,0.08); border-color: var(--green); }
.callout strong { display: block; margin-bottom: 4px; }
.code-block { background: var(--bg-code); border: 1px solid var(--border); border-radius: 10px; margin: 14px 0; overflow: hidden; }
.code-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); }
.code-lang { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; }
.copy-btn { font-size: 12px; color: var(--text-muted); background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; }
.copy-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
pre { padding: 16px 18px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; margin: 0; }
code { font-family: var(--font-mono); font-size: 0.9em; }
.docs-main p code, .docs-main li code, .docs-main td code { background: var(--bg-code); padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #c9d1e0; border: 1px solid var(--border); }
.kw { color: #c084fc; } .str { color: #86efac; } .num { color: #fdba74; } .cmt { color: #4b5e7e; font-style: italic; } .fn { color: #93c5fd; } .key { color: #6c8ef5; } .url { color: #fdba74; } .hdr { color: #a5b4fc; } .val { color: #86efac; } .mt { color: #94a3b8; }
.tabs { margin: 14px 0; }
.tab-list { display: flex; gap: 4px; padding: 0 0 0 2px; border-bottom: 1px solid var(--border); margin-bottom: 0; }
.tab-btn { font-size: 13px; padding: 6px 12px; background: none; border: none; cursor: pointer; color: var(--text-muted); border-radius: 6px 6px 0 0; border-bottom: 2px solid transparent; transition: all 0.15s; margin-bottom: -1px; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }
.tab-panel .code-block { border-radius: 0 8px 8px 8px; margin-top: 0; }
.table-wrap { overflow-x: auto; margin: 14px 0; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 9px 12px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(255,255,255,0.02); }
.endpoint-badge { display: inline-flex; align-items: center; gap: 10px; background: var(--bg-code); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px; font-family: var(--font-mono); font-size: 13px; margin: 14px 0 20px; }
.badge-method { font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 4px; }
.badge-get { background: rgba(74,222,128,0.2); color: var(--green); }
.badge-post { background: rgba(108,142,245,0.2); color: var(--accent); }
.badge-path { color: var(--text); }
.error-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 18px; margin: 10px 0; }
.error-code { font-family: var(--font-mono); font-size: 13px; color: var(--red); font-weight: 600; margin-bottom: 4px; }
.error-desc { color: #b4bfcc; font-size: 13px; }
.pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
.plan-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; position: relative; transition: border-color 0.2s; display: flex; flex-direction: column; }
.plan-card:hover { border-color: var(--accent); }
.plan-card.featured { border-color: var(--accent-dim); }
.plan-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 20px; margin-bottom: 6px; background: rgba(108,142,245,0.15); color: var(--accent); border: 1px solid rgba(108,142,245,0.3); }
.plan-badge.best-value { background: rgba(74,222,128,0.12); color: var(--green); border-color: rgba(74,222,128,0.3); }
.plan-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.plan-price { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
.plan-price span { font-size: 13px; font-weight: 400; color: var(--text-muted); }
.plan-calls { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.plan-features { list-style: none; padding: 0; flex: 1; }
.plan-features li { font-size: 12px; color: #b4bfcc; padding: 2px 0; }
.plan-features li::before { content: '\\2713  '; color: var(--green); }
.steps { counter-reset: step; }
.step { display: flex; gap: 14px; margin-bottom: 28px; }
.step-num { width: 30px; height: 30px; background: var(--accent-dim); border: 2px solid var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.step-content h3 { margin-top: 0; }
.docs-main hr { border: none; border-top: 1px solid var(--border); margin: 36px 0; }
@media (max-width: 900px) {
  .docs-toc { display: none; }
  .docs-main-wrapper { margin-left: 0; }
  .docs-main { padding: 24px 20px 80px; }
  .pricing-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

const preBlocks: Record<string, string> = {
  authHttp: `<span class="hdr">Authorization: Bearer dk_live_xxxxxxxxxxxxxxxxxxxxxxxx</span>`,
  qsCurl: `<span class="fn">curl</span> <span class="url">https://docuextract.dev/v1/extract</span> \\\n  <span class="hdr">-H</span> <span class="str">"Authorization: Bearer dk_live_YOUR_KEY"</span> \\\n  <span class="hdr">-H</span> <span class="str">"Content-Type: application/json"</span> \\\n  <span class="hdr">-d</span> <span class="str">&#39;{\n    "document": "https://example.com/invoice.pdf",\n    "type": "invoice"\n  }&#39;</span>`,
  qsJs: `<span class="kw">const</span> response = <span class="kw">await</span> <span class="fn">fetch</span>(<span class="str">'https://docuextract.dev/v1/extract'</span>, {\n  method: <span class="str">'POST'</span>,\n  headers: {\n    <span class="str">'Authorization'</span>: <span class="str">'Bearer dk_live_YOUR_KEY'</span>,\n    <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span>,\n  },\n  body: <span class="fn">JSON.stringify</span>({\n    document: <span class="str">'https://example.com/invoice.pdf'</span>,\n    type: <span class="str">'invoice'</span>,\n  }),\n});\n\n<span class="kw">const</span> result = <span class="kw">await</span> response.<span class="fn">json</span>();\nconsole.<span class="fn">log</span>(result.data);\n<span class="cmt">// { vendor_name: "Acme Corp", total_amount: 1250.00, ... }</span>`,
  qsPy: `<span class="kw">import</span> requests\n\nresponse = requests.<span class="fn">post</span>(\n    <span class="str">'https://docuextract.dev/v1/extract'</span>,\n    headers={\n        <span class="str">'Authorization'</span>: <span class="str">'Bearer dk_live_YOUR_KEY'</span>,\n        <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span>,\n    },\n    json={\n        <span class="str">'document'</span>: <span class="str">'https://example.com/invoice.pdf'</span>,\n        <span class="str">'type'</span>: <span class="str">'invoice'</span>,\n    }\n)\n\nresult = response.<span class="fn">json</span>()\n<span class="fn">print</span>(result[<span class="str">'data'</span>])\n<span class="cmt"># {'vendor_name': 'Acme Corp', 'total_amount': 1250.0, ...}</span>`,
  qsResponse: `{\n  <span class="key">"data"</span>: {\n    <span class="key">"vendor_name"</span>: <span class="str">"Acme Corp"</span>,\n    <span class="key">"invoice_number"</span>: <span class="str">"INV-2024-0847"</span>,\n    <span class="key">"invoice_date"</span>: <span class="str">"2024-03-15"</span>,\n    <span class="key">"due_date"</span>: <span class="str">"2024-04-15"</span>,\n    <span class="key">"subtotal"</span>: <span class="num">1000.00</span>,\n    <span class="key">"tax_amount"</span>: <span class="num">250.00</span>,\n    <span class="key">"total_amount"</span>: <span class="num">1250.00</span>,\n    <span class="key">"currency"</span>: <span class="str">"USD"</span>,\n    <span class="key">"line_items"</span>: [\n      { <span class="key">"description"</span>: <span class="str">"Consulting services"</span>, <span class="key">"quantity"</span>: <span class="num">10</span>, <span class="key">"unit_price"</span>: <span class="num">100.00</span>, <span class="key">"total"</span>: <span class="num">1000.00</span> }\n    ]\n  },\n  <span class="key">"metadata"</span>: {\n    <span class="key">"type"</span>: <span class="str">"invoice"</span>,\n    <span class="key">"confidence"</span>: <span class="num">0.96</span>,\n    <span class="key">"model"</span>: <span class="str">"claude-haiku-4-5-20251001"</span>,\n    <span class="key">"processing_time_ms"</span>: <span class="num">1847</span>,\n    <span class="key">"page_count"</span>: <span class="num">1</span>\n  }\n}`,
};

export default function DashboardDocsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="docs-layout">
        {/* Docs table of contents sidebar */}
        <nav className="docs-toc">
          <div className="docs-toc-logo">
            <a href="#introduction">
              <div className="logo-icon">📄</div>
              <div>
                <div className="logo-text">DocuExtract</div>
                <div className="logo-badge">API Reference v1</div>
              </div>
            </a>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-title">Getting Started</div>
            <a href="#introduction" className="docs-nav-link active">Introduction</a>
            <a href="#quickstart" className="docs-nav-link">Quick Start</a>
            <a href="#authentication" className="docs-nav-link">Authentication</a>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-title">Endpoints</div>
            <a href="#extract" className="docs-nav-link"><span className="docs-nav-method method-post">POST</span>/v1/extract</a>
            <a href="#detect" className="docs-nav-link"><span className="docs-nav-method method-post">POST</span>/v1/detect</a>
            <a href="#usage" className="docs-nav-link"><span className="docs-nav-method method-get">GET</span>/v1/usage</a>
            <a href="#health" className="docs-nav-link"><span className="docs-nav-method method-get">GET</span>/v1/health</a>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-title">Billing</div>
            <a href="#checkout" className="docs-nav-link"><span className="docs-nav-method method-post">POST</span>/v1/billing/checkout</a>
            <a href="#portal" className="docs-nav-link"><span className="docs-nav-method method-post">POST</span>/v1/billing/portal</a>
          </div>
          <div className="docs-nav-group">
            <div className="docs-nav-group-title">Reference</div>
            <a href="#document-types" className="docs-nav-link">Document Types</a>
            <a href="#errors" className="docs-nav-link">Error Codes</a>
            <a href="/pricing" className="docs-nav-link">Pricing</a>
          </div>
        </nav>

        {/* Main docs content */}
        <div className="docs-main-wrapper" id="docs-scroll-container">
        <main className="docs-main">

          {/* Introduction */}
          <section id="introduction">
            <h1>DocuExtract API</h1>
            <p>Send a document, get JSON back. No templates. No training. Works in 5 minutes.</p>
            <p>DocuExtract converts unstructured documents — invoices, receipts, contracts, resumes, bank statements — into clean, validated JSON using Claude AI. You send a document (image, PDF, or URL), specify what you want extracted, and receive structured data in seconds.</p>
            <div className="callout callout-info">
              <strong>Base URL</strong>
              <code>https://docuextract.dev/v1</code>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Feature</th><th>Detail</th></tr></thead>
                <tbody>
                  <tr><td>Authentication</td><td>Bearer token (API key)</td></tr>
                  <tr><td>Request format</td><td>JSON (<code>Content-Type: application/json</code>)</td></tr>
                  <tr><td>Response format</td><td>JSON</td></tr>
                  <tr><td>Max file size</td><td>10 MB</td></tr>
                  <tr><td>Supported formats</td><td>PDF, PNG, JPG, WEBP (base64 or URL)</td></tr>
                  <tr><td>Default model</td><td>Claude Haiku 4.5 (fast)</td></tr>
                  <tr><td>Accurate model</td><td>Claude Sonnet 4.6 (complex documents)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr />

          {/* Quick Start */}
          <section id="quickstart">
            <h2>Quick Start</h2>
            <p>Extract structured data from a document in 3 steps.</p>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h3>Get your API key</h3>
                  <p>Go to <a href="/dashboard/keys">API Keys</a> to get your free API key. It looks like <code>dk_live_xxxxxxxxxxxxxxxx</code>.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h3>Make your first extraction</h3>
                  <p>Send a document URL (or base64) to <code>/v1/extract</code>:</p>
                  <div className="tabs">
                    <div className="tab-list">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <button className="tab-btn active" onClick={(e) => (window as any).switchTab(e.currentTarget, 'qs-curl')}>curl</button>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <button className="tab-btn" onClick={(e) => (window as any).switchTab(e.currentTarget, 'qs-js')}>JavaScript</button>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <button className="tab-btn" onClick={(e) => (window as any).switchTab(e.currentTarget, 'qs-py')}>Python</button>
                    </div>
                    <div id="qs-curl" className="tab-panel active">
                      <div className="code-block">
                        <div className="code-header"><span className="code-lang">bash</span><button className="copy-btn" onClick={(e) => (window as any).copyCode(e.currentTarget)}>Copy</button></div>
                        <pre dangerouslySetInnerHTML={{ __html: preBlocks.qsCurl }} />
                      </div>
                    </div>
                    <div id="qs-js" className="tab-panel">
                      <div className="code-block">
                        <div className="code-header"><span className="code-lang">javascript</span><button className="copy-btn" onClick={(e) => (window as any).copyCode(e.currentTarget)}>Copy</button></div>
                        <pre dangerouslySetInnerHTML={{ __html: preBlocks.qsJs }} />
                      </div>
                    </div>
                    <div id="qs-py" className="tab-panel">
                      <div className="code-block">
                        <div className="code-header"><span className="code-lang">python</span><button className="copy-btn" onClick={(e) => (window as any).copyCode(e.currentTarget)}>Copy</button></div>
                        <pre dangerouslySetInnerHTML={{ __html: preBlocks.qsPy }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h3>Use the structured data</h3>
                  <p>The response contains the extracted fields, confidence score, and processing metadata:</p>
                  <div className="code-block">
                    <div className="code-header"><span className="code-lang">json</span></div>
                    <pre dangerouslySetInnerHTML={{ __html: preBlocks.qsResponse }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr />

          {/* Authentication */}
          <section id="authentication">
            <h2>Authentication</h2>
            <p>All API endpoints (except <code>GET /v1/health</code>) require authentication via a Bearer token in the <code>Authorization</code> header.</p>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">http</span></div>
              <pre dangerouslySetInnerHTML={{ __html: preBlocks.authHttp }} />
            </div>
            <h3>API Key Format</h3>
            <p>API keys start with <code>dk_live_</code> followed by 32 random characters. Keys are generated when you sign up and can be regenerated from your <a href="/dashboard/keys">API Keys page</a>.</p>
            <div className="callout callout-warn">
              <strong>Keep your API key secret</strong>
              Never expose your API key in client-side code or public repositories. Use environment variables to store it securely.
            </div>
            <h3>Rate Limit Headers</h3>
            <p>Every authenticated response includes rate limit information:</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Header</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>X-RateLimit-Limit-Minute</code></td><td>Maximum requests per minute for your plan</td></tr>
                  <tr><td><code>X-RateLimit-Remaining-Minute</code></td><td>Remaining requests this minute</td></tr>
                  <tr><td><code>X-RateLimit-Limit-Month</code></td><td>Maximum extractions per month for your plan</td></tr>
                  <tr><td><code>X-RateLimit-Remaining-Month</code></td><td>Remaining extractions this month</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr />

          {/* Extract */}
          <section id="extract">
            <h2>POST /v1/extract</h2>
            <p>Extract structured data from a document. This is the core endpoint.</p>
            <div className="endpoint-badge">
              <span className="badge-method badge-post">POST</span>
              <span className="badge-path">https://docuextract.dev/v1/extract</span>
            </div>
            <h3>Request Body</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>document</code></td><td>string</td><td>Yes</td><td>Document as base64-encoded string or a publicly accessible URL</td></tr>
                  <tr><td><code>type</code></td><td>string</td><td>No</td><td>Document type hint. One of: <code>invoice</code>, <code>receipt</code>, <code>bank_statement</code>, <code>resume</code>, <code>contract</code>, <code>form</code>, <code>id_document</code>. Auto-detected if omitted.</td></tr>
                  <tr><td><code>model</code></td><td>string</td><td>No</td><td><code>&quot;fast&quot;</code> (default) or <code>&quot;accurate&quot;</code>. Fast uses Claude Haiku; accurate uses Claude Sonnet for complex/multi-page documents.</td></tr>
                  <tr><td><code>schema</code></td><td>object</td><td>No</td><td>Custom JSON schema describing the fields to extract. When provided, the extraction is guided by your schema.</td></tr>
                </tbody>
              </table>
            </div>
            <h3>Response</h3>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{\n  <span class="key">"data"</span>: { <span class="cmt">/* extracted fields */</span> },\n  <span class="key">"metadata"</span>: {\n    <span class="key">"type"</span>: <span class="str">"invoice"</span>,\n    <span class="key">"confidence"</span>: <span class="num">0.96</span>,\n    <span class="key">"model"</span>: <span class="str">"claude-haiku-4-5-20251001"</span>,\n    <span class="key">"processing_time_ms"</span>: <span class="num">1847</span>,\n    <span class="key">"page_count"</span>: <span class="num">1</span>\n  }\n}` }} />
            </div>
          </section>

          <hr />

          {/* Detect */}
          <section id="detect">
            <h2>POST /v1/detect</h2>
            <p>Detect the type of a document without extracting its data.</p>
            <div className="endpoint-badge">
              <span className="badge-method badge-post">POST</span>
              <span className="badge-path">https://docuextract.dev/v1/detect</span>
            </div>
            <h3>Response</h3>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{\n  <span class="key">"type"</span>: <span class="str">"invoice"</span>,\n  <span class="key">"confidence"</span>: <span class="num">0.98</span>\n}` }} />
            </div>
          </section>

          <hr />

          {/* Usage */}
          <section id="usage">
            <h2>GET /v1/usage</h2>
            <p>Retrieve your current usage statistics for the billing period.</p>
            <div className="endpoint-badge">
              <span className="badge-method badge-get">GET</span>
              <span className="badge-path">https://docuextract.dev/v1/usage</span>
            </div>
            <h3>Response</h3>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{\n  <span class="key">"used"</span>: <span class="num">847</span>,\n  <span class="key">"limit"</span>: <span class="num">10000</span>,\n  <span class="key">"plan"</span>: <span class="str">"pro"</span>,\n  <span class="key">"period_end"</span>: <span class="str">"2024-04-24"</span>,\n  <span class="key">"breakdown"</span>: [\n    { <span class="key">"date"</span>: <span class="str">"2024-03-24"</span>, <span class="key">"count"</span>: <span class="num">42</span> }\n  ]\n}` }} />
            </div>
          </section>

          <hr />

          {/* Health */}
          <section id="health">
            <h2>GET /v1/health</h2>
            <p>Health check endpoint. No authentication required.</p>
            <div className="endpoint-badge">
              <span className="badge-method badge-get">GET</span>
              <span className="badge-path">https://docuextract.dev/v1/health</span>
            </div>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{ <span class="key">"status"</span>: <span class="str">"ok"</span>, <span class="key">"version"</span>: <span class="str">"1.0.0"</span> }` }} />
            </div>
          </section>

          <hr />

          {/* Checkout */}
          <section id="checkout">
            <h2>POST /v1/billing/checkout</h2>
            <p>Create a Stripe Checkout session to subscribe to a paid plan. Returns a URL to redirect your user to for payment.</p>
            <div className="endpoint-badge">
              <span className="badge-method badge-post">POST</span>
              <span className="badge-path">https://docuextract.dev/v1/billing/checkout</span>
            </div>
            <h3>Request Body</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>plan</code></td><td>string</td><td>Yes</td><td>Plan to subscribe to. One of: <code>starter</code>, <code>pro</code>, <code>scale</code></td></tr>
                </tbody>
              </table>
            </div>
            <h3>Response</h3>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{ <span class="key">"url"</span>: <span class="str">"https://checkout.stripe.com/c/pay/cs_live_..."</span> }` }} />
            </div>
            <p>Redirect the user to this URL. After payment, Stripe redirects back to your dashboard.</p>
          </section>

          <hr />

          {/* Portal */}
          <section id="portal">
            <h2>POST /v1/billing/portal</h2>
            <p>Create a Stripe Billing Portal session for subscription management.</p>
            <div className="endpoint-badge">
              <span className="badge-method badge-post">POST</span>
              <span className="badge-path">https://docuextract.dev/v1/billing/portal</span>
            </div>
            <div className="callout callout-info">
              Requires an active Stripe subscription. Free plan users will receive a 400 error.
            </div>
            <h3>Response</h3>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{ <span class="key">"url"</span>: <span class="str">"https://billing.stripe.com/p/session/..."</span> }` }} />
            </div>
          </section>

          <hr />

          {/* Document Types */}
          <section id="document-types">
            <h2>Document Types</h2>
            <p>DocuExtract automatically detects document types, or you can specify one explicitly.</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Type</th><th>Description</th><th>Key Fields Extracted</th></tr></thead>
                <tbody>
                  <tr><td><code>invoice</code></td><td>Vendor invoices and billing statements</td><td>vendor name, invoice number, dates, line items, totals, payment terms</td></tr>
                  <tr><td><code>receipt</code></td><td>Purchase receipts from retail, restaurants, etc.</td><td>merchant name, date, items purchased, subtotal, tax, total, payment method</td></tr>
                  <tr><td><code>bank_statement</code></td><td>Bank and credit card statements</td><td>account number, period, opening/closing balance, transactions</td></tr>
                  <tr><td><code>resume</code></td><td>CVs and resumes</td><td>name, contact info, work experience, education, skills</td></tr>
                  <tr><td><code>contract</code></td><td>Legal agreements and contracts</td><td>parties, effective date, termination date, key obligations, governing law</td></tr>
                  <tr><td><code>form</code></td><td>Filled forms (applications, surveys, intake forms)</td><td>all labeled fields and their values</td></tr>
                  <tr><td><code>id_document</code></td><td>ID cards, passports, driver&apos;s licenses</td><td>name, date of birth, expiry, document number, issuing authority</td></tr>
                  <tr><td><code>unknown</code></td><td>Fallback for unrecognized types</td><td>best-effort extraction of all visible structured data</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr />

          {/* Errors */}
          <section id="errors">
            <h2>Error Codes</h2>
            <p>All errors return a JSON response with an <code>error</code> object containing <code>code</code> and <code>message</code> fields.</p>
            <div className="code-block">
              <div className="code-header"><span className="code-lang">json</span></div>
              <pre dangerouslySetInnerHTML={{ __html: `{\n  <span class="key">"error"</span>: {\n    <span class="key">"code"</span>: <span class="str">"unauthorized"</span>,\n    <span class="key">"message"</span>: <span class="str">"Invalid or missing API key"</span>\n  }\n}` }} />
            </div>
            <h3>4xx Client Errors</h3>
            <div className="error-card"><div className="error-code">401 — unauthorized</div><div className="error-desc">The API key is missing, malformed, or revoked.</div></div>
            <div className="error-card"><div className="error-code">400 — invalid_request</div><div className="error-desc">A required field is missing or a field value is invalid (includes inaccessible document URLs).</div></div>
            <div className="error-card"><div className="error-code">413 — file_too_large</div><div className="error-desc">The document exceeds the 10 MB size limit.</div></div>
            <div className="error-card"><div className="error-code">415 — unsupported_format</div><div className="error-desc">The file format is not supported. Use PDF, PNG, JPG, or WEBP.</div></div>
            <div className="error-card"><div className="error-code">422 — extraction_failed</div><div className="error-desc">The AI extraction failed after retrying. Try again. If it persists, the document may be corrupted or too complex.</div></div>
            <div className="error-card"><div className="error-code">429 — rate_limited</div><div className="error-desc">You&apos;ve exceeded your per-minute or per-month rate limit. Check the <code>Retry-After</code> header. Upgrade your plan for higher limits.</div></div>
            <h3>5xx Server Errors</h3>
            <div className="error-card"><div className="error-code">500 — internal_error</div><div className="error-desc">Unexpected server error. Please try again or contact support.</div></div>
          </section>

          <hr />

          {/* Pricing */}
          <section id="pricing">
            <h2>Pricing</h2>
            <p>Simple, transparent pricing. No credit multipliers, no enterprise-gating.</p>
            <div className="pricing-grid">
              <div className="plan-card">
                <div className="plan-name">Free</div>
                <div className="plan-price">$0<span>/mo</span></div>
                <div className="plan-calls">100 extractions/mo</div>
                <ul className="plan-features">
                  <li>10 req/min rate limit</li>
                  <li>Haiku model only</li>
                  <li>No credit card required</li>
                </ul>
              </div>
              <div className="plan-card featured">
                <div className="plan-badge">Most Popular</div>
                <div className="plan-name">Starter</div>
                <div className="plan-price">$49<span>/mo</span></div>
                <div className="plan-calls">2,500 extractions/mo</div>
                <ul className="plan-features">
                  <li>30 req/min rate limit</li>
                  <li>Haiku + Sonnet</li>
                  <li>Email support</li>
                </ul>
              </div>
              <div className="plan-card">
                <div className="plan-badge best-value">Best Value</div>
                <div className="plan-name">Pro</div>
                <div className="plan-price">$99<span>/mo</span></div>
                <div className="plan-calls">10,000 extractions/mo</div>
                <ul className="plan-features">
                  <li>60 req/min rate limit</li>
                  <li>Haiku + Sonnet</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="plan-card">
                <div className="plan-name">Scale</div>
                <div className="plan-price">$249<span>/mo</span></div>
                <div className="plan-calls">50,000 extractions/mo</div>
                <ul className="plan-features">
                  <li>120 req/min rate limit</li>
                  <li>All models + Priority</li>
                  <li>SLA + dedicated support</li>
                </ul>
              </div>
            </div>
            <h3>Overage Pricing</h3>
            <p>When you exceed your monthly quota, additional extractions are billed at <strong>$0.05 per extraction</strong>.</p>
            <div className="callout callout-tip">
              <strong>Tip</strong>
              Monitor your usage with <code>GET /v1/usage</code> or check the <code>X-RateLimit-Remaining-Month</code> header.
            </div>
          </section>

        </main>
        </div>
      </div>

      <Script id="dashboard-docs-js" strategy="afterInteractive">{`
        window.switchTab = function(btn, panelId) {
          var tabsEl = btn.closest('.tabs');
          tabsEl.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
          tabsEl.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
          btn.classList.add('active');
          document.getElementById(panelId).classList.add('active');
        };

        window.copyCode = async function(btn) {
          var pre = btn.closest('.code-block').querySelector('pre');
          try {
            await navigator.clipboard.writeText(pre.innerText);
            btn.textContent = 'Copied!';
            setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
          } catch(e) {}
        };

        // Active nav on scroll
        var scrollContainer = document.getElementById('docs-scroll-container');
        var sections = document.querySelectorAll('.docs-main section[id]');
        var navLinks = document.querySelectorAll('.docs-nav-link');
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              navLinks.forEach(function(link) { link.classList.remove('active'); });
              var active = document.querySelector('.docs-nav-link[href="#' + entry.target.id + '"]');
              if (active) active.classList.add('active');
            }
          });
        }, { root: scrollContainer, rootMargin: '-20% 0px -70% 0px' });
        sections.forEach(function(s) { observer.observe(s); });

        // Smooth scroll nav links within the scroll container
        navLinks.forEach(function(link) {
          link.addEventListener('click', function(e) {
            var href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
              e.preventDefault();
              var target = document.getElementById(href.slice(1));
              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });
      `}</Script>
    </>
  );
}
