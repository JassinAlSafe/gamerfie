import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameFilters, Game } from "@/types";
import { IGDBResponse } from "@/types/igdb-types";

export function useGames(
  page: number = 1,
  limit: number = 24,
  filters?: GameFilters
) {
  const queryClient = useQueryClient();
  const queryKey = ["games", page, limit, filters];

  return useQuery<IGDBResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.platformId && { platformId: filters.platformId.toString() }),
        ...(filters?.genreId && { genreId: filters.genreId.toString() }),
        ...(filters?.timeRange && { timeRange: filters.timeRange }),
        ...(filters?.search && { search: filters.search })
      });

      const response = await fetch(`/api/games?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch games");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
    select: (data) => {
      // Prefetch next page
      if (data.currentPage < data.totalPages) {
        const nextPageParams = new URLSearchParams({
          page: (page + 1).toString(),
          limit: limit.toString(),
          ...(filters?.platformId && { platformId: filters.platformId.toString() }),
          ...(filters?.genreId && { genreId: filters.genreId.toString() }),
          ...(filters?.timeRange && { timeRange: filters.timeRange }),
          ...(filters?.search && { search: filters.search })
        });

        void queryClient.prefetchQuery({
          queryKey: ["games", page + 1, limit, filters],
          queryFn: () => 
            fetch(`/api/games?${nextPageParams.toString()}`).then(res => res.json()),
          staleTime: 1000 * 60 * 5
        });
      }
      return data;
    }
  });
}

export function usePopularGames(limit: number = 10) {
  return useQuery<Game[]>({
    queryKey: ["popularGames", limit],
    queryFn: async () => {
      const response = await fetch(`/api/games/popular?limit=${limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch popular games");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
}

export function useSearchGames(query: string, enabled: boolean = false) {
  return useQuery<Game[]>({
    queryKey: ["searchGames", query],
    queryFn: async () => {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search games");
      }
      return response.json();
    },
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
}

export function useGameDetails(gameId: number | null) {
  return useQuery<Game>({
    queryKey: ["game", gameId],
    queryFn: async () => {
      if (!gameId) throw new Error("Game ID is required");
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch game details");
      }
      return response.json();
    },
    enabled: !!gameId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  });
}

