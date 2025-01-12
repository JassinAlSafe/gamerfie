import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useFriendsStore } from './useFriendsStore'

export type JournalEntryType = 'progress' | 'review' | 'daily' | 'list'

export interface JournalEntry {
  id: string
  type: JournalEntryType
  date: string
  title: string
  content: string
  game?: {
    id: string
    name: string
    cover_url?: string
  }
  progress?: number
  hoursPlayed?: number
  rating?: number
  createdAt: string
  updatedAt: string
}

interface JournalState {
  entries: JournalEntry[]
  loading: boolean
  error: string | null
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  setEntries: (entries: JournalEntry[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchEntries: () => Promise<void>
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  addEntry: async (entry) => {
    try {
      set({ loading: true, error: null })
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('No authenticated user')

      // Insert the entry into the journal_entries table
      const { data: newEntry, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: session.user.id,
          type: entry.type,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          game_id: entry.game?.id,
          game: entry.game?.name,
          cover_url: entry.game?.cover_url,
          progress: entry.progress,
          hours_played: entry.hoursPlayed,
          rating: entry.rating,
        })
        .select()
        .single()

      if (error) throw error

      // Transform the entry to match our interface
      const transformedEntry: JournalEntry = {
        id: newEntry.id,
        type: newEntry.type,
        date: newEntry.date,
        title: newEntry.title,
        content: newEntry.content,
        game: newEntry.game_id ? {
          id: newEntry.game_id,
          name: newEntry.game,
          cover_url: newEntry.cover_url,
        } : undefined,
        progress: newEntry.progress,
        hoursPlayed: newEntry.hours_played,
        rating: newEntry.rating,
        createdAt: newEntry.created_at,
        updatedAt: newEntry.updated_at,
      }

      set(state => ({
        entries: [transformedEntry, ...state.entries],
        loading: false,
      }))
    } catch (error) {
      console.error('Error adding journal entry:', error)
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateEntry: async (id: string, entry) => {
    try {
      set({ loading: true, error: null })
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('No authenticated user')

      // Update the entry in the journal_entries table
      const { data: updatedEntry, error } = await supabase
        .from('journal_entries')
        .update({
          type: entry.type,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          game_id: entry.game?.id,
          game: entry.game?.name,
          cover_url: entry.game?.cover_url,
          progress: entry.progress,
          hours_played: entry.hoursPlayed,
          rating: entry.rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Transform the entry to match our interface
      const transformedEntry: JournalEntry = {
        id: updatedEntry.id,
        type: updatedEntry.type,
        date: updatedEntry.date,
        title: updatedEntry.title,
        content: updatedEntry.content,
        game: updatedEntry.game_id ? {
          id: updatedEntry.game_id,
          name: updatedEntry.game,
          cover_url: updatedEntry.cover_url,
        } : undefined,
        progress: updatedEntry.progress,
        hoursPlayed: updatedEntry.hours_played,
        rating: updatedEntry.rating,
        createdAt: updatedEntry.created_at,
        updatedAt: updatedEntry.updated_at,
      }

      set(state => ({
        entries: state.entries.map(e => e.id === id ? transformedEntry : e),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating journal entry:', error)
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteEntry: async (id) => {
    try {
      set({ loading: true, error: null })
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        loading: false,
      }))
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchEntries: async () => {
    try {
      set({ loading: true, error: null })
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('No authenticated user')

      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })

      if (error) throw error

      // Transform entries to match our interface
      const transformedEntries: JournalEntry[] = entries.map(entry => ({
        id: entry.id,
        type: entry.type,
        date: entry.date,
        title: entry.title,
        content: entry.content,
        game: entry.game_id ? {
          id: entry.game_id,
          name: entry.game,
          cover_url: entry.cover_url,
        } : undefined,
        progress: entry.progress,
        hoursPlayed: entry.hours_played,
        rating: entry.rating,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      }))

      set({ entries: transformedEntries, loading: false })
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
})) 