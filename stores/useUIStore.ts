import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import CookieManager from '@/utils/cookieManager'

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
      setBetaBanner: (isVisible) => {
        set({ isBetaBannerVisible: isVisible });
        
        // Update cookie if consent allows
        if (CookieManager.hasConsent('functional')) {
          CookieManager.setUserPreferences({ 
            betaBannerDismissed: !isVisible 
          });
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (theme !== 'system') {
          set({ computedTheme: theme });
        } else {
          // Check system preference
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          set({ computedTheme: systemTheme });
        }
        
        // Update cookie if consent allows
        if (CookieManager.hasConsent('functional')) {
          CookieManager.setUserPreferences({ theme });
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
        
        // Still keep localStorage for backward compatibility
        localStorage.setItem('beta-banner-dismissed', 'true');
        
        // Update cookie if consent allows
        if (CookieManager.hasConsent('functional')) {
          CookieManager.setUserPreferences({ 
            betaBannerDismissed: true 
          });
        }
      },
      closeAllMenus: () => set({ 
        isMobileMenuOpen: false, 
        isProfileMenuOpen: false 
      }),
      initTheme: () => {
        // Load preferences from cookies first if available
        const cookiePrefs = CookieManager.getUserPreferences();
        
        if (cookiePrefs.theme) {
          set({ theme: cookiePrefs.theme });
          if (cookiePrefs.theme !== 'system') {
            set({ computedTheme: cookiePrefs.theme });
          }
        } else {
          // Force dark theme initially if no preference
          set({ computedTheme: 'dark' });
        }
        
        // Initialize beta banner state - check cookie first, then localStorage
        if (cookiePrefs.betaBannerDismissed) {
          set({ isBetaBannerVisible: false });
        } else {
          const isDismissed = localStorage.getItem('beta-banner-dismissed');
          if (isDismissed === 'true') {
            set({ isBetaBannerVisible: false });
          }
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
      partialize: (state) => ({ 
        theme: state.theme,
        isBetaBannerVisible: state.isBetaBannerVisible 
      })
    }
  )
) 