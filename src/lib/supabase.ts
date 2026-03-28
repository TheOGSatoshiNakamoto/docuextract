import { createBrowserClient } from '@supabase/ssr';

// Lazy singleton — only initialized when first called (browser context only).
// Never call this at module level; call from within useEffect or event handlers.
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
