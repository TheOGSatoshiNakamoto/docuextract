'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const tabs = [
  { key: 'overview', label: 'Overview', href: '/dashboard' },
  { key: 'keys', label: 'API Keys', href: '/dashboard/keys' },
  { key: 'usage', label: 'Usage', href: '/dashboard/usage' },
  { key: 'billing', label: 'Billing', href: '/dashboard/billing' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

interface Props {
  user: { email?: string } | null;
  activeTab: TabKey;
}

export default function DashboardNav({ user, activeTab }: Props) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <a href="/" className="text-white font-semibold flex items-center gap-1.5 text-sm">
            <span>⚡</span> DocuExtract
          </a>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {user?.email && <span className="hidden sm:inline mr-2">{user.email}</span>}
            <button
              onClick={signOut}
              disabled={signingOut}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
        <nav className="flex gap-0 -mb-px">
          {tabs.map(tab => (
            <a
              key={tab.key}
              href={tab.href}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
