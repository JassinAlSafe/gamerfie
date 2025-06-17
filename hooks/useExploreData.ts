"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { Game } from '@/types';
import { Playlist } from '@/types/playlist';

interface ExploreData {
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

interface UseExploreDataResult {
  data: ExploreData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// In-memory cache to reduce API calls and improve performance
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedData: { data: ExploreData; timestamp: number } | null = null;

export function useExploreData(limit: number = 12): UseExploreDataResult {
  const [data, setData] = useState<ExploreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const performanceMonitor = usePerformanceMonitor("ExploreData");

  // Ensure we're on the client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for playlist cache invalidation events
  useEffect(() => {
    if (!isClient) return;

    const handleCacheInvalidation = () => {
      console.log('Playlist cache invalidated, refreshing explore data...');
      cachedData = null; // Clear local cache
      setRefetchTrigger(prev => prev + 1); // Trigger refetch
    };

    // Listen for custom events (same-tab communication)
    window.addEventListener('playlist-cache-invalidated', handleCacheInvalidation);

    // Listen for BroadcastChannel events (cross-tab communication)
    let broadcastChannel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('playlist-updates');
        broadcastChannel.addEventListener('message', (event) => {
          if (event.data.type === 'CACHE_INVALIDATED') {
            handleCacheInvalidation();
          }
        });
      } catch (error) {
        console.warn('BroadcastChannel not available:', error);
      }
    }

    return () => {
      window.removeEventListener('playlist-cache-invalidated', handleCacheInvalidation);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [isClient]);

  useEffect(() => {
    // Only fetch data on the client side to prevent hydration issues
    if (!isClient) return;
    
    const fetchExploreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
          console.log('Using cached explore data');
          performanceMonitor.recordCacheHit();
          setData(cachedData.data);
          setIsLoading(false);
          performanceMonitor.finishLoading();
          return;
        }

        // Record API call for fresh data
        performanceMonitor.recordApiCall();
        
        console.log('Fetching fresh explore data via batch API...');
        const response = await fetch(`/api/explore?limit=${limit}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'public, max-age=300',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch explore data: ${response.status} ${response.statusText}`);
        }

        const fetchedData = await response.json();

        // Validate response structure
        if (!fetchedData || typeof fetchedData !== 'object') {
          throw new Error('Invalid explore data format received');
        }

        const exploreData: ExploreData = {
          popular: Array.isArray(fetchedData.popular) ? fetchedData.popular : [],
          trending: Array.isArray(fetchedData.trending) ? fetchedData.trending : [],
          upcoming: Array.isArray(fetchedData.upcoming) ? fetchedData.upcoming : [],
          recent: Array.isArray(fetchedData.recent) ? fetchedData.recent : [],
          classic: Array.isArray(fetchedData.classic) ? fetchedData.classic : [],
          featuredPlaylists: Array.isArray(fetchedData.featuredPlaylists) ? fetchedData.featuredPlaylists : [],
          stats: {
            totalGames: fetchedData.stats?.totalGames || 0,
            totalPlaylists: fetchedData.stats?.totalPlaylists || 0
          }
        };

        // Cache the data
        cachedData = {
          data: exploreData,
          timestamp: Date.now()
        };

        setData(exploreData);
        
        console.log('Successfully fetched explore data:', {
          popular: exploreData.popular.length,
          trending: exploreData.trending.length,
          upcoming: exploreData.upcoming.length,
          recent: exploreData.recent.length,
          classic: exploreData.classic.length,
          playlists: exploreData.featuredPlaylists.length,
          totalApiCalls: 1,
          cached: response.headers.get('X-Cache') === 'HIT'
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch explore data';
        console.error('Explore data fetch error:', errorMessage);
        setError(errorMessage);
        
        // Fallback to cached data if available, even if stale
        if (cachedData) {
          console.log('Using stale cached data as fallback');
          setData(cachedData.data);
          performanceMonitor.recordCacheHit();
        }
      } finally {
        setIsLoading(false);
        performanceMonitor.finishLoading();
      }
    };

    fetchExploreData();
  }, [limit, refetchTrigger, isClient]); // Depend on limit, refetchTrigger, and isClient

  const refetch = useCallback(async () => {
    // Force refetch by clearing cache and triggering useEffect
    cachedData = null;
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch
  };
}

// Helper hook for individual categories (backward compatibility)
export function useExploreCategory(category: keyof Omit<ExploreData, 'featuredPlaylists' | 'stats'>) {
  const { data, isLoading, error } = useExploreData();
  
  return {
    games: data?.[category] || [],
    isLoading,
    error,
    isEmpty: !data?.[category]?.length
  };
}

// Clear cache function for debugging/testing
export function clearExploreCache() {
  cachedData = null;
  console.log('Explore data cache cleared');
}

// Warm up cache function for better initial performance
export function warmUpExploreCache() {
  if (typeof window !== 'undefined') {
    // Preload explore data in the background
    fetch('/api/explore?limit=12', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'public, max-age=300',
      }
    }).catch(error => {
      console.warn('Failed to warm up explore cache:', error);
    });
  }
} 