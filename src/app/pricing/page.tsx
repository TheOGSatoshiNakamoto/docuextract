'use client';

import { useState } from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

// Pricing values below are verified to match src/lib/plans.ts (server-only).
// Free: 50/$0, Starter: 1500/$49, Pro: 5000/$99, Scale: 20000/$249.
// When plans.ts changes, update these values to match.

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
.hero p { font-size: 17px; color: var(--text-muted); max-width: 500px; margin: 0 auto 28px; }

/* ── BILLING TOGGLE ── */
.billing-toggle {
  display: inline-flex; align-items: center; gap: 12px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 8px; padding: 4px; margin-bottom: 56px;
}
.billing-btn {
  padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;
  cursor: pointer; border: none; background: transparent; color: var(--text-muted);
  transition: all 0.15s; font-family: inherit;
}
.billing-btn.active { background: var(--bg-code); color: var(--text); }
.billing-save { font-size: 11px; color: var(--green); font-weight: 600; }

/* ── PRICING GRID ── */
.pricing-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
  max-width: var(--max-w); margin: 0 auto; padding: 0 24px;
}
.plan-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 12px; padding: 28px 24px; position: relative;
  display: flex; flex-direction: column;
  transition: border-color 0.15s;
}
.plan-card:hover { border-color: rgba(108,142,245,0.4); }
.plan-card.popular {
  border-color: var(--accent); background: linear-gradient(135deg, #161b27 0%, rgba(108,142,245,0.06) 100%);
}
.plan-popular-badge {
  position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: #fff; font-size: 11px; font-weight: 700;
  padding: 3px 12px; border-radius: 20px; white-space: nowrap; letter-spacing: 0.3px;
}
.plan-name { font-size: 14px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
.plan-price-value { font-size: 36px; font-weight: 800; color: var(--text); letter-spacing: -1px; }
.plan-price-period { font-size: 13px; color: var(--text-muted); }
.plan-volume { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
.plan-features { list-style: none; space-y: 8px; flex: 1; margin-bottom: 24px; }
.plan-features li {
  display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--text-muted);
  padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.plan-features li:last-child { border-bottom: none; }
.plan-features .check { color: var(--green); font-size: 12px; margin-top: 1px; flex-shrink: 0; }
.plan-cta {
  display: block; width: 100%; text-align: center; padding: 10px;
  border-radius: 7px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; border: none; text-decoration: none;
}
.plan-cta.primary { background: var(--accent); color: #fff; }
.plan-cta.primary:hover { background: var(--accent-hover); text-decoration: none; }
.plan-cta.secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }
.plan-cta.secondary:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }
.plan-cta.current { background: var(--bg-code); color: var(--text-muted); cursor: default; }

/* ── FEATURE MATRIX ── */
.feature-matrix-section { padding: 80px 24px; }
.section-label {
  font-size: 12px; font-weight: 600; color: var(--accent);
  text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-bottom: 12px;
}
.section-title {
  font-size: clamp(24px, 4vw, 36px); font-weight: 700; letter-spacing: -0.5px;
  text-align: center; margin-bottom: 48px;
}
.feature-table { max-width: var(--max-w); margin: 0 auto; }
.feature-table table { width: 100%; border-collapse: collapse; }
.feature-table th {
  padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 600;
  color: var(--text-muted); border-bottom: 1px solid var(--border);
}
.feature-table th:first-child { text-align: left; }
.feature-table th.highlight { color: var(--accent); }
.feature-table td {
  padding: 12px 16px; text-align: center; font-size: 13px; color: var(--text-muted);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.feature-table td:first-child { text-align: left; color: var(--text); font-weight: 500; }
.feature-table tr:last-child td { border-bottom: none; }
.feature-table tr:hover td { background: rgba(255,255,255,0.02); }
.feature-table .yes { color: var(--green); font-size: 15px; }
.feature-table .no { color: #374151; font-size: 15px; }
.feature-table .highlight-col { background: rgba(108,142,245,0.05); }
.compare-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── CALCULATOR ── */
.calculator-section { padding: 0 24px 80px; }
.calculator {
  max-width: 640px; margin: 0 auto;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 32px;
}
.calculator h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.calculator p { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
.slider-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.slider {
  flex: 1; -webkit-appearance: none; appearance: none; height: 4px;
  background: var(--border); border-radius: 2px; outline: none; cursor: pointer;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: var(--accent); cursor: pointer; border: 2px solid var(--bg);
}
.slider-value { font-size: 18px; font-weight: 700; color: var(--text); min-width: 80px; text-align: right; }
.calc-result {
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  padding: 20px; display: flex; align-items: center; justify-content: space-between;
}
.calc-plan-name { font-size: 20px; font-weight: 700; color: var(--text); }
.calc-plan-desc { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.calc-plan-price { font-size: 28px; font-weight: 800; color: var(--accent); letter-spacing: -0.5px; }

/* ── FAQ ── */
.faq-section { padding: 0 24px 80px; }
.faq-grid { max-width: 780px; margin: 0 auto; display: grid; gap: 12px; }
.faq-item {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
}
.faq-q {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; background: none; border: none; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--text); text-align: left;
  font-family: inherit; transition: color 0.15s; gap: 12px;
}
.faq-q:hover { color: var(--accent); }
.faq-chevron { transition: transform 0.2s; color: var(--text-muted); flex-shrink: 0; }
.faq-chevron.open { transform: rotate(90deg); }
.faq-a {
  padding: 0 20px 16px; font-size: 14px; color: var(--text-muted); line-height: 1.7;
}

/* ── CTA BANNER ── */
/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .pricing-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .pricing-grid { grid-template-columns: 1fr; }
  .nav-links li:not(:last-child):not(:nth-last-child(2)) { display: none; }
  .feature-matrix-section { overflow-x: auto; }
  .slider-row { flex-direction: column; align-items: stretch; }
  .slider-value { text-align: left; }
}
`;

// ── Data ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    volume: '50 extractions/mo',
    cta: 'Get started free',
    ctaHref: '/login',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      '50 API calls/month',
      '5 requests/minute',
      'Claude Haiku only',
      'JSON output',
      'Community support',
      '—',
    ],
  },
  {
    name: 'Starter',
    monthly: 49,
    annual: 39,
    volume: '1,500 extractions/mo',
    cta: 'Start Starter',
    ctaHref: '/login',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      '1,500 API calls/month',
      '30 requests/minute',
      'Haiku + Sonnet (3x cost)',
      'JSON output + confidence',
      'Email support',
      '$0.04/extraction overage',
    ],
  },
  {
    name: 'Pro',
    monthly: 99,
    annual: 79,
    volume: '5,000 extractions/mo',
    cta: 'Start Pro',
    ctaHref: '/login',
    ctaStyle: 'primary',
    popular: true,
    features: [
      '5,000 API calls/month',
      '60 requests/minute',
      'Haiku + Sonnet (3x cost)',
      'JSON + confidence + webhooks',
      'Priority email support',
      '$0.025/extraction overage',
    ],
  },
  {
    name: 'Scale',
    monthly: 249,
    annual: 199,
    volume: '20,000 extractions/mo',
    cta: 'Start Scale',
    ctaHref: '/login',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      '20,000 API calls/month',
      '120 requests/minute',
      'Haiku + Sonnet (3x cost) + Priority',
      'JSON + confidence + webhooks',
      'Dedicated Slack support',
      '$0.015/extraction overage',
    ],
  },
];

const FEATURE_ROWS = [
  { label: 'Monthly extractions', free: '50', starter: '1,500', pro: '5,000', scale: '20,000' },
  { label: 'Rate limit', free: '5/min', starter: '30/min', pro: '60/min', scale: '120/min' },
  { label: 'Claude Haiku model', free: '✓', starter: '✓', pro: '✓', scale: '✓' },
  { label: 'Claude Sonnet model', free: '✗', starter: '✓ (3x cost)', pro: '✓ (3x cost)', scale: '✓ (3x cost)' },
  { label: 'Confidence scores', free: '✓', starter: '✓', pro: '✓', scale: '✓' },
  { label: 'Webhook support', free: '✗', starter: '✗', pro: '✓', scale: '✓' },
  { label: 'Custom schemas', free: '✓', starter: '✓', pro: '✓', scale: '✓' },
  { label: 'Overage pricing', free: '✗', starter: '$0.04/call', pro: '$0.025/call', scale: '$0.015/call' },
  { label: 'Support', free: 'Community', starter: 'Email', pro: 'Priority email', scale: 'Dedicated Slack' },
  { label: 'SLA', free: '✗', starter: '✗', pro: '✓', scale: '✓' },
];

const FAQS = [
  {
    q: 'What happens when I hit my monthly limit?',
    a: "On paid plans, extractions beyond your limit are billed at the overage rate — $0.04/call on Starter, $0.025/call on Pro, and $0.015/call on Scale. We'll send you an email alert at 70% and 100% usage. On the Free plan, your API returns 429 errors once the limit is reached — upgrade to continue.",
  },
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: "Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the start of your next billing cycle. You can manage your plan anytime from the Billing tab in your dashboard.",
  },
  {
    q: 'Do you offer refunds?',
    a: "We offer a full refund within 7 days of your first paid charge if DocuExtract doesn't work for your use case. After that, refunds are handled case-by-case. Contact us at hello@docuextract.dev.",
  },
  {
    q: 'What document types are supported?',
    a: "DocuExtract supports invoices, receipts, bank statements, resumes, contracts, forms, ID documents, and generic documents. We auto-detect the document type, or you can specify it explicitly for higher accuracy.",
  },
  {
    q: 'What file formats do you accept?',
    a: 'We accept PDF, PNG, JPG, and WEBP files up to 10MB, as well as public document URLs. Files can be sent as base64-encoded strings or URLs.',
  },
  {
    q: 'Is my data stored or used for training?',
    a: 'No. Documents are processed in memory and not stored after extraction. We never use your documents to train models. See our privacy policy for details.',
  },
  {
    q: 'Do you offer annual billing?',
    a: "Yes — toggle to annual billing above to see discounted rates. Annual plans are billed upfront and save you up to 20% compared to monthly.",
  },
  {
    q: 'Can I try before I buy?',
    a: 'Absolutely. The Free plan gives you 50 extractions/month with no credit card required. You can also try the playground at /playground without signing up at all.',
  },
];

function calcRecommendedPlan(docs: number): { name: string; price: number; desc: string } {
  if (docs <= 50) return { name: 'Free', price: 0, desc: '50 extractions included' };
  if (docs <= 1500) return { name: 'Starter', price: 49, desc: '1,500 extractions included' };
  if (docs <= 5000) return { name: 'Pro', price: 99, desc: '5,000 extractions included' };
  return { name: 'Scale', price: 249, desc: '20,000 extractions included' };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [docsPerMonth, setDocsPerMonth] = useState(500);

  const recommended = calcRecommendedPlan(docsPerMonth);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <PublicNav />

      {/* HERO */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-dim)', border: '1px solid rgba(108,142,245,0.3)',
            color: 'var(--accent)', padding: '4px 12px', borderRadius: 20,
            fontSize: 13, fontWeight: 500, marginBottom: 24,
          }}>
            Simple, transparent pricing
          </div>
          <h1>Start free.<br /><span className="highlight">Pay when you&apos;re serious.</span></h1>
          <p>No credit card for the free tier. No sales calls. No hidden fees. Upgrade when your usage demands it.</p>

          {/* Billing toggle */}
          <div className="billing-toggle">
            <button className={`billing-btn ${!annual ? 'active' : ''}`} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={`billing-btn ${annual ? 'active' : ''}`} onClick={() => setAnnual(true)}>
              Annual <span className="billing-save">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          return (
            <div key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <span className="plan-popular-badge">Most Popular</span>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="plan-price-value">${price}</span>
                <span className="plan-price-period">/mo</span>
              </div>
              <div className="plan-volume">{plan.volume}</div>
              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    {f === '—' ? (
                      <span style={{ color: '#374151' }}>—</span>
                    ) : (
                      <>
                        <span className="check">✓</span>
                        <span>{f}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <a href={plan.ctaHref} className={`plan-cta ${plan.ctaStyle}`}>{plan.cta}</a>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 20, paddingBottom: 8 }}>
        All paid plans include a 7-day money-back guarantee · Cancel anytime · Billed in USD
      </p>

      {/* FEATURE MATRIX */}
      <section className="feature-matrix-section">
        <div className="section-label">Compare plans</div>
        <h2 className="section-title">Everything in one place</h2>
        <div className="feature-table">
          <div className="compare-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Starter</th>
                <th className="highlight">Pro</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.free === '✓' ? <span className="yes">✓</span> : row.free === '✗' ? <span className="no">✗</span> : row.free}</td>
                  <td>{row.starter === '✓' ? <span className="yes">✓</span> : row.starter === '✗' ? <span className="no">✗</span> : row.starter}</td>
                  <td className="highlight-col">{row.pro === '✓' ? <span className="yes">✓</span> : row.pro === '✗' ? <span className="no">✗</span> : row.pro}</td>
                  <td>{row.scale === '✓' ? <span className="yes">✓</span> : row.scale === '✗' ? <span className="no">✗</span> : row.scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="calculator-section">
        <div className="section-label" style={{ textAlign: 'center', marginBottom: 12 }}>Usage calculator</div>
        <h2 className="section-title">Find the right plan</h2>
        <div className="calculator">
          <h2>How many documents do you process per month?</h2>
          <p>Drag the slider to see which plan fits your volume.</p>
          <div className="slider-row">
            <input
              type="range"
              className="slider"
              min={0}
              max={20000}
              step={100}
              value={docsPerMonth}
              onChange={(e) => setDocsPerMonth(Number(e.target.value))}
            />
            <span className="slider-value">{docsPerMonth.toLocaleString()}</span>
          </div>
          <div className="calc-result">
            <div>
              <div className="calc-plan-name">{recommended.name} plan</div>
              <div className="calc-plan-desc">{recommended.desc}</div>
            </div>
            <div className="calc-plan-price">
              {recommended.price === 0 ? 'Free' : `$${recommended.price}/mo`}
            </div>
          </div>
          {docsPerMonth > 0 && (
            <a href="/login" className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
              Get started with {recommended.name} →
            </a>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-label" style={{ textAlign: 'center', marginBottom: 12 }}>FAQ</div>
        <h2 className="section-title">Questions answered</h2>
        <div className="faq-grid">
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={`faq-chevron ${openFaq === i ? 'open' : ''}`}>›</span>
              </button>
              {openFaq === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
