"use client";

import { useState, useEffect } from 'react';
import { Game } from '@/types/game';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useDebounce } from '@/hooks/use-debounce';

export function useGameSearch(query: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedQuery.trim()) {
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
            genres:game_genres(id, name),
            achievements:game_achievements(id, name, description)
          `)
          .ilike('name', `%${debouncedQuery}%`)
          .limit(10);

        if (searchError) throw searchError;

        setGames(data || []);
      } catch (err) {
        console.error('Error searching games:', err);
        setError(err instanceof Error ? err : new Error('Failed to search games'));
      } finally {
        setIsLoading(false);
      }
    };

    searchGames();
  }, [debouncedQuery, supabase]);

  return { games, isLoading, error };
} 