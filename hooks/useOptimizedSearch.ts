import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";
import { Game } from "@/types";

interface UseOptimizedSearchOptions {
  endpoint?: string;
  debounceMs?: number;
  minQueryLength?: number;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
}

interface SearchResult {
  query: string;
  debouncedQuery: string;
  results: Game[];
  isSearching: boolean;
  isLoading: boolean;
  error: Error | null;
  hasResults: boolean;
  isEmpty: boolean;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  refetch: () => void;
}

/**
 * Optimized search hook with debouncing, caching, and performance optimizations
 */
export function useOptimizedSearch({
  endpoint = "/api/games/search",
  debounceMs = 300,
  minQueryLength = 2,
  staleTime = 1000 * 60 * 5, // 5 minutes
  cacheTime = 1000 * 60 * 10, // 10 minutes
  enabled = true,
}: UseOptimizedSearchOptions = {}): SearchResult {
  
  const [query, setQueryState] = useState("");
  const debouncedQuery = useDebounce(query, debounceMs);
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldSearch = useMemo(() => {
    return enabled && 
           debouncedQuery.length >= minQueryLength && 
           debouncedQuery.trim() !== "";
  }, [enabled, debouncedQuery, minQueryLength]);

  const searchGames = useCallback(async (): Promise<Game[]> => {
    if (!shouldSearch) return [];

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const trimmedQuery = debouncedQuery.trim();
      const url = `${endpoint}?q=${encodeURIComponent(trimmedQuery)}`;
      
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      const games = Array.isArray(data) ? data : data.games || data.results || [];
      
      return games;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't throw
        return [];
      }
      throw error;
    }
  }, [shouldSearch, debouncedQuery, endpoint]);

  const {
    data: results = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Game[], Error>({
    queryKey: ["search", debouncedQuery],
    queryFn: searchGames,
    enabled: shouldSearch,
    staleTime,
    gcTime: cacheTime,
    placeholderData: [], // Updated from keepPreviousData
    retry: (failureCount, error) => {
      // Don't retry on client errors or aborted requests
      if (error instanceof Error && (
        error.name === 'AbortError' ||
        error.message.includes('400') ||
        error.message.includes('404')
      )) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState("");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const isSearching = useMemo(() => {
    return query.length >= minQueryLength && query.trim() !== "";
  }, [query, minQueryLength]);

  const hasResults = useMemo(() => {
    return results.length > 0;
  }, [results]);

  const isEmpty = useMemo(() => {
    return shouldSearch && !isLoading && results.length === 0;
  }, [shouldSearch, isLoading, results]);

  return {
    query,
    debouncedQuery,
    results,
    isSearching,
    isLoading,
    error: error as Error | null,
    hasResults,
    isEmpty,
    setQuery,
    clearQuery,
    refetch,
  };
}