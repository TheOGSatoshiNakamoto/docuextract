import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Use Cases — Document Extraction for Every Type | DocuExtract',
  description: 'See how DocuExtract extracts structured JSON from invoices, receipts, bank statements, resumes, contracts, forms, ID documents, and business cards. Before/after demos with real API examples.',
};

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

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 7px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; border: none; text-decoration: none;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; }
.btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

section { padding: 80px 24px; }
.container { max-width: var(--max-w); margin: 0 auto; }

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

.formats-bar {
  display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
  margin-top: 28px;
}
.format-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
  background: var(--accent-dim); border: 1px solid rgba(108,142,245,0.2);
  color: var(--accent);
}

.use-case { border-top: 1px solid var(--border); }
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

.use-case-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;
}
.use-case-grid.reversed { direction: rtl; }
.use-case-grid.reversed > * { direction: ltr; }
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

.doc-mockup {
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  padding: 20px; font-size: 13px; line-height: 1.8; color: var(--text-muted);
}
.doc-mockup .doc-header { font-weight: 700; font-size: 16px; color: var(--text); margin-bottom: 12px; }
.doc-mockup .doc-row { display: flex; justify-content: space-between; padding: 4px 0; }
.doc-mockup .doc-row.bold { font-weight: 600; color: var(--text); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 6px; }
.doc-mockup .doc-divider { border-top: 1px solid var(--border); margin: 8px 0; }
.doc-mockup .doc-section-title { font-weight: 600; color: var(--text); margin: 12px 0 6px; font-size: 13px; }

.json-output {
  font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
  color: var(--text); white-space: pre-wrap; overflow-x: auto;
}
.jk { color: var(--purple); }
.js { color: var(--green); }
.jn { color: var(--orange); }
.jb { color: var(--accent); }

.key-fields {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px;
}
.key-field {
  padding: 3px 10px; border-radius: 5px; font-size: 12px; font-weight: 500;
  font-family: var(--font-mono); background: var(--bg-code); border: 1px solid var(--border);
  color: var(--text-muted);
}

.code-mini {
  background: var(--bg-code); border: 1px solid var(--border); border-radius: 8px;
  padding: 14px 16px; font-family: var(--font-mono); font-size: 12px;
  line-height: 1.7; color: var(--text-muted); overflow-x: auto; margin-top: 20px;
}
.code-mini .kw { color: var(--accent); }
.code-mini .str { color: var(--green); }

.cta-banner {
  text-align: center; padding: 80px 24px;
  background: var(--bg-card); border-top: 1px solid var(--border);
}
.cta-banner h2 { font-size: clamp(22px, 4vw, 38px); font-weight: 800; letter-spacing: -0.5px; margin-bottom: 14px; }
.cta-banner p { color: var(--text-muted); font-size: 16px; margin-bottom: 28px; }

