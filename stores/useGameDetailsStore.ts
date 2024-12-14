import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game } from '@/types/game'

interface GameDetailsState {
  games: Record<number, Game & { timestamp: number }>
  isLoading: boolean
  error: string | null
  setGame: (game: Game) => void
  getGame: (id: number) => (Game & { timestamp: number }) | undefined
  fetchGame: (id: number) => Promise<void>
  clearCache: () => void
  clearStaleCache: (maxAge?: number) => void
}

export const useGameDetailsStore = create<GameDetailsState>()(
  persist(
    (set, get) => ({
      games: {},
      isLoading: false,
      error: null,

      setGame: (game) => set((state) => ({ 
        games: { 
          ...state.games, 
          [game.id]: { ...game, timestamp: Date.now() } 
        } 
      })),

      getGame: (id) => get().games[id],

      fetchGame: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check cache first
          const cachedGame = get().games[id];
          if (cachedGame && Date.now() - cachedGame.timestamp < 1000 * 60 * 60) {
            set({ isLoading: false });
            return;
          }

          // Use IGDB proxy endpoint
          const response = await fetch('/api/igdb-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'games',
              query: `
                fields name, summary, storyline, rating, total_rating, first_release_date, 
                       cover.*, screenshots.*, artworks.*, genres.*, platforms.*, 
                       involved_companies.*, involved_companies.company.*;
                where id = ${id};
              `
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch game');
          
          const [game] = await response.json();
          if (!game) throw new Error('Game not found');

          set((state) => ({ 
            games: { 
              ...state.games, 
              [id]: { ...game, timestamp: Date.now() } 
            },
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch game',
            isLoading: false 
          });
        }
      },

      clearCache: () => set({ games: {} }),

      clearStaleCache: (maxAge = 1000 * 60 * 60) => {
        const now = Date.now();
        set((state) => ({
          games: Object.fromEntries(
            Object.entries(state.games).filter(
              ([_, game]) => now - game.timestamp < maxAge
            )
          )
        }));
      }
    }),
    {
      name: 'game-details-storage',
      partialize: (state) => ({ games: state.games })
    }
  )
); 