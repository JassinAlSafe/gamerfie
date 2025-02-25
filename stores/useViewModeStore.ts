import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'grid' | 'list';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      viewMode: 'grid', // Default to grid view
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'gamerfie-view-mode', // Local storage key
    }
  )
); 