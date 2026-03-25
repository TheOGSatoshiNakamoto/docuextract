-- Migration 007: Fix create_user_with_api_key RPC signature
--
-- Migration 006 defined this function generating its own UUID, which always
-- violated the FK constraint users.id → auth.users(id). This replaces it
-- with a version that accepts the pre-existing auth user's ID, making it
-- usable for admin / bulk-import scenarios where the auth.users row already
-- exists but the public.users row needs to be created explicitly.
--
-- Normal sign-up flow: auth signup → trigger (migration 005) auto-creates
-- the public.users row. This RPC is for admin / override scenarios only.

CREATE OR REPLACE FUNCTION public.create_user_with_api_key(
  p_user_id UUID,
  p_email   TEXT,
  p_api_key TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, api_key, api_key_hash)
  VALUES (
    p_user_id,
    p_email,
    p_api_key,
    crypt(p_api_key, gen_salt('bf'))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN p_user_id;
END;
$$;
