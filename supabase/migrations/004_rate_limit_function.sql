-- Migration 004: Atomic rate limit check-and-increment function
-- Called by lib/ratelimit.ts on every authenticated API request.

CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_user_id     UUID,
  p_minute_limit INTEGER,
  p_month_limit  INTEGER,
  p_now          TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_minute_reset  TIMESTAMPTZ;
  v_month_reset   TIMESTAMPTZ;
  v_req_minute    INTEGER;
  v_req_month     INTEGER;
  v_allowed       BOOLEAN;
BEGIN
  -- Compute window boundaries
  v_minute_reset := date_trunc('minute', p_now) + INTERVAL '1 minute';
  v_month_reset  := date_trunc('month',  p_now) + INTERVAL '1 month';

  -- Upsert the rate_limits row atomically, resetting counters when windows expire
  INSERT INTO public.rate_limits (
    user_id,
    requests_this_minute,
    requests_this_month,
    minute_reset_at,
    month_reset_at
  )
  VALUES (
    p_user_id,
    1, 1,
    v_minute_reset,
    v_month_reset
  )
  ON CONFLICT (user_id) DO UPDATE SET
    -- Reset minute counter if the window has expired
    requests_this_minute = CASE
      WHEN rate_limits.minute_reset_at <= p_now THEN 1
      ELSE rate_limits.requests_this_minute + 1
    END,
    minute_reset_at = CASE
      WHEN rate_limits.minute_reset_at <= p_now THEN v_minute_reset
      ELSE rate_limits.minute_reset_at
    END,
    -- Reset monthly counter if the window has expired
    requests_this_month = CASE
      WHEN rate_limits.month_reset_at <= p_now THEN 1
      ELSE rate_limits.requests_this_month + 1
    END,
    month_reset_at = CASE
      WHEN rate_limits.month_reset_at <= p_now THEN v_month_reset
      ELSE rate_limits.month_reset_at
    END
  RETURNING
    requests_this_minute,
    requests_this_month,
    minute_reset_at,
    month_reset_at
  INTO v_req_minute, v_req_month, v_minute_reset, v_month_reset;

  -- Determine if request is allowed (check minute first, then monthly)
  v_allowed := (v_req_minute <= p_minute_limit) AND (v_req_month <= p_month_limit);

  RETURN jsonb_build_object(
    'allowed',               v_allowed,
    'requests_this_minute',  v_req_minute,
    'requests_this_month',   v_req_month,
    'minute_reset_at',       v_minute_reset,
    'month_reset_at',        v_month_reset
  );
END;
$$;
