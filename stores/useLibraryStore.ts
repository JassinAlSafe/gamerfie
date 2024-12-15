import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Game } from '@/types/game'

interface LibraryState {
  games: Game[]
  isLoading: boolean
  error: string | null
  setGames: (games: Game[]) => void
  addGame: (game: Game) => Promise<void>
  removeGame: (gameId: string) => Promise<void>
  fetchUserLibrary: (userId: string) => Promise<void>
  clearLibrary: () => void
  updateGame: (gameId: string, updates: Partial<Game>) => Promise<void>
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
  updateGamesOrder: (newOrder: string[]) => Promise<void>;
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

        // First, update the games table through the server API
        const response = await fetch('/api/games/upsert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: game.id,
            name: game.name,
            cover: game.cover ? {
              id: game.cover.id,
              url: game.cover.url.startsWith('//') 
                ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}` 
                : game.cover.url.replace('t_thumb', 't_1080p')
            } : null,
            rating: game.rating || 0,
            first_release_date: game.first_release_date,
            platforms: game.platforms,
            genres: game.genres,
            summary: game.summary || '',
            storyline: game.storyline || ''
          })
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to update game: ${error}`);
        }

        // Get current number of games to determine the display order
        const { data: currentGames, error: countError } = await supabase
          .from('user_games')
          .select('game_id')
          .eq('user_id', user.id);

        if (countError) throw countError;

        // Then create the user-game relationship
        const { error: userGameError } = await supabase
          .from('user_games')
          .insert([{ 
            user_id: user.id, 
            game_id: game.id,
            status: 'want_to_play',
            created_at: new Date().toISOString(),
            display_order: (currentGames?.length || 0) + 1 // Add to the end of the list
          }])

        if (userGameError) throw userGameError;

        // Fetch updated library
        await get().fetchUserLibrary(user.id);
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add game',
          isLoading: false 
        })
        throw error;
      } finally {
        set({ isLoading: false })
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

        // Fetch updated library instead of updating local state directly
        await get().fetchUserLibrary(user.id);
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to remove game',
          isLoading: false 
        })
        throw error;
      }
    },

    fetchUserLibrary: async (userId) => {
      try {
        set({ isLoading: true, error: null })
        
        // First get user's games with all game details in a single query
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
            display_order,
            games (
              id,
              name,
              cover,
              rating,
              first_release_date,
              platforms,
              genres,
              summary,
              storyline
            )
          `)
          .eq('user_id', userId)
          .order('display_order', { ascending: true });

        if (userGamesError) {
          console.error('Error fetching user games:', userGamesError);
          throw userGamesError;
        }

        if (!userGames?.length) {
          set({ games: [], isLoading: false });
          return;
        }

        // Transform the data to match our Game type
        const games = userGames.map(userGame => ({
          id: userGame.game_id,
          ...userGame.games,
          status: userGame.status,
          playTime: userGame.play_time,
          userRating: userGame.user_rating,
          completedAt: userGame.completed_at,
          lastPlayedAt: userGame.last_played_at,
          notes: userGame.notes,
          displayOrder: userGame.display_order
        }));

        set({ games, isLoading: false });
      } catch (error) {
        console.error('Error in fetchUserLibrary:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch library',
          isLoading: false,
          games: []
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