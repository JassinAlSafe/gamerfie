import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Game } from '@/types/game'

interface LibraryState {
  games: Game[]
  isLoading: boolean
  error: string | null
  setGames: (games: Game[]) => void
  addGame: (game: Game) => Promise<void>
  removeGame: (gameId: number) => Promise<void>
  fetchUserLibrary: (userId: string) => Promise<void>
  clearLibrary: () => void
  updateGame: (gameId: number, updates: Partial<Game>) => Promise<void>
  updateGameProgress: (gameId: string, progress: {
    status?: GameStatus;
    playTime?: number;
    userRating?: number;
    notes?: string;
  }) => Promise<void>
  getGameStats: () => {
    totalGames: number;
    completedGames: number;
    totalPlayTime: number;
    averageRating: number;
  }
  updateGamesOrder: (newOrder: number[]) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => {
  const supabase = createClientComponentClient()

  return {
    games: [],
    isLoading: false,
    error: null,

    setGames: (games) => set({ games }),

    addGame: async (game) => {
      try {
        set({ isLoading: true, error: null })
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // First, insert or update the game in the games table
        const { error: gameError } = await supabase
          .from('games')
          .upsert({
            id: game.id,
            name: game.name,
            cover: game.cover,
            rating: game.rating,
            first_release_date: game.first_release_date,
            platforms: game.platforms,
            genres: game.genres
          }, { 
            onConflict: 'id'  // Update if game already exists
          });

        if (gameError) throw gameError;

        // Then create the user-game relationship
        const { error: userGameError } = await supabase
          .from('user_games')
          .insert([{ 
            user_id: user.id, 
            game_id: game.id,
            status: 'notStarted',
            display_order: get().games.length  // Add at the end of the list
          }])

        if (userGameError) throw userGameError;

        set((state) => ({ 
          games: [...state.games, game],
          isLoading: false 
        }))
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add game',
          isLoading: false 
        })
      }
    },

    removeGame: async (gameId) => {
      try {
        set({ isLoading: true, error: null })
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
          .from('user_games')
          .delete()
          .match({ user_id: user.id, game_id: gameId })

        if (error) throw error

        set((state) => ({
          games: state.games.filter(g => g.id !== gameId),
          isLoading: false
        }))
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false })
      }
    },

    fetchUserLibrary: async (userId) => {
      try {
        set({ isLoading: true, error: null })
        
        // First get user's games
        const { data: userGames, error: userGamesError } = await supabase
          .from('user_games')
          .select(`
            game_id,
            status,
            play_time,
            user_rating,
            completed_at,
            notes,
            last_played_at,
            display_order
          `)
          .eq('user_id', userId)
          .order('display_order', { ascending: true });

        if (userGamesError) throw userGamesError;

        // Then fetch the game details
        if (userGames && userGames.length > 0) {
          const { data: gamesData, error: gamesError } = await supabase
            .from('games')
            .select('*')
            .in('id', userGames.map(ug => ug.game_id));

          if (gamesError) throw gamesError;

          // Combine the data
          const games = userGames.map(userGame => {
            const gameData = gamesData?.find(g => g.id === userGame.game_id);
            return {
              ...gameData,
              playStatus: userGame.status,
              playTime: userGame.play_time,
              userRating: userGame.user_rating,
              completed: userGame.status === 'completed',
              completedAt: userGame.completed_at,
              lastPlayedAt: userGame.last_played_at,
              notes: userGame.notes
            };
          });

          set({ games, isLoading: false });
        } else {
          set({ games: [], isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch library',
          isLoading: false 
        });
      }
    },

    clearLibrary: () => set({ games: [], error: null }),

    updateGame: async (gameId, updates) => {
      try {
        set({ isLoading: true, error: null })
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
          .from('user_games')
          .update(updates)
          .match({ user_id: user.id, game_id: gameId })

        if (error) throw error

        set((state) => ({
          games: state.games.map(game => 
            game.id === gameId ? { ...game, ...updates } : game
          ),
          isLoading: false
        }))
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update game',
          isLoading: false 
        })
      }
    },

    updateGameProgress: async (gameId, progress) => {
      try {
        set({ isLoading: true, error: null });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const updates = {
          ...progress,
          completed_at: progress.status === 'completed' ? new Date().toISOString() : null,
          last_played_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('user_games')
          .update(updates)
          .match({ user_id: user.id, game_id: gameId });

        if (error) throw error;

        set((state) => ({
          games: state.games.map(game => 
            game.id === gameId 
              ? { 
                  ...game, 
                  ...progress,
                  completedAt: updates.completed_at,
                  lastPlayedAt: updates.last_played_at 
                } 
              : game
          ),
          isLoading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update game progress',
          isLoading: false 
        });
      }
    },

    getGameStats: () => {
      const { games } = get();
      return {
        totalGames: games.length,
        completedGames: games.filter(game => game.status === 'completed').length,
        totalPlayTime: games.reduce((total, game) => total + (game.playTime || 0), 0),
        averageRating: games.reduce((total, game) => total + (game.userRating || 0), 0) / games.length || 0
      };
    },

    updateGamesOrder: async (newOrder) => {
      try {
        set({ isLoading: true, error: null });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Update the order in the database
        const { error } = await supabase
          .from('user_games')
          .update({ display_order: newOrder.indexOf(game.id) })
          .in('game_id', newOrder);

        if (error) throw error;

        // Update local state
        set((state) => ({
          games: newOrder.map(id => state.games.find(g => g.id === id)!),
          isLoading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update game order',
          isLoading: false 
        });
      }
    }
  }
}) 