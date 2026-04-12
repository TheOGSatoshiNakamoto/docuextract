'use client';

import Script from 'next/script';
import { DocsSections, publicContext, tocItems, docsScript } from '@/content/docs-data';
import PublicFooter from '@/components/PublicFooter';

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117; --bg-card: #161b27; --bg-code: #1e2435; --border: #2a3147;
  --text: #e2e8f0; --text-muted: #8892a4; --accent: #6c8ef5; --accent-dim: #3d5099;
  --green: #4ade80; --red: #f87171; --yellow: #facc15; --orange: #fb923c; --purple: #c084fc;
  --sidebar-width: 260px;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; font-size: 15px; }
.layout { display: flex; min-height: 100vh; }
.sidebar { width: var(--sidebar-width); background: var(--bg-card); border-right: 1px solid var(--border); position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto; padding: 24px 0; z-index: 10; }
.sidebar-logo { padding: 0 20px 20px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.sidebar-logo a { text-decoration: none; display: flex; align-items: center; gap: 10px; }
.logo-icon { width: 32px; height: 32px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.logo-text { font-size: 16px; font-weight: 700; color: var(--text); }
.logo-badge { font-size: 11px; color: var(--text-muted); font-weight: 400; margin-top: 1px; }
.nav-group { padding: 0 12px; margin-bottom: 8px; }
.nav-group-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); padding: 6px 8px; margin-bottom: 2px; }
.nav-link { display: block; padding: 6px 8px; border-radius: 6px; text-decoration: none; color: var(--text-muted); font-size: 14px; transition: all 0.15s; }
.nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.nav-link.active { color: var(--accent); background: rgba(108,142,245,0.1); }
.nav-method { display: inline-block; font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-right: 6px; }
.method-get { background: rgba(74,222,128,0.15); color: var(--green); }
.method-post { background: rgba(108,142,245,0.15); color: var(--accent); }
.main { margin-left: var(--sidebar-width); flex: 1; max-width: 860px; padding: 48px 56px 120px; }
section { padding-top: 80px; margin-top: -80px; }
h1 { font-size: 32px; font-weight: 800; color: var(--text); margin-bottom: 12px; line-height: 1.2; }
h2 { font-size: 22px; font-weight: 700; color: var(--text); margin: 40px 0 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
h3 { font-size: 16px; font-weight: 600; color: var(--text); margin: 28px 0 10px; }
p { color: #b4bfcc; margin-bottom: 16px; line-height: 1.7; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.callout { padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; border-left: 3px solid; }
.callout-info { background: rgba(108,142,245,0.08); border-color: var(--accent); }
.callout-warn { background: rgba(250,204,21,0.08); border-color: var(--yellow); color: #d4ae20; }
.callout-tip { background: rgba(74,222,128,0.08); border-color: var(--green); }
.callout strong { display: block; margin-bottom: 4px; }
.code-block { background: var(--bg-code); border: 1px solid var(--border); border-radius: 10px; margin: 16px 0; overflow: hidden; }
.code-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); }
.code-lang { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; }
.copy-btn { font-size: 12px; color: var(--text-muted); background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; }
.copy-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
pre { padding: 18px 20px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; }
code { font-family: var(--font-mono); font-size: 0.9em; }
p code, li code { background: var(--bg-code); padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #c9d1e0; border: 1px solid var(--border); }
.kw { color: #c084fc; } .str { color: #86efac; } .num { color: #fdba74; } .cmt { color: #4b5e7e; font-style: italic; } .fn { color: #93c5fd; } .key { color: #6c8ef5; } .url { color: #fdba74; } .hdr { color: #a5b4fc; } .val { color: #86efac; } .mt { color: #94a3b8; }
.tabs { margin: 16px 0; }
.tab-list { display: flex; gap: 4px; padding: 0 0 0 2px; border-bottom: 1px solid var(--border); margin-bottom: 0; }
.tab-btn { font-size: 13px; padding: 7px 14px; background: none; border: none; cursor: pointer; color: var(--text-muted); border-radius: 6px 6px 0 0; border-bottom: 2px solid transparent; transition: all 0.15s; margin-bottom: -1px; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }
.tab-panel .code-block { border-radius: 0 8px 8px 8px; margin-top: 0; }
.table-wrap { overflow-x: auto; margin: 16px 0; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; padding: 10px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
td code { font-size: 12px; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(255,255,255,0.02); }
.endpoint-badge { display: inline-flex; align-items: center; gap: 10px; background: var(--bg-code); border: 1px solid var(--border); padding: 10px 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 14px; margin: 16px 0 24px; }
.badge-method { font-weight: 700; font-size: 12px; padding: 3px 8px; border-radius: 4px; }
.badge-get { background: rgba(74,222,128,0.2); color: var(--green); }
.badge-post { background: rgba(108,142,245,0.2); color: var(--accent); }
.badge-path { color: var(--text); }
.error-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 16px 20px; margin: 12px 0; }
.error-code { font-family: var(--font-mono); font-size: 13px; color: var(--red); font-weight: 600; margin-bottom: 4px; }
.error-desc { color: #b4bfcc; font-size: 14px; }
.pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
.plan-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; position: relative; transition: border-color 0.2s, transform 0.2s; display: flex; flex-direction: column; }
.plan-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.plan-card.featured { border-color: var(--accent-dim); }
.plan-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 20px; margin-bottom: 8px; background: rgba(108,142,245,0.15); color: var(--accent); border: 1px solid rgba(108,142,245,0.3); }
.plan-badge.best-value { background: rgba(74,222,128,0.12); color: var(--green); border-color: rgba(74,222,128,0.3); }
.plan-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.plan-price { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
.plan-price span { font-size: 13px; font-weight: 400; color: var(--text-muted); }
.plan-calls { font-size: 13px; color: var(--text-muted); margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
.plan-features { list-style: none; flex: 1; }
.plan-features li { font-size: 13px; color: #b4bfcc; padding: 3px 0; }
.plan-features li::before { content: '\\2713 '; color: var(--green); }
.plan-subscribe { display: block; width: 100%; margin-top: 16px; padding: 9px 0; border-radius: 7px; font-size: 13px; font-weight: 600; text-align: center; text-decoration: none; cursor: pointer; border: 1px solid var(--border); color: var(--text-muted); background: transparent; opacity: 0; transform: translateY(6px); transition: opacity 0.18s, transform 0.18s, background 0.18s, color 0.18s, border-color 0.18s; pointer-events: none; }
.plan-card:hover .plan-subscribe { opacity: 1; transform: translateY(0); pointer-events: auto; }
.plan-subscribe:hover { background: var(--accent); border-color: var(--accent); color: #fff; text-decoration: none; }
.plan-subscribe.filled { background: var(--accent); border-color: var(--accent); color: #fff; }
.plan-subscribe.filled:hover { background: #5a7ef0; }
.back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 20px 16px; color: var(--text-muted); font-size: 13px; text-decoration: none; transition: color 0.15s; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
.back-btn:hover { color: var(--text); text-decoration: none; }
.steps { counter-reset: step; }
.step { display: flex; gap: 16px; margin-bottom: 32px; }
.step-num { width: 32px; height: 32px; background: var(--accent-dim); border: 2px solid var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.step-content h3 { margin-top: 0; }
hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
.menu-toggle { display: none; position: fixed; top: 16px; left: 16px; z-index: 20; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--text); cursor: pointer; font-size: 18px; }
@media (max-width: 768px) {
  .menu-toggle { display: flex; align-items: center; }
  .sidebar { transform: translateX(-100%); transition: transform 0.2s; }
  .sidebar.open { transform: translateX(0); }
  .main { margin-left: 0; padding: 56px 20px 80px; }
  .pricing-grid { grid-template-columns: repeat(2, 1fr); }
  h1 { font-size: 24px; }
}
`;

export default function DocsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <button className="menu-toggle" id="menu-toggle">&#9776;</button>

      <div className="layout">
        {/* Sidebar */}
        <nav className="sidebar" id="sidebar">
          <a href="/" className="back-btn">
            &larr; Back to Home
          </a>
          <div className="sidebar-logo">
            <a href="#introduction">
              <div className="logo-icon">&#128196;</div>
              <div>
                <div className="logo-text">DocuExtract</div>
                <div className="logo-badge">API Reference v1</div>
              </div>
            </a>
          </div>
          {tocItems.map((group) => (
            <div className="nav-group" key={group.group}>
              <div className="nav-group-title">{group.group}</div>
              {group.items.map((item) => {
                if ('external' in item && item.external) {
                  return (
                    <a href={item.href} className="nav-link" key={item.href}>
                      {item.label}
                    </a>
                  );
                }
                return (
                  <a href={item.href} className={`nav-link${item.href === '#introduction' ? ' active' : ''}`} key={item.href}>
                    {'method' in item && item.method && (
                      <span className={`nav-method method-${item.method.toLowerCase()}`}>{item.method}</span>
                    )}
                    {item.label}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Main */}
        <main className="main">
          <DocsSections ctx={publicContext} />
        </main>
      </div>

      <PublicFooter />

      <Script id="docs-js" strategy="afterInteractive">{`
        ${docsScript}

        // Active nav on scroll
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link');
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              navLinks.forEach(function(link) { link.classList.remove('active'); });
              var active = document.querySelector('.nav-link[href="#' + entry.target.id + '"]');
              if (active) active.classList.add('active');
            }
          });
        }, { rootMargin: '-20% 0px -70% 0px' });
        sections.forEach(function(s) { observer.observe(s); });

        // Mobile sidebar
        document.getElementById('menu-toggle').addEventListener('click', function() {
          document.querySelector('.sidebar').classList.toggle('open');
        });
        navLinks.forEach(function(link) {
          link.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.remove('open');
          });
        });
      `}</Script>
    </>
  );
}
