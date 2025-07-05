import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Game, Platform, Genre } from '@/types'

// Enhanced game with metadata
interface CachedGame extends Game {
  timestamp: number
  fetchCount: number
  lastAccessed: number
  source: 'cache' | 'api'
  error?: string
}

// Per-game loading and error states
interface GameState {
  isLoading: boolean
  error: string | null
  retryCount: number
}

interface GameDetailsState {
  // Data storage
  games: Record<string, CachedGame>
  gameStates: Record<string, GameState>
  
  // Global state
  globalLoading: boolean
  
  // Configuration
  maxCacheSize: number
  defaultCacheTTL: number
  maxRetries: number
  
  // Core actions
  setGame: (game: Game, source?: 'cache' | 'api') => void
  getGame: (id: string) => CachedGame | undefined
  fetchGame: (id: string, force?: boolean) => Promise<Game | null>
  
  // Enhanced actions
  prefetchGame: (id: string) => Promise<void>
  refreshGame: (id: string) => Promise<void>
  getGameError: (id: string) => string | null
  isGameLoading: (id: string) => boolean
  
  // Cache management
  clearCache: () => void
  clearStaleCache: (maxAge?: number) => void
  clearGameCache: (id: string) => void
  optimizeCache: () => void
  getCacheStats: () => {
    totalGames: number
    cacheSize: number
    staleCacheCount: number
    mostAccessed: string[]
  }
  
  // Utilities
  markGameAccessed: (id: string) => void
  resetGameError: (id: string) => void
}

// Game data processing utility
const processGameData = (game: any): Game => {
  return {
    ...game,
    // Ensure platforms are in correct format
    platforms: Array.isArray(game.platforms) 
      ? game.platforms.map((p: string | Platform) => 
          typeof p === 'string' ? { id: p, name: p } : p
        )
      : [],
    // Ensure genres are in correct format  
    genres: Array.isArray(game.genres)
      ? game.genres.map((g: string | Genre) => 
          typeof g === 'string' ? { id: g, name: g } : g
        )
      : [],
    // Set defaults for missing fields
    summary: game.summary || undefined,
    storyline: game.storyline || undefined,
    rating: game.rating || 0,
    first_release_date: game.first_release_date || undefined
  }
}

