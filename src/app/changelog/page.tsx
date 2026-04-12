import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Changelog | DocuExtract',
};

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-hover: #5a7ef0;
  --accent-dim: rgba(108,142,245,0.12); --green: #4ade80; --green-bg: rgba(74,222,128,0.08);
  --purple: #c084fc; --orange: #fb923c;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
  --max-w: 720px; --radius: 10px;
}
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 16px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; }

.hero { padding: 80px 24px 48px; text-align: center; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(108,142,245,0.08) 0%, transparent 70%); pointer-events: none; }
.section-label { font-size: 12px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
.hero h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -1px; margin-bottom: 14px; }
.hero h1 .hl { color: var(--accent); }
.hero p { font-size: 16px; color: var(--text-muted); max-width: 480px; margin: 0 auto; }

.timeline { max-width: var(--max-w); margin: 0 auto; padding: 0 24px 80px; position: relative; }
.timeline::before { content: ''; position: absolute; left: calc(24px + 7px); top: 0; bottom: 0; width: 2px; background: var(--border); }

.entry { position: relative; padding-left: 36px; margin-bottom: 48px; }
.entry-dot { position: absolute; left: 0; top: 6px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg); border: 2px solid var(--accent); z-index: 1; }
.entry.major .entry-dot { background: var(--accent); }

.entry-date { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-bottom: 8px; }
.entry-title { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 8px; }
.entry-badge { display: inline-flex; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 8px; }
.badge-feature { background: var(--accent-dim); color: var(--accent); }
.badge-fix { background: var(--green-bg); color: var(--green); }
.badge-improvement { background: rgba(192,132,252,0.1); color: var(--purple); }

.entry-body { color: var(--text-muted); font-size: 14px; line-height: 1.7; }
.entry-body ul { margin: 8px 0 0 18px; }
.entry-body li { margin-bottom: 4px; }
.entry-body code { background: var(--bg-code); border: 1px solid var(--border); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; }

@media (max-width: 600px) {
  .timeline::before { left: calc(16px + 7px); }
  .entry { padding-left: 28px; }
}
`;

const ENTRIES = [
  {
    date: 'March 30, 2026',
    title: 'v1.3: Premium dashboard, pricing page, and playground upgrade',
    major: true,
    badges: ['feature'],
    body: `<ul>
      <li>New collapsible sidebar navigation with keyboard shortcut (<code>[</code> or <code>Cmd+B</code>)</li>
      <li>Getting Started widget — 3 auto-completing steps to first extraction</li>
      <li>Split-pane playground: upload on left, JSON output on right, with 3 pre-loaded sample documents</li>
      <li>Dedicated <code>/pricing</code> page with tier comparison, usage calculator, and FAQ</li>
      <li>GitHub + Google OAuth login with social proof</li>
      <li>Blog infrastructure with 3 SEO-targeted technical posts</li>
      <li>Use cases page with before/after extraction demos</li>
    </ul>`,
  },
  {
    date: 'March 29, 2026',
    title: 'v1.2: Live on docuextract.dev + Sentry monitoring',
    major: true,
    badges: ['feature'],
    body: `<ul>
      <li>Custom domain <code>docuextract.dev</code> live and serving all routes</li>
      <li>Sentry error tracking integrated into all API route handlers</li>
      <li>3 SEO blog posts: invoice extraction guide, API comparison, receipt processing tutorial</li>
      <li>Edge Runtime enabled for <code>/v1/health</code> and <code>/v1/usage</code> — sub-50ms cold starts</li>
      <li>Stripe webhook URL migrated to docuextract.dev</li>
    </ul>`,
  },
  {
    date: 'March 28, 2026',
    title: 'v1.1: Single Next.js app architecture',
    major: false,
    badges: ['improvement'],
    body: `<ul>
      <li>Merged API + dashboard into a single Next.js 14 App Router project</li>
      <li>20 routes, 1 package.json, zero CORS issues</li>
      <li>Security audit: all 14 lib files enforce <code>server-only</code></li>
      <li>Docs content audit: 7 error code inaccuracies fixed</li>
    </ul>`,
  },
  {
    date: 'March 27, 2026',
    title: 'v1.0: Developer experience complete',
    major: true,
    badges: ['feature'],
    body: `<ul>
      <li>Interactive API playground at <code>/playground</code> — try extractions without signup</li>
      <li>Developer dashboard with API key management, usage charts, billing</li>
      <li>API documentation with tabbed code examples (curl, JavaScript, Python)</li>
      <li>JavaScript SDK (TypeScript, fetch-based, npm-ready)</li>
      <li>Python SDK (requests-based, PyPI-ready)</li>
    </ul>`,
  },
  {
    date: 'March 26, 2026',
    title: 'Billing integration + metered overage',
    major: false,
    badges: ['feature'],
    body: `<ul>
      <li>Stripe webhook handler with signature verification and idempotent processing</li>
      <li>Checkout and billing portal endpoints</li>
      <li>Metered overage: per-plan rates ($0.04–$0.015/extraction) beyond plan limit, auto-reported to Stripe</li>
      <li>E2E billing test script for full lifecycle verification</li>
    </ul>`,
  },
  {
    date: 'March 25, 2026',
    title: 'v0.9: Extraction engine goes live',
    major: true,
    badges: ['feature'],
    body: `<ul>
      <li>Claude-powered extraction engine: 8 document type prompts + custom schema support</li>
      <li>90-97% extraction accuracy with confidence scoring per field</li>
      <li><code>POST /v1/extract</code> — send any document, get structured JSON back</li>
      <li>Auto document type detection via <code>POST /v1/detect</code></li>
      <li>Support for PDF, PNG, JPG, WEBP up to 10MB (base64 or URL)</li>
    </ul>`,
  },
  {
    date: 'March 24, 2026',
    title: 'Project kickoff: foundations laid',
    major: false,
    badges: ['improvement'],
    body: `<ul>
      <li>Supabase schema deployed: users, api_usage, rate_limits, webhook_events</li>
      <li>API key auth with bcrypt hashing and 60s caching</li>
      <li>Atomic rate limiting (per-minute + per-month)</li>
      <li>Health endpoint live: <code>GET /v1/health</code></li>
    </ul>`,
  },
];

export default function ChangelogPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <PublicNav />

      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label">Changelog</div>
          <h1>What&apos;s <span className="hl">new</span></h1>
          <p>Bi-weekly updates on new features, fixes, and improvements. Building DocuExtract in public.</p>
        </div>
      </section>

      <div className="timeline">
        {ENTRIES.map((entry, i) => (
          <div key={i} className={`entry ${entry.major ? 'major' : ''}`}>
            <div className="entry-dot" />
            <div className="entry-date">{entry.date}</div>
            <div style={{ marginBottom: 8 }}>
              {entry.badges.map((b) => (
                <span key={b} className={`entry-badge badge-${b}`}>
                  {b === 'feature' ? 'New Feature' : b === 'fix' ? 'Bug Fix' : 'Improvement'}
                </span>
              ))}
            </div>
            <div className="entry-title">{entry.title}</div>
            <div className="entry-body" dangerouslySetInnerHTML={{ __html: entry.body }} />
          </div>
        ))}
      </div>

      <PublicFooter />
    </>
  );
}
