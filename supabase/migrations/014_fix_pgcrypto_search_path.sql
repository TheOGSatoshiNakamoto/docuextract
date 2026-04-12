-- Migration 014: Fix pgcrypto search_path for key generation functions
--
-- Three functions call pgcrypto functions (gen_random_bytes, crypt, gen_salt)
-- but their search_path does not include the 'extensions' schema where
-- Supabase installs pgcrypto. This causes:
--   "function gen_random_bytes(integer) does not exist"
-- when users try to regenerate API keys.
--
-- Migration 009 fixed this for lookup_user_by_api_key but missed these three.

-- ─── 1. generate_api_key() ───────────────────────────────────────────────────
-- Was missing SET search_path entirely (migrations 002 and 010).

CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  RETURN 'dk_live_' || encode(gen_random_bytes(24), 'hex');
END;
$$;

-- ─── 2. regenerate_my_api_key() ──────────────────────────────────────────────
-- Had SET search_path = public (migration 005), missing 'extensions'.

CREATE OR REPLACE FUNCTION public.regenerate_my_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_new_key TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_new_key := generate_api_key();

  UPDATE public.users
  SET api_key      = v_new_key,
      api_key_hash = crypt(v_new_key, gen_salt('bf')),
      updated_at   = NOW()
  WHERE id = auth.uid();

  RETURN v_new_key;
END;
$$;

-- ─── 3. handle_new_auth_user() ───────────────────────────────────────────────
-- Had SET search_path = public (migration 008), missing 'extensions'.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_api_key TEXT;
BEGIN
  BEGIN
    v_api_key := generate_api_key();
    INSERT INTO public.users (id, email, api_key, api_key_hash)
    VALUES (
      NEW.id,
      NEW.email,
      v_api_key,
      crypt(v_api_key, gen_salt('bf'))
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;
