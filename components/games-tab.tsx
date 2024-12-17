import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function GamesTab() {
  const supabase = createClientComponentClient();
  
  const { data, isLoading, error } = useInfiniteQuery({
    queryKey: ['games'],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      
      return fetchUserGames({ 
        userId, 
        start, 
        end,
        supabase // Pass the client here
      });
    },
    // ... rest of the config
  });

  // ... rest of the component
} 