'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import CommandPalette from './CommandPalette';
import FeedbackWidget from './FeedbackWidget';

export default function TopBar() {
  const [userName, setUserName] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [userAvatar, setUserAvatar] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setFeedbackOpen(false);
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    <header className="bg-[#0a0c12]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-outline-variant/10 py-3 w-full">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-8 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 bg-surface-container-lowest text-xs text-on-surface-variant/30 w-64 md:w-80 pl-3 pr-3 py-2.5 rounded-lg hover:bg-surface-container-low transition-all text-left"
        >
          <span className="material-symbols-outlined text-sm">search</span>
          <span className="flex-1">Search or jump to...</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[11px] font-mono bg-surface-container-high text-on-surface-variant/60 rounded border border-outline-variant/20">{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-mono bg-surface-container-high text-on-surface-variant/60 rounded border border-outline-variant/20">K</kbd>
          </span>
        </button>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
      <div className="flex items-center gap-3">
        <FeedbackWidget
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onOpen={() => setFeedbackOpen(true)}
        />
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
      </div>
    </header>
  );
}
