-- Migration 015: Create api_keys table for multi-key support
--
-- Moves API key storage from a single column on the users table to a
-- dedicated one-to-many table. Each user can have multiple named keys,
-- each independently revocable.
--
-- The users.api_key and users.api_key_hash columns are preserved for
-- backward compatibility but the auth lookup (migration 016) will read
-- from this table instead.

-- ─── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE public.api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'Default',
  key_prefix    TEXT NOT NULL,        -- first 12 chars for display + lookup narrowing
  key_hash      TEXT NOT NULL,        -- bcrypt hash of the full key
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'revoked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Listing a user's keys
CREATE INDEX idx_api_keys_user_id ON public.api_keys (user_id);

-- Auth lookup: narrow bcrypt scan by prefix + active status
CREATE INDEX idx_api_keys_prefix_active ON public.api_keys (key_prefix)
  WHERE status = 'active';

-- Counting active keys per user (for plan limit enforcement)
CREATE INDEX idx_api_keys_user_status ON public.api_keys (user_id, status)
  WHERE status = 'active';

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys: read own"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "api_keys: update own"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Migrate existing keys ──────────────────────────────────────────────────

INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash, status, created_at)
SELECT id, 'Production Key', left(api_key, 12), api_key_hash, 'active', created_at
FROM public.users
WHERE api_key IS NOT NULL AND api_key_hash IS NOT NULL;
