-- Migration 006: create_user_with_api_key RPC
--
-- Adds a SECURITY DEFINER function that creates a new user row with a
-- bcrypt-hashed API key in a single atomic call. Required by:
--   - The billing E2E test script (scripts/test-billing-e2e.ts)
--   - The dashboard sign-up flow (Phase 4/5)
--
-- SECURITY DEFINER: runs as the DB owner so the service role key can
-- insert into public.users even when RLS is enabled.

CREATE OR REPLACE FUNCTION public.create_user_with_api_key(
  p_email   TEXT,
  p_api_key TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.users (id, email, api_key, api_key_hash)
  VALUES (
    v_user_id,
    p_email,
    p_api_key,
    crypt(p_api_key, gen_salt('bf'))
  );
  RETURN v_user_id;
END;
$$;
