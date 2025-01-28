import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Game } from '@/types/game'

interface LibraryState {
  games: Game[];
  loading: boolean;
  error: string | null;
  addGame: (game: Partial<Game>) => Promise<Game>;
  removeGame: (gameId: string) => Promise<void>;
  fetchUserLibrary: (userId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
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
    const supabase = createClientComponentClient<Database>();
    set({ loading: true, error: null });

    try {
      // First get all user's games
      const { data: userGames, error: userGamesError } = await supabase
        .from('user_games')
        .select('game_id')
        .eq('user_id', userId);

      if (userGamesError) throw userGamesError;

      if (!userGames.length) {
        set({ games: [], loading: false });
        return;
      }

      // Then get the game details for each game
      const gameIds = userGames.map(ug => ug.game_id);
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .in('id', gameIds);

      if (gamesError) throw gamesError;

      // Transform the games to match the Game interface
      const transformedGames = games.map(game => ({
        id: game.id,
        name: game.name,
        cover: game.cover_url ? {
          url: game.cover_url.startsWith('//') 
            ? `https:${game.cover_url.replace('t_thumb', 't_cover_big').replace('t_micro', 't_cover_big')}` 
            : game.cover_url.replace('t_thumb', 't_cover_big').replace('t_micro', 't_cover_big')
        } : null,
        rating: game.rating,
        first_release_date: game.first_release_date,
        platforms: game.platforms ? JSON.parse(game.platforms as string) : null,
        genres: game.genres ? JSON.parse(game.genres as string) : null,
        summary: game.summary
      })) as Game[];

      console.log('Transformed games:', transformedGames); // Debug log
      set({ games: transformedGames, loading: false });
    } catch (error) {
      console.error('Error fetching library:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch library', loading: false });
    }
  },
})) 