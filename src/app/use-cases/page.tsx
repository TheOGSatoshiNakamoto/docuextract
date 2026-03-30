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
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 16px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ── NAV ── */
nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(15,17,23,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: var(--max-w); margin: 0 auto; padding: 0 24px;
  height: 60px; display: flex; align-items: center; gap: 32px;
}
.nav-logo { font-weight: 700; font-size: 18px; color: var(--text); letter-spacing: -0.3px; }
.nav-logo span { color: var(--accent); }
.nav-links { display: flex; gap: 24px; list-style: none; margin-left: auto; align-items: center; }
.nav-links a { color: var(--text-muted); font-size: 14px; transition: color 0.15s; }
.nav-links a:hover { color: var(--text); text-decoration: none; }
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 7px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; border: none; text-decoration: none;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; }
.btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

/* ── SECTIONS ── */
section { padding: 80px 24px; }
.container { max-width: var(--max-w); margin: 0 auto; }

/* ── HERO ── */
.hero {
  padding: 80px 24px 60px; text-align: center; position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(108,142,245,0.10) 0%, transparent 70%);
  pointer-events: none;
}
.hero h1 {
  font-size: clamp(32px, 5vw, 52px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 16px;
}
.hero h1 .highlight { color: var(--accent); }
.hero p { font-size: 17px; color: var(--text-muted); max-width: 560px; margin: 0 auto; }
.section-label {
  font-size: 12px; font-weight: 600; color: var(--accent);
  text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-bottom: 12px;
}
.section-title {
  font-size: clamp(24px, 4vw, 38px); font-weight: 700; letter-spacing: -0.5px;
  margin-bottom: 14px;
}
.section-sub { color: var(--text-muted); font-size: 16px; margin-bottom: 48px; }

/* ── USE CASE SECTION ── */
.use-case { border-top: 1px solid var(--border); }
.use-case-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;
}
.use-case-label {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--accent-dim); border: 1px solid rgba(108,142,245,0.3);
  color: var(--accent); padding: 3px 10px; border-radius: 16px;
  font-size: 12px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;
}
.use-case h2 {
  font-size: clamp(24px, 3vw, 32px); font-weight: 700; letter-spacing: -0.5px; margin-bottom: 12px;
}
.use-case .desc { color: var(--text-muted); font-size: 15px; margin-bottom: 24px; line-height: 1.7; }

