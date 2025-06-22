import { useState } from "react";
import { useQuery } from '@tanstack/react-query';

export function useSearchQuery() {
  const [searchQuery, setSearchQuery] = useState("");
  return [searchQuery, setSearchQuery] as const;
}

export function useStatusFilter() {
  const [statusFilter, setStatusFilter] = useState("all");
  return [statusFilter, setStatusFilter] as const;
}

interface FilterOption {
  id: string;
  name: string;
  slug: string;
}

interface RatingRange {
  label: string;
  min: number;
  max: number;
}

interface GameFilterOptions {
  platforms: FilterOption[];
  genres: FilterOption[];
  gameModes: FilterOption[];
  themes: FilterOption[];
  ratingRanges: RatingRange[];
  popularYears: string[];
}

export function useGameFilters() {
  const query = useQuery<GameFilterOptions>({
    queryKey: ['game-filters'],
    queryFn: async () => {
      const response = await fetch('/api/games/filters');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - filter options don't change often
    gcTime: 60 * 60 * 1000, // 1 hour in memory
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    filterOptions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// Helper hooks for specific filter types
export function usePlatforms() {
  const { filterOptions, isLoading, error } = useGameFilters();
  return {
    platforms: filterOptions?.platforms || [],
    isLoading,
    error
  };
}

export function useGenres() {
  const { filterOptions, isLoading, error } = useGameFilters();
  return {
    genres: filterOptions?.genres || [],
    isLoading,
    error
  };
}

export function useGameModes() {
  const { filterOptions, isLoading, error } = useGameFilters();
  return {
    gameModes: filterOptions?.gameModes || [],
    isLoading,
    error
  };
}

export function useThemes() {
  const { filterOptions, isLoading, error } = useGameFilters();
  return {
    themes: filterOptions?.themes || [],
    isLoading,
    error
  };
}