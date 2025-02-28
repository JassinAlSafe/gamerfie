import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useGamesStore } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useGameDetails } from "@/hooks/Games/use-game-details";
import { useDebounce } from "@/hooks/Settings/useDebounce";
import { Game } from "@/types/game";

const ITEMS_PER_PAGE = 48;
const STALE_TIME = 1000 * 60 * 5; // 5 minutes

interface GameResponse {
  games: Game[];
  totalGames: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export function useGamesInfinite() {
  const store = useGamesStore();
  const { query: searchQuery } = useSearchStore();
  const debouncedSearch = useDebounce(searchQuery, 500);

  const query = useInfiniteQuery<GameResponse>({
    queryKey: [
      "games",
      store.sortBy,
      store.selectedPlatform,
      store.selectedGenre,
      store.selectedCategory,
      store.selectedYear,
      store.timeRange,
      debouncedSearch,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(ITEMS_PER_PAGE),
        platform: store.selectedPlatform || 'all',
        genre: store.selectedGenre || 'all',
        category: store.selectedCategory || 'all',
        year: store.selectedYear || 'all',
        sort: store.sortBy || 'popularity',
        search: debouncedSearch || '',
        timeRange: store.timeRange || 'all'
      });

      const response = await fetch(`/api/games?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      
      return {
        ...data,
        hasMore: data.currentPage < data.totalPages
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: STALE_TIME,
  });

  return {
    ...query,
    allGames: query.data?.pages.flatMap(page => page.games) || [],
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
  return useQuery<GameResponse>({
    queryKey: [`${type}-games`, limit],
    queryFn: async () => {
      const response = await fetch(`/api/games/${type}?limit=${limit}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type} games`);
      return response.json();
    },
    staleTime: STALE_TIME,
  });
}

