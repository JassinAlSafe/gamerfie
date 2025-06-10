import { create } from 'zustand';
import { GameStats } from '@/types/user';
import { createClient } from '@/utils/supabase/client';

interface GameLibraryState {
  isLoading: boolean;
  error: string | null;
  stats: GameStats;
  fetchGameLibrary: (userId: string) => Promise<void>;
}

export const useGameLibraryStore = create<GameLibraryState>((set) => ({
  isLoading: false,
  error: null,
  stats: {
    totalGames: 0,
    totalPlaytime: 0,
    recentlyPlayed: [],
    mostPlayed: [],
  },
  fetchGameLibrary: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();

      // Fetch user's games with stats
      const { data: userGames, error: gamesError } = await supabase
        .from('user_games')
        .select(`
          *,
          games (
            id,
            name,
            cover_url,
            platforms,
            genres,
            summary,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('last_played_at', { ascending: false });

      if (gamesError) throw gamesError;

      // Calculate stats
      const totalGames = userGames?.length || 0;
      const totalPlaytime = userGames?.reduce((total, game) => total + (game.play_time || 0), 0) || 0;

      // Get recently played games (last 5)
      const recentlyPlayed = userGames
        ?.filter(game => game.last_played_at)
        ?.slice(0, 5)
        ?.map(game => ({
          id: game.game_id,
          name: game.games?.name || '',
          title: game.games?.name || '',
          cover_url: game.games?.cover_url || null,
          platforms: game.games?.platforms ? JSON.parse(game.games.platforms) : [],
          genres: game.games?.genres ? JSON.parse(game.games.genres) : [],
          status: game.status,
          rating: game.user_rating || 0,
          summary: game.games?.summary || '',
          first_release_date: undefined,
          created_at: game.created_at,
          updated_at: game.updated_at
        })) || [];

      // Get most played games (top 5 by playtime)
      const mostPlayed = [...(userGames || [])]
        ?.sort((a, b) => (b.play_time || 0) - (a.play_time || 0))
        ?.slice(0, 5)
        ?.map(game => ({
          id: game.game_id,
          name: game.games?.name || '',
          title: game.games?.name || '',
          cover_url: game.games?.cover_url || null,
          platforms: game.games?.platforms ? JSON.parse(game.games.platforms) : [],
          genres: game.games?.genres ? JSON.parse(game.games.genres) : [],
          status: game.status,
          rating: game.user_rating || 0,
          summary: game.games?.summary || '',
          first_release_date: undefined,
          created_at: game.created_at,
          updated_at: game.updated_at
        })) || [];

      set({
        stats: {
          totalGames,
          totalPlaytime,
          recentlyPlayed,
          mostPlayed
        }
      });
    } catch (error) {
      console.error('Error fetching game library:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch game library' });
    } finally {
      set({ isLoading: false });
    }
  }
})); 