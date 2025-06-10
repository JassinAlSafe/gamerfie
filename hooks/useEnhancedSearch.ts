import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { debounce } from 'lodash';

interface GameResult {
  id: string;
  name: string;
  cover_url?: string;
  igdb_id?: number;
  similarity_score?: number;
  release_date?: string;
  rating?: number;
}

interface UserResult {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  similarity_score?: number;
}

interface SearchResults {
  games: GameResult[];
  users: UserResult[];
  isLoading: boolean;
  error: string | null;
}

interface UseEnhancedSearchOptions {
  debounceMs?: number;
  gameLimit?: number;
  userLimit?: number;
}

export function useEnhancedSearch(options: UseEnhancedSearchOptions = {}) {
  const {
    debounceMs = 300,
    gameLimit = 10,
    userLimit = 5
  } = options;

  const [results, setResults] = useState<SearchResults>({
    games: [],
    users: [],
    isLoading: false,
    error: null
  });

  const supabase = createClient();

  const performSearch = async (
    query: string, 
    searchType: 'all' | 'games' | 'users' = 'all'
  ) => {
    if (query.length < 2) {
      setResults({
        games: [],
        users: [],
        isLoading: false,
        error: null
      });
      return;
    }

    setResults(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const promises = [];

      // Search games if needed
      if (searchType === 'all' || searchType === 'games') {
        promises.push(
          supabase.rpc('search_games', {
            search_term: query,
            limit_count: gameLimit
          })
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // Search users if needed  
      if (searchType === 'all' || searchType === 'users') {
        promises.push(
          supabase.rpc('search_users', {
            search_term: query,
            limit_count: userLimit
          })
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      const [gamesResult, usersResult] = await Promise.all(promises);

      if (gamesResult.error) {
        console.error('Games search error:', gamesResult.error);
      }

      if (usersResult.error) {
        console.error('Users search error:', usersResult.error);
      }

      setResults({
        games: gamesResult.data || [],
        users: usersResult.data || [],
        isLoading: false,
        error: (gamesResult.error || usersResult.error) ? 'Search error occurred' : null
      });

    } catch (error) {
      console.error('Search error:', error);
      setResults({
        games: [],
        users: [],
        isLoading: false,
        error: 'Search failed'
      });
    }
  };

  // Create debounced search function
  const debouncedSearch = useRef(
    debounce(performSearch, debounceMs)
  ).current;

  const search = useCallback((
    query: string, 
    searchType: 'all' | 'games' | 'users' = 'all'
  ) => {
    debouncedSearch(query, searchType);
  }, [debouncedSearch]);

  const searchImmediate = useCallback((
    query: string, 
    searchType: 'all' | 'games' | 'users' = 'all'
  ) => {
    performSearch(query, searchType);
  }, [gameLimit, userLimit, supabase]);

  const clearResults = useCallback(() => {
    setResults({
      games: [],
      users: [],
      isLoading: false,
      error: null
    });
  }, []);

  const getTotalResults = useCallback(() => {
    return results.games.length + results.users.length;
  }, [results.games.length, results.users.length]);

  return {
    results,
    search,
    searchImmediate,
    clearResults,
    getTotalResults,
    isLoading: results.isLoading,
    error: results.error
  };
}

// Hook for getting game recommendations
export function useGameRecommendations() {
  const [recommendations, setRecommendations] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const getRecommendations = useCallback(async (
    userId?: string,
    limit: number = 10
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_game_recommendations', {
        for_user_id: userId,
        limit_count: limit
      });

      if (rpcError) {
        throw rpcError;
      }

      setRecommendations(data || []);
    } catch (err) {
      console.error('Recommendations error:', err);
      setError('Failed to fetch recommendations');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    recommendations,
    getRecommendations,
    clearRecommendations,
    isLoading,
    error
  };
}

// Hook for social features
export function useSocialFeatures() {
  const supabase = createClient();

  const checkFriendship = useCallback(async (
    userId1: string,
    userId2: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('are_friends', {
        user1_uuid: userId1,
        user2_uuid: userId2
      });

      if (error) {
        console.error('Friendship check error:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Friendship check error:', error);
      return false;
    }
  }, [supabase]);

  const getMutualFriends = useCallback(async (
    userId1: string,
    userId2: string
  ): Promise<UserResult[]> => {
    try {
      const { data, error } = await supabase.rpc('get_mutual_friends', {
        user1_uuid: userId1,
        user2_uuid: userId2
      });

      if (error) {
        console.error('Mutual friends error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Mutual friends error:', error);
      return [];
    }
  }, [supabase]);

  const getUserActivitySummary = useCallback(async (
    userId: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('get_user_activity_summary', {
        user_uuid: userId
      });

      if (error) {
        console.error('Activity summary error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Activity summary error:', error);
      return null;
    }
  }, [supabase]);

  return {
    checkFriendship,
    getMutualFriends,
    getUserActivitySummary
  };
}

// Hook for gaming trends and analytics
export function useGamingAnalytics() {
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const getGamingTrends = useCallback(async (days: number = 30) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_gaming_trends', {
        days_back: days
      });

      if (rpcError) {
        throw rpcError;
      }

      setTrends(data || []);
    } catch (err) {
      console.error('Gaming trends error:', err);
      setError('Failed to fetch gaming trends');
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const clearTrends = useCallback(() => {
    setTrends([]);
    setError(null);
  }, []);

  return {
    trends,
    getGamingTrends,
    clearTrends,
    isLoading,
    error
  };
} 