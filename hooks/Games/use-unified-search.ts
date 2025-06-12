import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UnifiedGameService, DataSource, SearchStrategy } from '@/services/unifiedGameService';
import { Game } from '@/types';
import { useDebounce } from '@/hooks/Settings/useDebounce';
import toast from 'react-hot-toast';

interface GameSearchResult {
  games: Game[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  search_time?: number;
  sources: DataSource[];
  cache_hit: boolean;
}

interface UseUnifiedSearchOptions {
  debounceMs?: number;
  strategy?: SearchStrategy;
  source?: DataSource;
  cacheEnabled?: boolean;
  autoSearch?: boolean;
  minQueryLength?: number;
}

interface SearchState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
  connectivity: { igdb: boolean; rawg: boolean } | null;
}

export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}) {
  const {
    debounceMs = 300,
    strategy = 'combined',
    source = 'auto',
    cacheEnabled = true,
    autoSearch = true,
    minQueryLength = 2
  } = options;

  const queryClient = useQueryClient();
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    isSearching: false,
    hasSearched: false,
    error: null,
    connectivity: null
  });

  const [searchResults, setSearchResults] = useState<GameSearchResult>({
    games: [],
    total_count: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
    sources: [],
    cache_hit: false
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const debouncedQuery = useDebounce(searchState.query, debounceMs);

  // Test API connectivity on mount
  const { data: connectivity } = useQuery({
    queryKey: ['api-connectivity'],
    queryFn: () => UnifiedGameService.testConnectivity(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  useEffect(() => {
    if (connectivity) {
      setSearchState(prev => ({ ...prev, connectivity }));
    }
  }, [connectivity]);

  // Perform search
  const performSearch = useCallback(async (
    query: string,
    currentPage: number = 1,
    currentPageSize: number = 20,
    searchOptions?: {
      strategy?: SearchStrategy;
      source?: DataSource;
      useCache?: boolean;
    }
  ) => {
    if (!query || query.trim().length < minQueryLength) {
      setSearchResults({
        games: [],
        total_count: 0,
        page: currentPage,
        page_size: currentPageSize,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false,
        sources: [],
        cache_hit: false
      });
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      error: null,
      hasSearched: true
    }));

    try {
      const startTime = Date.now();
      const result = await UnifiedGameService.searchGames(
        query.trim(),
        currentPage,
        currentPageSize,
        {
          strategy: searchOptions?.strategy || strategy,
          useCache: searchOptions?.useCache ?? cacheEnabled,
          source: searchOptions?.source || source
        }
      );

      const searchTime = Date.now() - startTime;
      
      const formattedResult: GameSearchResult = {
        games: result.games,
        total_count: result.total,
        page: result.page,
        page_size: result.pageSize,
        total_pages: Math.ceil(result.total / result.pageSize),
        has_next_page: result.hasNextPage,
        has_previous_page: result.hasPreviousPage,
        search_time: searchTime,
        sources: result.sources,
        cache_hit: result.cacheHit || false
      };

      setSearchResults(formattedResult);
      
      // Show cache hit info in development
      if (process.env.NODE_ENV === 'development' && result.cacheHit) {
        console.log(`🎯 Cache hit for "${query}" (${searchTime}ms)`);
      }

    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      
      setSearchState(prev => ({
        ...prev,
        error: errorMessage
      }));

      // Show user-friendly error toast
      if (errorMessage.includes('unavailable')) {
        toast.error('Game search services are temporarily unavailable. Please try again later.');
      } else {
        toast.error('Search failed. Please check your connection and try again.');
      }
    } finally {
      setSearchState(prev => ({
        ...prev,
        isSearching: false
      }));
    }
  }, [strategy, source, cacheEnabled, minQueryLength]);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (autoSearch && debouncedQuery !== searchState.query) {
      setPage(1); // Reset to first page on new search
      performSearch(debouncedQuery, 1, pageSize);
    }
  }, [debouncedQuery, autoSearch, performSearch, pageSize, searchState.query]);

  // Manual search function
  const search = useCallback((
    query: string,
    options?: {
      strategy?: SearchStrategy;
      source?: DataSource;
      useCache?: boolean;
    }
  ) => {
    setSearchState(prev => ({ ...prev, query }));
    setPage(1);
    performSearch(query, 1, pageSize, options);
  }, [performSearch, pageSize]);

  // Load next page
  const loadNextPage = useCallback(() => {
    if (searchResults.has_next_page && !searchState.isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      performSearch(debouncedQuery, nextPage, pageSize);
    }
  }, [searchResults.has_next_page, searchState.isSearching, page, debouncedQuery, pageSize, performSearch]);

  // Load previous page
  const loadPreviousPage = useCallback(() => {
    if (searchResults.has_previous_page && !searchState.isSearching && page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      performSearch(debouncedQuery, prevPage, pageSize);
    }
  }, [searchResults.has_previous_page, searchState.isSearching, page, debouncedQuery, pageSize, performSearch]);

  // Go to specific page
  const goToPage = useCallback((targetPage: number) => {
    if (targetPage >= 1 && targetPage <= searchResults.total_pages && targetPage !== page) {
      setPage(targetPage);
      performSearch(debouncedQuery, targetPage, pageSize);
    }
  }, [searchResults.total_pages, page, debouncedQuery, pageSize, performSearch]);

  // Change page size
  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    performSearch(debouncedQuery, 1, newPageSize);
  }, [debouncedQuery, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setSearchState({
      query: '',
      isSearching: false,
      hasSearched: false,
      error: null,
      connectivity: searchState.connectivity
    });
    
    setSearchResults({
      games: [],
      total_count: 0,
      page: 1,
      page_size: pageSize,
      total_pages: 0,
      has_next_page: false,
      has_previous_page: false,
      sources: [],
      cache_hit: false
    });
    
    setPage(1);
  }, [pageSize, searchState.connectivity]);

  // Get suggestions (quick search for autocomplete)
  const getSuggestions = useCallback(async (
    query: string,
    limit: number = 5
  ): Promise<Game[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const result = await UnifiedGameService.searchGames(
        query.trim(),
        1,
        limit,
        { useCache: true, strategy: 'rawg_first' } // RAWG is better for quick suggestions
      );
      return result.games;
    } catch (error) {
      console.warn('Suggestions failed:', error);
      return [];
    }
  }, []);

  // Update query without triggering search (for controlled inputs)
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return UnifiedGameService.getCacheStats();
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    UnifiedGameService.clearCache();
    queryClient.invalidateQueries({ queryKey: ['unified-search'] });
    toast.success('Search cache cleared');
  }, [queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Search state
    query: searchState.query,
    isSearching: searchState.isSearching,
    hasSearched: searchState.hasSearched,
    error: searchState.error,
    connectivity: searchState.connectivity,
    
    // Results
    results: searchResults,
    games: searchResults.games,
    totalCount: searchResults.total_count,
    
    // Pagination
    page,
    pageSize,
    totalPages: searchResults.total_pages,
    hasNextPage: searchResults.has_next_page,
    hasPreviousPage: searchResults.has_previous_page,
    
    // Actions
    search,
    setQuery,
    clearSearch,
    loadNextPage,
    loadPreviousPage,
    goToPage,
    changePageSize,
    getSuggestions,
    
    // Cache management
    getCacheStats,
    clearCache,
    
    // Performance info
    searchTime: searchResults.search_time,
    cacheHit: searchResults.cache_hit,
    sources: searchResults.sources
  };
} 