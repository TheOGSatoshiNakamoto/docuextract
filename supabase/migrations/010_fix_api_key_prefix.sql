-- Migration 010: Fix API key prefix
--
-- The generate_api_key() function (migration 002) creates keys with 'dex_live_'
-- prefix, but the codebase UI and documentation standardized on 'dk_live_'.
-- This migration updates the function to use the correct prefix.
--
-- Existing keys with 'dex_live_' prefix will continue to work for API auth
-- (bcrypt hash comparison doesn't check the prefix). New keys will use 'dk_live_'.

CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'dk_live_' || encode(gen_random_bytes(24), 'hex');
END;
$$;
