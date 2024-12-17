import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  libraryView: 'grid' | 'list'
  sortBy: 'name' | 'rating' | 'releaseDate' | 'dateAdded'
  sortOrder: 'asc' | 'desc'
  showCompletedGames: boolean
  setLibraryView: (view: 'grid' | 'list') => void
  setSortBy: (sort: 'name' | 'rating' | 'releaseDate' | 'dateAdded') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setShowCompletedGames: (show: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      libraryView: 'grid',
      sortBy: 'dateAdded',
      sortOrder: 'desc',
      showCompletedGames: true,
      
      setLibraryView: (view) => set({ libraryView: view }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setShowCompletedGames: (show) => set({ showCompletedGames: show })
    }),
    {
      name: 'settings-storage'
    }
  )
) 