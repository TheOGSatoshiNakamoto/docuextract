-- Migration 009: Fix lookup_user_by_api_key search_path
--
-- Migration 002 defined lookup_user_by_api_key with SET search_path = public.
-- Supabase installs pgcrypto in the 'extensions' schema, so crypt() is not
-- visible when the search path is restricted to 'public' only. This causes:
--   "function crypt(text, text) does not exist"
-- at runtime, making all API key authentication fail.
--
-- Fix: include 'extensions' in the search path so crypt() is resolvable.

CREATE OR REPLACE FUNCTION public.lookup_user_by_api_key(key TEXT)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM public.users
    WHERE api_key_hash = crypt(key, api_key_hash)
    LIMIT 1;
END;
$$;
