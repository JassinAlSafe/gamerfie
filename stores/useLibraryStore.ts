import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { Game } from '@/types'

interface LibraryState {
  games: Game[]
  loading: boolean
  setGames: (games: Game[]) => void
  setLoading: (loading: boolean) => void
  addGame: (game: Game) => void
  removeGame: (gameId: string) => void
  updateGame: (gameId: string, updates: Partial<Game>) => void
  updateGamesOrder: (orderedGames: Game[]) => void
  
  // Actions
  fetchUserGames: (userId: string) => Promise<void>
  fetchUserLibrary: (userId: string) => Promise<void>
  addGameToLibrary: (gameId: string, userId: string) => Promise<void>
  removeGameFromLibrary: (gameId: string, userId: string) => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  games: [],
  loading: false,
  
  setGames: (games) => set({ games }),
  setLoading: (loading) => set({ loading }),
  
  addGame: (game) => set((state) => ({
    games: [...state.games, game]
  })),
  
  removeGame: (gameId) => set((state) => ({
    games: state.games.filter(game => game.id !== gameId)
  })),
  
  updateGame: (gameId, updates) => set((state) => ({
    games: state.games.map(game => 
      game.id === gameId ? { ...game, ...updates } : game
    )
  })),
  
  updateGamesOrder: (orderedGames) => set({ games: orderedGames }),
  
  fetchUserGames: async (userId: string) => {
    set({ loading: true })
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_games')
        .select(`
          *,
          game:games(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.warn('Games feature not available:', error.message)
        set({ games: [], loading: false })
        return
      }
      
      const games = data?.map(item => item.game).filter(Boolean) || []
      set({ games })
    } catch (error) {
      console.warn('Error fetching user games (table may not exist):', error)
      set({ games: [], loading: false })
    } finally {
      set({ loading: false })
    }
  },
  
  fetchUserLibrary: async (userId: string) => {
    await get().fetchUserGames(userId)
  },
  
  addGameToLibrary: async (gameId: string, userId: string) => {
    const supabase = createClient()
    
    // First check if the game exists in our games table
    const { data: existingGame } = await supabase
      .from('games')
      .select('id')
      .eq('id', gameId)
      .maybeSingle();

    // If game doesn't exist in our database, create a minimal entry
    if (!existingGame) {
      const { error: gameError } = await supabase
        .from('games')
        .insert({
          id: gameId,
          name: `Game ${gameId}`, // Fallback name
          cover_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (gameError) {
        console.error('Error inserting game:', gameError)
        throw gameError
      }
    }
    
    const { error } = await supabase
      .from('user_games')
      .insert({
        user_id: userId,
        game_id: gameId,
        status: 'backlog',
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error adding game to library:', error)
      throw error
    }
    
    // Refresh the games list
    get().fetchUserGames(userId)
  },
  
  removeGameFromLibrary: async (gameId: string, userId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('user_games')
      .delete()
      .match({ user_id: userId, game_id: gameId })
    
    if (error) {
      console.error('Error removing game from library:', error)
      throw error
    }
    
    // Remove from local state
    get().removeGame(gameId)
  },
}))