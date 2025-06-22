import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern for Supabase client to prevent multiple instances
let supabaseSingleton: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseSingleton) {
    return supabaseSingleton;
  }

  // Create new instance only if needed
  if (typeof window !== 'undefined') {
    supabaseSingleton = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } else {
    // For server-side, create a new instance each time
    // (server instances shouldn't be singletons due to auth contexts)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseSingleton;
}

// Reset singleton (useful for testing or auth changes)
export function resetSupabaseClient() {
  supabaseSingleton = null;
}