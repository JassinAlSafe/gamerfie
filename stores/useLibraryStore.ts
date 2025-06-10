import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { Game } from '@/types'
import { normalizeGameData } from '@/utils/json-utils'
import type { GameStats } from '@/types/user'

interface LibraryState {
  games: Game[]
  loading: boolean
  error: string | null
  stats: GameStats
  
  // Local state management
  setGames: (games: Game[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game>) => void
  updateGamesOrder: (games: Game[]) => void
  
  // Database operations
  fetchUserLibrary: (userId: string) => Promise<void>
  addGameToLibrary: (game: Game, userId: string) => Promise<void>
  removeGameFromLibrary: (gameId: string, userId: string) => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  games: [],
  loading: false,
  error: null,
  stats: {
    total_played: 0,
    played_this_year: 0,
    backlog: 0,
    totalGames: 0,
    totalPlaytime: 0,
    recentlyPlayed: [],
    mostPlayed: [],
  },
  
  setGames: (games) => set({ games }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  removeGame: (gameId) => set((state) => ({
    games: state.games.filter(game => game.id !== gameId)
  })),
  
  updateGame: (gameId, updates) => set((state) => ({
    games: state.games.map(game => 
      game.id === gameId ? { ...game, ...updates } : game
    )
  })),
  
  updateGamesOrder: (games) => set({ games }),
  
  fetchUserLibrary: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data, error } = await supabase
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
            first_release_date,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.warn('Games feature not available:', error.message)
        set({ games: [], loading: false, error: error.message })
        return
      }
      
      // Transform and flatten the data
      const games = data?.map(item => {
        if (!item.games || !item.games.id) {
          console.warn('Invalid game data:', item);
          return null;
        }
        
        const normalizedGame = normalizeGameData(item.games);
        if (!normalizedGame) return null;
        
        return {
          ...normalizedGame,
          // Add user-specific data
          status: item.status,
          user_rating: item.user_rating,
          play_time: item.play_time,
          progress: item.progress,
          last_played_at: item.last_played_at,
          updated_at: item.updated_at,
        };
      }).filter(Boolean) || []
      
      // Calculate comprehensive stats in one batch
      const totalGames = games.length;
      const totalPlaytime = data?.reduce((total, item) => total + (item.play_time || 0), 0) || 0;

      // Calculate basic counts
      const total_played = data?.filter(item => 
        ['playing', 'completed', 'dropped'].includes(item.status)
      ).length || 0;

      const backlog = data?.filter(item => item.status === 'want_to_play').length || 0;

      // Calculate games played this year
      const currentYear = new Date().getFullYear();
      const played_this_year = data?.filter(item => {
        if (!item.last_played_at) return false;
        const lastPlayedYear = new Date(item.last_played_at).getFullYear();
        return lastPlayedYear === currentYear;
      }).length || 0;

      // Get recently played games (last 5)
      const recentlyPlayed = data?.filter(item => item.last_played_at)
        .sort((a, b) => new Date(b.last_played_at).getTime() - new Date(a.last_played_at).getTime())
        .slice(0, 5)
        .map(item => {
          const normalizedGame = normalizeGameData(item.games);
          return normalizedGame ? {
            ...normalizedGame,
            status: item.status,
            rating: item.user_rating || 0,
            created_at: item.created_at,
            updated_at: item.updated_at
          } : null;
        }).filter(Boolean) || [];

      // Get most played games (top 5 by playtime)
      const mostPlayed = [...(data || [])]
        .sort((a, b) => (b.play_time || 0) - (a.play_time || 0))
        .slice(0, 5)
        .map(item => {
          const normalizedGame = normalizeGameData(item.games);
          return normalizedGame ? {
            ...normalizedGame,
            status: item.status,
            rating: item.user_rating || 0,
            created_at: item.created_at,
            updated_at: item.updated_at
          } : null;
        }).filter(Boolean) || [];

      const completeStats: GameStats = {
        total_played,
        played_this_year,
        backlog,
        totalGames,
        totalPlaytime,
        recentlyPlayed,
        mostPlayed,
      };
      
      // Single state update to prevent multiple re-renders
      set({ 
        games, 
        stats: completeStats, 
        loading: false,
        error: null 
      })
    } catch (error) {
      console.warn('Error fetching user library:', error)
      set({ 
        games: [], 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          total_played: 0,
          played_this_year: 0,
          backlog: 0,
          totalGames: 0,
          totalPlaytime: 0,
          recentlyPlayed: [],
          mostPlayed: [],
        }
      })
    }
  },
  
  addGameToLibrary: async (game: Game, userId: string) => {
    const supabase = createClient()
    
    try {
      set({ loading: true, error: null })
      
      // Upsert the game with complete data
      const { error: gameError } = await supabase
        .from('games')
        .upsert({
          id: game.id,
          name: game.name || `Game ${game.id}`,
          cover_url: game.cover_url || null,
          platforms: game.platforms ? JSON.stringify(game.platforms) : null,
          genres: game.genres ? JSON.stringify(game.genres) : null,
          summary: game.summary || null,
          first_release_date: game.first_release_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (gameError) {
        throw gameError
      }
      
      // Add to user's library
      const { error: userGameError } = await supabase
        .from('user_games')
        .insert({
          user_id: userId,
          game_id: game.id,
          status: 'want_to_play',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (userGameError) {
        // If duplicate, that's fine - game already in library
        if (userGameError.code !== '23505') {
          throw userGameError
        }
      }
      
      // Refresh the library
      await get().fetchUserLibrary(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add game to library'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },
  
  removeGameFromLibrary: async (gameId: string, userId: string) => {
    const supabase = createClient()
    
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase
        .from('user_games')
        .delete()
        .match({ user_id: userId, game_id: gameId })
      
      if (error) {
        throw error
      }
      
      // Remove from local state immediately for better UX
      get().removeGame(gameId)
      set({ loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove game from library'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

}))