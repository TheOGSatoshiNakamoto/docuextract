-- Migration 011: Migrate existing dex_live_ keys to dk_live_
--
-- Migration 010 fixed generate_api_key() for NEW keys, but existing users
-- still have 'dex_live_' prefixed keys. This migrates them to 'dk_live_'
-- and rehashes so the bcrypt comparison works with the new prefix.
--
-- Safe to run pre-launch. Post-launch this would be a breaking change
-- requiring user notification and a grace period.

UPDATE public.users
SET api_key = 'dk_live_' || substring(api_key from 10),
    api_key_hash = crypt('dk_live_' || substring(api_key from 10), gen_salt('bf')),
    updated_at = NOW()
WHERE api_key LIKE 'dex_live_%';
