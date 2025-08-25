import { create } from 'zustand';

// Simple, focused state for game filters
interface GameFilters {
  category: string;
  platform: string;
  search: string;
}

interface GameFiltersState {
  filters: GameFilters;
  updateFilter: <K extends keyof GameFilters>(key: K, value: GameFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: GameFilters = {
  category: 'all',
  platform: 'all', 
  search: ''
};

export const useGameFilters = create<GameFiltersState>((set) => ({
  filters: defaultFilters,
  
  updateFilter: (key, value) =>
    set(state => ({ 
      filters: { ...state.filters, [key]: value }
    })),
    
  resetFilters: () =>
    set({ filters: defaultFilters })
}));