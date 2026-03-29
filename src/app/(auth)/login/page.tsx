'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter — $49/mo',
  pro: 'Pro — $99/mo',
  scale: 'Scale — $249/mo',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? '';
  const isSignup = !!searchParams.get('signup') || !!plan;

  const planLabel = plan ? PLAN_LABELS[plan] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getSupabaseClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${plan ? `?plan=${plan}` : ''}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0f1117; --bg-card: #161b27; --bg-input: #1e2435;
          --border: #2a3147; --border-focus: #6c8ef5;
          --text: #e2e8f0; --text-muted: #8892a4; --text-sub: #5a6478;
          --accent: #6c8ef5; --accent-hover: #5a7ef0; --accent-dim: rgba(108,142,245,0.12);
          --green: #4ade80; --red: #f87171;
          --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        html, body { min-height: 100vh; }
        body { font-family: var(--font); background: var(--bg); color: var(--text); }
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .page::before {
          content: '';
          position: absolute;
          top: -300px; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(108,142,245,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .back-link {
          position: absolute;
          top: 24px; left: 24px;
          display: flex; align-items: center; gap: 6px;
          color: var(--text-muted); font-size: 14px; text-decoration: none;
          transition: color 0.15s;
        }
        .back-link:hover { color: var(--text); }
        .card {
          width: 100%; max-width: 400px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 36px 32px;
          position: relative;
          z-index: 1;
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px; text-decoration: none;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: var(--accent); border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .logo-text { font-size: 18px; font-weight: 700; color: var(--text); }
        .logo-version { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
        .heading { font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: -0.3px; }
        .subheading { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; line-height: 1.5; }
        .plan-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent-dim); border: 1px solid rgba(108,142,245,0.25);
          color: var(--accent); border-radius: 20px;
          padding: 4px 12px; font-size: 12px; font-weight: 600;
          margin-bottom: 20px;
        }
        label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
        input[type=email] {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px; color: var(--text);
          outline: none;
          transition: border-color 0.15s;
          font-family: var(--font);
        }
        input[type=email]::placeholder { color: var(--text-sub); }
        input[type=email]:focus { border-color: var(--border-focus); }
        .error { color: var(--red); font-size: 13px; margin-top: 8px; }
        .submit-btn {
          width: 100%; margin-top: 16px;
          background: var(--accent); color: #fff;
          border: none; border-radius: 8px;
          padding: 12px 0; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
          font-family: var(--font);
        }
        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .divider { text-align: center; color: var(--text-sub); font-size: 12px; margin: 20px 0 16px; position: relative; }
        .divider::before, .divider::after {
          content: ''; position: absolute; top: 50%; width: calc(50% - 20px);
          height: 1px; background: var(--border);
        }
        .divider::before { left: 0; }
        .divider::after { right: 0; }
        .footnote { text-align: center; font-size: 12px; color: var(--text-sub); margin-top: 20px; line-height: 1.6; }
        .footnote a { color: var(--text-muted); text-decoration: none; }
        .footnote a:hover { color: var(--text); }
        .success-box { text-align: center; }
        .success-icon { font-size: 40px; margin-bottom: 14px; }
        .success-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .success-text { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
        .success-text strong { color: var(--text); }
        .retry-link { display: inline-block; margin-top: 16px; color: var(--accent); font-size: 13px; cursor: pointer; background: none; border: none; font-family: var(--font); }
        .retry-link:hover { text-decoration: underline; }
        .features { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
        .feature { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
      `}</style>

      <div className="page">
        <a href="/" className="back-link">← Home</a>

        <div className="card">
          <a href="/" className="logo">
            <div className="logo-icon">📄</div>
            <div>
              <div className="logo-text">DocuExtract</div>
              <div className="logo-version">API v1</div>
            </div>
          </a>

          {sent ? (
            <div className="success-box">
              <div className="success-icon">📬</div>
              <div className="success-title">Check your inbox</div>
              <p className="success-text">
                We sent a magic link to <strong>{email}</strong>.
                Click it to sign in — no password needed.
              </p>
              <button className="retry-link" onClick={() => { setSent(false); setEmail(''); }}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {planLabel && (
                <div className="plan-pill">
                  ✦ Subscribing to {planLabel}
                </div>
              )}
              <div className="heading">{isSignup ? 'Create your account' : 'Welcome back'}</div>
              <div className="subheading">
                {isSignup
                  ? 'Enter your email — we\'ll send you a magic link to create your account and go straight to your dashboard.'
                  : 'Enter your email and we\'ll send you a magic link to sign in.'}
              </div>

              <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoFocus
                />
                {error && <p className="error">{error}</p>}
                <button type="submit" className="submit-btn" disabled={loading || !email}>
                  {loading ? 'Sending link…' : isSignup ? 'Create account & continue →' : 'Continue with email →'}
                </button>
              </form>

              <div className="features">
                <div className="feature"><div className="feature-dot" /> No password required — magic link sign-in</div>
                <div className="feature"><div className="feature-dot" /> Free tier: 100 extractions/month, no card needed</div>
                <div className="feature"><div className="feature-dot" /> API key ready in your dashboard immediately</div>
              </div>
            </>
          )}
        </div>

        <p className="footnote" style={{ marginTop: '20px', maxWidth: '400px' }}>
          By signing in you agree to our{' '}
          <a href="/docs#pricing">Terms of Service</a> and{' '}
          <a href="/docs">Privacy Policy</a>.
        </p>
      </div>
    </>
  );
}
