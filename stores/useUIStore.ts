import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isMobileMenuOpen: boolean
  isProfileMenuOpen: boolean
  isBetaBannerVisible: boolean
  theme: 'light' | 'dark' | 'system'
  setMobileMenu: (isOpen: boolean) => void
  setProfileMenu: (isOpen: boolean) => void
  setBetaBanner: (isVisible: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleMobileMenu: () => void
  toggleProfileMenu: () => void
  dismissBetaBanner: () => void
  closeAllMenus: () => void
  computedTheme: 'light' | 'dark'
  initTheme: () => () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isMobileMenuOpen: false,
      isProfileMenuOpen: false,
      isBetaBannerVisible: true,
      theme: 'dark',
      computedTheme: 'dark',
      setMobileMenu: (isOpen) => set({ isMobileMenuOpen: isOpen }),
      setProfileMenu: (isOpen) => set({ isProfileMenuOpen: isOpen }),
      setBetaBanner: (isVisible) => set({ isBetaBannerVisible: isVisible }),
      setTheme: (theme) => {
        set({ theme });
        if (theme !== 'system') {
          set({ computedTheme: theme });
        } else {
          // Check system preference
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          set({ computedTheme: systemTheme });
        }
      },
      toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen,
        isProfileMenuOpen: false 
      })),
      toggleProfileMenu: () => set((state) => ({ 
        isProfileMenuOpen: !state.isProfileMenuOpen,
        isMobileMenuOpen: false 
      })),
      dismissBetaBanner: () => {
        set({ isBetaBannerVisible: false });
        localStorage.setItem('beta-banner-dismissed', 'true');
      },
      closeAllMenus: () => set({ 
        isMobileMenuOpen: false, 
        isProfileMenuOpen: false 
      }),
      initTheme: () => {
        // Force dark theme initially
        set({ computedTheme: 'dark' });
        
        // Initialize beta banner state from localStorage
        const isDismissed = localStorage.getItem('beta-banner-dismissed');
        if (isDismissed === 'true') {
          set({ isBetaBannerVisible: false });
        }
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          if (get().theme === 'system') {
            set({ computedTheme: e.matches ? 'dark' : 'light' });
          }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
) 