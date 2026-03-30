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
  const [oauthLoading, setOauthLoading] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? '';
  const isSignup = !!searchParams.get('signup') || !!plan;

  const planLabel = plan ? PLAN_LABELS[plan] : null;
  const oauthRedirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${plan ? `?plan=${plan}` : ''}`;
  const magicLinkRedirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm${plan ? `?plan=${plan}` : ''}`;

  async function handleOAuth(provider: 'github' | 'google') {
    setOauthLoading(provider);
    setError('');
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: oauthRedirectTo },
    });
    if (error) {
      setError(error.message);
      setOauthLoading('');
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: magicLinkRedirectTo },
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
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 24px;
          position: relative; overflow: hidden;
        }
        .page::before {
          content: ''; position: absolute; top: -300px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(108,142,245,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .back-link {
          position: absolute; top: 24px; left: 24px;
          display: flex; align-items: center; gap: 6px;
          color: var(--text-muted); font-size: 14px; text-decoration: none; transition: color 0.15s;
        }
        .back-link:hover { color: var(--text); }

        .card {
          width: 100%; max-width: 400px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 14px; padding: 36px 32px;
          position: relative; z-index: 1;
        }
        .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; text-decoration: none; }
        .logo-text { font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
        .logo-text span { color: var(--accent); }

        .heading { font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: -0.3px; }
        .subheading { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }
        .plan-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent-dim); border: 1px solid rgba(108,142,245,0.25);
          color: var(--accent); border-radius: 20px;
          padding: 4px 12px; font-size: 12px; font-weight: 600; margin-bottom: 20px;
        }

        /* OAuth buttons */
        .oauth-btn {
          width: 100%; padding: 11px 16px; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; font-family: var(--font);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          border: none;
        }
        .oauth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .oauth-github {
          background: #fff; color: #111;
        }
        .oauth-github:hover:not(:disabled) { background: #f0f0f0; }
        .oauth-google {
          background: transparent; color: var(--text);
          border: 1px solid var(--border); margin-top: 10px;
        }
        .oauth-google:hover:not(:disabled) { border-color: var(--text-muted); }

        .divider {
          text-align: center; color: var(--text-sub); font-size: 12px;
          margin: 20px 0; position: relative;
        }
        .divider::before, .divider::after {
          content: ''; position: absolute; top: 50%; width: calc(50% - 20px);
          height: 1px; background: var(--border);
        }
        .divider::before { left: 0; }
        .divider::after { right: 0; }

        .email-toggle {
          display: block; width: 100%; text-align: center;
          background: none; border: none; color: var(--text-muted);
          font-size: 13px; cursor: pointer; font-family: var(--font);
          padding: 8px; transition: color 0.15s;
        }
        .email-toggle:hover { color: var(--accent); }

        label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
        input[type=email] {
          width: 100%; background: var(--bg-input); border: 1px solid var(--border);
          border-radius: 8px; padding: 11px 14px; font-size: 14px; color: var(--text);
          outline: none; transition: border-color 0.15s; font-family: var(--font);
        }
        input[type=email]::placeholder { color: var(--text-sub); }
        input[type=email]:focus { border-color: var(--border-focus); }
        .error { color: var(--red); font-size: 13px; margin-top: 8px; }
        .submit-btn {
          width: 100%; margin-top: 12px; background: var(--accent); color: #fff;
          border: none; border-radius: 8px; padding: 11px 0; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: var(--font);
        }
        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .features {
          margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 8px;
        }
        .feature { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
        .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }

        .success-box { text-align: center; }
        .success-icon { font-size: 40px; margin-bottom: 14px; }
        .success-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .success-text { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
        .success-text strong { color: var(--text); }
        .retry-link { display: inline-block; margin-top: 16px; color: var(--accent); font-size: 13px; cursor: pointer; background: none; border: none; font-family: var(--font); }
        .retry-link:hover { text-decoration: underline; }

        .footnote { text-align: center; font-size: 12px; color: var(--text-sub); margin-top: 20px; max-width: 400px; line-height: 1.6; }
        .footnote a { color: var(--text-muted); text-decoration: none; }
        .footnote a:hover { color: var(--text); }
      `}</style>

      <div className="page">
        <a href="/" className="back-link">← Home</a>

        <div className="card">
          <a href="/" className="logo">
            <span className="logo-text">Docu<span>Extract</span></span>
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
                <div className="plan-pill">✦ Subscribing to {planLabel}</div>
              )}

              <div className="heading">{isSignup ? 'Create your account' : 'Welcome back'}</div>
              <div className="subheading">
                {isSignup
                  ? 'Sign up in one click — no password needed. Your API key will be ready instantly.'
                  : 'Sign in to your DocuExtract dashboard.'}
              </div>

              {/* GitHub OAuth — Primary */}
              <button
                className="oauth-btn oauth-github"
                onClick={() => handleOAuth('github')}
                disabled={!!oauthLoading}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                {oauthLoading === 'github' ? 'Redirecting...' : 'Continue with GitHub'}
              </button>

              {/* Google OAuth — Secondary */}
              <button
                className="oauth-btn oauth-google"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.43l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>

              {/* Divider + Magic Link */}
              <div className="divider">or</div>

              {!showEmail ? (
                <button className="email-toggle" onClick={() => setShowEmail(true)}>
                  Continue with email (magic link) →
                </button>
              ) : (
                <form onSubmit={handleMagicLink}>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                  />
                  {error && <p className="error">{error}</p>}
                  <button type="submit" className="submit-btn" disabled={loading || !email}>
                    {loading ? 'Sending link...' : 'Send magic link →'}
                  </button>
                </form>
              )}

              {error && !showEmail && <p className="error" style={{ textAlign: 'center' }}>{error}</p>}

              <div className="features">
                <div className="feature"><div className="feature-dot" /> No password — one-click OAuth or magic link</div>
                <div className="feature"><div className="feature-dot" /> Free tier: 100 extractions/month, no credit card</div>
                <div className="feature"><div className="feature-dot" /> API key ready in your dashboard instantly</div>
              </div>
            </>
          )}
        </div>

        <p className="footnote">
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </>
  );
}
