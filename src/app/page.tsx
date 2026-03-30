'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CodeBlock from '@/components/CodeBlock';
import BentoGrid from '@/components/BentoGrid';
import AnimatedCounter from '@/components/AnimatedCounter';

// ── SAMPLE CODE SNIPPETS ────────────────────────────────────────────────────

const EXTRACT_CODE = {
  curl: `curl https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "document_url": "https://example.com/invoice.pdf",
    "document_type": "invoice"
  }'`,
  Python: `import requests

response = requests.post(
  "https://docuextract.dev/v1/extract",
  headers={"Authorization": "Bearer YOUR_API_KEY"},
  json={
    "document_url": "https://example.com/invoice.pdf",
    "document_type": "invoice"
  }
)
data = response.json()`,
  'Node.js': `const res = await fetch("https://docuextract.dev/v1/extract", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    document_url: "https://example.com/invoice.pdf",
    document_type: "invoice",
  }),
});
const data = await res.json();`,
  Go: `resp, _ := http.Post(
  "https://docuextract.dev/v1/extract",
  "application/json",
  strings.NewReader(\`{
    "document_url": "https://example.com/invoice.pdf",
    "document_type": "invoice"
  }\`),
)`,
};

const JSON_RESPONSE = `{
  "data": {
    "vendor": "Acme Corp",
    "invoice_number": "INV-2024-0847",
    "date": "2024-11-15",
    "due_date": "2024-12-15",
    "total": 4250.00,
    "currency": "USD",
    "line_items": [
      { "description": "API Integration", "amount": 3500.00 },
      { "description": "Support", "amount": 750.00 }
    ]
  },
  "confidence": 0.97,
  "processing_time_ms": 1243,
  "document_type": "invoice",
  "model": "claude-haiku-4-5"
}`;

// ── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0C1222]/90 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link href="/" className="text-white font-bold text-lg flex items-center gap-2 shrink-0">
          <span className="text-cyan-400">⚡</span> DocuExtract
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-auto text-sm text-slate-400">
          <Link href="/playground" className="hover:text-white transition-colors">Playground</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
        <Link
          href="/login"
          className="ml-auto md:ml-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors shrink-0"
        >
          Get API Key
        </Link>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0C1222] pt-16">
      {/* Aurora gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(6,182,212,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 80% -5%, rgba(99,102,241,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(6,182,212,0.06) 0%, transparent 60%)
          `,
          filter: 'blur(0px)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
            Powered by Claude AI · 99.5% accuracy
          </span>
        </motion.div>

        <motion.h1
          className="font-bold text-slate-100 leading-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Send a document,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            get structured JSON back.
          </span>
        </motion.h1>

        <motion.p
          className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          The document extraction API you wish existed. Upload PDFs, invoices, receipts — get clean
          data in under 2 seconds. No templates. No training. Works in 5 minutes.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href="/playground"
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-base transition-colors"
          >
            Try it free →
          </Link>
          <Link
            href="/docs"
            className="px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-base transition-colors"
          >
            View docs
          </Link>
        </motion.div>

        <motion.p
          className="text-slate-600 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Free tier — 100 extractions/month · No credit card required
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>
    </section>
  );
}

// ── LIVE API DEMO ─────────────────────────────────────────────────────────────

function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setShowResponse(true), 800);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <section className="bg-[#0C1222] py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-bold text-slate-100 mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            One API call. Clean JSON.
          </h2>
          <p className="text-slate-400 text-lg">
            Send any document. Get structured data back in seconds.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-medium">Request</p>
            <CodeBlock code={EXTRACT_CODE} showChrome />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-medium">
              Response{' '}
              <AnimatePresence>
                {showResponse && (
                  <motion.span
                    key="badge"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2 text-emerald-400 normal-case tracking-normal"
                  >
                    ✓ 1,243ms
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
            <AnimatePresence>
              {showResponse ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CodeBlock code={{ JSON: JSON_RESPONSE }} showChrome />
                </motion.div>
              ) : (
                <div
                  className="rounded-xl h-64 flex items-center justify-center"
                  style={{ border: '1px solid rgba(6, 182, 212, 0.2)', background: '#0F172A' }}
                >
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-2 text-cyan-400 text-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Processing document…
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── BENTO GRID ────────────────────────────────────────────────────────────────

const STATS = [
  { value: 99.5, suffix: '%', label: 'accuracy', decimals: 1 },
  { value: 2, prefix: '<', suffix: 's', label: 'processing', decimals: 0 },
  { value: 20, suffix: '+', label: 'document types', decimals: 0 },
];

const INTEGRATIONS = ['cURL', 'Python', 'Node.js', 'Go', 'Ruby', 'PHP'];

const USE_CASES = [
  {
    icon: '📄',
    title: 'Invoices',
    before: 'PDF from vendor · 14 line items · 3 pages',
    after: '{ vendor, date, total, line_items[] }',
  },
  {
    icon: '🧾',
    title: 'Receipts',
    before: 'Photo of crumpled receipt · skewed text',
    after: '{ merchant, total, tax, items[] }',
  },
  {
    icon: '📋',
    title: 'Resumes',
    before: 'Word doc · 2 pages · varied formatting',
    after: '{ name, email, skills[], experience[] }',
  },
];

function BentoSection() {
  const cells = [
    // Stats (top-left, single col)
    {
      id: 'stats',
      colSpan: 1 as const,
      children: (
        <div className="p-6 h-full flex flex-col justify-between">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-4">By the numbers</p>
          <div className="space-y-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-slate-100">
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Use cases (top-right, 2-col)
    {
      id: 'use-cases',
      colSpan: 2 as const,
      children: (
        <div className="p-6">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-4">What you can extract</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="rounded-lg bg-[#0C1222] p-4">
                <div className="text-2xl mb-2">{uc.icon}</div>
                <p className="text-slate-200 font-semibold mb-3 text-sm">{uc.title}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 shrink-0 mt-0.5">→</span>
                    <span className="text-slate-500 font-mono">{uc.before}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    <span className="text-emerald-400 font-mono">{uc.after}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Code snippet (bottom-left, 2-col)
    {
      id: 'code',
      colSpan: 2 as const,
      children: (
        <div className="p-6">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-4">Get started in 30 seconds</p>
          <CodeBlock
            code={{
              curl: `curl https://docuextract.dev/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"document_url":"...","document_type":"invoice"}'`,
              Python: `import requests
r = requests.post(
  "https://docuextract.dev/v1/extract",
  headers={"Authorization": "Bearer YOUR_API_KEY"},
  json={"document_url": "...", "document_type": "invoice"}
)`,
            }}
          />
        </div>
      ),
    },
    // Integrations (bottom-right, 1-col)
    {
      id: 'integrations',
      colSpan: 1 as const,
      children: (
        <div className="p-6 h-full flex flex-col">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-4">Works with any stack</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {INTEGRATIONS.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1.5 rounded-lg bg-[#0C1222] text-slate-400 text-sm font-mono border border-slate-800"
              >
                {lang}
              </span>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-4">REST API · JSON · Bearer auth</p>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-[#0C1222] py-24">
      <div className="max-w-5xl mx-auto px-6">
        <BentoGrid cells={cells} cols={3} />
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Send your document',
    desc: 'POST a base64-encoded file or URL. Supports PDF, PNG, JPG, WEBP up to 10MB.',
  },
  {
    n: '02',
    title: 'Claude extracts the data',
    desc: 'Our AI engine identifies the document type and pulls every relevant field — no templates required.',
  },
  {
    n: '03',
    title: 'Get clean JSON back',
    desc: 'Validated, normalized data with confidence scores. ISO dates, standardized currencies, ready to store.',
  },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[#0C1222] py-24 border-t border-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-bold text-slate-100 mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            How it works
          </h2>
          <p className="text-slate-400 text-lg">Upload → AI extracts → Get JSON. That's it.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="text-5xl font-black text-slate-800 mb-4 font-mono">{step.n}</div>
              <h3 className="text-slate-200 font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-8 text-slate-700 text-lg">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING SUMMARY ───────────────────────────────────────────────────────────

const PLANS = [
  { name: 'Free', price: '$0', extractions: '100/mo', highlight: false },
  { name: 'Starter', price: '$49', extractions: '2,500/mo', highlight: false },
  { name: 'Pro', price: '$99', extractions: '10,000/mo', highlight: true },
  { name: 'Scale', price: '$249', extractions: '50,000/mo', highlight: false },
];

function PricingSummary() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[#0C1222] py-24 border-t border-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-bold text-slate-100 mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400 text-lg">Start free. Pay when you're serious. No credit card, no sales calls.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`rounded-xl p-5 border ${
                plan.highlight
                  ? 'border-cyan-500/40 bg-cyan-500/5'
                  : 'border-slate-800 bg-[#161E2E]'
              }`}
            >
              {plan.highlight && (
                <span className="text-xs text-cyan-400 font-medium mb-2 block">Most popular</span>
              )}
              <p className="text-slate-400 text-sm mb-1">{plan.name}</p>
              <p className="text-2xl font-bold text-slate-100 mb-1">{plan.price}<span className="text-slate-500 text-sm font-normal">/mo</span></p>
              <p className="text-slate-500 text-xs">{plan.extractions}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
            Compare all features →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── FINAL CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[#0C1222] py-32 border-t border-slate-900">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-bold text-slate-100 mb-6"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Ready to extract your first document?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Drop any invoice into the playground and watch it transform into clean JSON — no signup
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/playground"
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-base transition-colors"
            >
              Try it now — no signup required
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-base transition-colors"
            >
              Get API key →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0C1222] border-t border-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="text-cyan-400">⚡</span>
            <span className="font-semibold text-slate-300">DocuExtract</span>
            <span className="text-slate-600">·</span>
            <span>Built with Claude AI</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/docs" className="hover:text-slate-300 transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <Link href="/changelog" className="hover:text-slate-300 transition-colors">Changelog</Link>
          </div>
          <p className="text-slate-600 text-xs">© 2026 DocuExtract. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="bg-[#0C1222] min-h-screen">
      <Navbar />
      <Hero />
      <LiveDemo />
      <BentoSection />
      <HowItWorks />
      <PricingSummary />
      <FinalCTA />
      <Footer />
    </main>
  );
}
