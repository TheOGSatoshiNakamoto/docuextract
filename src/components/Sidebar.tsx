'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ── Icons (inline SVG, no icon library needed) ───────────────────────────────

function IconRocket() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 1.5C9.5 1.5 13 2 13.5 5.5C14 9 11 11.5 8 13L3 11L5 6C5 6 6.5 3 9.5 1.5Z" />
      <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
      <path d="M3 11L2 14L5 13" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6.5L8 2L14 6.5V14H10V10H6V14H2V6.5Z" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1" width="10" height="14" rx="1.5" />
      <path d="M6 5H10M6 8H10M6 11H8" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="7" r="3.5" />
      <path d="M9 8.5L14 8.5M12 8.5V11" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2H10C10.8 2 11.5 2.7 11.5 3.5V13.5C11.5 14.3 10.8 15 10 15H3V2Z" />
      <path d="M11.5 13.5C11.5 14.3 12.2 15 13 15H14V2H13C12.2 2 11.5 2.7 11.5 3.5" />
      <path d="M6 5.5H9M6 8H9" />
    </svg>
  );
}

function IconWebhook() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3V1M8 15V13M3 8H1M15 8H13" />
      <circle cx="8" cy="8" r="3" />
      <path d="M5.5 5.5L4 4M11.5 5.5L13 4M5.5 10.5L4 12M11.5 10.5L13 12" />
    </svg>
  );
}

