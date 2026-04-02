-- Migration 012: Webhook infrastructure tables
--
-- Webhook endpoints: user-configured URLs that receive event notifications
-- Webhook deliveries: log of every delivery attempt with payload and response

-- ─── Webhook Endpoints ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  description     TEXT,
  events          TEXT[] NOT NULL DEFAULT '{}',
  signing_secret  TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_endpoints_user ON public.webhook_endpoints (user_id);

-- ─── Webhook Deliveries ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id     UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  response_status INTEGER,
  response_body   TEXT,
  request_headers JSONB,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  success         BOOLEAN NOT NULL DEFAULT false,
  delivered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_endpoint ON public.webhook_deliveries (endpoint_id, delivered_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own endpoints
CREATE POLICY "webhook_endpoints: read own"
  ON public.webhook_endpoints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "webhook_endpoints: insert own"
  ON public.webhook_endpoints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhook_endpoints: update own"
  ON public.webhook_endpoints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "webhook_endpoints: delete own"
  ON public.webhook_endpoints FOR DELETE
  USING (auth.uid() = user_id);

-- Users can read deliveries for their own endpoints
CREATE POLICY "webhook_deliveries: read own"
  ON public.webhook_deliveries FOR SELECT
  USING (
    endpoint_id IN (SELECT id FROM public.webhook_endpoints WHERE user_id = auth.uid())
  );

-- ─── Updated-at trigger ──────────────────────────────────────────────────────

CREATE TRIGGER webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