@media (max-width: 768px) {
  .use-case-grid { grid-template-columns: 1fr; }
  .use-case-grid.reversed { direction: ltr; }
  .formats-bar { gap: 8px; }
}
`;

function Css() {
  return <style>{css}</style>;
}

export default function UseCasesPage() {
  return (
    <>
      <Css />

      <PublicNav />

      {/* HERO */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label">Use Cases</div>
          <h1>Extract structured data from <span className="highlight">any document</span></h1>
          <p>Invoices, receipts, contracts, bank statements, resumes, forms, IDs — send any document, get clean JSON back. See real extraction results below.</p>
          <div className="formats-bar">
            <span className="format-pill">PDF</span>
            <span className="format-pill">PNG</span>
            <span className="format-pill">JPG</span>
            <span className="format-pill">WebP</span>
            <span className="format-pill" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)' }}>Max 10 MB</span>
          </div>
        </div>
      </section>

      {/* ── 1. INVOICE ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Invoice Extraction</div>
          <h2>Extract vendor details, line items, and totals from any invoice format</h2>
          <p className="desc">
            Send any invoice — PDF, scan, or photo — and get back structured line items, vendor info, dates, tax, and totals. Works with any layout, any language, any vendor.
          </p>

          <div className="use-case-grid">
            <div className="panel">
              <div className="panel-header">
                <span>Input — invoice_2026.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">INVOICE #INV-2026-0847</div>
                  <div className="doc-row"><span>From: Meridian Supply Co.</span><span>Date: 2026-03-15</span></div>
                  <div className="doc-row"><span>To: Greenfield Logistics LLC</span><span>Due: 2026-04-14</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Industrial valve assembly x 12</span><span>$1,014.00</span></div>
                  <div className="doc-row"><span>Copper fitting kit x 6</span><span>$138.00</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Subtotal</span><span>$1,152.00</span></div>
                  <div className="doc-row"><span>Tax (15%)</span><span>$172.80</span></div>
                  <div className="doc-row bold"><span>Total Due</span><span>$1,324.80</span></div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.2s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "vendor_name": "Meridian Supply Co.",
  "invoice_number": "INV-2026-0847",
  "date": "2026-03-15",
  "due_date": "2026-04-14",
  "line_items": [
    { "description": "Industrial valve assembly",
      "quantity": 12, "unit_price": 84.50,
      "amount": 1014.00 },
    { "description": "Copper fitting kit",
      "quantity": 6, "unit_price": 23.00,
      "amount": 138.00 }
  ],
  "subtotal": 1152.00,
  "tax": 172.80,
  "total": 1324.80,
  "currency": "USD"
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['vendor_name','invoice_number','date','due_date','line_items[]','subtotal','tax','total','currency'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "https://example.com/invoice.pdf", "type": "invoice"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try invoice extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 2. RECEIPT (reversed) ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Receipt Processing</div>
          <h2>Turn retail and restaurant receipts into structured expense data</h2>
          <p className="desc">
            Extract merchant, date, items, tax, tip, and total from any receipt — even crumpled photos from a pocket. Perfect for expense tracking, bookkeeping automation, and travel reimbursement.
          </p>

          <div className="use-case-grid reversed">
            <div className="panel">
              <div className="panel-header">
                <span>Input — receipt_photo.jpg</span>
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
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 12 }}>03/15/2026 11:42 AM</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 0.9s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "merchant": "Blue Bottle Coffee",
  "address": "123 Market St, San Francisco CA",
  "date": "2026-03-15",
  "time": "11:42",
  "items": [
    { "name": "Cortado", "price": 5.50 },
    { "name": "Avocado Toast", "price": 14.00 },
    { "name": "Sparkling Water", "price": 3.00 }
  ],
  "subtotal": 22.50,
  "tax": 1.94,
  "tip": 4.50,
  "total": 28.94
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['merchant','address','date','time','items[]','subtotal','tax','tip','total','payment_method'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "<base64_receipt_image>", "type": "receipt"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try receipt extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 3. BANK STATEMENT ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Bank Statement</div>
          <h2>Parse transactions, balances, and account details automatically</h2>
          <p className="desc">
            Upload a bank statement PDF and get back structured transactions with dates, descriptions, amounts, and running balances. Handles any bank&#39;s layout — no per-bank configuration needed.
          </p>

          <div className="use-case-grid">
            <div className="panel">
              <div className="panel-header">
                <span>Input — march_statement.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">First National Bank</div>
                  <div className="doc-row"><span>Account: Greenfield Logistics LLC</span><span>****4821</span></div>
                  <div className="doc-row"><span>Period: Mar 1 – Mar 31, 2026</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Opening Balance</span><span>$14,280.50</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>03/04 Wire transfer - Vendor payment</span><span style={{ color: 'var(--red)' }}>-$3,200.00</span></div>
                  <div className="doc-row"><span>03/11 Client payment received</span><span style={{ color: 'var(--green)' }}>+$5,600.00</span></div>
                  <div className="doc-row"><span>03/18 Office supplies</span><span style={{ color: 'var(--red)' }}>-$487.28</span></div>
                  <div className="doc-row"><span>03/25 Monthly subscription</span><span style={{ color: 'var(--red)' }}>-$4,300.00</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row bold"><span>Closing Balance</span><span>$11,893.22</span></div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.8s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "bank_name": "First National Bank",
  "account_holder": "Greenfield Logistics LLC",
  "account_number": "****4821",
  "statement_period": {
    "start": "2026-03-01",
    "end": "2026-03-31"
  },
  "opening_balance": 14280.50,
  "closing_balance": 11893.22,
  "transactions": [
    { "date": "2026-03-04",
      "description": "Wire transfer - Vendor payment",
      "amount": -3200.00,
      "balance": 11080.50 },
    { "date": "2026-03-11",
      "description": "Client payment received",
      "amount": 5600.00,
      "balance": 16680.50 }
  ]
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['bank_name','account_holder','account_number','statement_period','opening_balance','closing_balance','transactions[]'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "https://example.com/statement.pdf", "type": "bank_statement"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try bank statement extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 4. RESUME (reversed) ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Resume Parsing</div>
          <h2>Extract contact info, work history, education, and skills</h2>
          <p className="desc">
            Convert PDF resumes into structured candidate profiles. Works with any layout — single column, two-column, creative designs, infographic-style. Build ATS integrations, talent databases, or hiring automation in minutes.
          </p>

          <div className="use-case-grid reversed">
            <div className="panel">
              <div className="panel-header">
                <span>Input — sarah_chen_resume.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">Sarah Chen</div>
                  <div style={{ fontSize: 12, marginBottom: 16 }}>sarah@example.com · San Francisco, CA · github.com/schen</div>
                  <div className="doc-section-title">Experience</div>
                  <div style={{ marginBottom: 12 }}>
                    <div><strong>Senior Software Engineer</strong> — Stripe (2021–Present)</div>
                    <div style={{ fontSize: 12 }}>Led payments infrastructure team. Reduced checkout latency by 40%.</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div><strong>Software Engineer</strong> — Vercel (2019–2021)</div>
                    <div style={{ fontSize: 12 }}>Built Edge Functions runtime. 12 open-source contributions.</div>
                  </div>
                  <div className="doc-section-title">Skills</div>
                  <div style={{ fontSize: 12 }}>TypeScript, Go, Python, PostgreSQL, Redis, AWS, Kubernetes</div>
                  <div className="doc-section-title">Education</div>
                  <div style={{ fontSize: 12 }}>B.S. Computer Science — UC Berkeley (2019)</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.5s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "name": "Sarah Chen",
  "email": "sarah@example.com",
  "location": "San Francisco, CA",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Stripe",
      "period": "2021-present",
      "highlights": ["Led payments infra"]
    },
    {
      "title": "Software Engineer",
      "company": "Vercel",
      "period": "2019-2021"
    }
  ],
  "skills": ["TypeScript", "Go", "Python"],
  "education": [{
    "degree": "B.S. Computer Science",
    "school": "UC Berkeley",
    "year": 2019
  }]
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['name','email','phone','location','experience[]','skills[]','education[]','certifications[]'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "https://example.com/resume.pdf", "type": "resume"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try resume extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 5. CONTRACT ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Contract Extraction</div>
          <h2>Pull key clauses, dates, parties, and terms from legal agreements</h2>
          <p className="desc">
            Extract the data that matters from contracts, NDAs, leases, and service agreements — parties, effective dates, termination clauses, payment terms, and governing law. No more reading 30-page PDFs to find one clause.
          </p>

          <div className="use-case-grid">
            <div className="panel">
              <div className="panel-header">
                <span>Input — service_agreement.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">SERVICE AGREEMENT</div>
                  <div style={{ fontSize: 12, marginBottom: 12 }}>Between Oakridge Consulting Group and TechBridge Solutions Inc.</div>
                  <div className="doc-section-title">Terms</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>Effective Date: April 1, 2026</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>Termination: March 31, 2027</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>Governing Law: State of Delaware</div>
                  <div className="doc-divider" />
                  <div className="doc-section-title">Key Clauses</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>4.1 Payment Terms — Net 30 from invoice date</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>8.2 Termination — Either party may terminate with 60 days written notice</div>
                  <div className="doc-divider" />
                  <div className="doc-row bold"><span>Total Contract Value</span><span>$96,000.00</span></div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 2.1s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "contract_type": "Service Agreement",
  "parties": [
    "Oakridge Consulting Group",
    "TechBridge Solutions Inc."
  ],
  "effective_date": "2026-04-01",
  "termination_date": "2027-03-31",
  "governing_law": "State of Delaware",
  "key_clauses": [
    { "clause": "Payment Terms",
      "summary": "Net 30 from invoice date" },
    { "clause": "Termination",
      "summary": "60 days written notice" }
  ],
  "total_value": 96000.00,
  "currency": "USD"
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['contract_type','parties[]','effective_date','termination_date','governing_law','key_clauses[]','total_value','currency'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "https://example.com/contract.pdf", "type": "contract"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try contract extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 6. FORM (reversed) ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Form Extraction</div>
          <h2>Convert filled forms into structured field-value pairs</h2>
          <p className="desc">
            Digitize paper forms, applications, surveys, and questionnaires. DocuExtract reads both printed and handwritten text, mapping every field to a clean key-value pair. Process thousands of forms in hours instead of weeks.
          </p>

          <div className="use-case-grid reversed">
            <div className="panel">
              <div className="panel-header">
                <span>Input — patient_intake.pdf</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header">Patient Intake Form</div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Full Name:</span><span>Maria Santos</span></div>
                  <div className="doc-row"><span>Date of Birth:</span><span>07/14/1988</span></div>
                  <div className="doc-row"><span>Phone:</span><span>+1-555-0142</span></div>
                  <div className="doc-row"><span>Insurance Provider:</span><span>Blue Cross</span></div>
                  <div className="doc-row"><span>Policy Number:</span><span>BCX-9928174</span></div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Reason for Visit:</span><span>Annual physical exam</span></div>
                  <div className="doc-row"><span>Allergies:</span><span>Penicillin</span></div>
                  <div className="doc-row"><span>Current Medications:</span><span>Lisinopril 10mg</span></div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.1s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "form_type": "Patient Intake Form",
  "fields": {
    "full_name": "Maria Santos",
    "date_of_birth": "1988-07-14",
    "phone": "+1-555-0142",
    "insurance_provider": "Blue Cross",
    "policy_number": "BCX-9928174",
    "reason_for_visit": "Annual physical exam",
    "allergies": ["Penicillin"],
    "current_medications": ["Lisinopril 10mg"]
  }
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['form_type','fields{}','full_name','date_of_birth','phone','insurance_provider','policy_number','allergies[]'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "<base64_form_image>", "type": "form"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try form extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 7. ID DOCUMENT ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">ID Document</div>
          <h2>Extract name, DOB, ID number, and expiry from IDs and passports</h2>
          <p className="desc">
            Process passports, driver&#39;s licenses, and national ID cards. Extract the key identity fields you need for KYC flows, onboarding forms, or identity verification pipelines.
          </p>

          <div className="use-case-grid">
            <div className="panel">
              <div className="panel-header">
                <span>Input — passport_scan.jpg</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup">
                  <div className="doc-header" style={{ textAlign: 'center' }}>UNITED STATES OF AMERICA</div>
                  <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 16, color: 'var(--accent)' }}>PASSPORT</div>
                  <div className="doc-divider" />
                  <div className="doc-row"><span>Surname:</span><span>CHEN</span></div>
                  <div className="doc-row"><span>Given Names:</span><span>JAMES ROBERT</span></div>
                  <div className="doc-row"><span>Date of Birth:</span><span>03 NOV 1992</span></div>
                  <div className="doc-row"><span>Nationality:</span><span>UNITED STATES</span></div>
                  <div className="doc-row"><span>Passport No:</span><span>567284193</span></div>
                  <div className="doc-row"><span>Date of Issue:</span><span>15 JUN 2022</span></div>
                  <div className="doc-row"><span>Date of Expiry:</span><span>14 JUN 2032</span></div>
                  <div className="doc-row"><span>Sex:</span><span>M</span></div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 1.3s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "document_type": "passport",
  "full_name": "James Robert Chen",
  "date_of_birth": "1992-11-03",
  "nationality": "United States",
  "document_number": "567284193",
  "issue_date": "2022-06-15",
  "expiry_date": "2032-06-14",
  "gender": "M"
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['document_type','full_name','date_of_birth','nationality','document_number','issue_date','expiry_date','gender'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "<base64_passport_photo>", "type": "id_document"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try ID extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── 8. BUSINESS CARD (reversed) ── */}
      <section className="use-case">
        <div className="container">
          <div className="use-case-label">Business Card</div>
          <h2>Capture contact details from business cards instantly</h2>
          <p className="desc">
            Snap a photo of a business card and get back structured contact info — name, title, company, email, phone, and address. Build CRM integrations, contact importers, or networking apps.
          </p>

          <div className="use-case-grid reversed">
            <div className="panel">
              <div className="panel-header">
                <span>Input — business_card.jpg</span>
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Before</span>
              </div>
              <div className="panel-body">
                <div className="doc-mockup" style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>Priya Sharma</div>
                  <div style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}>VP of Engineering</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 16 }}>Nexus Dynamics</div>
                  <div className="doc-divider" />
                  <div style={{ textAlign: 'left', marginTop: 12 }}>
                    <div className="doc-row"><span>Email:</span><span>priya@nexusdynamics.com</span></div>
                    <div className="doc-row"><span>Phone:</span><span>+1-415-555-0198</span></div>
                    <div className="doc-row"><span>Web:</span><span>nexusdynamics.com</span></div>
                    <div style={{ fontSize: 11, marginTop: 8, color: 'var(--text-muted)' }}>450 Market Street, Suite 200, San Francisco, CA 94105</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span>Output — Extracted JSON</span>
                <span style={{ color: 'var(--green)', fontSize: 11 }}>After — 0.7s</span>
              </div>
              <div className="panel-body">
                <pre className="json-output">{`{
  "full_name": "Priya Sharma",
  "title": "VP of Engineering",
  "company": "Nexus Dynamics",
  "email": "priya@nexusdynamics.com",
  "phone": "+1-415-555-0198",
  "website": "nexusdynamics.com",
  "address": "450 Market Street, Suite 200, San Francisco, CA 94105"
}`}</pre>
              </div>
            </div>
          </div>

          <div className="key-fields">
            {['full_name','title','company','email','phone','website','address'].map(f => <span key={f} className="key-field">{f}</span>)}
          </div>

          <div className="code-mini">
            <span className="kw">curl</span>{` -X POST https://docuextract.dev/v1/extract \\`}<br />
            {`  -H `}<span className="str">{`"Authorization: Bearer dk_live_your_key_here"`}</span>{` \\`}<br />
            {`  -H `}<span className="str">{`"Content-Type: application/json"`}</span>{` \\`}<br />
            {`  -d `}<span className="str">{`'{"document": "<base64_card_photo>"}'`}</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <a href="/playground" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Try business card extraction in the playground</a>
          </div>
        </div>
      </section>

      {/* ── ALL TYPES GRID ── */}
      <section style={{ borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <div className="section-label">One endpoint, every document</div>
          <h2 className="section-title">8 document types, zero configuration</h2>
          <p className="section-sub" style={{ maxWidth: 500, margin: '0 auto 40px' }}>
            DocuExtract auto-detects the document type, or you can specify it for higher accuracy. Accepts PDF, PNG, JPG, and WebP up to 10 MB.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 700, margin: '0 auto' }}>
            {[
              { icon: '📄', name: 'Invoices' },
              { icon: '🧾', name: 'Receipts' },
              { icon: '🏦', name: 'Bank Statements' },
              { icon: '📎', name: 'Resumes' },
              { icon: '📋', name: 'Contracts' },
              { icon: '📝', name: 'Forms' },
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
        <p>50 free extractions/month. No credit card. No templates. No training.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/playground" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 24px' }}>
            Try the playground
          </a>
          <a href="/docs" className="btn btn-outline" style={{ fontSize: 15, padding: '12px 24px' }}>
            Read the docs
          </a>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
