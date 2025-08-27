"use client";

import { useQuery } from '@tanstack/react-query';
import { Game } from '@/types';
import { Playlist } from '@/types/playlist';
import { createMobileOptimizedAbortController, handleMobileNetworkError } from '@/utils/mobile-detection';

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

// Mobile-optimized fetch function with timeout handling
async function fetchExploreData(limit: number = 12): Promise<ExploreData> {
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const { controller, timeoutId } = createMobileOptimizedAbortController();
  
  if (isMobile) {
    console.log('🔍 [Mobile] Fetching explore data...', { limit });
  }
  
  try {
    const response = await fetch(`/api/explore?limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMsg = `Failed to fetch explore data: ${response.status} ${response.statusText}`;
      if (isMobile) {
        console.error('❌ [Mobile] Explore API error:', errorMsg);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    if (isMobile) {
      console.log('✅ [Mobile] Explore data fetched successfully:', {
        popular: data.popular?.length || 0,
        trending: data.trending?.length || 0,
        upcoming: data.upcoming?.length || 0,
        recent: data.recent?.length || 0,
      });
    }

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
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMsg = handleMobileNetworkError(error as Error);
    if (isMobile) {
      console.error('❌ [Mobile] Explore fetch failed:', errorMsg, error);
    }
    throw new Error(errorMsg);
  }
}

// Clean hook that leverages React Query's natural caching
export function useExploreData(limit: number = 12) {
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return useQuery({
    queryKey: ['explore-data', limit],
    queryFn: () => fetchExploreData(limit),
    staleTime: isMobile ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 min mobile, 5 min desktop
    gcTime: isMobile ? 30 * 60 * 1000 : 10 * 60 * 1000, // 30 min mobile, 10 min desktop
    retry: isMobile ? 5 : 2, // More retries for mobile
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 60000),
    refetchOnWindowFocus: false,
    networkMode: 'online' as const, // Only run queries when online
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