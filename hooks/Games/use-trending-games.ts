import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UnifiedGameService, DataSource } from '@/services/unifiedGameService';
import { Game } from '@/types';
import toast from 'react-hot-toast';

interface TrendingGamesState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  sources: DataSource[];
  connectivity: { igdb: boolean; rawg: boolean } | null;
  lastUpdated: Date | null;
}

interface UseTrendingGamesOptions {
  limit?: number;
  source?: DataSource;
  enablePolling?: boolean;
  pollInterval?: number;
}

export function useTrendingGames(options: UseTrendingGamesOptions = {}) {
  const {
    limit = 12,
    source,
    enablePolling = false,
    pollInterval = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [state, setState] = useState<TrendingGamesState>({
    games: [],
    isLoading: true,
    error: null,
    sources: [],
    connectivity: null,
    lastUpdated: null
  });

  // Test connectivity first
  const { data: connectivity } = useQuery({
    queryKey: ['api-connectivity'],
    queryFn: () => UnifiedGameService.testConnectivity(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Fetch trending games
  const fetchTrendingGames = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('Fetching trending games with unified service...');
      const games = await UnifiedGameService.getTrendingGames(limit, source);
      
      // Handle empty arrays gracefully
      if (!games || games.length === 0) {
        console.log('No trending games returned from unified service');
        setState(prev => ({
          ...prev,
          games: [],
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
          sources: []
        }));
        return;
      }
      
      setState(prev => ({
        ...prev,
        games,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        sources: games.map(game => game.dataSource || 'unknown').filter((value, index, self) => self.indexOf(value) === index) as DataSource[]
      }));

      console.log(`Successfully fetched ${games.length} trending games from unified service`);
    } catch (error) {
      console.error('Error fetching trending games:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trending games';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        games: [],
        sources: []
      }));

      // Only show toast errors for actual network/service errors, not empty results
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error. Please check your connection.');
      } else if (errorMessage.includes('unavailable') || errorMessage.includes('service')) {
        toast.error('Game services are temporarily unavailable.');
      }
      // Don't show toast for empty results or minor errors
    }
  }, [limit, source]);

  // Update connectivity state
  useEffect(() => {
    if (connectivity) {
      setState(prev => ({ ...prev, connectivity }));
    }
  }, [connectivity]);

  // Initial fetch and polling
  useEffect(() => {
    fetchTrendingGames();

    if (enablePolling) {
      const interval = setInterval(fetchTrendingGames, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTrendingGames, enablePolling, pollInterval]);

  const retry = useCallback(() => {
    fetchTrendingGames();
  }, [fetchTrendingGames]);

  const getSourceInfo = useCallback(() => {
    if (!state.sources.length) return null;
    
    return {
      primary: state.sources[0],
      count: state.sources.length,
      isHybrid: state.sources.length > 1,
      sourceLabels: {
        igdb: 'IGDB',
        rawg: 'RAWG',
        auto: 'Auto',
        unknown: 'Unknown'
      }
    };
  }, [state.sources]);

  const isPartiallyAvailable = useCallback(() => {
    return connectivity && (connectivity.igdb || connectivity.rawg) && (!connectivity.igdb || !connectivity.rawg);
  }, [connectivity]);

  return {
    // Core data
    games: state.games,
    isLoading: state.isLoading,
    error: state.error,
    
    // Enhanced information
    sources: state.sources,
    connectivity: state.connectivity,
    lastUpdated: state.lastUpdated,
    
    // Helper functions
    retry,
    getSourceInfo,
    isPartiallyAvailable,
    
    // Status flags
    hasData: state.games.length > 0,
    isOffline: connectivity && !connectivity.igdb && !connectivity.rawg,
    isFullyOnline: connectivity && connectivity.igdb && connectivity.rawg,
  };
} 