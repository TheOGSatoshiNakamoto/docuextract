-- Migration 008: Make handle_new_auth_user trigger defensive
--
-- The original trigger (migration 005) propagates any exception back to
-- Supabase Auth, causing auth.admin.createUser to fail with "Database error
-- creating new user". This replaces the trigger function with an exception-
-- safe version: if the public.users insert fails for any reason, the error
-- is logged via RAISE WARNING (visible in Supabase logs) but NOT re-raised,
-- so the auth user is always created successfully.
--
-- The sign-up flow should always succeed even if the trigger has a transient
-- issue. A missing public.users row is recoverable; a failed signup is not.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
