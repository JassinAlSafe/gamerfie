import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Game, GamePlatform } from '@/types/game'

interface LibraryState {
  games: Game[];
  loading: boolean;
  error: string | null;
  addGame: (game: Partial<Game>) => Promise<Game>;
  removeGame: (gameId: string) => Promise<void>;
  fetchUserLibrary: (userId: string) => Promise<void>;
  updateGamesOrder: (games: Game[]) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  games: [],
  loading: false,
  error: null,

  addGame: async (game: Partial<Game>) => {
    try {
      set({ loading: true, error: null });
      const supabase = createClientComponentClient<Database>();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Transform IGDB cover URL to proper format
      let coverUrl = null;
      if (game.cover?.url) {
        try {
          const imageId = game.cover.url.split('/').pop()?.replace('t_thumb/', '');
          if (!imageId) {
            console.warn('Could not extract image ID from cover URL:', game.cover.url);
          } else {
            coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}`;
          }
        } catch (error) {
          console.error('Error processing cover URL:', error);
          // Don't throw here, just log the error and continue without a cover
        }
      }

      const timestamp = new Date().toISOString();
      // First, ensure the game exists in the games table
      const gameData = {
        id: game.id,
        name: game.name,
        cover_url: coverUrl,
        rating: game.rating,
        first_release_date: game.first_release_date,
        platforms: game.platforms ? JSON.stringify(game.platforms) : null,
        genres: game.genres ? JSON.stringify(game.genres) : null,
        summary: game.summary,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { error: gameError, data: gameResult } = await supabase
        .from('games')
        .upsert(gameData)
        .select()
        .single();

      if (gameError) {
        console.error('Error upserting game:', gameError);
        throw new Error(gameError.message);
      }

      // Then add the game to user's library
      const { error: userGameError } = await supabase
        .from('user_games')
        .upsert({
          user_id: session.user.id,
          game_id: game.id,
          status: 'want_to_play',
          updated_at: timestamp,
        });

      if (userGameError) {
        console.error('Error adding game to library:', userGameError);
        throw new Error(userGameError.message);
      }

      // Update local state with the processed game data
      const processedGame = {
        ...gameResult,
        title: gameResult.name,
        platform: 'PC' as GamePlatform,
        cover: coverUrl ? { url: coverUrl } : null,
      } as Game;

      set(state => ({
        games: [...state.games, processedGame],
        loading: false
      }));

      return processedGame;
    } catch (error) {
      console.error('Error adding game:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add game', 
        loading: false 
      });
      throw error;
    }
  },

  removeGame: async (gameId: string) => {
    const supabase = createClientComponentClient()
    set({ loading: true, error: null })

    try {
      console.log('Starting game removal process for gameId:', gameId);
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_games')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId)

      if (error) {
        console.error('Error removing game from database:', error);
        throw error;
      }

      console.log('Successfully removed game from database');

      // Update local state
      set(state => {
        console.log('Updating local state - removing game:', gameId);
        const updatedGames = state.games.filter(game => game.id !== gameId);
        console.log('Updated games count:', updatedGames.length);
        return {
          games: updatedGames,
          loading: false
        };
      });

      console.log('Game removal process completed successfully');
    } catch (error) {
      console.error('Error removing game:', error)
      set({ error: 'Failed to remove game', loading: false })
      throw error
    }
  },

  fetchUserLibrary: async (userId: string) => {
    try {
      const supabase = createClientComponentClient<Database>();
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) throw new Error('Not authenticated');

      // Update the query to join with games table to get full game data
      const { data, error } = await supabase
        .from('user_games')
        .select(`
          *,
          game:games(
            id,
            name,
            cover_url,
            rating,
            first_release_date,
            platforms,
            genres,
            summary
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Game interface
      const transformedData = data.map(item => ({
        id: item.game.id,
        title: item.game.name,
        name: item.game.name,
        cover_url: item.game.cover_url,
        cover: item.game.cover_url ? { url: item.game.cover_url } : null,
        rating: item.game.rating,
        first_release_date: item.game.first_release_date,
        platform: 'PC' as GamePlatform,
        platforms: typeof item.game.platforms === 'string' 
          ? JSON.parse(item.game.platforms) 
          : item.game.platforms,
        genres: typeof item.game.genres === 'string' 
          ? JSON.parse(item.game.genres) 
          : item.game.genres,
        summary: item.game.summary,
        status: item.status,
        playtime: item.play_time || 0,
        lastPlayed: item.last_played_at,
        achievements: item.achievements ? {
          total: item.achievements.total || 0,
          completed: item.achievements.completed || 0
        } : undefined
      }));

      set({ games: transformedData, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching library:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false 
      });
      throw error;
    }
  },

  updateGamesOrder: (games) => {
    set({ games });
  },
}))