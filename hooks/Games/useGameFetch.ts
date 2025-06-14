import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Game } from "@/types";

export type GameFetchSource = "popular" | "trending" | "upcoming" | "recent" | "classic" | "playlist";

interface GameFetchOptions {
  source: GameFetchSource;
  limit?: number;
  playlistId?: string;
  enableRefetch?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface GameFetchResult {
  games: Game[];
  isEmpty: boolean;
  hasData: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Unified hook for fetching games from various sources
 * Provides consistent error handling, caching, and loading states
 */
export function useGameFetch({
  source,
  limit = 12,
  playlistId,
  enableRefetch = true,
  staleTime = 1000 * 60 * 5, // 5 minutes
  cacheTime = 1000 * 60 * 10, // 10 minutes
}: GameFetchOptions): GameFetchResult {
  
  const fetchGames = useCallback(async (): Promise<Game[]> => {
    try {
      let url: string;
      
      switch (source) {
        case "playlist":
          if (!playlistId) throw new Error("Playlist ID required for playlist source");
          url = `/api/playlists/${playlistId}`;
          break;
        case "popular":
        case "trending":
        case "upcoming":
        case "recent":
        case "classic":
          url = `/api/games/${source}?limit=${limit}`;
          break;
        default:
          throw new Error(`Unsupported game fetch source: ${source}`);
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${source} games: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (source === "playlist") {
        return (data.games as Game[]) || [];
      }
      
      // Handle games API responses
      const games = Array.isArray(data) ? data : data.games || [];
      
      // Handle error responses gracefully
      if (data.error && games.length === 0) {
        console.warn(`${source} games service unavailable:`, data.error);
        return [];
      }

      return games;
    } catch (error) {
      console.error(`Error fetching ${source} games:`, error);
      throw error;
    }
  }, [source, limit, playlistId]);

  const queryResult = useQuery({
    queryKey: ["games", source, limit, playlistId].filter(Boolean),
    queryFn: fetchGames,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: enableRefetch,
    retry: (failureCount, error) => {
      // Don't retry more than 2 times
      if (failureCount >= 2) return false;

      // Don't retry on client errors
      if (error instanceof Error && (
        error.message.includes("404") || 
        error.message.includes("403") ||
        error.message.includes("400")
      )) {
        return false;
      }

      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const games = queryResult.data || [];
  
  return {
    games,
    isEmpty: games.length === 0,
    hasData: games.length > 0,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}