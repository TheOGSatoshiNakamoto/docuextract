-- Migration 016: Multi-key SQL functions
--
-- Replaces the single-key auth lookup with one that reads from api_keys,
-- and adds RPCs for creating, revoking, and listing keys with per-plan limits.

-- ─── 1. lookup_user_by_api_key (replace) ─────────────────────────────────────
-- Signature unchanged — auth.ts needs no modification.
-- Now reads from api_keys table, narrows by prefix + active status before
-- bcrypt comparison. Updates last_used_at on match.

CREATE OR REPLACE FUNCTION public.lookup_user_by_api_key(key TEXT)
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_prefix  TEXT;
  v_key_id  UUID;
  v_user_id UUID;
BEGIN
  v_prefix := left(key, 12);

  SELECT ak.id, ak.user_id INTO v_key_id, v_user_id
  FROM public.api_keys ak
  WHERE ak.key_prefix = v_prefix
    AND ak.status = 'active'
    AND ak.key_hash = crypt(key, ak.key_hash)
  LIMIT 1;

  IF v_key_id IS NOT NULL THEN
    -- Fire-and-forget timestamp update (non-critical)
    UPDATE public.api_keys SET last_used_at = NOW() WHERE id = v_key_id;
    RETURN QUERY SELECT * FROM public.users WHERE id = v_user_id;
  END IF;
END;
$$;

-- ─── 2. create_api_key (new) ─────────────────────────────────────────────────
-- Authenticated users call this to create a new named API key.
-- Enforces per-plan limits. Returns the plaintext key (shown once).

CREATE OR REPLACE FUNCTION public.create_api_key(key_name TEXT DEFAULT 'Untitled')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id      UUID;
  v_plan         TEXT;
  v_active_count INT;
  v_max_keys     INT;
  v_new_key      TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT plan INTO v_plan FROM public.users WHERE id = v_user_id;

  v_max_keys := CASE v_plan
    WHEN 'free'    THEN 2
    WHEN 'starter' THEN 5
    WHEN 'pro'     THEN 10
    WHEN 'scale'   THEN 25
    ELSE 2
  END;

  SELECT count(*) INTO v_active_count
  FROM public.api_keys
  WHERE user_id = v_user_id AND status = 'active';

  IF v_active_count >= v_max_keys THEN
    RAISE EXCEPTION 'Key limit reached: % active of % allowed on your % plan. Upgrade to create more keys.',
      v_active_count, v_max_keys, v_plan;
  END IF;

  v_new_key := generate_api_key();

  INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash, status)
  VALUES (v_user_id, key_name, left(v_new_key, 12), crypt(v_new_key, gen_salt('bf')), 'active');

  -- Also update users table for backward compat (latest key wins)
  UPDATE public.users
  SET api_key      = v_new_key,
      api_key_hash = crypt(v_new_key, gen_salt('bf')),
      updated_at   = NOW()
  WHERE id = v_user_id;

  RETURN v_new_key;
END;
$$;

-- ─── 3. revoke_api_key (new) ─────────────────────────────────────────────────
-- Revokes a specific key by ID. Only operates on the caller's own keys.

CREATE OR REPLACE FUNCTION public.revoke_api_key(target_key_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.api_keys
  SET status = 'revoked', revoked_at = NOW()
  WHERE id = target_key_id
    AND user_id = auth.uid()
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Key not found or already revoked';
  END IF;
END;
$$;

-- ─── 4. list_my_api_keys (new) ──────────────────────────────────────────────
-- Returns key metadata for the authenticated user. Never exposes the hash.

CREATE OR REPLACE FUNCTION public.list_my_api_keys()
RETURNS TABLE(
  id UUID,
  name TEXT,
  key_prefix TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
    SELECT ak.id, ak.name, ak.key_prefix, ak.status,
           ak.created_at, ak.last_used_at, ak.revoked_at
    FROM public.api_keys ak
    WHERE ak.user_id = auth.uid()
    ORDER BY
      CASE ak.status WHEN 'active' THEN 0 ELSE 1 END,
      ak.created_at DESC;
END;
$$;

-- ─── 5. Update handle_new_auth_user trigger ─────────────────────────────────
-- On signup, write to BOTH users table (backward compat) AND api_keys table.

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

    -- Also insert into the multi-key table
    INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash, status)
    VALUES (NEW.id, 'Default', left(v_api_key, 12), crypt(v_api_key, gen_salt('bf')), 'active');

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- ─── 6. Update regenerate_my_api_key (backward compat) ──────────────────────
-- Revokes all existing keys and creates a fresh one. Maintains backward
-- compat for callers that haven't migrated to create_api_key yet.

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

  -- Revoke all existing active keys for this user
  UPDATE public.api_keys
  SET status = 'revoked', revoked_at = NOW()
  WHERE user_id = auth.uid() AND status = 'active';

  -- Generate new key
  v_new_key := generate_api_key();

  -- Insert into api_keys table
  INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash, status)
  VALUES (auth.uid(), 'Default', left(v_new_key, 12), crypt(v_new_key, gen_salt('bf')), 'active');

  -- Update users table for backward compat
  UPDATE public.users
  SET api_key      = v_new_key,
      api_key_hash = crypt(v_new_key, gen_salt('bf')),
      updated_at   = NOW()
  WHERE id = auth.uid();

  RETURN v_new_key;
END;
$$;
