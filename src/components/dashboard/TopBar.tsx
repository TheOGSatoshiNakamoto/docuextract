'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function TopBar() {
  const [userName, setUserName] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const email = session.user.email ?? '';
      const name = session.user.user_metadata?.full_name || email.split('@')[0] || 'User';
      setUserName(name);
      setUserAvatar(session.user.user_metadata?.avatar_url || '');

      const { data } = await supabase
        .from('users')
        .select('plan')
        .eq('id', session.user.id)
        .single();
      if (data?.plan) setUserPlan(data.plan);
    });
  }, []);

  return (
    <header className="bg-[#0a0c12]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-outline-variant/10 flex justify-between items-center px-6 md:px-8 py-3 w-full">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">
            search
          </span>
          <input
            className="bg-surface-container-lowest border-none text-xs text-on-surface-variant w-64 md:w-80 pl-10 pr-4 py-2.5 rounded-lg focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-on-surface-variant/30"
            placeholder="Search resources, logs, or documentation..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        <div className="h-6 w-px bg-outline-variant/15 mx-1" />
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-on-surface font-headline">{userName}</p>
            <p className="text-[10px] text-primary font-headline uppercase tracking-wider capitalize">{userPlan} Plan</p>
          </div>
          {userAvatar ? (
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full border border-primary/20"
              src={userAvatar}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-on-surface-variant/60">person</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
