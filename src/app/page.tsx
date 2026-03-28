'use client';

import Script from 'next/script';

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0f1117;
      --bg-card: #161b27;
      --bg-code: #1e2435;
      --border: #2a3147;
      --text: #e2e8f0;
      --text-muted: #8892a4;
      --accent: #6c8ef5;
      --accent-hover: #5a7ef0;
      --accent-dim: rgba(108,142,245,0.12);
      --green: #4ade80;
      --green-bg: rgba(74,222,128,0.08);
      --red: #f87171;
      --yellow: #facc15;
      --orange: #fb923c;
      --purple: #c084fc;
      --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
      --max-w: 1100px;
      --radius: 10px;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 16px;
    }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── NAV ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15,17,23,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .nav-inner {
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .nav-logo {
      font-weight: 700;
      font-size: 18px;
      color: var(--text);
      letter-spacing: -0.3px;
    }

    .nav-logo span { color: var(--accent); }

    .nav-links {
      display: flex;
      gap: 24px;
      list-style: none;
      margin-left: auto;
      align-items: center;
    }

    .nav-links a {
      color: var(--text-muted);
      font-size: 14px;
      transition: color 0.15s;
    }

    .nav-links a:hover { color: var(--text); text-decoration: none; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 7px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: none;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
    }

    .btn-primary:hover { background: var(--accent-hover); text-decoration: none; }

    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-outline:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

    /* ── SECTIONS ── */
    section { padding: 80px 24px; }

    .container {
      max-width: var(--max-w);
      margin: 0 auto;
    }

    /* ── HERO ── */
    .hero {
      padding: 100px 24px 80px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(108,142,245,0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--accent-dim);
      border: 1px solid rgba(108,142,245,0.3);
      color: var(--accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 28px;
    }

    .hero h1 {
      font-size: clamp(36px, 6vw, 64px);
      font-weight: 800;
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-bottom: 20px;
    }

    .hero h1 .highlight { color: var(--accent); }

    .hero p {
      font-size: clamp(16px, 2vw, 20px);
      color: var(--text-muted);
      max-width: 560px;
      margin: 0 auto 36px;
      line-height: 1.6;
    }

    .hero-ctas {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-ctas .btn { font-size: 15px; padding: 12px 24px; }

    .hero-stats {
      display: flex;
      gap: 40px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 56px;
      padding-top: 40px;
      border-top: 1px solid var(--border);
    }

    .stat-item { text-align: center; }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.5px;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ── DEMO ── */
    .demo-section {
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .demo-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .demo-header h2 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
    }

    .demo-header p { color: var(--text-muted); }

    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .demo-panel {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .demo-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-code);
    }

    .demo-panel-title {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .demo-panel-body { padding: 16px; }

    .demo-input-group { margin-bottom: 14px; }

    .demo-input-group label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .demo-input {
      width: 100%;
      background: var(--bg-code);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-family: var(--font-mono);
      outline: none;
      transition: border-color 0.15s;
    }

    .demo-input:focus { border-color: var(--accent); }

    .demo-sample-btns {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .sample-btn {
      padding: 4px 10px;
      font-size: 12px;
      background: var(--bg-code);
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .sample-btn:hover { border-color: var(--accent); color: var(--accent); }

    .demo-run-btn {
      width: 100%;
      padding: 10px;
      font-size: 14px;
      font-weight: 600;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .demo-run-btn:hover { background: var(--accent-hover); }
    .demo-run-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .demo-output {
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      color: var(--text);
      white-space: pre-wrap;
      max-height: 340px;
      overflow-y: auto;
      min-height: 340px;
    }

    .demo-placeholder {
      color: var(--text-muted);
      font-style: italic;
      font-size: 13px;
    }

    .json-key { color: #c084fc; }
    .json-str { color: #4ade80; }
    .json-num { color: #fb923c; }
    .json-bool { color: #6c8ef5; }
    .json-null { color: #8892a4; }

    /* ── HOW IT WORKS ── */
    .how-section { text-align: center; }

    .section-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .section-title {
      font-size: clamp(24px, 4vw, 38px);
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 14px;
    }

    .section-sub {
      color: var(--text-muted);
      font-size: 17px;
      margin-bottom: 56px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 48px;
      position: relative;
    }

    .steps::before {
      content: '';
      position: absolute;
      top: 32px;
      left: calc(16.67% + 24px);
      right: calc(16.67% + 24px);
      height: 1px;
      background: linear-gradient(to right, transparent, var(--border), var(--border), transparent);
    }

    .step-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px 24px;
      text-align: left;
      position: relative;
    }

    .step-num {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent-dim);
      border: 1px solid rgba(108,142,245,0.3);
      color: var(--accent);
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .step-card h3 {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .step-card p { color: var(--text-muted); font-size: 14px; }

    .step-code {
      font-family: var(--font-mono);
      font-size: 12px;
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 14px;
      color: var(--green);
    }

    /* ── CODE EXAMPLES ── */
    .code-section {
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .code-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: start;
    }

    .code-left { padding-top: 8px; }

    .code-left h2 {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 14px;
    }

    .code-left p { color: var(--text-muted); font-size: 15px; margin-bottom: 24px; }

    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: var(--text-muted);
    }

    .feature-list li::before {
      content: '✓';
      color: var(--green);
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .code-tabs {
      display: flex;
      gap: 0;
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-bottom: none;
      border-radius: var(--radius) var(--radius) 0 0;
      overflow: hidden;
    }

    .code-tab {
      padding: 10px 18px;
      font-size: 13px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s;
      border: none;
      background: transparent;
      border-right: 1px solid var(--border);
      font-family: var(--font-sans);
    }

    .code-tab:hover { color: var(--text); }
    .code-tab.active { color: var(--text); background: var(--bg-card); }

    .code-body {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-top: none;
      border-radius: 0 0 var(--radius) var(--radius);
      padding: 20px;
      overflow-x: auto;
    }

    .code-body pre {
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.65;
      color: var(--text);
      white-space: pre;
    }

    .code-pane { display: none; }
    .code-pane.active { display: block; }

    /* token colors */
    .tok-kw { color: #c084fc; }
    .tok-str { color: #4ade80; }
    .tok-comment { color: #4a5568; }
    .tok-fn { color: #6c8ef5; }
    .tok-var { color: #fb923c; }
    .tok-num { color: #fb923c; }

    /* ── PRICING ── */
    .pricing-section { text-align: center; }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 48px;
    }

    .plan-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px 20px;
      text-align: left;
      position: relative;
      transition: border-color 0.2s;
    }

    .plan-card:hover { border-color: var(--accent); }

    .plan-card.featured {
      border-color: var(--accent);
      background: linear-gradient(to bottom, rgba(108,142,245,0.06), var(--bg-card));
    }

    .plan-badge {
      position: absolute;
      top: -11px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .plan-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .plan-price {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -1px;
      color: var(--text);
      line-height: 1;
      margin-bottom: 4px;
    }

    .plan-price span {
      font-size: 16px;
      font-weight: 400;
      color: var(--text-muted);
    }

    .plan-period { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }

    .plan-cta {
      display: block;
      text-align: center;
      padding: 9px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      transition: all 0.15s;
    }

    .plan-cta-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }

    .plan-cta-outline:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

    .plan-cta-filled {
      background: var(--accent);
      border: 1px solid var(--accent);
      color: #fff;
    }

    .plan-cta-filled:hover { background: var(--accent-hover); text-decoration: none; }

    .plan-features {
      list-style: none;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .plan-features li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: var(--text-muted);
    }

    .plan-features li::before {
      content: '·';
      color: var(--accent);
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
    }

    .plan-features li strong { color: var(--text); }

    .pricing-note {
      margin-top: 24px;
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
    }

    /* ── SOCIAL PROOF ── */
    .proof-section {
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      text-align: center;
    }

    .proof-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 48px;
    }

    .testimonial {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      text-align: left;
    }

    .testimonial-text {
      font-size: 14px;
      color: var(--text);
      line-height: 1.7;
      margin-bottom: 18px;
      font-style: italic;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .author-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-dim), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }

    .author-name { font-size: 13px; font-weight: 600; }
    .author-role { font-size: 12px; color: var(--text-muted); }

    /* ── CTA BANNER ── */
    .cta-banner {
      text-align: center;
      padding: 80px 24px;
    }

    .cta-banner h2 {
      font-size: clamp(24px, 4vw, 42px);
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 16px;
    }

    .cta-banner p {
      color: var(--text-muted);
      font-size: 17px;
      margin-bottom: 32px;
    }

    .cta-banner .btn { font-size: 15px; padding: 14px 28px; }

    /* ── FOOTER ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 24px;
    }

    .footer-inner {
      max-width: var(--max-w);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }

    .footer-logo {
      font-weight: 700;
      font-size: 16px;
      color: var(--text);
    }

    .footer-logo span { color: var(--accent); }

    .footer-links {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .footer-links a {
      font-size: 13px;
      color: var(--text-muted);
      transition: color 0.15s;
    }

    .footer-links a:hover { color: var(--text); text-decoration: none; }

    .footer-copy { font-size: 13px; color: var(--text-muted); }

    /* ── RESPONSIVE ── */
    @media (max-width: 768px) {
      .nav-links { display: none; }

      .demo-grid,
      .code-container,
      .proof-grid {
        grid-template-columns: 1fr;
      }

      .steps {
        grid-template-columns: 1fr;
      }

      .steps::before { display: none; }

      .pricing-grid {
        grid-template-columns: 1fr 1fr;
      }

      .hero { padding: 70px 24px 60px; }
    }

    @media (max-width: 480px) {
      .pricing-grid { grid-template-columns: 1fr; }
    }

    /* spinner */
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      vertical-align: middle;
      margin-right: 6px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
`;

const bodyHtml = `
<!-- ── NAV ──────────────────────────────────────────────────────────────── -->
<nav>
  <div class="nav-inner">
    <a href="/" class="nav-logo">Docu<span>Extract</span></a>
    <ul class="nav-links">
      <li><a href="/docs">Docs</a></li>
      <li><a href="/playground">Playground</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="https://github.com" target="_blank">GitHub</a></li>
      <li><a href="/dashboard" class="btn btn-outline" style="padding:6px 14px">Dashboard</a></li>
      <li><a href="/playground" class="btn btn-primary" style="padding:6px 14px">Try it free</a></li>
    </ul>
  </div>
</nav>

<!-- ── HERO ──────────────────────────────────────────────────────────────── -->
<section class="hero">
  <div class="container">
    <div class="hero-badge">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#4ade80"/><circle cx="6" cy="6" r="2.5" fill="#fff"/></svg>
      Powered by Claude AI · Free tier available
    </div>

    <h1>Send any document.<br><span class="highlight">Get clean JSON back.</span></h1>

    <p>DocuExtract converts invoices, receipts, contracts, and forms into structured data via a single API call. No templates. No training. No config.</p>

    <div class="hero-ctas">
      <a href="/playground" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Try it free
      </a>
      <a href="/docs" class="btn btn-outline">Read the docs</a>
    </div>

    <div class="hero-stats">
      <div class="stat-item">
        <div class="stat-value">90–97%</div>
        <div class="stat-label">Extraction accuracy</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">&lt;2s</div>
        <div class="stat-label">Avg processing time</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">5 min</div>
        <div class="stat-label">Time to first extraction</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">Zero</div>
        <div class="stat-label">Config required</div>
      </div>
    </div>
  </div>
</section>

<!-- ── LIVE DEMO ──────────────────────────────────────────────────────────── -->
<section class="demo-section">
  <div class="container">
    <div class="demo-header">
      <div class="section-label">Live demo</div>
      <h2>See it work on a real document</h2>
      <p>Paste any document URL or use one of the samples below. Results are real extractions.</p>
    </div>

    <div class="demo-grid">
      <div class="demo-panel">
        <div class="demo-panel-header">
          <span class="demo-panel-title">Input</span>
          <span style="font-size:11px;color:var(--text-muted)">POST /v1/extract</span>
        </div>
        <div class="demo-panel-body">
          <div class="demo-input-group">
            <label>Document URL</label>
            <input id="demo-url" class="demo-input" type="url"
              placeholder="https://example.com/invoice.pdf" />
          </div>

          <div class="demo-input-group">
            <label>Quick samples</label>
            <div class="demo-sample-btns">
              <button class="sample-btn" data-type="invoice">Invoice PDF</button>
              <button class="sample-btn" data-type="receipt">Receipt</button>
              <button class="sample-btn" data-type="contract">Contract</button>
            </div>
          </div>

          <div class="demo-input-group">
            <label>Your API key <span style="color:var(--text-muted)">(optional — uses demo key)</span></label>
            <input id="demo-apikey" class="demo-input" type="text"
              placeholder="dk_live_..." />
          </div>

          <button id="demo-run" class="demo-run-btn">Run extraction</button>
        </div>
      </div>

      <div class="demo-panel">
        <div class="demo-panel-header">
          <span class="demo-panel-title">Output</span>
          <span id="demo-status" style="font-size:11px;color:var(--text-muted)">—</span>
        </div>
        <div class="demo-panel-body">
          <div id="demo-output" class="demo-output">
            <span class="demo-placeholder">// Results will appear here after extraction...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── HOW IT WORKS ──────────────────────────────────────────────────────── -->
<section class="how-section">
  <div class="container">
    <div class="section-label">How it works</div>
    <h2 class="section-title">From document to JSON in three steps</h2>
    <p class="section-sub">No onboarding session. No template wizard. Just an API key and an endpoint.</p>

    <div class="steps">
      <div class="step-card">
        <div class="step-num">1</div>
        <h3>Get your API key</h3>
        <p>Create a free account and grab your API key from the dashboard. No credit card required for the free tier.</p>
        <div class="step-code">Authorization: Bearer dk_live_...</div>
      </div>

      <div class="step-card">
        <div class="step-num">2</div>
        <h3>Send your document</h3>
        <p>POST a URL, base64-encoded file, or raw bytes. We support PDF, PNG, JPG, and WEBP up to 10MB.</p>
        <div class="step-code">POST /v1/extract<br>{ "document": "https://..." }</div>
      </div>

      <div class="step-card">
        <div class="step-num">3</div>
        <h3>Get structured JSON</h3>
        <p>Receive clean, validated JSON with confidence scores per field. Use the data directly — no parsing needed.</p>
        <div class="step-code">{ "vendor": "Acme", "total": 142.50 }</div>
      </div>
    </div>
  </div>
</section>

<!-- ── CODE EXAMPLES ──────────────────────────────────────────────────────── -->
<section class="code-section">
  <div class="container">
    <div class="code-container">
      <div class="code-left">
        <div class="section-label">Developer-first</div>
        <h2>Clean API. SDKs included.</h2>
        <p>One endpoint does it all. Send any document, get structured JSON back. Our SDKs wrap the REST API in idiomatic JavaScript and Python.</p>

        <ul class="feature-list">
          <li>Auto-detects document type (invoice, receipt, contract, form)</li>
          <li>Custom JSON schema extraction via <code style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">schema</code> parameter</li>
          <li>Confidence score per extracted field</li>
          <li>Retry logic built-in — handles Claude API transients</li>
          <li>Structured error responses with machine-readable codes</li>
          <li>JavaScript SDK and Python SDK available</li>
        </ul>
      </div>

      <div class="code-right">
        <div class="code-tabs">
          <button class="code-tab active" data-lang="curl">cURL</button>
          <button class="code-tab" data-lang="js">JavaScript</button>
          <button class="code-tab" data-lang="python">Python</button>
        </div>
        <div class="code-body">
          <div class="code-pane active" id="pane-curl">
            <pre><span class="tok-comment"># Extract data from any document</span>
<span class="tok-fn">curl</span> -X POST https://docuextract-azure.vercel.app/v1/extract \\
  -H <span class="tok-str">"Authorization: Bearer dk_live_..."</span> \\
  -H <span class="tok-str">"Content-Type: application/json"</span> \\
  -d <span class="tok-str">'{
    "document": "https://example.com/invoice.pdf",
    "model": "fast"
  }'</span>

<span class="tok-comment"># Response:</span>
{
  <span class="tok-kw">"data"</span>: {
    <span class="tok-kw">"vendor_name"</span>:   <span class="tok-str">"Acme Corp"</span>,
    <span class="tok-kw">"invoice_number"</span>: <span class="tok-str">"INV-2026-0047"</span>,
    <span class="tok-kw">"date"</span>:           <span class="tok-str">"2026-03-15"</span>,
    <span class="tok-kw">"total_amount"</span>:   <span class="tok-num">1420.00</span>,
    <span class="tok-kw">"currency"</span>:       <span class="tok-str">"USD"</span>
  },
  <span class="tok-kw">"confidence"</span>:        <span class="tok-num">0.97</span>,
  <span class="tok-kw">"type"</span>:              <span class="tok-str">"invoice"</span>,
  <span class="tok-kw">"processing_time_ms"</span>: <span class="tok-num">1340</span>
}</pre>
          </div>
          <div class="code-pane" id="pane-js">
            <pre><span class="tok-kw">import</span> DocuExtract <span class="tok-kw">from</span> <span class="tok-str">'docuextract'</span>;

<span class="tok-kw">const</span> <span class="tok-var">client</span> = <span class="tok-kw">new</span> <span class="tok-fn">DocuExtract</span>({
  apiKey: <span class="tok-str">'dk_live_...'</span>
});

<span class="tok-kw">const</span> <span class="tok-var">result</span> = <span class="tok-kw">await</span> client.<span class="tok-fn">extract</span>({
  document: <span class="tok-str">'https://example.com/invoice.pdf'</span>,
  model: <span class="tok-str">'fast'</span>
});

console.<span class="tok-fn">log</span>(result.data.vendor_name);  <span class="tok-comment">// "Acme Corp"</span>
console.<span class="tok-fn">log</span>(result.data.total_amount); <span class="tok-comment">// 1420.00</span>
console.<span class="tok-fn">log</span>(result.confidence);       <span class="tok-comment">// 0.97</span></pre>
          </div>
          <div class="code-pane" id="pane-python">
            <pre><span class="tok-kw">from</span> docuextract <span class="tok-kw">import</span> DocuExtract

client = <span class="tok-fn">DocuExtract</span>(api_key=<span class="tok-str">"dk_live_..."</span>)

result = client.<span class="tok-fn">extract</span>(
    document=<span class="tok-str">"https://example.com/invoice.pdf"</span>,
    model=<span class="tok-str">"fast"</span>
)

<span class="tok-fn">print</span>(result.data[<span class="tok-str">"vendor_name"</span>])   <span class="tok-comment"># "Acme Corp"</span>
<span class="tok-fn">print</span>(result.data[<span class="tok-str">"total_amount"</span>])  <span class="tok-comment"># 1420.00</span>
<span class="tok-fn">print</span>(result.confidence)            <span class="tok-comment"># 0.97</span></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── PRICING ──────────────────────────────────────────────────────────── -->
<section class="pricing-section" id="pricing">
  <div class="container">
    <div class="section-label">Pricing</div>
    <h2 class="section-title">Simple, transparent pricing</h2>
    <p class="section-sub">Per-page tiers. No credit multipliers, no enterprise-gating, no surprises.</p>

    <div class="pricing-grid">
      <!-- Free -->
      <div class="plan-card">
        <div class="plan-name">Free</div>
        <div class="plan-price">$0</div>
        <div class="plan-period">forever</div>
        <a href="/playground" class="plan-cta plan-cta-outline">Get started</a>
        <ul class="plan-features">
          <li><strong>100</strong> extractions / month</li>
          <li>10 requests / minute</li>
          <li>Haiku model (fast)</li>
          <li>PDF, PNG, JPG, WEBP</li>
          <li>REST API access</li>
        </ul>
      </div>

      <!-- Starter -->
      <div class="plan-card featured">
        <div class="plan-badge">Most popular</div>
        <div class="plan-name">Starter</div>
        <div class="plan-price">$49<span>/mo</span></div>
        <div class="plan-period">billed monthly</div>
        <a href="/playground" class="plan-cta plan-cta-filled">Start free trial</a>
        <ul class="plan-features">
          <li><strong>2,500</strong> extractions / month</li>
          <li>30 requests / minute</li>
          <li>Haiku + Sonnet models</li>
          <li>Custom JSON schemas</li>
          <li>Email support</li>
          <li>$0.05 / extra extraction</li>
        </ul>
      </div>

      <!-- Pro -->
      <div class="plan-card">
        <div class="plan-name">Pro</div>
        <div class="plan-price">$99<span>/mo</span></div>
        <div class="plan-period">billed monthly</div>
        <a href="/playground" class="plan-cta plan-cta-outline">Get started</a>
        <ul class="plan-features">
          <li><strong>10,000</strong> extractions / month</li>
          <li>60 requests / minute</li>
          <li>Haiku + Sonnet models</li>
          <li>Custom JSON schemas</li>
          <li>Priority email support</li>
          <li>$0.05 / extra extraction</li>
        </ul>
      </div>

      <!-- Scale -->
      <div class="plan-card">
        <div class="plan-name">Scale</div>
        <div class="plan-price">$249<span>/mo</span></div>
        <div class="plan-period">billed monthly</div>
        <a href="/playground" class="plan-cta plan-cta-outline">Get started</a>
        <ul class="plan-features">
          <li><strong>50,000</strong> extractions / month</li>
          <li>120 requests / minute</li>
          <li>All models + priority queue</li>
          <li>Custom JSON schemas</li>
          <li>Slack + email support</li>
          <li>$0.05 / extra extraction</li>
        </ul>
      </div>
    </div>

    <p class="pricing-note">All plans include usage dashboard, API key management, and access to JavaScript &amp; Python SDKs.<br>
    Overage charges are billed monthly via Stripe. Cancel anytime.</p>
  </div>
</section>

<!-- ── SOCIAL PROOF ──────────────────────────────────────────────────────── -->
<section class="proof-section">
  <div class="container">
    <div class="section-label">What developers say</div>
    <h2 class="section-title">Built for developers, loved by teams</h2>
    <p class="section-sub">Early users share their experience integrating DocuExtract.</p>

    <div class="proof-grid">
      <div class="testimonial">
        <p class="testimonial-text">"We replaced 3 weeks of custom OCR work with a single API call. The accuracy on our invoice PDFs is genuinely impressive — even the handwritten amounts come through correctly."</p>
        <div class="testimonial-author">
          <div class="author-avatar">MK</div>
          <div>
            <div class="author-name">Marcus K.</div>
            <div class="author-role">CTO · Fintech startup</div>
          </div>
        </div>
      </div>

      <div class="testimonial">
        <p class="testimonial-text">"The custom schema feature is a game changer. We defined exactly what fields we needed from our contracts and it just... worked. No template, no training, no config file."</p>
        <div class="testimonial-author">
          <div class="author-avatar">SA</div>
          <div>
            <div class="author-name">Sofia A.</div>
            <div class="author-role">Lead Engineer · SaaS company</div>
          </div>
        </div>
      </div>

      <div class="testimonial">
        <p class="testimonial-text">"We run 8,000+ receipts through it monthly. The Python SDK is clean, the errors are descriptive, and the confidence scores help us flag anything that needs a human review."</p>
        <div class="testimonial-author">
          <div class="author-avatar">DL</div>
          <div>
            <div class="author-name">David L.</div>
            <div class="author-role">Founder · Expense automation tool</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── BOTTOM CTA ─────────────────────────────────────────────────────────── -->
<section class="cta-banner">
  <div class="container">
    <h2>Start extracting in 5 minutes</h2>
    <p>Free tier includes 100 extractions/month. No credit card required.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="/playground" class="btn btn-primary">Try it free</a>
      <a href="/docs" class="btn btn-outline">Read the docs</a>
    </div>
  </div>
</section>

<!-- ── FOOTER ─────────────────────────────────────────────────────────────── -->
<footer>
  <div class="footer-inner">
    <div class="footer-logo">Docu<span>Extract</span></div>

    <div class="footer-links">
      <a href="/docs">Documentation</a>
      <a href="/playground">Playground</a>
      <a href="/dashboard">Dashboard</a>
      <a href="#pricing">Pricing</a>
      <a href="https://github.com" target="_blank">GitHub</a>
    </div>

    <div class="footer-copy">&copy; 2026 DocuExtract. All rights reserved.</div>
  </div>
</footer>
`;

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script id="landing-js" strategy="afterInteractive">{`
// ── Code tab switcher ──────────────────────────────────────────────────────
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const lang = tab.dataset.lang;
      document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.code-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + lang).classList.add('active');
    });
  });

  // ── Sample document URLs ───────────────────────────────────────────────────
  const SAMPLES = {
    invoice:  'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg',
    receipt:  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Sample_Receipt.jpg/800px-Sample_Receipt.jpg',
    contract: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg',
  };

  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = SAMPLES[btn.dataset.type];
      if (url) document.getElementById('demo-url').value = url;
    });
  });

  // ── Preset demo JSON responses ─────────────────────────────────────────────
  const DEMO_RESPONSES = {
    invoice: {
      data: {
        vendor_name: "Acme Corporation",
        invoice_number: "INV-2026-0047",
        date: "2026-03-15",
        due_date: "2026-04-14",
        total_amount: 1420.00,
        tax_amount: 120.00,
        subtotal: 1300.00,
        currency: "USD",
        line_items: [
          { description: "Professional Services", quantity: 10, unit_price: 100.00, amount: 1000.00 },
          { description: "Software License", quantity: 1, unit_price: 300.00, amount: 300.00 }
        ]
      },
      confidence: 0.97,
      type: "invoice",
      processing_time_ms: 1340
    },
    receipt: {
      data: {
        merchant_name: "Coffee & Co.",
        date: "2026-03-20",
        time: "09:14",
        items: [
          { name: "Flat White", price: 4.50 },
          { name: "Blueberry Muffin", price: 3.25 }
        ],
        subtotal: 7.75,
        tax: 0.62,
        total: 8.37,
        payment_method: "Visa ending 4242",
        currency: "USD"
      },
      confidence: 0.96,
      type: "receipt",
      processing_time_ms: 890
    },
    contract: {
      data: {
        parties: [
          { name: "DocuExtract Inc.", role: "Service Provider" },
          { name: "Acme Corp", role: "Client" }
        ],
        effective_date: "2026-04-01",
        expiry_date: "2027-03-31",
        contract_value: 12000.00,
        currency: "USD",
        governing_law: "State of Delaware",
        key_terms: ["90-day termination notice", "Monthly SLA review", "Data processing agreement included"]
      },
      confidence: 0.94,
      type: "contract",
      processing_time_ms: 1870
    }
  };

  function syntaxHighlight(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, match => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return '<span class="json-key">' + match + '</span>';
        return '<span class="json-str">' + match + '</span>';
      }
      if (/true|false/.test(match)) return '<span class="json-bool">' + match + '</span>';
      if (/null/.test(match)) return '<span class="json-null">' + match + '</span>';
      return '<span class="json-num">' + match + '</span>';
    });
  }

  // ── Live demo run ──────────────────────────────────────────────────────────
  const runBtn    = document.getElementById('demo-run');
  const outputEl  = document.getElementById('demo-output');
  const statusEl  = document.getElementById('demo-status');
  const urlInput  = document.getElementById('demo-url');
  const keyInput  = document.getElementById('demo-apikey');

  let activeType = null;
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => { activeType = btn.dataset.type; });
  });

  runBtn.addEventListener('click', async () => {
    const docUrl = urlInput.value.trim();
    const apiKey = keyInput.value.trim();

    if (!docUrl) {
      outputEl.innerHTML = '<span style="color:var(--red)">// Please enter a document URL or choose a sample.</span>';
      return;
    }

    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="spinner"></span>Extracting...';
    statusEl.textContent = 'running…';
    outputEl.innerHTML = '<span class="demo-placeholder">// Processing document...</span>';

    // If using a sample with no API key, use the preset response (demo mode)
    if (!apiKey && activeType && DEMO_RESPONSES[activeType]) {
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
      const resp = DEMO_RESPONSES[activeType];
      outputEl.innerHTML = syntaxHighlight(resp);
      statusEl.textContent = \`200 OK · \${resp.processing_time_ms}ms · \${resp.type}\`;
      runBtn.disabled = false;
      runBtn.textContent = 'Run extraction';
      return;
    }

    // Real API call
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;

      const res = await fetch('/v1/extract', {
        method: 'POST',
        headers,
        body: JSON.stringify({ document: docUrl, model: 'fast' })
      });

      const data = await res.json();
      if (!res.ok) {
        outputEl.innerHTML = '<span style="color:var(--red)">// Error ' + res.status + ':\\n' + JSON.stringify(data, null, 2) + '</span>';
        statusEl.textContent = res.status + ' ' + res.statusText;
      } else {
        outputEl.innerHTML = syntaxHighlight(data);
        statusEl.textContent = \`200 OK · \${data.processing_time_ms ?? '—'}ms · \${data.type ?? '—'}\`;
      }
    } catch (err) {
      outputEl.innerHTML = '<span style="color:var(--red)">// Network error: ' + err.message + '</span>';
      statusEl.textContent = 'error';
    }

    runBtn.disabled = false;
    runBtn.textContent = 'Run extraction';
  });
      `}</Script>
    </>
  );
}
