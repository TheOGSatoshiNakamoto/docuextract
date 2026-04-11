'use client';

import Script from 'next/script';
import { DocsSections, dashboardContext, tocItems, docsScript } from '@/content/docs-data';

const css = `
*, *::before, *::after { box-sizing: border-box; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-dim: #3d5099;
  --green: #4ade80; --red: #f87171; --yellow: #facc15; --orange: #fb923c; --purple: #c084fc;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
}
.docs-layout { display: flex; height: calc(100vh - 90px); font-family: var(--font-sans); color: var(--text); font-size: 15px; line-height: 1.6; overflow: hidden; }
.docs-toc { width: clamp(200px, 22%, 260px); border-right: 1px solid var(--border); height: 100%; overflow-y: auto; padding: 24px 0; flex-shrink: 0; background: var(--bg-card); z-index: 5; transition: width 0.2s; }
.docs-main-wrapper { flex: 1; overflow-y: auto; scroll-behavior: smooth; min-width: 0; }
.docs-toc-toggle { display: none; }
.docs-toc-logo { padding: 0 16px 16px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
.docs-toc-logo a { text-decoration: none; display: flex; align-items: center; gap: 10px; }
.docs-toc-logo .logo-icon { width: 28px; height: 28px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.docs-toc-logo .logo-text { font-size: 15px; font-weight: 700; color: var(--text); }
.docs-toc-logo .logo-badge { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.docs-nav-group { padding: 0 10px; margin-bottom: 8px; }
.docs-nav-group-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); padding: 6px 8px; margin-bottom: 2px; }
.docs-nav-link { display: block; padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--text-muted); font-size: 13px; transition: all 0.15s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.docs-nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); text-decoration: none; }
.docs-nav-link.active { color: var(--accent); background: rgba(108,142,245,0.1); }
.docs-nav-method { display: inline-block; font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-right: 6px; }
.method-get { background: rgba(74,222,128,0.15); color: var(--green); }
.method-post { background: rgba(108,142,245,0.15); color: var(--accent); }
.docs-main { max-width: 820px; padding: 40px 48px 100px; min-width: 0; }
.docs-main section { scroll-margin-top: 24px; }
.docs-main h1 { font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 12px; line-height: 1.2; }
.docs-main h2 { font-size: 20px; font-weight: 700; color: var(--text); margin: 36px 0 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.docs-main h3 { font-size: 15px; font-weight: 600; color: var(--text); margin: 24px 0 10px; }
.docs-main p { color: #b4bfcc; margin-bottom: 14px; line-height: 1.7; }
.docs-main a { color: var(--accent); text-decoration: none; }
.docs-main a:hover { text-decoration: underline; }
.callout { padding: 12px 16px; border-radius: 8px; margin: 18px 0; font-size: 14px; border-left: 3px solid; }
.callout-info { background: rgba(108,142,245,0.08); border-color: var(--accent); }
.callout-warn { background: rgba(250,204,21,0.08); border-color: var(--yellow); color: #d4ae20; }
.callout-tip { background: rgba(74,222,128,0.08); border-color: var(--green); }
.callout strong { display: block; margin-bottom: 4px; }
.code-block { background: var(--bg-code); border: 1px solid var(--border); border-radius: 10px; margin: 14px 0; overflow: hidden; }
.code-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); }
.code-lang { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; }
.copy-btn { font-size: 12px; color: var(--text-muted); background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; }
.copy-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
pre { padding: 16px 18px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; margin: 0; }
code { font-family: var(--font-mono); font-size: 0.9em; }
.docs-main p code, .docs-main li code, .docs-main td code { background: var(--bg-code); padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #c9d1e0; border: 1px solid var(--border); }
.kw { color: #c084fc; } .str { color: #86efac; } .num { color: #fdba74; } .cmt { color: #4b5e7e; font-style: italic; } .fn { color: #93c5fd; } .key { color: #6c8ef5; } .url { color: #fdba74; } .hdr { color: #a5b4fc; } .val { color: #86efac; } .mt { color: #94a3b8; }
.tabs { margin: 14px 0; }
.tab-list { display: flex; gap: 4px; padding: 0 0 0 2px; border-bottom: 1px solid var(--border); margin-bottom: 0; }
.tab-btn { font-size: 13px; padding: 6px 12px; background: none; border: none; cursor: pointer; color: var(--text-muted); border-radius: 6px 6px 0 0; border-bottom: 2px solid transparent; transition: all 0.15s; margin-bottom: -1px; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }
.tab-panel .code-block { border-radius: 0 8px 8px 8px; margin-top: 0; }
.table-wrap { overflow-x: auto; margin: 14px 0; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 9px 12px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(255,255,255,0.02); }
.endpoint-badge { display: inline-flex; align-items: center; gap: 10px; background: var(--bg-code); border: 1px solid var(--border); padding: 8px 14px; border-radius: 8px; font-family: var(--font-mono); font-size: 13px; margin: 14px 0 20px; }
.badge-method { font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 4px; }
.badge-get { background: rgba(74,222,128,0.2); color: var(--green); }
.badge-post { background: rgba(108,142,245,0.2); color: var(--accent); }
.badge-path { color: var(--text); }
.error-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 18px; margin: 10px 0; }
.error-code { font-family: var(--font-mono); font-size: 13px; color: var(--red); font-weight: 600; margin-bottom: 4px; }
.error-desc { color: #b4bfcc; font-size: 13px; }
.pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
.plan-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; position: relative; transition: border-color 0.2s; display: flex; flex-direction: column; }
.plan-card:hover { border-color: var(--accent); }
.plan-card.featured { border-color: var(--accent-dim); }
.plan-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 20px; margin-bottom: 6px; background: rgba(108,142,245,0.15); color: var(--accent); border: 1px solid rgba(108,142,245,0.3); }
.plan-badge.best-value { background: rgba(74,222,128,0.12); color: var(--green); border-color: rgba(74,222,128,0.3); }
.plan-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.plan-price { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
.plan-price span { font-size: 13px; font-weight: 400; color: var(--text-muted); }
.plan-calls { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.plan-features { list-style: none; padding: 0; flex: 1; }
.plan-features li { font-size: 12px; color: #b4bfcc; padding: 2px 0; }
.plan-features li::before { content: '\\2713  '; color: var(--green); }
.steps { counter-reset: step; }
.step { display: flex; gap: 14px; margin-bottom: 28px; }
.step-num { width: 30px; height: 30px; background: var(--accent-dim); border: 2px solid var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.step-content h3 { margin-top: 0; }
.docs-main hr { border: none; border-top: 1px solid var(--border); margin: 36px 0; }
/* Medium screens — narrower TOC */
@media (max-width: 1100px) {
  .docs-main { padding: 32px 32px 80px; }
}
/* Small screens — TOC becomes a slide-over drawer */
@media (max-width: 768px) {
  .docs-toc {
    position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
    transform: translateX(-100%); transition: transform 0.25s ease;
    z-index: 50; box-shadow: none;
  }
  .docs-toc.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
  .docs-toc-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
  .docs-toc-backdrop.open { display: block; }
  .docs-toc-toggle {
    display: flex; align-items: center; gap: 6px;
    position: sticky; top: 0; z-index: 10;
    background: var(--bg-card); border-bottom: 1px solid var(--border);
    padding: 10px 16px; cursor: pointer; border: none;
    color: var(--text-muted); font-size: 13px; font-weight: 600;
    font-family: var(--font-sans); width: 100%; transition: color 0.15s;
  }
  .docs-toc-toggle:hover { color: var(--text); }
  .docs-toc-toggle svg { flex-shrink: 0; }
  .docs-main { padding: 24px 16px 80px; }
  .pricing-grid { grid-template-columns: repeat(2, 1fr); }
  .endpoint-badge { font-size: 11px; padding: 6px 10px; }
  .badge-path { word-break: break-all; }
}
`;

