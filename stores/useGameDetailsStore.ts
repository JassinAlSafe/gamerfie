import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, Platform, Genre } from '@/types/game'

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

          // Use the games/details endpoint
          const response = await fetch('/api/games/details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ids: [id]
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch game');
          }
          
          const [game] = await response.json();
          if (!game) throw new Error('Game not found');

          console.log('Raw game data:', {
            platforms: game.platforms,
            platformsType: typeof game.platforms,
            isArray: Array.isArray(game.platforms)
          });

          // Process the game data to match our Game type
          const processedGame = {
            ...game,
            // Ensure all required fields are present
            id: game.id.toString(),
            name: game.name,
            cover_url: game.cover_url || null,
            rating: game.rating || 0,
            first_release_date: game.first_release_date || null,
            platforms: Array.isArray(game.platforms) 
              ? game.platforms.map((p: string | Platform) => typeof p === 'string' ? { id: p, name: p } : p)
              : typeof game.platforms === 'object' && game.platforms !== null
                ? [game.platforms].map((p: string | Platform) => typeof p === 'string' ? { id: p, name: p } : p)
                : [],
            genres: Array.isArray(game.genres)
              ? game.genres.map((g: string | Genre) => typeof g === 'string' ? { id: g, name: g } : g)
              : [],
            summary: game.summary || null,
            storyline: game.storyline || null
          };

          console.log('Processed game data:', {
            id: processedGame.id,
            name: processedGame.name,
            genresType: typeof processedGame.genres,
            genres: processedGame.genres
          });

          set((state) => ({ 
            games: { 
              ...state.games, 
              [id]: { ...processedGame, timestamp: Date.now() } 
            },
            isLoading: false 
          }));
        } catch (error) {
          console.error('Error fetching game:', error);
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