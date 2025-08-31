import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Validate environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables:', { 
      hasUrl: !!url, 
      hasKey: !!key 
    });
    throw new Error('Supabase URL and anon key are required');
  }

  return createBrowserClient(url, key, {
    auth: {
      // Enable automatic token refresh
      autoRefreshToken: true,
      // Persist session in local storage (default behavior)
      persistSession: true,
      // Detect session from URL when component mounts (default behavior) 
      detectSessionInUrl: true,
      // Flowtype parameter for auth flow
      flowType: 'pkce'
    }
  });
} 