"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/game';
import { createClient } from "@/utils/supabase/client";
import { useDebounce } from '@/hooks/Settings/use-debounce';
import { useGamesStore } from '@/stores/useGamesStore';
import { useSearchStore } from '@/stores/useSearchStore';


export interface SearchState {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: () => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface SearchResults {
  games: Game[];
  isLoading: boolean;
  error: Error | null;
}

export function useGameSearch(): SearchResults & SearchState {
  const router = useRouter();
  const { query, setQuery } = useSearchStore();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debouncedSearch = useDebounce(query, 300);
  const setSelectedCategory = useGamesStore((state) => state.setSelectedCategory);
  const supabase = createClient();

  const handleSearch = useCallback(() => {
    if (debouncedSearch.trim()) {
      setSelectedCategory("all");
      router.push(`/all-games?search=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch, router, setSelectedCategory]);


  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedSearch.trim()) {
        setGames([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: searchError } = await supabase
          .from('games')
          .select(`
            id,
            name,
            cover_url,
           description,
           rating,
           release_date,
           platforms,
          `)
          .ilike('name', `%${debouncedSearch}%`)
          .limit(10);

        if (searchError) throw searchError;

        const mappedGames: Game[] = (data || []).map((game: any) => ({
          id: game.id,
          name: game.name,
          cover_url: game.cover_url,
          description: game.description || '',
          rating: game.rating || 0,
          releaseDate: game.release_date || '',
          platforms: game.platforms || [],
          genres: [],
          achievements: []
        }));

        setGames(mappedGames);
      } catch (err) {
        console.error('Error searching games:', err);
        setError(err instanceof Error ? err : new Error('Failed to search games'));
      } finally {
        setIsLoading(false);
      }
    };

    searchGames();
  }, [debouncedSearch, supabase]);

  return {
    // Search results
    games,
    isLoading,
    error,
    // Search state and handlers
    query,
    setQuery,
    handleSearch,
    handleSearchChange,
    handleKeyPress,
  };
}