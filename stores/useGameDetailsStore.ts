import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, GameStatus } from '@/types/game'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

interface GameProgress {
  playTime: number
  completionPercentage: number
  achievementsCompleted: number
  status: GameStatus | null
  lastPlayed: string | null
  notes: string | null
}

interface GameDetailsState {
  // Game Details
  games: Record<number, Game & { timestamp: number }>
  isLoading: boolean
  error: string | null

  // Game Progress
  progress: Record<string, GameProgress> // key: `${userId}-${gameId}`
  progressLoading: boolean
  progressError: string | null

  // Game Details Actions
  setGame: (game: Game) => void
  getGame: (id: number) => (Game & { timestamp: number }) | undefined
  fetchGame: (id: number) => Promise<void>
  clearCache: () => void
  clearStaleCache: (maxAge?: number) => void

  // Game Progress Actions
  fetchProgress: (userId: string, gameId: string) => Promise<void>
  updateGameStatus: (
    userId: string,
    gameId: string,
    status: GameStatus,
    progress?: Partial<Omit<GameProgress, 'status'>>,
    notes?: string
  ) => Promise<void>
  resetProgress: () => void
}

const getProgressKey = (userId: string, gameId: string) => `${userId}-${gameId}`

export const useGameDetailsStore = create<GameDetailsState>()(
  persist(
    (set, get) => ({
      // Initial State
      games: {},
      isLoading: false,
      error: null,
      progress: {},
      progressLoading: false,
      progressError: null,

      // Game Details Actions
      setGame: (game) => set((state) => ({
        games: {
          ...state.games,
          [game.id]: { ...game, timestamp: Date.now() }
        }
      })),

      getGame: (id) => get().games[id],

      fetchGame: async (id) => {
        try {
          set({ isLoading: true, error: null })

          // Check cache first
          const cachedGame = get().games[id]
          if (cachedGame && Date.now() - cachedGame.timestamp < 1000 * 60 * 60) {
            set({ isLoading: false })
            return
          }

          const response = await fetch('/api/igdb-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: 'games',
              query: `
                fields name, summary, storyline, rating, total_rating, first_release_date,
                       cover.*, screenshots.*, artworks.*, genres.*, platforms.*,
                       involved_companies.*, involved_companies.company.*;
                where id = ${id};
              `
            }),
          })

          if (!response.ok) throw new Error('Failed to fetch game')
          const [game] = await response.json()
          if (!game) throw new Error('Game not found')

          set((state) => ({
            games: {
              ...state.games,
              [id]: { ...game, timestamp: Date.now() }
            },
            isLoading: false
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch game',
            isLoading: false
          })
          toast.error('Failed to fetch game details')
        }
      },

      clearCache: () => set({ games: {} }),

      clearStaleCache: (maxAge = 1000 * 60 * 60) => {
        const now = Date.now()
        set((state) => ({
          games: Object.fromEntries(
            Object.entries(state.games).filter(
              ([_, game]) => now - game.timestamp < maxAge
            )
          )
        }))
      },

      // Game Progress Actions
      fetchProgress: async (userId, gameId) => {
        const supabase = createClientComponentClient()
        const progressKey = getProgressKey(userId, gameId)

        set({ progressLoading: true, progressError: null })

        try {
          const { data, error } = await supabase
            .from('user_games')
            .select('*')
            .eq('user_id', userId)
            .eq('game_id', gameId)
            .single()

          if (error) throw error

          if (data) {
            set((state) => ({
              progress: {
                ...state.progress,
                [progressKey]: {
                  playTime: data.play_time || 0,
                  completionPercentage: data.completion_percentage || 0,
                  achievementsCompleted: data.achievements_completed || 0,
                  status: data.status as GameStatus,
                  lastPlayed: data.last_played_at,
                  notes: data.notes
                }
              },
              progressLoading: false
            }))
          } else {
            set((state) => ({
              progress: {
                ...state.progress,
                [progressKey]: {
                  playTime: 0,
                  completionPercentage: 0,
                  achievementsCompleted: 0,
                  status: null,
                  lastPlayed: null,
                  notes: null
                }
              },
              progressLoading: false
            }))
          }
        } catch (error) {
          console.error('Error fetching game progress:', error)
          set({
            progressError: 'Failed to fetch game progress',
            progressLoading: false
          })
          toast.error('Failed to fetch game progress')
        }
      },

      updateGameStatus: async (userId, gameId, status, progress = {}, notes) => {
        const supabase = createClientComponentClient()
        const progressKey = getProgressKey(userId, gameId)

        try {
          const updateData = {
            status,
            ...progress,
            ...(notes && { notes }),
            last_played_at: new Date().toISOString()
          }

          const { error } = await supabase
            .from('user_games')
            .upsert({
              user_id: userId,
              game_id: gameId,
              ...updateData
            })

          if (error) throw error

          // Update local state
          set((state) => ({
            progress: {
              ...state.progress,
              [progressKey]: {
                ...state.progress[progressKey],
                status,
                ...progress,
                ...(notes && { notes }),
                lastPlayed: new Date().toISOString()
              }
            }
          }))

          toast.success('Game status updated successfully')
        } catch (error) {
          console.error('Error updating game status:', error)
          toast.error('Failed to update game status')
          throw error
        }
      },

      resetProgress: () => set({ progress: {}, progressLoading: false, progressError: null }),
    }),
    {
      name: 'game-details-storage',
      partialize: (state) => ({
        games: state.games,
        progress: state.progress
      })
    }
  )
) 