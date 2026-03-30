'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function KeysPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from('users')
        .select('api_key')
        .eq('id', session.user.id)
        .single();
      if (data) setApiKey(data.api_key);
    });
  }, []);

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  async function regenerateKey() {
    setRegenerating(true);
    setConfirmRegen(false);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('regenerate_my_api_key');
    if (!error && data) {
      setApiKey(data);
      setRevealed(true);
      setSuccessMsg('New API key generated. Copy it now — it won\'t be shown again in full.');
      setTimeout(() => setSuccessMsg(''), 6000);
    }
    setRegenerating(false);
  }

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(24)}${apiKey.slice(-4)}` : '–';

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">API Keys</h1>
        <p className="text-gray-400 text-sm mb-8">
          Use your API key to authenticate requests. Keep it secret.
        </p>

        {successMsg && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3 mb-6">
            {successMsg}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-medium text-sm">Secret API key</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Pass this as <code className="text-gray-400">Authorization: Bearer &lt;key&gt;</code>
              </p>
            </div>
            <button
              onClick={() => setRevealed(r => !r)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {revealed ? 'Hide' : 'Reveal'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-300 font-mono truncate">
              {revealed ? apiKey : maskedKey}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 text-xs text-gray-400 hover:text-white px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 transition-colors"
            >
              {copying ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Usage example */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <p className="text-gray-400 text-sm font-medium mb-3">Example usage</p>
          <pre className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto">{`curl ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuextract.dev'}/v1/extract \\
  -H "Authorization: Bearer ${revealed && apiKey ? apiKey : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"document": "https://example.com/invoice.pdf"}'`}</pre>
        </div>

        {/* Regenerate */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white text-sm font-medium">Regenerate API key</p>
              <p className="text-gray-500 text-xs mt-1">
                Your current key will be immediately invalidated. Any integrations using it will stop working.
              </p>
            </div>
            {confirmRegen ? (
              <div className="flex gap-2 shrink-0 ml-4">
                <button
                  onClick={() => setConfirmRegen(false)}
                  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={regenerateKey}
                  disabled={regenerating}
                  className="text-xs text-white bg-red-700 hover:bg-red-600 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {regenerating ? 'Regenerating…' : 'Confirm'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRegen(true)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0 ml-4"
              >
                Regenerate
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
