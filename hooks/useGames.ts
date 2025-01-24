import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { GameFilters, Game } from "@/types/game";
import { IGDBResponse } from "@/types";
import { GameCategory } from '@/types/index';

export function useGames(filters: GameFilters) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['games', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/games?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
    select: (data: IGDBResponse) => ({
      games: data.games,
      totalPages: data.totalPages,
      totalGames: data.totalGames
    })
  });

  const prefetchPopularCategories = async () => {
    const popularCategories: GameCategory[] = ['popular', 'recent', 'upcoming'];
    
    await Promise.all(
      popularCategories.map(async (category) => {
        const prefetchFilters = { 
          ...filters, 
          category, 
          limit: 10 
        };
        
        await queryClient.prefetchQuery({
          queryKey: ['games', prefetchFilters],
          queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(prefetchFilters).forEach(([key, value]) => {
              if (value) params.append(key, value.toString());
            });
            
            const response = await fetch(`/api/games?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch games');
            return response.json();
          },
          staleTime: 300000 // 5 minutes
        });
      })
    );
  };

  return {
    games: data?.games ?? [],
    totalPages: data?.totalPages ?? 1,
    totalGames: data?.totalGames ?? 0,
    isLoading,
    error,
    prefetchPopularCategories
  };
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
    staleTime: 300000, // 5 minutes
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
    staleTime: 300000, // 5 minutes
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
    staleTime: 1800000, // 30 minutes
    retry: 2
  });
}

export function useCategoryGames(category: 'popular' | 'upcoming' | 'new', limit: number = 12) {
  return useQuery<GameCategoryData>({
    queryKey: ['categoryGames', category],
    queryFn: async () => {
      const response = await fetch(`/api/games/popular?category=${category}&limit=${limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch category games');
      }
      return response.json();
    },
    staleTime: 300000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });
}

interface GameCategoryData {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

export function usePrefetchPopularCategories() {
  const queryClient = useQueryClient();
  
  const prefetchCategories = async () => {
    const popularCategories: GameCategory[] = ['popular', 'recent', 'upcoming'];
    
    await Promise.all(
      popularCategories.map(async (category) => {
        await queryClient.prefetchQuery({
          queryKey: ['games', { category, limit: 10 }],
          queryFn: () => fetchGames({ category, limit: 10 }),
          staleTime: 300000 // 5 minutes
        });
      })
    );
  };

  return { prefetchCategories };
}

