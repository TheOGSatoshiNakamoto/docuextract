-- Migration 003: Row Level Security policies
-- Users can only read/write their own data.
-- All mutations happen via service role (bypasses RLS) from the API.

-- ─── Enable RLS ───────────────────────────────────────────────────────────────

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ─── users policies ───────────────────────────────────────────────────────────

-- Authenticated users can read their own row
CREATE POLICY "users: read own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Authenticated users can update their own row (email, etc.)
CREATE POLICY "users: update own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ─── api_usage policies ───────────────────────────────────────────────────────

-- Users can read their own usage records
CREATE POLICY "api_usage: read own"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ─── rate_limits policies ─────────────────────────────────────────────────────

-- Users can read their own rate limit state
CREATE POLICY "rate_limits: read own"
  ON public.rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- ─── webhook_events: service role only ────────────────────────────────────────
-- No anon/user policies — all access via service role key from API server.
