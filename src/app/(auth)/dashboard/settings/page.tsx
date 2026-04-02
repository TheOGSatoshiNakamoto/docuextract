'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(180,197,255,0.15)]">
        <span className="material-symbols-outlined text-3xl text-primary">settings</span>
      </div>
      <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Settings</h2>
      <span className="inline-block px-3 py-1 text-[10px] font-headline font-bold uppercase tracking-[0.15em] rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
        Coming Soon
      </span>
      <p className="text-on-surface-variant text-sm leading-relaxed max-w-md mb-8">
        Manage your profile, notification preferences, and account settings.
      </p>
      <Link
        href="/dashboard"
        className="text-sm text-primary hover:underline font-headline uppercase tracking-[0.15em]"
      >
        &larr; Back to Overview
      </Link>
    </div>
  );
}
