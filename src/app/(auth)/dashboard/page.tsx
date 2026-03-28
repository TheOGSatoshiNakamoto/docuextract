'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://docuextract-azure.vercel.app';

interface UsageData {
  used: number;
  limit: number;
  plan: string;
  period_end: string;
  breakdown: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [copyLabel, setCopyLabel] = useState('Copy');

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUser(session.user);

      const { data } = await supabase
        .from('users')
        .select('api_key, plan')
        .eq('id', session.user.id)
        .single();
      if (data) setApiKey(data.api_key);

      try {
        const res = await fetch(`${API_BASE}/v1/usage`, {
          headers: { Authorization: `Bearer ${data?.api_key}` },
        });
        if (res.ok) setUsage(await res.json());
      } catch {
        // non-blocking
      } finally {
        setLoadingUsage(false);
      }
    });
  }, []);

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy'), 2000);
  }

  const usedPct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardNav user={user} activeTab="overview" />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
        <p className="text-gray-400 text-sm mb-8">{user?.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Usage card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Extractions this month</span>
              <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                {usage?.plan ?? '…'}
              </span>
            </div>
            {loadingUsage ? (
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  {usage?.used?.toLocaleString() ?? 0}
                  <span className="text-base text-gray-500 font-normal ml-1">
                    / {usage?.limit?.toLocaleString() ?? '–'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full mt-3">
                  <div
                    className="h-1.5 bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                {usage?.period_end && (
                  <p className="text-xs text-gray-600 mt-2">
                    Resets {new Date(usage.period_end).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>

          {/* API key card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">API Key</span>
              <a href="/dashboard/keys" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Manage →
              </a>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono truncate">
                {apiKey ? `${apiKey.slice(0, 12)}${'•'.repeat(20)}` : '–'}
              </code>
              <button
                onClick={copyKey}
                disabled={!apiKey}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded bg-gray-800 border border-gray-700"
              >
                {copyLabel}
              </button>
            </div>
          </div>
        </div>

        {/* Quick start */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Quick start</h2>
          <pre className="bg-gray-950 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-x-auto">{`curl -X POST https://docuextract-azure.vercel.app/v1/extract \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"document": "<base64_or_url>", "type": "invoice"}'`}</pre>
          <div className="flex gap-3 mt-4">
            <a href="/docs" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Read the docs →
            </a>
            <a href="/playground" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Try the playground →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