export const useGameDetailsStore = create<GameDetailsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        games: {},
        gameStates: {},
        globalLoading: false,
        maxCacheSize: 100, // Limit cache size
        defaultCacheTTL: 1000 * 60 * 60, // 1 hour
        maxRetries: 3,

        // Core actions
        setGame: (game, source = 'api') => {
          const now = Date.now()
          const existing = get().games[game.id]
          
          set((state) => ({
            games: {
              ...state.games,
              [game.id]: {
                ...processGameData(game),
                timestamp: now,
                fetchCount: existing ? existing.fetchCount + 1 : 1,
                lastAccessed: now,
                source,
              }
            },
            gameStates: {
              ...state.gameStates,
              [game.id]: {
                isLoading: false,
                error: null,
                retryCount: 0,
              }
            }
          }))
          
          // Auto-cleanup if cache is too large
          const { games } = get()
          if (Object.keys(games).length > get().maxCacheSize) {
            get().optimizeCache()
          }
        },

        getGame: (id) => {
          const game = get().games[id]
          if (game) {
            get().markGameAccessed(id)
          }
          return game
        },

        fetchGame: async (id, force = false) => {
          const state = get()
          const cachedGame = state.games[id]
          const gameState = state.gameStates[id]
          
          // Check if already loading
          if (gameState?.isLoading) {
            return null
          }
          
          // Check cache validity
          if (!force && cachedGame && Date.now() - cachedGame.timestamp < state.defaultCacheTTL) {
            get().markGameAccessed(id)
            return { ...cachedGame, timestamp: undefined } as Game
          }
          
          // Check retry limit
          if (gameState?.retryCount >= state.maxRetries) {
            return null
          }
          
          try {
            // Set loading state for this specific game
            set((state) => ({
              gameStates: {
                ...state.gameStates,
                [id]: {
                  isLoading: true,
                  error: null,
                  retryCount: (state.gameStates[id]?.retryCount || 0),
                }
              }
            }))
            
            const response = await fetch(`/api/games/${id}`)
            if (!response.ok) {
              throw new Error(`Failed to fetch game: ${response.status} ${response.statusText}`)
            }
            
            const game = await response.json()
            if (!game) {
              throw new Error('Game not found')
            }

            get().setGame(game, 'api')
            return processGameData(game)
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch game'
            
            set((state) => ({
              gameStates: {
                ...state.gameStates,
                [id]: {
                  isLoading: false,
                  error: errorMessage,
                  retryCount: (state.gameStates[id]?.retryCount || 0) + 1,
                }
              }
            }))
            
            // Log error for debugging (only in development)
            if (process.env.NODE_ENV === 'development') {
              console.error(`Error fetching game ${id}:`, error)
            }
            
            return null
          }
        },

        // Enhanced actions
        prefetchGame: async (id) => {
          // Only prefetch if not already cached
          const cachedGame = get().games[id]
          if (!cachedGame || Date.now() - cachedGame.timestamp > get().defaultCacheTTL) {
            await get().fetchGame(id)
          }
        },

        refreshGame: async (id) => {
          await get().fetchGame(id, true)
        },

        getGameError: (id) => {
          return get().gameStates[id]?.error || null
        },

        isGameLoading: (id) => {
          return get().gameStates[id]?.isLoading || false
        },

        // Cache management
        clearCache: () => set({ 
          games: {}, 
          gameStates: {} 
        }),

        clearGameCache: (id) => set((state) => {
          const { [id]: removedGame, ...remainingGames } = state.games
          const { [id]: removedState, ...remainingStates } = state.gameStates
          return {
            games: remainingGames,
            gameStates: remainingStates
          }
        }),

        clearStaleCache: (maxAge = get().defaultCacheTTL) => {
          const now = Date.now()
          set((state) => ({
            games: Object.fromEntries(
              Object.entries(state.games).filter(
                ([_, game]) => now - game.timestamp < maxAge
              )
            ),
            gameStates: Object.fromEntries(
              Object.entries(state.gameStates).filter(
                ([id]) => state.games[id] && now - state.games[id].timestamp < maxAge
              )
            )
          }))
        },

        optimizeCache: () => {
          const { games, maxCacheSize } = get()
          const gameEntries = Object.entries(games)
          
          if (gameEntries.length <= maxCacheSize) return
          
          // Sort by last accessed time and keep the most recent ones
          const sortedGames = gameEntries
            .sort(([, a], [, b]) => b.lastAccessed - a.lastAccessed)
            .slice(0, maxCacheSize)
          
          set((state) => ({
            games: Object.fromEntries(sortedGames),
            gameStates: Object.fromEntries(
              sortedGames.map(([id]) => [id, state.gameStates[id]]).filter(([, state]) => state)
            )
          }))
        },

        getCacheStats: () => {
          const { games } = get()
          const gameEntries = Object.entries(games)
          const now = Date.now()
          
          return {
            totalGames: gameEntries.length,
            cacheSize: JSON.stringify(games).length,
            staleCacheCount: gameEntries.filter(
              ([, game]) => now - game.timestamp > get().defaultCacheTTL
            ).length,
            mostAccessed: gameEntries
              .sort(([, a], [, b]) => b.fetchCount - a.fetchCount)
              .slice(0, 5)
              .map(([, game]) => `${game.name} (${game.fetchCount} fetches)`)
          }
        },

        markGameAccessed: (id) => {
          const game = get().games[id]
          if (game) {
            set((state) => ({
              games: {
                ...state.games,
                [id]: {
                  ...game,
                  lastAccessed: Date.now()
                }
              }
            }))
          }
        },

        resetGameError: (id) => {
          set((state) => ({
            gameStates: {
              ...state.gameStates,
              [id]: {
                ...state.gameStates[id],
                error: null,
                retryCount: 0,
              }
            }
          }))
        },
      }),
      {
        name: 'game-details-storage',
        partialize: (state) => ({ 
          games: state.games,
          // Don't persist loading states or errors
        }),
        // Version for migration if schema changes
        version: 2,
        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            // Migrate old cache format
            const migratedGames: Record<string, CachedGame> = {}
            
            Object.entries(persistedState.games || {}).forEach(([id, game]: [string, any]) => {
              migratedGames[id] = {
                ...game,
                fetchCount: 1,
                lastAccessed: game.timestamp || Date.now(),
                source: 'cache' as const,
              }
            })
            
            return {
              ...persistedState,
              games: migratedGames,
              gameStates: {},
            }
          }
          return persistedState
        }
      }
    )
  )
)

// Auto-cleanup stale cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    useGameDetailsStore.getState().clearStaleCache()
  }, 5 * 60 * 1000)
}

// Export selectors for better performance
export const selectGame = (id: string) => (state: GameDetailsState) => state.games[id]
export const selectGameError = (id: string) => (state: GameDetailsState) => state.gameStates[id]?.error
export const selectGameLoading = (id: string) => (state: GameDetailsState) => state.gameStates[id]?.isLoading || false