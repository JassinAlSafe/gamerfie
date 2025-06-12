import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, Platform, Genre } from '@/types'

interface GameDetailsState {
  games: Record<string, Game & { timestamp: number }>
  isLoading: boolean
  error: string | null
  setGame: (game: Game) => void
  getGame: (id: string) => (Game & { timestamp: number }) | undefined
  fetchGame: (id: string) => Promise<void>
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

          console.log(`Fetching game details for ID: ${id}`);
          
          // Use API route instead of direct service to avoid CORS issues
          const response = await fetch(`/api/games/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch game details: ${response.status} ${response.statusText}`);
          }
          
          const game = await response.json();
          
          if (!game) {
            throw new Error('Game not found');
          }

          console.log('Successfully fetched game via API route:', {
            id: game.id,
            name: game.name,
            dataSource: game.dataSource
          });

          // Process the game data to ensure compatibility
          const processedGame: Game = {
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
            // Set defaults for missing fields - convert null to undefined
            summary: game.summary || undefined,
            storyline: game.storyline || undefined,
            rating: game.rating || 0,
            first_release_date: game.first_release_date || undefined
          };

          console.log('Processed game data for store:', {
            id: processedGame.id,
            name: processedGame.name,
            platformsCount: processedGame.platforms?.length || 0,
            genresCount: processedGame.genres?.length || 0
          });

          set((state) => ({ 
            games: { 
              ...state.games, 
              [id]: { ...processedGame, timestamp: Date.now() } 
            },
            isLoading: false 
          }));
        } catch (error) {
          console.error('Error fetching game via API route:', error);
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