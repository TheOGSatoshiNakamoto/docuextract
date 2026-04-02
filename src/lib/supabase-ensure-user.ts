/**
 * Ensures the public.users row exists for the current auth user.
 *
 * Migration 008 made the auth trigger defensive — if the INSERT INTO
 * public.users fails during signup, the error is silently swallowed.
 * This leaves the auth user with no public.users row, no API key,
 * and a completely broken dashboard.
 *
 * This function detects the missing row and creates it via the
 * create_user_with_api_key RPC (migration 007), which is idempotent
 * (ON CONFLICT DO NOTHING).
 *
 * Call this from any dashboard page that queries public.users and gets null.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function ensureUserRow(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<{ api_key: string; plan: string; monthly_limit: number } | null> {
  // Generate a key client-side to pass to the RPC
  // The RPC will hash it server-side with bcrypt
  const keyBytes = new Uint8Array(24);
  crypto.getRandomValues(keyBytes);
  const hex = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const newApiKey = `dk_live_${hex}`;

  const { error: rpcError } = await supabase.rpc('create_user_with_api_key', {
    p_user_id: userId,
    p_email: email,
    p_api_key: newApiKey,
  });

  if (rpcError) {
    console.error('Failed to create user row:', rpcError);
    return null;
  }

  // Re-fetch the user row (might have been created by trigger with a different key)
  const { data } = await supabase
    .from('users')
    .select('api_key, plan, monthly_limit')
    .eq('id', userId)
    .single();

  return data;
}
