'use client';

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">API Logs</h1>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          Coming soon
        </span>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          View real-time request and response logs for all your API calls.
        </p>
        <a
          href="/dashboard"
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Back to Overview
        </a>
      </div>
    </div>
  );
}
