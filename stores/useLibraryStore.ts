import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Game, GameStatus, GamePlatform } from '@/types/game'
import { getHighQualityImageUrl } from "@/utils/image-utils";

interface LibraryState {
  games: Game[];
  loading: boolean;
  error: string | null;
  addGame: (game: Partial<Game>) => Promise<Game>;
  removeGame: (gameId: string) => Promise<void>;
  fetchUserLibrary: (userId: string) => Promise<Game[]>;
  updateGamesOrder: (games: Game[]) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  games: [],
  loading: false,
  error: null,

  fetchUserLibrary: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const supabase = createClientComponentClient<Database>();

      const { data, error } = await supabase
        .from('user_games')
        .select(`
          *,
          games (
            id,
            name,
            cover_url
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.games?.id,
        title: item.games?.name || '',
        coverImage: item.games?.cover_url || '',
        status: item.status as GameStatus,
        rating: item.rating || 0,
        notes: item.notes || '',
        created_at: item.created_at,
        playtime: 0,
        platform: 'PC' as GamePlatform,
        achievements_total: 0,
        achievements_completed: 0,
        platforms: [],
        genres: []
      } as Game)) || [];

      set({ games: formattedData, loading: false });
      return formattedData;
    } catch (error) {
      console.error('Error fetching library:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false 
      });
      throw error;
    }
  },

  addGame: async (game: Partial<Game>) => {
    try {
      set({ loading: true, error: null });
      const supabase = createClientComponentClient<Database>();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Ensure required fields are present
      if (!game.id || !game.name) {
        throw new Error('Game ID and name are required');
      }

      // First, check if the game exists in the games table
      const { data: existingGame } = await supabase
        .from('games')
        .select('*')
        .eq('id', game.id)
        .single();

      if (!existingGame) {
        // Store the raw URL exactly as received, without any processing
        const gameData = {
          id: game.id,
          name: game.name,
          cover_url: game.cover_url || game.coverImage, // Store raw URL as-is
          platforms: game.platforms ? JSON.stringify(game.platforms) : null,
          genres: game.genres ? JSON.stringify(game.genres) : null,
          summary: game.summary
        };

        console.log('LibraryStore - Storing raw game data:', gameData);

        const { error: gameError } = await supabase
          .from('games')
          .insert(gameData);

        if (gameError) {
          console.error('Error inserting game:', gameError);
          throw gameError;
        }
      }

      // Check if game is already in user's library
      const { data: existingUserGame } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('game_id', game.id)
        .single();

      if (existingUserGame) {
        set({ loading: false });
        return game as Game; // Game already exists in library
      }

      // Add to user's library
      const { data: userGame, error: userGameError } = await supabase
        .from('user_games')
        .insert({
          user_id: session.user.id,
          game_id: game.id,
          status: 'want_to_play',
          play_time: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*, games(*)')
        .single();

      if (userGameError) throw userGameError;

      // Refresh the library after adding a new game
      await get().fetchUserLibrary(session.user.id);

      return userGame as unknown as Game;
    } catch (error) {
      console.error('Error adding game to library:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false 
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeGame: async (gameId: string) => {
    try {
      set({ loading: true, error: null });
      const supabase = createClientComponentClient<Database>();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_games')
        .delete()
        .eq('user_id', session.user.id)
        .eq('game_id', gameId);

      if (error) throw error;

      // Update local state after removal
      set(state => ({
        games: state.games.filter(game => game.id !== gameId)
      }));
    } catch (error) {
      console.error('Error removing game from library:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false 
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateGamesOrder: (games) => {
    set({ games });
  },
}))