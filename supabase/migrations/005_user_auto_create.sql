-- Migration 005: Auto-create public.users row on Supabase Auth signup
-- Provides a trigger so dashboard signups automatically get an API key.
-- Also adds regenerate_my_api_key() callable by authenticated users via RPC.

-- ─── Trigger: auto-create user row on auth signup ─────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key TEXT;
BEGIN
  v_api_key := generate_api_key();
  INSERT INTO public.users (id, email, api_key, api_key_hash)
  VALUES (
    NEW.id,
    NEW.email,
    v_api_key,
    crypt(v_api_key, gen_salt('bf'))
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent in case of retries
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ─── RPC: regenerate API key (caller must be authenticated) ───────────────────

CREATE OR REPLACE FUNCTION public.regenerate_my_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