export default function DashboardDocsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="docs-layout">
        {/* Mobile TOC backdrop */}
        <div className="docs-toc-backdrop" id="docs-toc-backdrop" onClick={() => {
          document.getElementById('docs-toc')?.classList.remove('open');
          document.getElementById('docs-toc-backdrop')?.classList.remove('open');
        }} />

        {/* Docs table of contents sidebar */}
        <nav className="docs-toc" id="docs-toc">
          <div className="docs-toc-logo">
            <a href="#introduction">
              <div className="logo-icon">📄</div>
              <div>
                <div className="logo-text">DocuExtract</div>
                <div className="logo-badge">API Reference v1</div>
              </div>
            </a>
          </div>
          {tocItems.map((group) => (
            <div className="docs-nav-group" key={group.group}>
              <div className="docs-nav-group-title">{group.group}</div>
              {group.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`docs-nav-link${item.href === '#introduction' ? ' active' : ''}`}
                  {...('external' in item && item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {'method' in item && item.method && (
                    <span className={`docs-nav-method method-${item.method.toLowerCase()}`}>{item.method}</span>
                  )}
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>

        {/* Main docs content */}
        <div className="docs-main-wrapper" id="docs-scroll-container">
        {/* Mobile TOC toggle */}
        <button className="docs-toc-toggle" onClick={() => {
          document.getElementById('docs-toc')?.classList.add('open');
          document.getElementById('docs-toc-backdrop')?.classList.add('open');
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4H14M2 8H10M2 12H14" /></svg>
          API Reference
        </button>
        <main className="docs-main">
          <DocsSections ctx={dashboardContext} />
        </main>
        </div>
      </div>

      <Script id="dashboard-docs-js" strategy="afterInteractive">{`
        ${docsScript}

        // Active nav on scroll
        var scrollContainer = document.getElementById('docs-scroll-container');
        var sections = document.querySelectorAll('.docs-main section[id]');
        var navLinks = document.querySelectorAll('.docs-nav-link');
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              navLinks.forEach(function(link) { link.classList.remove('active'); });
              var active = document.querySelector('.docs-nav-link[href="#' + entry.target.id + '"]');
              if (active) active.classList.add('active');
            }
          });
        }, { root: scrollContainer, rootMargin: '-20% 0px -70% 0px' });
        sections.forEach(function(s) { observer.observe(s); });

        // Smooth scroll nav links + close mobile drawer
        navLinks.forEach(function(link) {
          link.addEventListener('click', function(e) {
            var href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
              e.preventDefault();
              var target = document.getElementById(href.slice(1));
              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Close mobile drawer if open
              var toc = document.getElementById('docs-toc');
              var backdrop = document.getElementById('docs-toc-backdrop');
              if (toc) toc.classList.remove('open');
              if (backdrop) backdrop.classList.remove('open');
            }
          });
        });
      `}</Script>
    </>
  );
}
