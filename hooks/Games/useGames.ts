import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useGamesStore } from "@/stores/useGamesStore";
import { useGameDetails } from "@/hooks/Games/use-game-details";
import { useDebounce } from "@/hooks/Settings/useDebounce";
import { createMobileOptimizedAbortController, handleMobileNetworkError } from "@/utils/mobile-detection";

const ITEMS_PER_PAGE = 24;

export function useGamesInfinite() {
  const store = useGamesStore();
  const debouncedSearchQuery = useDebounce(store.searchQuery, 500);

  const query = useInfiniteQuery({
    queryKey: [
      "popular-games",
      store.sortBy,
      store.selectedPlatform,
      store.selectedGenre,
      store.selectedCategory,
      store.selectedYear,
      store.timeRange,
      store.selectedGameMode,
      store.selectedTheme,
      store.minRating,
      store.maxRating,
      store.hasMultiplayer,
      debouncedSearchQuery,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const { controller, timeoutId } = createMobileOptimizedAbortController();
      
      try {
        const params = new URLSearchParams({
          page: String(pageParam),
          limit: String(ITEMS_PER_PAGE),
          platform: store.selectedPlatform || 'all',
          genre: store.selectedGenre || 'all',
          category: store.selectedCategory || 'all',
          year: store.selectedYear || 'all',
          sort: store.sortBy || 'popularity',
          search: debouncedSearchQuery || '',
          timeRange: store.timeRange || 'all',
          gameMode: store.selectedGameMode || 'all',
          theme: store.selectedTheme || 'all',
          multiplayer: store.hasMultiplayer.toString()
        });

        // Add rating filters if set
        if (store.minRating !== null) {
          params.set('minRating', store.minRating.toString());
        }
        if (store.maxRating !== null) {
          params.set('maxRating', store.maxRating.toString());
        }

        const response = await fetch(`/api/games?${params.toString()}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate response
        if (!data || !Array.isArray(data.games)) {
          throw new Error('Invalid response format');
        }
        
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw new Error(handleMobileNetworkError(error as Error));
      }
    },
    getNextPageParam: (lastPage) => {
      // Simple pagination logic - if we have games and API says there's more
      if (lastPage?.hasNextPage && lastPage.games?.length > 0) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes for popular games
    gcTime: 15 * 60 * 1000, // 15 minutes in memory
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2, // Simple retry logic
  });

  return {
    ...query,
    allGames: query.data?.pages.flatMap(page => page.games || []) || [],
    refetch: query.refetch,
  };
}

export function useGame(id: string | number) {
  const { game, isLoading, error } = useGameDetails(id);
  
  return {
    data: game,
    isLoading,
    error,
    isError: !!error
  };
}

export function useGamesList(type: 'trending' | 'popular' | 'upcoming', limit: number = 10) {
  return useQuery({
    queryKey: [`${type}-games`, limit],
    queryFn: async () => {
      const response = await fetch(`/api/games/${type}?limit=${limit}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type} games`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

