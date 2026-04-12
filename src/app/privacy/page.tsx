import PublicNav from '@/components/PublicNav';

// Static CSS — no user input, safe for dangerouslySetInnerHTML.
const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
.legal a { color: var(--accent); text-decoration: none; }
.legal a:hover { text-decoration: underline; }
.legal-footer { max-width: var(--max-w); margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.legal-footer span { font-weight: 700; font-size: 16px; }
.legal-footer span em { color: var(--accent); font-style: normal; }
.legal-footer a { font-size: 13px; color: var(--text-muted); text-decoration: none; }
.legal-footer a:hover { color: var(--text); }
`;

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PublicNav />
      <div className="legal">
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: April 12, 2026</p>

        <h2>What We Collect</h2>
        <p>When you create an account, we collect:</p>
        <ul>
          <li><strong>Account information:</strong> email address and authentication provider (GitHub, Google, or magic link).</li>
          <li><strong>API usage logs:</strong> timestamps, document types processed, model used, processing time, and confidence scores. We use this to enforce rate limits, generate usage reports, and improve the service.</li>
          <li><strong>Payment information:</strong> managed entirely by Stripe. We store your Stripe customer ID and subscription status but never see or store your card details.</li>
        </ul>

        <h2>What We Do NOT Collect</h2>
        <p>We do not store your documents. Documents sent to the <code>/v1/extract</code> endpoint are processed in memory by the Claude AI model and immediately discarded. We never retain, cache, or log document content. Your data passes through — it does not stay.</p>

        <h2>How We Use Your Data</h2>
        <ul>
          <li>Authenticate your API requests</li>
          <li>Enforce rate limits and usage quotas</li>
          <li>Send usage alerts and weekly reports (you can unsubscribe)</li>
          <li>Process payments and manage subscriptions</li>
          <li>Improve the service (aggregated, anonymized usage patterns only)</li>
        </ul>

        <h2>Third-Party Processors</h2>
        <ul>
          <li><strong>Supabase</strong> — database, authentication, and file storage</li>
          <li><strong>Anthropic (Claude API)</strong> — document extraction AI processing</li>
          <li><strong>Stripe</strong> — payment processing and subscription management</li>
          <li><strong>Vercel</strong> — application hosting and deployment</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
        </ul>

        <h2>Your Rights</h2>
        <p>You can delete your account at any time from <a href="/dashboard/settings">Settings</a>. This permanently removes your account data, API keys, and usage history. Document content is never stored, so there is nothing to delete.</p>
        <p>To request a data export or ask questions about your data, email <a href="mailto:privacy@docuextract.dev">privacy@docuextract.dev</a>.</p>

        <h2>Cookies</h2>
        <p>We use essential cookies only — authentication session tokens managed by Supabase. No tracking cookies, no analytics cookies, no third-party advertising cookies.</p>

        <h2>Changes</h2>
        <p>We may update this policy as the service evolves. Material changes will be communicated via email to registered users.</p>
      </div>

      <footer className="legal-footer">
        <span>Docu<em>Extract</em></span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="/docs">Docs</a>
          <a href="/pricing">Pricing</a>
          <a href="/security">Security</a>
          <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </>
  );
}
