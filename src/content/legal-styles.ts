/**
 * Shared CSS for all legal pages (/terms, /privacy, /acceptable-use).
 * Static string constant — no user input, safe for dangerouslySetInnerHTML.
 */
export const legalCss = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-hover: #5a7ef0;
  --green: #4ade80;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
  --max-w: 900px;
}
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.7; }

.legal-layout { display: flex; max-width: var(--max-w); margin: 0 auto; padding: 60px 24px 120px; gap: 48px; }

.legal-toc {
  width: 200px; flex-shrink: 0; position: sticky; top: 80px; align-self: flex-start;
  max-height: calc(100vh - 100px); overflow-y: auto;
  border-right: 1px solid var(--border); padding-right: 24px;
}
.legal-toc-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 12px; }
.legal-toc a {
  display: block; font-size: 13px; color: var(--text-muted); text-decoration: none;
  padding: 4px 0; transition: color 0.15s; line-height: 1.5;
}
.legal-toc a:hover { color: var(--text); }
.legal-toc a.active { color: var(--accent); }

.legal-content { flex: 1; min-width: 0; }
.legal-content h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
.legal-content .updated { font-size: 13px; color: var(--text-muted); margin-bottom: 48px; }
.legal-content h2 {
  font-size: 18px; font-weight: 700; margin: 40px 0 12px; color: var(--text);
  padding-top: 24px; scroll-margin-top: 80px;
}
.legal-content h3 { font-size: 15px; font-weight: 600; margin: 24px 0 8px; color: var(--text); }
.legal-content p { color: var(--text-muted); margin-bottom: 16px; font-size: 15px; }
.legal-content ul, .legal-content ol { color: var(--text-muted); margin: 0 0 16px 20px; font-size: 15px; }
.legal-content li { margin-bottom: 6px; }
.legal-content code {
  font-family: var(--font-mono); font-size: 13px; background: #1e2435;
  padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);
}
.legal-content a { color: var(--accent); text-decoration: none; }
.legal-content a:hover { text-decoration: underline; }
.legal-content strong { color: var(--text); }

.legal-footer {
  max-width: var(--max-w); margin: 0 auto; padding: 40px 24px;
  border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}
.legal-footer .brand { font-weight: 700; font-size: 16px; color: var(--text); }
.legal-footer .brand em { color: var(--accent); font-style: normal; }
.legal-footer-links { display: flex; gap: 24px; }
.legal-footer-links a { font-size: 13px; color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
.legal-footer-links a:hover { color: var(--text); }

@media (max-width: 768px) {
  .legal-toc { display: none; }
  .legal-layout { padding: 40px 20px 80px; }
  .legal-content h1 { font-size: 26px; }
}

@media print {
  body { background: #fff; color: #111; }
  .legal-toc { display: none; }
  nav, .legal-footer { display: none; }
  .legal-content a { color: #111; text-decoration: underline; }
  .legal-content h2 { border-bottom: 1px solid #ccc; padding-bottom: 4px; }
}
`;
