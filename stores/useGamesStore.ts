import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, ProcessedGame, GameStatus } from '@/types/game';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

interface GamesState {
  // Discovery state
  games: Game[];
  currentPage: number;
  totalPages: number;
  totalGames: number;
  sortBy: 'rating' | 'popularity' | 'name' | 'release';
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: string;
  selectedYear: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // User collection state
  userGames: ProcessedGame[];
  userGamesLoading: boolean;
  userGamesError: string | null;
  
  // Discovery actions
  setGames: (games: Game[]) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalGames: (total: number) => void;
  setSortBy: (sort: 'rating' | 'popularity' | 'name' | 'release') => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedYear: (year: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;

  // User collection actions
  fetchUserGames: (userId: string, filters: {
    status: string;
    sortBy: string;
    sortOrder: string;
  }) => Promise<void>;
  updateGameStatus: (gameId: string, newStatus: GameStatus) => Promise<void>;
  resetUserGames: () => void;
}

export const useGamesStore = create<GamesState>()(
  persist(
    (set, get) => ({
      // Discovery state
      games: [],
      currentPage: 1,
      totalPages: 1,
      totalGames: 0,
      sortBy: 'rating',
      selectedPlatform: 'all',
      selectedGenre: 'all',
      selectedCategory: 'all',
      selectedYear: 'all',
      searchQuery: '',
      isLoading: false,
      error: null,

      // User collection state
      userGames: [],
      userGamesLoading: false,
      userGamesError: null,

      // Discovery actions
      setGames: (games) => set({ games }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (pages) => set({ totalPages: pages }),
      setTotalGames: (total) => set({ totalGames: total }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      resetFilters: () => set({
        selectedPlatform: 'all',
        selectedGenre: 'all',
        selectedCategory: 'all',
        selectedYear: 'all',
        searchQuery: '',
        currentPage: 1
      }),

      // User collection actions
      fetchUserGames: async (userId, filters) => {
        const supabase = createClientComponentClient();
        set({ userGamesLoading: true, userGamesError: null });

        try {
          let query = supabase
            .from('user_games')
            .select(`
              *,
              games(*)
            `)
            .eq('user_id', userId);

          if (filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }

          if (filters.sortBy === 'recent') {
            query = query.order('created_at', {
              ascending: filters.sortOrder === 'asc',
            });
          } else {
            query = query.order('games(name)', {
              ascending: filters.sortOrder === 'asc',
            });
          }

          const { data, error: queryError } = await query;
          if (queryError) throw queryError;

          const processedGames = data.map(item => ({
            ...item.games,
            status: item.status,
            playTime: item.play_time,
            userRating: item.user_rating,
            completedAt: item.completed_at,
            lastPlayedAt: item.last_played_at,
            notes: item.notes,
          }));

          set({ userGames: processedGames, userGamesLoading: false });
        } catch (error) {
          console.error('Error fetching user games:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch games';
          set({ userGamesError: errorMessage, userGamesLoading: false });
          toast.error(errorMessage);
        }
      },

      updateGameStatus: async (gameId, newStatus) => {
        const supabase = createClientComponentClient();
        
        try {
          const { error } = await supabase
            .from('user_games')
            .update({ status: newStatus })
            .eq('game_id', gameId);

          if (error) throw error;

          // Update local state
          set(state => ({
            userGames: state.userGames.map(game =>
              game.id.toString() === gameId
                ? { ...game, status: newStatus }
                : game
            )
          }));

          toast.success('Game status updated successfully');
        } catch (error) {
          console.error('Failed to update game status:', error);
          toast.error('Failed to update game status');
          throw error;
        }
      },

      resetUserGames: () => {
        set({ userGames: [], userGamesLoading: false, userGamesError: null });
      },
    }),
    {
      name: 'games-storage',
      partialize: (state) => ({
        sortBy: state.sortBy,
        selectedPlatform: state.selectedPlatform,
        selectedGenre: state.selectedGenre,
        selectedCategory: state.selectedCategory,
        selectedYear: state.selectedYear
      })
    }
  )
); 