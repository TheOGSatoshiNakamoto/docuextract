-- Migration 017: Add external_id to api_usage
--
-- Adds a user-facing short ID (ext_<8chars>) for extractions.
-- Used in webhook payloads, API responses, and dashboard display.
-- The UUID remains the primary key; external_id is for external reference.

ALTER TABLE public.api_usage ADD COLUMN external_id TEXT;

CREATE UNIQUE INDEX idx_api_usage_external_id ON public.api_usage (external_id);

-- Backfill existing rows with deterministic short IDs from their UUID
UPDATE public.api_usage
SET external_id = 'ext_' || substr(md5(id::text), 1, 8)
WHERE external_id IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE public.api_usage ALTER COLUMN external_id SET NOT NULL;
