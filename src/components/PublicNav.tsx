'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Shared public navigation bar for all marketing pages.
 * Uses inline styles to match the public page CSS-variables pattern.
 * Includes mobile hamburger menu that opens at <768px.
 */
export default function PublicNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    if (mobileOpen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [mobileOpen]);

  const links = [
    { href: '/playground', label: 'Playground' },
    { href: '/use-cases', label: 'Use Cases' },
    { href: '/docs', label: 'Docs' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/changelog', label: 'Changelog' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navCss }} />
      <nav>
        <div className="pn-inner">
          <a href="/" className="pn-logo">
            Docu<span>Extract</span>
          </a>

          {/* Desktop links */}
          <ul className="pn-links">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={pathname === l.href || pathname.startsWith(l.href + '/') ? 'pn-active' : ''}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <a href="/login" className="pn-cta">Get API Key</a>

          {/* Mobile hamburger */}
          <button
            className="pn-burger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5L15 15M15 5L5 15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 5H17M3 10H17M3 15H17" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <>
            <div className="pn-overlay" onClick={() => setMobileOpen(false)} />
            <div className="pn-mobile">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={`pn-mobile-link ${pathname === l.href || pathname.startsWith(l.href + '/') ? 'pn-active' : ''}`}
                >
                  {l.label}
                </a>
              ))}
              <a href="/dashboard" className="pn-mobile-link">Dashboard</a>
              <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
              <a href="/login" className="pn-mobile-cta">Get API Key</a>
            </div>
          </>
        )}
      </nav>
    </>
  );
}

const navCss = `
  /* ── PUBLIC NAV ── */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(15,17,23,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border, #2a3147);
  }

  .pn-inner {
    max-width: var(--max-w, 1100px);
    margin: 0 auto;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .pn-logo {
    font-weight: 700;
    font-size: 18px;
    color: var(--text, #e2e8f0);
    letter-spacing: -0.3px;
    text-decoration: none;
  }
  .pn-logo:hover { text-decoration: none; }
  .pn-logo span { color: var(--accent, #6c8ef5); }

  .pn-links {
    display: flex;
    gap: 24px;
    list-style: none;
    margin-left: auto;
    align-items: center;
    padding: 0;
  }

  .pn-links a {
    color: var(--text-muted, #8892a4);
    font-size: 14px;
    text-decoration: none;
    transition: color 0.15s;
  }
  .pn-links a:hover { color: var(--text, #e2e8f0); }
  .pn-links a.pn-active { color: var(--text, #e2e8f0); font-weight: 500; }

  .pn-cta {
    display: inline-flex;
    align-items: center;
    padding: 8px 18px;
    border-radius: 7px;
    font-size: 14px;
    font-weight: 600;
    background: var(--accent, #6c8ef5);
    color: #fff;
    text-decoration: none;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .pn-cta:hover { background: var(--accent-hover, #5a7ef0); text-decoration: none; }

  .pn-burger {
    display: none;
    background: none;
    border: none;
    color: var(--text-muted, #8892a4);
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
  }

  .pn-overlay {
    position: fixed;
    inset: 0;
    top: 60px;
    background: rgba(0,0,0,0.5);
    z-index: 99;
  }

  .pn-mobile {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--bg, #0f1117);
    border-bottom: 1px solid var(--border, #2a3147);
    padding: 16px 24px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pn-mobile-link {
    display: block;
    padding: 12px 16px;
    color: var(--text-muted, #8892a4);
    font-size: 15px;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.15s;
  }
  .pn-mobile-link:hover { background: rgba(108,142,245,0.08); color: var(--text, #e2e8f0); text-decoration: none; }
  .pn-mobile-link.pn-active { color: var(--accent, #6c8ef5); font-weight: 500; }

  .pn-mobile-cta {
    display: block;
    padding: 12px 16px;
    text-align: center;
    background: var(--accent, #6c8ef5);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s;
  }
  .pn-mobile-cta:hover { background: var(--accent-hover, #5a7ef0); text-decoration: none; }

  @media (max-width: 767px) {
    .pn-links { display: none; }
    .pn-cta { display: none; }
    .pn-burger { display: block; }
  }
`;
