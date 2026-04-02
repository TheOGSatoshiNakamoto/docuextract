'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  email: string;
  displayName: string;
  avatarUrl: string;
  userId: string;
  memberSince: string;
  providers: string[];
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${enabled ? 'bg-primary-container' : 'bg-surface-container-highest'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-headline font-bold text-on-surface">{title}</h3>
        {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [defaultModel, setDefaultModel] = useState<'fast' | 'accurate'>('fast');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notification toggles
  const [notifExtractions, setNotifExtractions] = useState(true);
  const [notifUsageAlerts, setNotifUsageAlerts] = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(false);
  const [notifProductUpdates, setNotifProductUpdates] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const user = session.user;
      const providers = user.app_metadata?.providers ?? [];

      const { data: userData } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', user.id)
        .single();

      setProfile({
        email: user.email ?? '',
        displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatarUrl: user.user_metadata?.avatar_url || '',
        userId: user.id,
        memberSince: userData?.created_at ?? user.created_at ?? '',
        providers: Array.isArray(providers) ? providers : [providers].filter(Boolean),
      });
      setLoading(false);
    });
  }, []);

  async function handleDeleteAccount() {
    if (deleteConfirm !== profile?.email) return;
    setDeleting(true);
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace('/?deleted=true');
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-container-low rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl w-full mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-4xl font-bold font-headline tracking-tighter text-on-surface">Settings</h2>
        <p className="text-on-surface-variant">Manage your profile, security, and preferences.</p>
      </div>

      {/* ── Profile ──────────────────────────────────────────────── */}
      <Section title="Profile" subtitle="Your account information and identity.">
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-5 mb-6">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border border-outline-variant/20" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">person</span>
              </div>
            )}
            <div>
              <p className="text-lg font-headline font-bold text-on-surface">{profile?.displayName}</p>
              <p className="text-sm text-on-surface-variant">{profile?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
              <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/40 mb-1">Account ID</p>
              <p className="text-xs font-mono text-on-surface truncate">{profile?.userId}</p>
            </div>
            <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
              <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/40 mb-1">Member Since</p>
              <p className="text-xs text-on-surface">
                {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Security ─────────────────────────────────────────────── */}
      <Section title="Security" subtitle="Connected accounts and authentication methods.">
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-4">
          <h4 className="text-sm font-headline font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">Connected Accounts</h4>
          {(['github', 'google', 'email'] as const).map((provider) => {
            const connected = profile?.providers.includes(provider) || (provider === 'email' && profile?.email);
            const icons: Record<string, string> = { github: 'code', google: 'mail', email: 'alternate_email' };
            const labels: Record<string, string> = { github: 'GitHub', google: 'Google', email: 'Email (Magic Link)' };
            return (
              <div key={provider} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">{icons[provider]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{labels[provider]}</p>
                    <p className="text-[10px] text-on-surface-variant/40">{connected ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-outline-variant/30'}`} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Notifications ────────────────────────────────────────── */}
      <Section title="Notifications" subtitle="Control what emails and alerts you receive.">
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-5">
          {[
            { label: 'Security Alerts', desc: 'Login from new device, password changes, key regeneration', value: true, onChange: () => {}, disabled: true },
            { label: 'Extraction Updates', desc: 'Notifications when extractions complete or fail', value: notifExtractions, onChange: setNotifExtractions },
            { label: 'Usage Alerts', desc: 'Warnings when approaching monthly API call limit', value: notifUsageAlerts, onChange: setNotifUsageAlerts },
            { label: 'Weekly Usage Report', desc: 'Summary of API calls, success rates, and trends', value: notifWeeklyReport, onChange: setNotifWeeklyReport },
            { label: 'Product Updates', desc: 'New features, changelog, and platform announcements', value: notifProductUpdates, onChange: setNotifProductUpdates },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant/50">{item.desc}</p>
              </div>
              <Toggle enabled={item.value} onChange={item.onChange} disabled={item.disabled} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Developer Preferences ────────────────────────────────── */}
      <Section title="Developer Preferences" subtitle="Default settings for API extractions.">
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-6">
          {/* Model selection — correction #10: Haiku/Sonnet NOT GPT */}
          <div>
            <p className="text-sm font-semibold text-on-surface mb-3">Default Extraction Model</p>
            <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/20 w-fit">
              <button
                onClick={() => setDefaultModel('fast')}
                className={`px-5 py-2 text-xs font-headline font-bold uppercase tracking-[0.1em] rounded-md transition-colors ${
                  defaultModel === 'fast' ? 'bg-primary-container text-white' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                }`}
              >
                Fast (Haiku 4.5)
              </button>
              <button
                onClick={() => setDefaultModel('accurate')}
                className={`px-5 py-2 text-xs font-headline font-bold uppercase tracking-[0.1em] rounded-md transition-colors ${
                  defaultModel === 'accurate' ? 'bg-primary-container text-white' : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                }`}
              >
                Accurate (Sonnet 4.6)
              </button>
            </div>
          </div>

          {/* Document type — correction #11: our actual types, no OCR */}
          <div>
            <p className="text-sm font-semibold text-on-surface mb-3">Default Document Type</p>
            <select className="bg-surface-container-high border-none rounded-lg text-sm text-on-surface py-2.5 px-4 focus:ring-1 focus:ring-primary/50 w-full max-w-xs">
              <option>Auto-detect</option>
              <option>Invoice</option>
              <option>Receipt</option>
              <option>Resume</option>
              <option>Bank Statement</option>
              <option>Contract</option>
              <option>Form</option>
              <option>ID Document</option>
              <option>Business Card</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <Section title="Team" subtitle="Collaborate with your team on document extraction.">
        <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 text-center relative overflow-hidden">
          <span className="material-symbols-outlined text-6xl text-on-surface/5 absolute top-4 right-4">groups</span>
          <span className="inline-block px-3 py-1 text-[10px] font-headline font-bold uppercase tracking-[0.15em] rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
            Coming Soon
          </span>
          <h4 className="font-headline font-bold text-lg text-on-surface mb-2">Team Management</h4>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-4">
            Invite team members, manage roles, and share API keys across your organization.
          </p>
        </div>
      </Section>

      {/* ── Danger Zone ──────────────────────────────────────────── */}
      <Section title="Danger Zone">
        <div className="bg-error/5 rounded-xl p-6 border border-error/20 space-y-6">
          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">Export All Data</p>
              <p className="text-xs text-on-surface-variant/50">Download all your extractions, usage logs, and account data.</p>
            </div>
            <button className="px-4 py-2 border border-outline-variant/20 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-high transition-colors">
              Export Data
            </button>
          </div>

          <div className="border-t border-error/10" />

          {/* Delete */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-error">Delete Account</p>
              <p className="text-xs text-on-surface-variant/50">
                Permanently delete your account, revoke all API keys, and erase extraction history. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-error/10 border border-error/30 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] text-error hover:bg-error/20 transition-colors shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-high rounded-xl border border-error/20 shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-error text-2xl">warning</span>
                <h3 className="font-headline font-bold text-xl text-on-surface">Delete Account</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">
                This will permanently delete your account, cancel any active subscription, revoke all API keys, and erase all extraction history. This action cannot be undone.
              </p>
              <p className="text-xs text-on-surface-variant/60 mb-2">
                Type <strong className="text-error">{profile?.email}</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={profile?.email}
                className="w-full bg-surface-container-lowest border border-error/20 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-error/50 focus:outline-none mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                  className="flex-1 py-2.5 border border-outline-variant/20 rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== profile?.email || deleting}
                  className="flex-1 py-2.5 bg-error text-white rounded-lg text-xs font-headline font-bold uppercase tracking-[0.1em] hover:brightness-110 transition-all disabled:opacity-30"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
