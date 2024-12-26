import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, GameStatus } from '@/types/game'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { supabase } from "@/lib/supabase"

interface GameProgress {
  playTime: number | null
  completionPercentage: number | null
  achievementsCompleted: number | null
  status: GameStatus | null
  lastPlayed: string | null
  notes: string | null
  comment?: string
  progress?: any
  created_at?: string
  updated_at?: string
  user_id?: string
  game_id?: string
}

interface GameDetailsState {
  // Game Details
  games: Record<number, Game & { timestamp: number }>
  isLoading: boolean
  error: string | null

  // Game Progress
  progress: Record<string, GameProgress> // key: `${userId}-${gameId}`
  progressLoading: boolean
  progressError: Error | null

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
    progressData?: any,
    comment?: string
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
        try {
          set({ progressLoading: true, progressError: null })
          const { data, error } = await supabase
            .from("user_games")
            .select("*")
            .eq("user_id", userId)
            .eq("game_id", gameId)
            .single()

          if (error) throw error

          const key = getProgressKey(userId, gameId)
          const progressData: GameProgress = {
            playTime: typeof data?.play_time === 'number' ? data.play_time : null,
            completionPercentage: typeof data?.completion_percentage === 'number' ? data.completion_percentage : null,
            achievementsCompleted: typeof data?.achievements_completed === 'number' ? data.achievements_completed : null,
            status: data?.status as GameStatus | null,
            lastPlayed: typeof data?.last_played === 'string' ? data.last_played : null,
            notes: typeof data?.notes === 'string' ? data.notes : null,
            comment: typeof data?.comment === 'string' ? data.comment : undefined,
            progress: data?.progress,
            created_at: typeof data?.created_at === 'string' ? data.created_at : undefined,
            updated_at: typeof data?.updated_at === 'string' ? data.updated_at : undefined,
            user_id: typeof data?.user_id === 'string' ? data.user_id : undefined,
            game_id: typeof data?.game_id === 'string' ? data.game_id : undefined
          }

          set((state) => ({
            progress: {
              ...state.progress,
              [key]: progressData,
            },
          }))
        } catch (error) {
          set({ progressError: error as Error })
        } finally {
          set({ progressLoading: false })
        }
      },

      updateGameStatus: async (
        userId: string,
        gameId: string,
        status: GameStatus,
        progressData?: any,
        comment?: string
      ) => {
        try {
          // First check if the record exists
          const { data: existingRecord } = await supabase
            .from("user_games")
            .select("*")
            .eq("user_id", userId)
            .eq("game_id", gameId)
            .single()

          const updateData = {
            status,
            ...(progressData && { progress: progressData }),
            ...(comment && { comment }),
            updated_at: new Date().toISOString(),
          }

          if (existingRecord) {
            // Update existing record
            const { error } = await supabase
              .from("user_games")
              .update(updateData)
              .eq("user_id", userId)
              .eq("game_id", gameId)

            if (error) throw error
          } else {
            // Insert new record
            const { error } = await supabase.from("user_games").insert([
              {
                user_id: userId,
                game_id: gameId,
                ...updateData,
                created_at: new Date().toISOString(),
              },
            ])

            if (error) throw error
          }

          // Refresh the progress after update
          await get().fetchProgress(userId, gameId)
        } catch (error) {
          console.error("Error updating game status:", error)
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