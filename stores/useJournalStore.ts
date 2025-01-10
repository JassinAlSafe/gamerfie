import { create } from 'zustand'

export type JournalEntryType = 'progress' | 'daily' | 'review' | 'list'

export interface JournalEntry {
  id: string
  type: JournalEntryType
  date: string
  title?: string
  game?: string
  content: string
  progress?: string
  hoursPlayed?: number
  rating?: number
  createdAt: Date
  updatedAt: Date
}

interface JournalState {
  entries: JournalEntry[]
  isLoading: boolean
  error: string | null
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, entry: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
  setEntries: (entries: JournalEntry[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  addEntry: (entry) => 
    set((state) => ({
      entries: [
        {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...state.entries,
      ],
    })),

  updateEntry: (id, updatedEntry) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id
          ? { ...entry, ...updatedEntry, updatedAt: new Date() }
          : entry
      ),
    })),

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),

  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
})) 