-- Migration 001: Initial schema
-- Creates core tables for DocuExtract
-- Apply via: Supabase SQL editor or `supabase db push`

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE public.users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  api_key               TEXT UNIQUE NOT NULL,
  api_key_hash          TEXT NOT NULL,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  plan                  TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'starter', 'pro', 'scale')),
  monthly_limit         INTEGER NOT NULL DEFAULT 100,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── API Usage ────────────────────────────────────────────────────────────────

CREATE TABLE public.api_usage (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint            TEXT NOT NULL,
  document_type       TEXT,
  model_used          TEXT NOT NULL,
  input_tokens        INTEGER,
  output_tokens       INTEGER,
  processing_time_ms  INTEGER,
  confidence_score    NUMERIC(4,3),
  status              TEXT NOT NULL
                        CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Rate Limits ──────────────────────────────────────────────────────────────

CREATE TABLE public.rate_limits (
  user_id               UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  requests_this_minute  INTEGER NOT NULL DEFAULT 0,
  requests_this_month   INTEGER NOT NULL DEFAULT 0,
  minute_reset_at       TIMESTAMPTZ,
  month_reset_at        TIMESTAMPTZ
);

-- ─── Webhook Events ───────────────────────────────────────────────────────────

CREATE TABLE public.webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type      TEXT NOT NULL,
  processed       BOOLEAN NOT NULL DEFAULT FALSE,
  payload         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_users_api_key_hash ON public.users (api_key_hash);
CREATE INDEX idx_api_usage_user_created ON public.api_usage (user_id, created_at DESC);
CREATE INDEX idx_api_usage_created ON public.api_usage (created_at DESC);
CREATE INDEX idx_rate_limits_user ON public.rate_limits (user_id);

-- ─── Updated-at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
