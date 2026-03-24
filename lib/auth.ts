import { createClient } from '@supabase/supabase-js';
import type { VercelRequest } from '@vercel/node';
import type { User } from './types.js';

// ─── Supabase client (service role — server-side only) ────────────────────────

function getSupabaseAdmin() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── In-memory cache (60-second TTL) ─────────────────────────────────────────
// Avoids a DB round-trip on every request. Invalidated by TTL only;
// plan changes propagate within one minute (acceptable for v1).

interface CacheEntry {
  user: User;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function getCached(apiKey: string): User | null {
  const entry = cache.get(apiKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(apiKey);
    return null;
  }
  return entry.user;
}

function setCached(apiKey: string, user: User): void {
  cache.set(apiKey, { user, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Auth result ──────────────────────────────────────────────────────────────

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403; message: string };

// ─── Main auth function ───────────────────────────────────────────────────────

/**
 * Validates the Bearer token from the Authorization header.
 * Returns the authenticated User or a typed failure (401/403).
 *
 * All endpoints except GET /v1/health must call this first.
 */
export async function authenticateRequest(req: VercelRequest): Promise<AuthResult> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Missing Authorization header. Use: Authorization: Bearer <api_key>' };
  }

  const apiKey = authHeader.slice(7).trim();

  if (!apiKey) {
    return { ok: false, status: 401, message: 'API key is empty' };
  }

  // Check cache first
  const cached = getCached(apiKey);
  if (cached) {
    return { ok: true, user: cached };
  }

  // Look up via Supabase RPC — uses bcrypt crypt() comparison server-side
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .rpc('lookup_user_by_api_key', { key: apiKey })
    .single();

  if (error || !data) {
    return { ok: false, status: 401, message: 'Invalid API key' };
  }

  const user = data as User;

  setCached(apiKey, user);
  return { ok: true, user };
}

/**
 * Clears the auth cache for a specific API key.
 * Call this from the Stripe webhook handler when a user's plan changes.
 */
export function invalidateAuthCache(apiKey: string): void {
  cache.delete(apiKey);
}
