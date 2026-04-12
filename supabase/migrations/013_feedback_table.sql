-- Migration 013: User feedback table
--
-- Stores page-specific feedback submitted through the dashboard widget.
-- Users submit feedback about the dashboard page they are currently viewing.

CREATE TABLE IF NOT EXISTS public.feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page       TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON public.feedback (user_id, created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "feedback: insert own"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback (supports future "my feedback" view)
CREATE POLICY "feedback: read own"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);
