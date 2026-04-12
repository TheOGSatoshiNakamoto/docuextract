'use client';

import Link from 'next/link';

/**
 * Shared footer for ALL public pages. Single source of truth for site-wide navigation.
 * Uses inline CSS pattern (no Tailwind) matching the public page design system.
 * Static CSS string — no user input, safe for existing inline style approach.
 * Resolves 11 audit findings from 2026-04-12 UX audit.
 */

const footerCss = `
.pub-footer { border-top: 1px solid var(--border, #2a3147); background: var(--bg-card, #161b27); }

.pub-footer-cta {
  max-width: var(--max-w, 1100px); margin: 0 auto; padding: 80px 24px;
  text-align: center;
}
.pub-footer-cta h2 {
  font-size: clamp(22px, 4vw, 38px); font-weight: 800; color: var(--text, #e2e8f0);
  margin-bottom: 14px; letter-spacing: -0.5px;
}
.pub-footer-cta h2 .highlight { color: var(--accent, #6c8ef5); }
.pub-footer-cta p {
  color: var(--text-muted, #8892a4); font-size: 16px; margin-bottom: 28px;
}
.pub-footer-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.pub-footer-cta .pf-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px;
  border-radius: 7px; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.15s; text-decoration: none; border: none;
}
.pub-footer-cta .pf-btn-primary { background: var(--accent, #6c8ef5); color: #fff; }
.pub-footer-cta .pf-btn-primary:hover { background: var(--accent-hover, #5a7ef0); }
.pub-footer-cta .pf-btn-outline {
  background: transparent; color: var(--text, #e2e8f0);
  border: 1px solid var(--border, #2a3147);
}
.pub-footer-cta .pf-btn-outline:hover { border-color: var(--accent, #6c8ef5); color: var(--accent, #6c8ef5); }

.pub-footer-cols {
  max-width: var(--max-w, 1100px); margin: 0 auto; padding: 40px 24px;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
  border-top: 1px solid var(--border, #2a3147);
}
.pub-footer-col h4 {
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text, #e2e8f0); margin-bottom: 14px;
}
.pub-footer-col a {
  display: block; font-size: 13px; color: var(--text-muted, #8892a4);
  text-decoration: none; padding: 4px 0; transition: color 0.15s; line-height: 1.6;
}
.pub-footer-col a:hover { color: var(--accent, #6c8ef5); }

.pub-footer-bottom {
  max-width: var(--max-w, 1100px); margin: 0 auto; padding: 24px 24px 32px;
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid var(--border, #2a3147); flex-wrap: wrap; gap: 12px;
}
.pub-footer-logo { font-weight: 700; font-size: 16px; color: var(--text, #e2e8f0); text-decoration: none; }
.pub-footer-logo span { color: var(--accent, #6c8ef5); }
.pub-footer-copy { font-size: 12px; color: var(--text-muted, #8892a4); }

@media (max-width: 1023px) {
  .pub-footer-cols { grid-template-columns: repeat(2, 1fr); gap: 32px; }
}
@media (max-width: 639px) {
  .pub-footer-cols { grid-template-columns: 1fr; gap: 28px; padding: 32px 20px; }
  .pub-footer-col a { padding: 6px 0; font-size: 14px; }
  .pub-footer-cta { padding: 48px 20px 40px; }
  .pub-footer-cta h2 { font-size: 22px; }
  .pub-footer-cta-row { flex-direction: column; align-items: center; }
  .pub-footer-cta .pf-btn { width: 100%; max-width: 280px; justify-content: center; }
  .pub-footer-bottom { padding: 20px 20px 28px; flex-direction: column; text-align: center; }
}
`;

export default function PublicFooter() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: footerCss }} />
      <footer className="pub-footer">
        {/* CTA Band */}
        <div className="pub-footer-cta">
          <h2>Extract your first document in <span className="highlight">3 minutes</span></h2>
          <p>50 free extractions/month. No credit card. No templates. No training.</p>
          <div className="pub-footer-cta-row">
            <Link href="/playground" className="pf-btn pf-btn-primary">Try the playground</Link>
            <Link href="/docs" className="pf-btn pf-btn-outline">Read the docs</Link>
          </div>
        </div>

        {/* Link Columns */}
        <div className="pub-footer-cols">
          <div className="pub-footer-col">
            <h4>Product</h4>
            <Link href="/playground">Playground</Link>
            <Link href="/use-cases">Use Cases</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/changelog">Changelog</Link>
          </div>
          <div className="pub-footer-col">
            <h4>Developers</h4>
            <Link href="/docs">Documentation</Link>
            <Link href="/blog">Blog</Link>
            <a href="https://github.com/TheOGSatoshiNakamoto/docuextract" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <div className="pub-footer-col">
            <h4>Company</h4>
            <a href="mailto:hello@docuextract.dev">Contact</a>
            <Link href="/login">Sign In</Link>
          </div>
          <div className="pub-footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/acceptable-use">Acceptable Use</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pub-footer-bottom">
          <Link href="/" className="pub-footer-logo">Docu<span>Extract</span></Link>
          <span className="pub-footer-copy">&copy; 2026 DocuExtract. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
