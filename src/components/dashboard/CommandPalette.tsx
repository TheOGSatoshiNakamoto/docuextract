'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty, CommandSeparator } from 'cmdk';
import { getSupabaseClient } from '@/lib/supabase';
import { tocItems } from '@/content/docs-data';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: 'dashboard' },
  { label: 'Extractions', href: '/dashboard/extractions', icon: 'description' },
  { label: 'Playground', href: '/playground', icon: 'terminal' },
  { label: 'API Keys', href: '/dashboard/keys', icon: 'vpn_key' },
  { label: 'Documentation', href: '/dashboard/docs', icon: 'menu_book' },
  { label: 'Webhooks', href: '/dashboard/webhooks', icon: 'webhook' },
  { label: 'Logs', href: '/dashboard/logs', icon: 'list_alt' },
  { label: 'Usage', href: '/dashboard/usage', icon: 'bar_chart' },
  { label: 'Billing', href: '/dashboard/billing', icon: 'credit_card' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
];

const actionItems = [
  { label: 'Copy API key', icon: 'content_copy', id: 'copy-key' },
  { label: 'Try the playground', icon: 'play_arrow', href: '/playground' },
  { label: 'View current usage', icon: 'bar_chart', href: '/dashboard/usage' },
  { label: 'Open docs', icon: 'menu_book', href: '/dashboard/docs' },
  { label: 'View billing', icon: 'credit_card', href: '/dashboard/billing' },
  { label: 'Sign out', icon: 'logout', id: 'sign-out' },
];

const docItems = tocItems.flatMap((group) =>
  group.items
    .filter((item) => item.href.startsWith('#'))
    .map((item) => ({
      label: item.label,
      group: group.group,
      href: `/dashboard/docs${item.href}`,
      method: 'method' in item ? (item.method as string) : undefined,
    }))
);

function addRecent(href: string) {
  try {
    const key = 'docuextract-recent-pages';
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    const updated = [href, ...stored.filter((h) => h !== href)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch { /* SSR safe */ }
}

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem('docuextract-recent-pages') || '[]');
  } catch { return []; }
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [toast, setToast] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const navigate = useCallback((href: string) => {
    addRecent(href);
    onClose();
    router.push(href);
  }, [router, onClose]);

  const handleAction = useCallback(async (id: string) => {
    if (id === 'copy-key') {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data } = await supabase
          .from('users')
          .select('api_key')
          .eq('id', session.user.id)
          .single();
        if (data?.api_key) {
          await navigator.clipboard.writeText(data.api_key);
          setToast('API key copied to clipboard');
        }
      } catch { setToast('Failed to copy API key'); }
      onClose();
    } else if (id === 'sign-out') {
      onClose();
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.replace('/login');
    }
  }, [onClose, router]);

  const recentNavItems = recent
    .map((href) => navItems.find((n) => n.href === href))
    .filter(Boolean);

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={(v) => { if (!v) onClose(); }}
        label="Command palette"
      >
        <div className="flex flex-col bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden shadow-2xl max-w-[600px] w-full mx-auto">
          <div className="flex items-center gap-3 px-4 border-b border-outline-variant/15">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">search</span>
            <CommandInput
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface py-3.5 placeholder:text-on-surface-variant/30 font-body"
            />
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto p-2">
            <CommandEmpty className="py-8 text-center text-sm text-on-surface-variant/50">
              No results found.
            </CommandEmpty>

            {recentNavItems.length > 0 && (
              <CommandGroup heading="Recent">
                {recentNavItems.map((item) => item && (
                  <CommandItem
                    key={`recent-${item.href}`}
                    value={`recent ${item.label}`}
                    onSelect={() => navigate(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-base opacity-60">{item.icon}</span>
                    <span className="text-xs font-body">{item.label}</span>
                    <span className="ml-auto text-[10px] text-on-surface-variant/30 font-headline uppercase tracking-widest">Go to</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Navigation">
              {navItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => navigate(item.href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-base opacity-60">{item.icon}</span>
                  <span className="text-xs font-body">{item.label}</span>
                  <span className="ml-auto text-[10px] text-on-surface-variant/30 font-headline uppercase tracking-widest">Go to</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="my-1 h-px bg-outline-variant/10" />

            <CommandGroup heading="Actions">
              {actionItems.map((item) => (
                <CommandItem
                  key={item.label}
                  value={item.label}
                  onSelect={() => item.href ? navigate(item.href) : handleAction(item.id!)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-base opacity-60">{item.icon}</span>
                  <span className="text-xs font-body">{item.label}</span>
                  <span className="ml-auto text-[10px] text-on-surface-variant/30 font-headline uppercase tracking-widest">Run</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="my-1 h-px bg-outline-variant/10" />

            <CommandGroup heading="Documentation">
              {docItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.group} ${item.label}`}
                  onSelect={() => navigate(item.href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-base opacity-60">article</span>
                  <span className="text-xs font-body">{item.label}</span>
                  <span className="ml-auto text-[10px] text-on-surface-variant/30 font-headline uppercase tracking-widest">{item.group}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-outline-variant/15 text-[10px] text-on-surface-variant/40 font-headline uppercase tracking-[0.15em]">
            <span>↑↓ navigate</span>
            <span>⏎ select</span>
            <span>esc close</span>
          </div>
        </div>
      </CommandDialog>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-surface-container-highest border border-outline-variant/20 text-on-surface text-xs font-body px-4 py-2.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </>
  );
}
