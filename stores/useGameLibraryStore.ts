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
    // Basic counts (from types/user.ts)
    total_played: 0,
    played_this_year: 0,
    backlog: 0,
    // Extended stats
    totalGames: 0,
    totalPlaytime: 0,
    recentlyPlayed: [],
    mostPlayed: [],
  },

  fetchGameLibrary: async (userId: string) => {
    if (!userId) {
      set({ error: 'User ID is required' });
      return;
    }

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

      const games = userGames || [];

      // Calculate comprehensive stats
      const totalGames = games.length;
      const totalPlaytime = games.reduce((total, game) => total + (game.play_time || 0), 0);

      // Calculate basic counts
      const total_played = games.filter(game => 
        ['playing', 'completed', 'dropped'].includes(game.status)
      ).length;

      const backlog = games.filter(game => game.status === 'want_to_play').length;

      // Calculate games played this year
      const currentYear = new Date().getFullYear();
      const played_this_year = games.filter(game => {
        if (!game.last_played_at) return false;
        const lastPlayedYear = new Date(game.last_played_at).getFullYear();
        return lastPlayedYear === currentYear;
      }).length;

      // Get recently played games (last 5)
      const recentlyPlayed = games
        .filter(game => game.last_played_at)
        .slice(0, 5)
        .map(game => ({
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
        }));

      // Get most played games (top 5 by playtime)
      const mostPlayed = [...games]
        .sort((a, b) => (b.play_time || 0) - (a.play_time || 0))
        .slice(0, 5)
        .map(game => ({
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
        }));

      const completeStats: GameStats = {
        // Basic counts
        total_played,
        played_this_year,
        backlog,
        // Extended stats
        totalGames,
        totalPlaytime,
        recentlyPlayed,
        mostPlayed,
      };

      set({ stats: completeStats });
    } catch (error) {
      console.error('Error fetching game library:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch game library';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  }
})); 