/* ── Before / After panels ── */
.panel {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid var(--border);
  background: var(--bg-code);
}
.panel-header span { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.panel-body { padding: 16px; }

/* ── Document mockup ── */
.doc-mockup {
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  padding: 20px; font-size: 13px; line-height: 1.8; color: var(--text-muted);
}
.doc-mockup .doc-header { font-weight: 700; font-size: 16px; color: var(--text); margin-bottom: 12px; }
.doc-mockup .doc-row { display: flex; justify-content: space-between; padding: 4px 0; }
.doc-mockup .doc-row.bold { font-weight: 600; color: var(--text); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 6px; }
.doc-mockup .doc-divider { border-top: 1px solid var(--border); margin: 8px 0; }

/* ── JSON output ── */
.json-output {
  font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
  color: var(--text); white-space: pre-wrap; overflow-x: auto;
}
.json-key { color: var(--purple); }
.json-str { color: var(--green); }
.json-num { color: var(--orange); }
.json-bool { color: var(--accent); }

/* ── Code block mini ── */
.code-mini {
  background: var(--bg-code); border: 1px solid var(--border); border-radius: 8px;
  padding: 14px 16px; font-family: var(--font-mono); font-size: 12px;
  line-height: 1.7; color: var(--text-muted); overflow-x: auto; margin-top: 20px;
}
.code-mini .kw { color: var(--accent); }
.code-mini .str { color: var(--green); }

/* ── CTA BANNER ── */
.cta-banner {
  text-align: center; padding: 80px 24px;
  background: var(--bg-card); border-top: 1px solid var(--border);
}
.cta-banner h2 { font-size: clamp(22px, 4vw, 38px); font-weight: 800; letter-spacing: -0.5px; margin-bottom: 14px; }
.cta-banner p { color: var(--text-muted); font-size: 16px; margin-bottom: 28px; }

/* ── FOOTER ── */
footer { border-top: 1px solid var(--border); padding: 40px 24px; }
.footer-inner {
  max-width: var(--max-w); margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;
}
.footer-logo { font-weight: 700; font-size: 16px; color: var(--text); }
.footer-logo span { color: var(--accent); }
.footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
.footer-links a { font-size: 13px; color: var(--text-muted); transition: color 0.15s; }
.footer-links a:hover { color: var(--text); text-decoration: none; }
.footer-copy { font-size: 13px; color: var(--text-muted); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .use-case-grid { grid-template-columns: 1fr; }
  .nav-links li:not(:last-child):not(:nth-last-child(2)) { display: none; }
}
`;

export default function UseCasesPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a href="/" className="nav-logo">Docu<span>Extract</span></a>
          <ul className="nav-links">
            <li><a href="/docs">Docs</a></li>
            <li><a href="/playground">Playground</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/dashboard" className="btn btn-outline" style={{ padding: '6px 14px' }}>Dashboard</a></li>
            <li><a href="/playground" className="btn btn-primary" style={{ padding: '6px 14px' }}>Try it free</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label">Use Cases</div>
          <h1>Extract structured data from <span className="highlight">any document</span></h1>
          <p>Invoices, receipts, resumes — send any document, get clean JSON back. See real extraction results below.</p>
        </div>
      </section>

      {/* ── INVOICE ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Invoice Extraction</div>
          <h2>Turn invoices into structured line items</h2>
          <p className="desc">
            Extract vendor name, invoice number, dates, line items with descriptions and amounts,
            tax, and totals — all with confidence scores. Works with any invoice layout.
          </p>

          <div className="use-case-grid">
            {/* Before: Invoice mockup */}
            <div className="panel">
              <div className="panel-header">
                <span>📄 Input — invoice_2024.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">INVOICE #INV-2024-0847</div>
                  <div className="doc-row"><span>From: Acme Corp</span><span>Date: 2024-03-15</span></div>
                  <div className="doc-row"><span>To: TechStart Inc.</span><span>Due: 2024-04-15</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Cloud hosting (March)</span><span>$1,200.00</span></div>
                  <div className="doc-row"><span>API access — Pro tier</span><span>$499.00</span></div>
                  <div className="doc-row"><span>Support hours (8h × $150)</span><span>$1,200.00</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Subtotal</span><span>$2,899.00</span></div>
                  <div className="doc-row"><span>Tax (8.5%)</span><span>$246.42</span></div>
                  <div className="doc-row bold"><span>Total Due</span><span>$3,145.42</span></div>
                </div>
              </div>
            </div>

            {/* After: JSON */}
            <div className="panel">
              <div className="panel-header">
                <span>✨ Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.2s</span>
              </div>
              <div className="panel-body">
                <div className="json-output">{`{
  `}<span className="json-key">{`"vendor"`}</span>{`: `}<span className="json-str">{`"Acme Corp"`}</span>{`,
  `}<span className="json-key">{`"invoice_number"`}</span>{`: `}<span className="json-str">{`"INV-2024-0847"`}</span>{`,
  `}<span className="json-key">{`"date"`}</span>{`: `}<span className="json-str">{`"2024-03-15"`}</span>{`,
  `}<span className="json-key">{`"due_date"`}</span>{`: `}<span className="json-str">{`"2024-04-15"`}</span>{`,
  `}<span className="json-key">{`"line_items"`}</span>{`: [
    { `}<span className="json-key">{`"description"`}</span>{`: `}<span className="json-str">{`"Cloud hosting (March)"`}</span>{`, `}<span className="json-key">{`"amount"`}</span>{`: `}<span className="json-num">{`1200.00`}</span>{` },
    { `}<span className="json-key">{`"description"`}</span>{`: `}<span className="json-str">{`"API access — Pro tier"`}</span>{`, `}<span className="json-key">{`"amount"`}</span>{`: `}<span className="json-num">{`499.00`}</span>{` },
    { `}<span className="json-key">{`"description"`}</span>{`: `}<span className="json-str">{`"Support hours (8h × $150)"`}</span>{`, `}<span className="json-key">{`"amount"`}</span>{`: `}<span className="json-num">{`1200.00`}</span>{` }
  ],
  `}<span className="json-key">{`"subtotal"`}</span>{`: `}<span className="json-num">{`2899.00`}</span>{`,
  `}<span className="json-key">{`"tax"`}</span>{`: `}<span className="json-num">{`246.42`}</span>{`,
  `}<span className="json-key">{`"total"`}</span>{`: `}<span className="json-num">{`3145.42`}</span>{`,
  `}<span className="json-key">{`"confidence"`}</span>{`: `}<span className="json-num">{`0.97`}</span>{`
}`}</div>
              </div>
            </div>
          </div>

          <div className="code-mini">
            <span className="kw">curl</span> -X POST https://docuextract.dev/v1/extract \<br />
            {'  '}-H <span className="str">{`"Authorization: Bearer dk_live_..."`}</span> \<br />
            {'  '}-H <span className="str">{`"Content-Type: application/json"`}</span> \<br />
            {'  '}-d <span className="str">{`'{"document": "https://example.com/invoice.pdf", "type": "invoice"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try invoice extraction in the playground →</a>
          </div>
        </div>
      </section>

      {/* ── RECEIPT ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Receipt Processing</div>
          <h2>Parse receipts into expense data</h2>
          <p className="desc">
            Extract merchant, date, items, tax, tip, and total from any receipt — even crumpled photos.
            Perfect for expense tracking, bookkeeping automation, and travel reimbursement.
          </p>

          <div className="use-case-grid">
            <div className="panel">
              <div className="panel-header">
                <span>📷 Input — receipt_photo.jpg</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>BLUE BOTTLE COFFEE</div>
                  <div style={{ fontSize: 11, marginBottom: 12 }}>123 Market St, San Francisco CA</div>
                  <div style={{ textAlign: 'left' }}>
                    <div className="doc-row"><span>Cortado</span><span>$5.50</span></div>
                    <div className="doc-row"><span>Avocado Toast</span><span>$14.00</span></div>
                    <div className="doc-row"><span>Sparkling Water</span><span>$3.00</span></div>
                    <div className="doc-divider" />
                    <div className="doc-row"><span>Subtotal</span><span>$22.50</span></div>
                    <div className="doc-row"><span>Tax (8.625%)</span><span>$1.94</span></div>
                    <div className="doc-row"><span>Tip</span><span>$4.50</span></div>
                    <div className="doc-row bold"><span>Total</span><span>$28.94</span></div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 12 }}>03/15/2024 11:42 AM</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>✨ Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 0.9s</span>
              </div>
              <div className="panel-body">
                <div className="json-output">{`{
  `}<span className="json-key">{`"merchant"`}</span>{`: `}<span className="json-str">{`"Blue Bottle Coffee"`}</span>{`,
  `}<span className="json-key">{`"address"`}</span>{`: `}<span className="json-str">{`"123 Market St, San Francisco CA"`}</span>{`,
  `}<span className="json-key">{`"date"`}</span>{`: `}<span className="json-str">{`"2024-03-15"`}</span>{`,
  `}<span className="json-key">{`"time"`}</span>{`: `}<span className="json-str">{`"11:42"`}</span>{`,
  `}<span className="json-key">{`"items"`}</span>{`: [
    { `}<span className="json-key">{`"name"`}</span>{`: `}<span className="json-str">{`"Cortado"`}</span>{`, `}<span className="json-key">{`"price"`}</span>{`: `}<span className="json-num">{`5.50`}</span>{` },
    { `}<span className="json-key">{`"name"`}</span>{`: `}<span className="json-str">{`"Avocado Toast"`}</span>{`, `}<span className="json-key">{`"price"`}</span>{`: `}<span className="json-num">{`14.00`}</span>{` },
    { `}<span className="json-key">{`"name"`}</span>{`: `}<span className="json-str">{`"Sparkling Water"`}</span>{`, `}<span className="json-key">{`"price"`}</span>{`: `}<span className="json-num">{`3.00`}</span>{` }
  ],
  `}<span className="json-key">{`"subtotal"`}</span>{`: `}<span className="json-num">{`22.50`}</span>{`,
  `}<span className="json-key">{`"tax"`}</span>{`: `}<span className="json-num">{`1.94`}</span>{`,
  `}<span className="json-key">{`"tip"`}</span>{`: `}<span className="json-num">{`4.50`}</span>{`,
  `}<span className="json-key">{`"total"`}</span>{`: `}<span className="json-num">{`28.94`}</span>{`,
  `}<span className="json-key">{`"confidence"`}</span>{`: `}<span className="json-num">{`0.94`}</span>{`
}`}</div>
              </div>
            </div>
          </div>

          <div className="code-mini">
            <span className="kw">curl</span> -X POST https://docuextract.dev/v1/extract \<br />
            {'  '}-H <span className="str">{`"Authorization: Bearer dk_live_..."`}</span> \<br />
            {'  '}-d <span className="str">{`'{"document": "<base64_receipt_image>", "type": "receipt"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try receipt extraction in the playground →</a>
          </div>
        </div>
      </section>

      {/* ── RESUME ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Resume Parsing</div>
          <h2>Convert resumes into candidate profiles</h2>
          <p className="desc">
            Extract name, contact info, skills, work experience, and education from PDF resumes.
            Build ATS integrations, talent databases, or hiring automation in minutes.
          </p>

          <div className="use-case-grid">
            <div className="panel">
              <div className="panel-header">
                <span>📄 Input — sarah_chen_resume.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">Sarah Chen</div>
                  <div style={{ fontSize: 12, marginBottom: 16 }}>sarah@example.com · San Francisco, CA · github.com/schen</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Experience</div>
                  <div style={{ marginBottom: 12 }}>
                    <div><strong>Senior Software Engineer</strong> — Stripe (2021–Present)</div>
                    <div style={{ fontSize: 12 }}>Led payments infrastructure team. Reduced checkout latency by 40%.</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div><strong>Software Engineer</strong> — Vercel (2019–2021)</div>
                    <div style={{ fontSize: 12 }}>Built Edge Functions runtime. 12 open-source contributions.</div>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Skills</div>
                  <div style={{ fontSize: 12 }}>TypeScript, Go, Python, PostgreSQL, Redis, AWS, Kubernetes</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, marginTop: 12 }}>Education</div>
                  <div style={{ fontSize: 12 }}>B.S. Computer Science — UC Berkeley (2019)</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>✨ Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.5s</span>
              </div>
              <div className="panel-body">
                <div className="json-output">{`{
  `}<span className="json-key">{`"name"`}</span>{`: `}<span className="json-str">{`"Sarah Chen"`}</span>{`,
  `}<span className="json-key">{`"email"`}</span>{`: `}<span className="json-str">{`"sarah@example.com"`}</span>{`,
  `}<span className="json-key">{`"location"`}</span>{`: `}<span className="json-str">{`"San Francisco, CA"`}</span>{`,
  `}<span className="json-key">{`"experience"`}</span>{`: [
    {
      `}<span className="json-key">{`"title"`}</span>{`: `}<span className="json-str">{`"Senior Software Engineer"`}</span>{`,
      `}<span className="json-key">{`"company"`}</span>{`: `}<span className="json-str">{`"Stripe"`}</span>{`,
      `}<span className="json-key">{`"period"`}</span>{`: `}<span className="json-str">{`"2021-present"`}</span>{`,
      `}<span className="json-key">{`"highlights"`}</span>{`: [`}<span className="json-str">{`"Led payments infrastructure"`}</span>{`]
    },
    {
      `}<span className="json-key">{`"title"`}</span>{`: `}<span className="json-str">{`"Software Engineer"`}</span>{`,
      `}<span className="json-key">{`"company"`}</span>{`: `}<span className="json-str">{`"Vercel"`}</span>{`,
      `}<span className="json-key">{`"period"`}</span>{`: `}<span className="json-str">{`"2019-2021"`}</span>{`
    }
  ],
  `}<span className="json-key">{`"skills"`}</span>{`: [`}<span className="json-str">{`"TypeScript"`}</span>{`, `}<span className="json-str">{`"Go"`}</span>{`, `}<span className="json-str">{`"Python"`}</span>{`, `}<span className="json-str">{`"PostgreSQL"`}</span>{`],
  `}<span className="json-key">{`"education"`}</span>{`: [{
    `}<span className="json-key">{`"degree"`}</span>{`: `}<span className="json-str">{`"B.S. Computer Science"`}</span>{`,
    `}<span className="json-key">{`"school"`}</span>{`: `}<span className="json-str">{`"UC Berkeley"`}</span>{`,
    `}<span className="json-key">{`"year"`}</span>{`: `}<span className="json-num">{`2019`}</span>{`
  }],
  `}<span className="json-key">{`"confidence"`}</span>{`: `}<span className="json-num">{`0.95`}</span>{`
}`}</div>
              </div>
            </div>
          </div>

          <div className="code-mini">
            <span className="kw">curl</span> -X POST https://docuextract.dev/v1/extract \<br />
            {'  '}-H <span className="str">{`"Authorization: Bearer dk_live_..."`}</span> \<br />
            {'  '}-d <span className="str">{`'{"document": "https://example.com/resume.pdf", "type": "resume"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try resume extraction in the playground →</a>
          </div>
        </div>
      </section>

      {/* ── MORE TYPES ── */}
      <section style={{ borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <div className="section-label">And more</div>
          <h2 className="section-title">8 document types, one endpoint</h2>
          <p className="section-sub" style={{ maxWidth: 500, margin: '0 auto 40px' }}>
            DocuExtract auto-detects the document type, or you can specify it for higher accuracy.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 700, margin: '0 auto' }}>
            {[
              { icon: '📄', name: 'Invoices' },
              { icon: '🧾', name: 'Receipts' },
              { icon: '📋', name: 'Contracts' },
              { icon: '📝', name: 'Forms' },
              { icon: '💳', name: 'Bank Statements' },
              { icon: '📎', name: 'Resumes' },
              { icon: '🪪', name: 'ID Documents' },
              { icon: '📇', name: 'Business Cards' },
            ].map((t) => (
              <div key={t.name} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '16px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <h2>Extract your first document in <span style={{ color: 'var(--accent)' }}>3 minutes</span></h2>
        <p>100 free extractions/month. No credit card. No templates. No training.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/playground" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 24px' }}>
            Try the playground →
          </a>
          <a href="/docs" className="btn btn-outline" style={{ fontSize: 15, padding: '12px 24px' }}>
            Read the docs
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <span className="footer-logo">Docu<span>Extract</span></span>
          <div className="footer-links">
            <a href="/docs">Docs</a>
            <a href="/pricing">Pricing</a>
            <a href="/playground">Playground</a>
            <a href="/use-cases">Use Cases</a>
            <a href="/blog">Blog</a>
          </div>
          <span className="footer-copy">Built with Claude AI</span>
        </div>
      </footer>
    </>
  );
}
