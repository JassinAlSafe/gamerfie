import { QueryClient } from '@tanstack/react-query';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
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

