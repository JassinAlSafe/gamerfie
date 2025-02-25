import { QueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Auto-refresh session on 401 errors
        if (error instanceof Error && error.message.includes('401')) {
          supabase.auth.refreshSession()
          return failureCount < 2
        }
        return false
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
    },
  },
});

let queryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createQueryClient();
  }

  // Client-side: create singleton
  if (!queryClient) {
    queryClient = createQueryClient();
  }

  return queryClient;
}

