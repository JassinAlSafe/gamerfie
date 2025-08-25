"use client";

import { useQuery } from '@tanstack/react-query';
import { Game } from '@/types';
import { Playlist } from '@/types/playlist';

export interface ExploreData {
  popular: Game[];
  trending: Game[];
  upcoming: Game[];
  recent: Game[];
  classic: Game[];
  featuredPlaylists: Playlist[];
  stats: {
    totalGames: number;
    totalPlaylists: number;
  };
}

// Simple fetch function with proper error handling
async function fetchExploreData(limit: number = 12): Promise<ExploreData> {
  const response = await fetch(`/api/explore?limit=${limit}`, {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=300',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch explore data: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Return with sensible defaults
  return {
    popular: Array.isArray(data.popular) ? data.popular : [],
    trending: Array.isArray(data.trending) ? data.trending : [],
    upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
    recent: Array.isArray(data.recent) ? data.recent : [],
    classic: Array.isArray(data.classic) ? data.classic : [],
    featuredPlaylists: Array.isArray(data.featuredPlaylists) ? data.featuredPlaylists : [],
    stats: {
      totalGames: data.stats?.totalGames || 0,
      totalPlaylists: data.stats?.totalPlaylists || 0
    }
  };
}

// Clean hook that leverages React Query's natural caching
export function useExploreData(limit: number = 12) {
  return useQuery({
    queryKey: ['explore-data', limit],
    queryFn: () => fetchExploreData(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Helper hook for individual categories
export function useExploreCategory(category: keyof Omit<ExploreData, 'featuredPlaylists' | 'stats'>) {
  const { data, isLoading, error } = useExploreData();
  
  return {
    games: data?.[category] || [],
    isLoading,
    error,
    isEmpty: !data?.[category]?.length
  };
}