import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CookieManager from '@/utils/cookieManager';

type ViewMode = 'grid' | 'list';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  initViewMode: () => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      viewMode: 'grid', // Default to grid view
      setViewMode: (mode) => {
        set({ viewMode: mode });
        
        // Save to cookie if consent allows
        if (CookieManager.hasConsent('functional')) {
          CookieManager.setUserPreferences({ libraryView: mode });
        }
      },
      initViewMode: () => {
        // Try to load from cookie first
        const cookiePrefs = CookieManager.getUserPreferences();
        if (cookiePrefs.libraryView) {
          set({ viewMode: cookiePrefs.libraryView });
        }
        // If no cookie preference, the persist middleware will handle localStorage
      }
    }),
    {
      name: 'gamerfie-view-mode', // Local storage key (kept for backward compatibility)
    }
  )
); 