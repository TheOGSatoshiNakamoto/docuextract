'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useOnboardingStatus } from '@/hooks/useOnboarding';
import Link from 'next/link';

interface UsageMini {
  used: number;
  limit: number;
  plan: string;
  resetDate: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  external?: boolean;
  badge?: string;
  showWhen?: boolean;
  id?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [usage, setUsage] = useState<UsageMini | null>(null);
  const [hasExtractions, setHasExtractions] = useState(false);
  const { isComplete: onboardingComplete } = useOnboardingStatus();
  const [signingOut, setSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
      if (localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* SSR safe */ }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => {
        const next = !c;
        try { localStorage.setItem('sidebar-collapsed', String(next)); } catch { /* SSR */ }
        return next;
      });
    }
  }, [isMobile]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
        const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const resetStr = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setUsage({ used, limit: data.monthly_limit ?? 100, plan: data.plan ?? 'free', resetDate: resetStr });
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

  const usedPct = usage && usage.limit > 0 ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const barColorClass = usedPct >= 95 ? 'bg-error' : usedPct >= 80 ? 'bg-amber-500' : 'bg-primary-container';

  // Overview is always visible. Quick Start only shows for new users.
  // When both are visible at /dashboard, Quick Start is the active one
  // (because the page renders Quick Start content). After skip/complete,
  // Quick Start disappears and Overview becomes active.
  const coreNav: NavItem[] = [
    { label: 'Quick Start', href: '/dashboard', icon: 'rocket_launch', showWhen: !onboardingComplete, id: 'quickstart' },
    { label: 'Overview', href: '/dashboard', icon: 'dashboard', id: 'overview' },
    { label: 'Extractions', href: '/dashboard/extractions', icon: 'description' },
    { label: 'Playground', href: '/playground', icon: 'terminal' },
  ];

  const infraNav: NavItem[] = [
    { label: 'API Keys', href: '/dashboard/keys', icon: 'vpn_key' },
    { label: 'Documentation', href: '/docs', icon: 'menu_book', external: true },
    { label: 'Webhooks', href: '/dashboard/webhooks', icon: 'webhook' },
    { label: 'Logs', href: '/dashboard/logs', icon: 'list_alt' },
  ];

  const accountNav: NavItem[] = [
    { label: 'Usage', href: '/dashboard/usage', icon: 'bar_chart' },
    { label: 'Billing', href: '/dashboard/billing', icon: 'credit_card' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  ];

  function isActive(item: NavItem) {
    if (item.href === '/dashboard') {
      if (pathname !== '/dashboard') return false;
      // Both Quick Start and Overview point to /dashboard —
      // only one should highlight based on onboarding state
      if (item.id === 'quickstart') return !onboardingComplete;
      if (item.id === 'overview') return onboardingComplete;
      return true;
    }
    return pathname.startsWith(item.href);
  }

  const isExpanded = isMobile ? true : !collapsed;
  const sidebarWidth = isMobile ? 'w-64' : collapsed ? 'w-[60px]' : 'w-64';

  function NavLink({ item }: { item: NavItem }) {
    if (item.showWhen === false) return null;
    const active = isActive(item);
    const Comp = item.external ? 'a' : Link;
    const extraProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
      <Comp
        href={item.href}
        {...extraProps}
        title={!isExpanded ? item.label : undefined}
        className={`
          flex items-center gap-3 px-3 py-2 transition-all duration-150
          ${active
            ? 'bg-primary/10 text-primary border-r-2 border-primary'
            : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high'
          }
        `}
      >
        <span className="material-symbols-outlined text-lg shrink-0">{item.icon}</span>
        {isExpanded && (
          <>
            <span className="font-headline uppercase text-[10px] tracking-[0.15em] truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-1.5 py-0.5 text-[8px] font-headline uppercase tracking-widest bg-surface-container-highest text-on-surface-variant/60 rounded">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Comp>
    );
  }

  function NavSection({ label, items }: { label: string; items: NavItem[] }) {
    return (
      <div>
        {isExpanded ? (
          <p className="font-headline uppercase text-[10px] tracking-[0.2em] text-on-surface-variant/40 mb-2 px-3 pt-4">
            {label}
          </p>
        ) : (
          <div className="my-2 mx-3 border-t border-outline-variant/15" />
        )}
        <div className="space-y-0.5">
          {items.map((item) => <NavLink key={item.label} item={item} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-30 p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-lg">menu</span>
        </button>
      )}

      <aside
        className={`
          flex flex-col shrink-0 bg-[#0a0c12] transition-all duration-200
          ${sidebarWidth}
          ${isMobile
            ? `fixed inset-y-0 left-0 z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'sticky top-0 h-screen overflow-y-auto'
          }
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 gap-3 shrink-0">
          {isExpanded ? (
            <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm text-white">description</span>
              </div>
              <span className="text-lg font-black text-primary/90 font-headline leading-tight truncate">
                DocuExtract
              </span>
            </Link>
          ) : (
            <Link href="/" className="w-8 h-8 bg-primary-container rounded flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-sm text-white">description</span>
            </Link>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              title={collapsed ? 'Expand sidebar ([)' : 'Collapse sidebar ([)'}
              className="p-1 rounded text-on-surface-variant/40 hover:text-on-surface-variant transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {collapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <NavSection label="Core Access" items={coreNav} />
          <NavSection label="Infrastructure" items={infraNav} />
          <NavSection label="Account" items={accountNav} />
        </nav>

        {/* Bottom: usage bar + plan + sign out */}
        <div className="shrink-0 px-3 py-4 space-y-3">
          {/* Usage bar */}
          {usage && isExpanded && (
            <div className="bg-surface-container-low rounded-lg p-3">
              <p className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant/50 mb-1.5">
                API Calls
              </p>
              <p className="font-mono text-sm text-on-surface">
                {usage.used.toLocaleString()} <span className="text-on-surface-variant/40">/ {usage.limit.toLocaleString()}</span>
              </p>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full ${barColorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant/40 mt-1.5">Resets {usage.resetDate}</p>
            </div>
          )}

          {/* Collapsed usage bar */}
          {usage && !isExpanded && (
            <div title={`${usage.used} / ${usage.limit} API calls`} className="h-1 bg-surface-container-highest rounded-full overflow-hidden mx-1">
              <div className={`h-full ${barColorClass} rounded-full`} style={{ width: `${usedPct}%` }} />
            </div>
          )}

          {/* Plan badge + upgrade */}
          {usage && isExpanded && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-headline uppercase tracking-[0.15em] text-on-surface-variant/50 capitalize">
                {usage.plan} Plan
              </span>
              {usage.plan === 'free' && (
                <Link href="/dashboard/billing" className="text-[10px] font-headline uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors">
                  Upgrade
                </Link>
              )}
            </div>
          )}

          {/* Support link */}
          {isExpanded && (
            <a
              href="mailto:support@docuextract.dev"
              className="flex items-center gap-3 px-3 py-1.5 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-base">help</span>
              <span className="font-headline uppercase text-[10px] tracking-[0.15em]">Support</span>
            </a>
          )}

          {/* User + sign out */}
          <div className={`flex items-center gap-2 px-1 pt-2 border-t border-outline-variant/10 ${!isExpanded ? 'justify-center' : ''}`}>
            {isExpanded && (
              <span className="text-[10px] text-on-surface-variant/40 truncate flex-1">{userEmail}</span>
            )}
            <button
              onClick={signOut}
              disabled={signingOut}
              title="Sign out"
              className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors shrink-0 p-1"
            >
              <span className="material-symbols-outlined text-base">{signingOut ? 'hourglass_empty' : 'logout'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