function IconTerminal() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M4 6L6.5 8.5L4 11M8 11H12" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 13L6 8L9 10.5L13 5" />
      <path d="M2 14H14" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path d="M1.5 7H14.5" />
      <path d="M4.5 10.5H6.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.2 3.2L4.2 4.2M11.8 11.8L12.8 12.8M3.2 12.8L4.2 11.8M11.8 4.2L12.8 3.2" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3L9 7L5 11" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4H14M2 8H14M2 12H14" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface UsageMini {
  used: number;
  limit: number;
  plan: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  /** Only shown when condition is true */
  showWhen?: boolean;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [usage, setUsage] = useState<UsageMini | null>(null);
  const [hasExtractions, setHasExtractions] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Detect mobile and restore collapsed state
  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
        setMobileOpen(false);
      }
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);

    try {
      if (!isMobile && localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* SSR safe */ }

    return () => window.removeEventListener('resize', checkMobile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut: [ or Cmd/Ctrl+B
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '[' || ((e.metaKey || e.ctrlKey) && e.key === 'b')) {
        e.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => {
        const next = !c;
        try { localStorage.setItem('sidebar-collapsed', String(next)); } catch { /* SSR safe */ }
        return next;
      });
    }
  }, [isMobile]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch user + usage for the usage bar (direct Supabase queries)
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserEmail(session.user.email ?? '');

      const { data } = await supabase
        .from('users')
        .select('plan, monthly_limit')
        .eq('id', session.user.id)
        .single();

      if (!data) return;

      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count } = await supabase
          .from('api_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .gte('created_at', monthStart);

        const used = count ?? 0;
        setUsage({ used, limit: data.monthly_limit ?? 100, plan: data.plan ?? 'free' });
        setHasExtractions(used > 0);
      } catch { /* non-blocking */ }
    });
  }, []);

  async function signOut() {
    setSigningOut(true);
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const usedPct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const barColor = usedPct >= 95 ? '#f87171' : usedPct >= 80 ? '#f59e0b' : '#6c8ef5';

  const mainNav: NavItem[] = [
    { label: 'Quick Start', href: '/dashboard', icon: <IconRocket />, showWhen: !hasExtractions },
    { label: 'Overview', href: '/dashboard', icon: <IconHome /> },
    { label: 'Extractions', href: '/dashboard/usage', icon: <IconDocument /> },
    { label: 'Playground', href: '/playground', icon: <IconPlay /> },
    { label: 'API Keys', href: '/dashboard/keys', icon: <IconKey /> },
  ];

  const devNav: NavItem[] = [
    { label: 'Documentation', href: '/docs', icon: <IconBook />, external: true },
    { label: 'Webhooks', href: '/dashboard/webhooks', icon: <IconWebhook /> },
    { label: 'Logs', href: '/dashboard/logs', icon: <IconTerminal /> },
  ];

  const accountNav: NavItem[] = [
    { label: 'Usage', href: '/dashboard/usage', icon: <IconChart /> },
    { label: 'Billing', href: '/dashboard/billing', icon: <IconCreditCard /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <IconSettings /> },
  ];

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  function NavLink({ item }: { item: NavItem }) {
    if (item.showWhen === false) return null;
    const active = isActive(item.href);
    return (
      <a
        href={item.href}
        title={!isExpanded ? item.label : undefined}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
          ${active
            ? 'bg-indigo-500/15 text-indigo-400'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }
        `}
      >
        <span className={`shrink-0 ${active ? 'text-indigo-400' : ''}`}>{item.icon}</span>
        {isExpanded && <span className="truncate">{item.label}</span>}
        {isExpanded && active && (
          <span className="ml-auto text-indigo-500 opacity-60"><IconChevron /></span>
        )}
      </a>
    );
  }

  // On mobile, sidebar is hidden by default and shown as overlay
  const showSidebar = isMobile ? mobileOpen : true;
  const sidebarWidth = isMobile ? 'w-[220px]' : collapsed ? 'w-[60px]' : 'w-[220px]';
  const isExpanded = isMobile ? true : !collapsed;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button (fixed top-left when sidebar hidden) */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-30 p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <IconMenu />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex flex-col shrink-0 border-r border-gray-800 bg-gray-950 transition-all duration-200
          ${sidebarWidth}
          ${isMobile ? `fixed inset-y-0 left-0 z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}` : ''}
        `}
        style={isMobile ? {} : { minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}
      >
        {/* Logo + toggle */}
        <div className={`flex items-center h-14 border-b border-gray-800 px-3 gap-2 shrink-0`}>
          {isExpanded && (
            <a href="/" className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-indigo-400 text-lg leading-none">⚡</span>
              <span className="font-bold text-white text-sm truncate">DocuExtract</span>
            </a>
          )}
          <button
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar ([)' : 'Collapse sidebar ([)'}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors shrink-0 ml-auto"
          >
            <IconMenu />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {mainNav.map((item) => <NavLink key={item.label} item={item} />)}

          {/* DEVELOPER section */}
          <div className={`mt-4 mb-1 ${!isExpanded ? 'hidden' : ''}`}>
            <span className="px-3 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Developer</span>
          </div>
          {!isExpanded && <div className="my-2 border-t border-gray-800/60" />}
          {devNav.map((item) => <NavLink key={item.label} item={item} />)}

          {/* ACCOUNT section */}
          <div className={`mt-4 mb-1 ${!isExpanded ? 'hidden' : ''}`}>
            <span className="px-3 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Account</span>
          </div>
          {!isExpanded && <div className="my-2 border-t border-gray-800/60" />}
          {accountNav.map((item) => <NavLink key={item.label} item={item} />)}
        </nav>

        {/* Bottom: usage bar + sign out */}
        <div className="shrink-0 border-t border-gray-800 px-3 py-3 space-y-3">
          {/* Usage bar */}
          {usage && isExpanded && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-gray-500 capitalize">{usage.plan} plan</span>
                <span className="text-[11px] text-gray-500">{usage.used.toLocaleString()} / {usage.limit.toLocaleString()}</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${usedPct}%`, background: barColor }}
                />
              </div>
              {usedPct >= 80 && (
                <a href="/dashboard/billing" className="mt-1.5 block text-[11px] text-amber-400 hover:text-amber-300">
                  Upgrade plan →
                </a>
              )}
            </div>
          )}

          {/* Usage bar icon-only (collapsed) */}
          {usage && !isExpanded && (
            <div title={`${usage.used} / ${usage.limit} extractions`} className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: barColor }} />
            </div>
          )}

          {/* Sign out */}
          {isExpanded && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 truncate flex-1">{userEmail}</span>
              <button
                onClick={signOut}
                disabled={signingOut}
                className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors shrink-0"
              >
                {signingOut ? '…' : 'Sign out'}
              </button>
            </div>
          )}
          {!isExpanded && (
            <button
              onClick={signOut}
              disabled={signingOut}
              title="Sign out"
              className="w-full flex justify-center text-gray-500 hover:text-gray-300 transition-colors p-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 2H2.5C2 2 1.5 2.5 1.5 3V11C1.5 11.5 2 12 2.5 12H5" />
                <path d="M9.5 4.5L12.5 7L9.5 9.5M4.5 7H12.5" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
