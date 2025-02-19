import  {useEffect} from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useGamesStore } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useGameDetailsStore } from "@/stores/useGameDetailsStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Game } from "@/types/game";
import { GameService } from "@/services/gameService";

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
  const { fetchGame } = useGameDetailsStore();
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

  useEffect(() => {
    if (!isNaN(numericId)) {
      fetchGame(numericId);
    }
  }, [numericId, fetchGame]);

  return useQuery({
    queryKey: ["game", numericId],
    queryFn: async () => {
      if (!numericId || isNaN(numericId)) {
        throw new Error("Invalid game ID");
      }

      try {
        const game = await GameService.fetchGameById(numericId);
        if (!game) {
          throw new Error("Game not found");
        }
        return game;
      } catch (error) {
        console.error("Game fetch error:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch game");
      }
    },
    enabled: !isNaN(numericId),
    staleTime: STALE_TIME,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Game not found") {
        return false;
      }
      return failureCount < 3;
    }
  });
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

