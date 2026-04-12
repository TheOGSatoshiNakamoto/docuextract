import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

// Static CSS — no user input, safe for dangerouslySetInnerHTML.
const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5;
  --green: #4ade80;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
  --max-w: 800px;
}
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.7; }
.legal { max-width: var(--max-w); margin: 0 auto; padding: 80px 24px 120px; }
.legal h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
.legal .updated { font-size: 13px; color: var(--text-muted); margin-bottom: 48px; }
.legal h2 { font-size: 18px; font-weight: 700; margin: 40px 0 12px; color: var(--text); }
.legal p { color: var(--text-muted); margin-bottom: 16px; font-size: 15px; }
.legal ul { color: var(--text-muted); margin: 0 0 16px 20px; font-size: 15px; }
.legal li { margin-bottom: 6px; }
.legal code { font-family: var(--font-mono); font-size: 13px; background: #1e2435; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border); }
.legal a { color: var(--accent); text-decoration: none; }
.legal a:hover { text-decoration: underline; }
.legal .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); color: var(--green); font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 32px; }
.legal .badge::before { content: ''; width: 6px; height: 6px; background: var(--green); border-radius: 50%; }
`;

export default function SecurityPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PublicNav />
      <div className="legal">
        <h1>Security</h1>
        <p className="updated">Last updated: April 12, 2026</p>
        <div className="badge">All systems operational</div>

        <h2>No Document Storage</h2>
        <p>DocuExtract processes documents in memory and never stores them. When you send a document to <code>/v1/extract</code>, it is passed to the Claude AI model for extraction, the structured result is returned, and the document is immediately discarded. No caching, no logging, no retention.</p>

        <h2>Encryption in Transit</h2>
        <p>All API traffic is encrypted with TLS 1.3. We enforce HTTPS on every endpoint — plaintext HTTP requests are rejected. Your documents and API keys never travel over an unencrypted connection.</p>

        <h2>API Key Security</h2>
        <ul>
          <li>API keys are hashed with <strong>bcrypt</strong> before storage. We never store plaintext keys.</li>
          <li>Keys are shown once at creation and cannot be retrieved again — only regenerated.</li>
          <li>Keys use the prefix <code>dk_live_</code> followed by 32 cryptographically random characters.</li>
          <li>Keys can be revoked instantly from the <a href="/dashboard/keys">API Keys</a> dashboard.</li>
        </ul>

        <h2>Authentication</h2>
        <ul>
          <li><strong>OAuth 2.0</strong> via GitHub and Google — no passwords stored</li>
          <li><strong>Magic link</strong> email authentication via Supabase Auth with PKCE flow</li>
          <li>Session tokens managed by Supabase with automatic rotation</li>
          <li>Row Level Security (RLS) enforced on all database tables — users can only access their own data</li>
        </ul>

        <h2>Infrastructure</h2>
        <ul>
          <li><strong>Hosting:</strong> Vercel (SOC 2 Type II compliant)</li>
          <li><strong>Database:</strong> Supabase PostgreSQL (SOC 2 Type II compliant)</li>
          <li><strong>AI Processing:</strong> Anthropic Claude API (SOC 2 Type II compliant)</li>
          <li><strong>Payments:</strong> Stripe (PCI DSS Level 1 certified)</li>
        </ul>

        <h2>Rate Limiting</h2>
        <p>All API endpoints enforce per-minute and per-month rate limits based on your plan tier. Rate limit headers are included in every response so you can monitor usage programmatically.</p>

        <h2>Vulnerability Reporting</h2>
        <p>If you discover a security vulnerability, please report it responsibly to <a href="mailto:security@docuextract.dev">security@docuextract.dev</a>. We take all reports seriously and will respond within 48 hours.</p>

        <h2>Compliance Roadmap</h2>
        <p>We are working toward SOC 2 Type II certification. All infrastructure providers are already SOC 2 compliant. Contact us at <a href="mailto:security@docuextract.dev">security@docuextract.dev</a> for security questionnaires or vendor assessments.</p>
      </div>

      <PublicFooter />
    </>
  );
}
