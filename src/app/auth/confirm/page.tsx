'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * Handles implicit-flow auth callbacks (magic links).
 * Supabase magic links redirect with tokens in the URL hash fragment:
 *   #access_token=...&refresh_token=...&expires_in=...&token_type=bearer
 * The server can't read hash fragments, so this client-side page
 * extracts the tokens and sets the session via the Supabase client.
 */
export default function AuthConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      const supabase = getSupabaseClient();
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            router.replace('/login?error=confirmation_failed');
          } else {
            router.replace('/dashboard');
          }
        });
    } else {
      // No tokens in hash — redirect to login
      router.replace('/login?error=confirmation_failed');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Signing you in...</div>
    </div>
  );
}
