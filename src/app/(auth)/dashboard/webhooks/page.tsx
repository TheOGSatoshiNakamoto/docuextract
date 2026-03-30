'use client';

export default function WebhooksPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Webhooks</h1>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          Coming soon
        </span>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Configure webhook endpoints to receive real-time notifications when extractions complete.
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
