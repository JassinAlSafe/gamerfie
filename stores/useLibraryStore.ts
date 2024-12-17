import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Game } from '@/types/game'

interface LibraryState {
  games: Game[];
  loading: boolean;
  error: Error | null;
  addGame: (game: Partial<Game>) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  fetchUserLibrary: (userId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  games: [],
  loading: false,
  error: null,

  addGame: async (game: Partial<Game>) => {
    const supabase = createClientComponentClient<Database>()
    set({ loading: true, error: null })

    try {
      // First, ensure the game exists in the games table
      const gameData = {
        id: game.id?.toString(),
        name: game.name,
        cover_url: game.cover?.url || game.cover_url,
        rating: game.rating || game.total_rating,
        first_release_date: game.first_release_date,
        platforms: game.platforms ? JSON.stringify(game.platforms) : null,
        genres: game.genres ? JSON.stringify(game.genres) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Adding game to games table:', gameData)

      // First insert/update the game in the games table
      const { error: gameError } = await supabase
        .from('games')
        .upsert(gameData)

      if (gameError) {
        console.error('Error upserting game:', gameError)
        throw gameError
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('No user found')

      console.log('Adding game to user_games:', { user_id: user.id, game_id: gameData.id })

      // Then add the game to user_games
      const { error: userGameError } = await supabase
        .from('user_games')
        .upsert({
          user_id: user.id,
          game_id: gameData.id,
          status: 'want_to_play',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (userGameError) {
        console.error('Error adding to user_games:', userGameError)
        throw userGameError
      }

      // Update local state
      set(state => ({
        games: [...state.games, game as Game],
        loading: false
      }))

      console.log('Game added successfully')
    } catch (error) {
      console.error('Error adding game:', error)
      set({ error: error as Error, loading: false })
      throw error
    }
  },

  removeGame: async (gameId: string) => {
    const supabase = createClientComponentClient()
    set({ loading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_games')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId)

      if (error) throw error

      // Update local state
      set(state => ({
        games: state.games.filter(game => game.id !== gameId),
        loading: false
      }))
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
        cover: game.cover_url ? { url: game.cover_url } : null,
        rating: game.rating,
        first_release_date: game.first_release_date,
        platforms: game.platforms,
        genres: game.genres
      })) as Game[];

      set({ games: transformedGames, loading: false });
    } catch (error) {
      console.error('Error fetching library:', error);
      set({ error: error as Error, loading: false });
    }
  },
})) 