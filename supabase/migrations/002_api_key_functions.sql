-- Migration 002: API key functions
-- Provides generate_api_key() and lookup_user_by_api_key()

-- ─── Key generation ───────────────────────────────────────────────────────────

-- Generates a new API key with the dex_live_ prefix.
-- Usage: SELECT generate_api_key();
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'dex_live_' || encode(gen_random_bytes(24), 'hex');
END;
$$;

-- ─── Key lookup (used by auth middleware) ─────────────────────────────────────

-- Looks up a user by their plaintext API key using bcrypt comparison.
-- Returns the full user row, or nothing if not found.
-- Called server-side only (service role key required).
CREATE OR REPLACE FUNCTION public.lookup_user_by_api_key(key TEXT)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM public.users
    WHERE api_key_hash = crypt(key, api_key_hash)
    LIMIT 1;
END;
$$;
