import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useFriendsStore } from './useFriendsStore'
import { ActivityType } from '@/types/friend'

export type JournalEntryType = 'progress' | 'review' | 'daily' | 'list'

interface ListGame {
  id: string
  name: string
  cover_url?: string
}

export interface JournalEntry {
  id: string
  type: JournalEntryType
  date: string
  title: string
  content: string
  games?: ListGame[] // Array of games for list type
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
  addGameToList: (listId: string, game: ListGame) => Promise<void>
  removeGameFromList: (listId: string, gameId: string) => Promise<void>
}

export const useJournalStore = create<JournalState>((set, get) => {
  const createActivity = async (
    activityType: ActivityType,
    gameId: string,
    details?: { name?: string; comment?: string; progress?: number }
  ) => {
    try {
      const response = await fetch('/api/friends/activities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: activityType,
          game_id: gameId,
          details,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create activity');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  return {
    entries: [],
    loading: false,
    error: null,

    addEntry: async (entry) => {
      try {
        const supabase = createClientComponentClient()
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.user) throw new Error('Not authenticated')

        // Prepare entry data
        const entryData = {
          user_id: session.session.user.id,
          type: entry.type,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          // Handle single game for non-list entries
          game_id: entry.game?.id,
          game: entry.game?.name,
          cover_url: entry.game?.cover_url,
          // Handle game array for list type
          game_list: entry.type === 'list' ? entry.games?.map(game => ({
            id: game.id,
            name: game.name,
            cover_url: game.cover_url
          })) : null,
          progress: entry.progress,
          hours_played: entry.hoursPlayed,
          rating: entry.rating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('journal_entries')
          .insert([entryData])
          .select()
          .single()

        if (error) throw error

        // Transform the returned data to match our interface
        const transformedEntry: JournalEntry = {
          id: data.id,
          type: data.type,
          date: data.date,
          title: data.title,
          content: data.content,
          games: data.game_list ? data.game_list.map((g: ListGame) => ({
            id: g.id,
            name: g.name,
            cover_url: g.cover_url
          })) : [],
          game: data.game_id ? {
            id: data.game_id,
            name: data.game,
            cover_url: data.cover_url,
          } : undefined,
          progress: data.progress,
          hoursPlayed: data.hours_played,
          rating: data.rating,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

        const entries = get().entries
        set({ entries: [transformedEntry, ...entries] })
      } catch (error) {
        set({ error: (error as Error).message })
        throw error
      }
    },

    addGameToList: async (listId: string, game: ListGame) => {
      try {
        const supabase = createClientComponentClient()
        const entry = get().entries.find(e => e.id === listId)
        if (!entry) throw new Error('List not found')

        // Get current games and add new one
        const currentGames = entry.games || []
        const updatedGames = [...currentGames, game]

        const { error } = await supabase
          .from('journal_entries')
          .update({ 
            game_list: updatedGames,
            updated_at: new Date().toISOString()
          })
          .eq('id', listId)

        if (error) throw error

        // Update local state
        const entries = get().entries.map(e =>
          e.id === listId ? { 
            ...e, 
            games: updatedGames,
            updatedAt: new Date().toISOString()
          } : e
        )
        set({ entries })
      } catch (error) {
        set({ error: (error as Error).message })
        throw error
      }
    },

    removeGameFromList: async (listId: string, gameId: string) => {
      try {
        const supabase = createClientComponentClient()
        const entry = get().entries.find(e => e.id === listId)
        if (!entry) throw new Error('List not found')

        const updatedGames = (entry.games || []).filter(g => g.id !== gameId)

        const { error } = await supabase
          .from('journal_entries')
          .update({ 
            game_list: updatedGames,
            updated_at: new Date().toISOString()
          })
          .eq('id', listId)

        if (error) throw error

        // Update local state
        const entries = get().entries.map(e =>
          e.id === listId ? { 
            ...e, 
            games: updatedGames,
            updatedAt: new Date().toISOString()
          } : e
        )
        set({ entries })
      } catch (error) {
        set({ error: (error as Error).message })
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

        // If this is a progress entry, update user_games and game_progress_history
        if (entry.type === 'progress' && entry.game?.id && entry.progress !== undefined) {
          try {
            // First, get the current user_games entry to preserve existing data
            const { data: currentUserGame } = await supabase
              .from('user_games')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('game_id', entry.game.id)
              .single();

            // Update user_games with merged data
            const { error: updateError } = await supabase
              .from('user_games')
              .upsert({
                user_id: session.user.id,
                game_id: entry.game.id,
                completion_percentage: entry.progress,
                play_time: entry.hoursPlayed ?? currentUserGame?.play_time,
                last_played_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: entry.progress === 100 ? 'completed' : 'playing',
                // Preserve other fields from the current entry
                achievements_completed: currentUserGame?.achievements_completed,
                notes: currentUserGame?.notes,
              }, {
                onConflict: 'user_id,game_id'
              });

            if (updateError) throw updateError;

            // Record progress history
            const { error: historyError } = await supabase
              .from('game_progress_history')
              .insert({
                user_id: session.user.id,
                game_id: entry.game.id,
                play_time: entry.hoursPlayed,
                completion_percentage: entry.progress,
                created_at: new Date().toISOString(),
              });

            if (historyError) {
              console.error('Error recording progress history:', historyError);
            }
          } catch (error) {
            console.error('Error updating game progress:', error);
          }
        }

        // Create activity for any entry type that has a game associated
        if (entry.game?.id) {
          try {
            switch (entry.type) {
              case 'progress':
                if (entry.progress === 100) {
                  await createActivity('completed', entry.game.id, {
                    comment: entry.content 
                      ? `${entry.content} (Completed the game!)`
                      : 'Completed the game!'
                  });
                } else {
                  await createActivity('progress', entry.game.id, {
                    progress: entry.progress,
                    comment: entry.content || `Updated progress to ${entry.progress}%`
                  });
                }
                break;
              case 'review':
                await createActivity('review', entry.game.id, {
                  comment: `Updated review for ${entry.game.name} - ${entry.rating}/10 - ${entry.content}`
                });
                break;
              case 'daily':
                await createActivity('started_playing', entry.game.id, {
                  comment: entry.content
                });
                break;
              case 'list':
                await createActivity('want_to_play', entry.game.id, {
                  comment: `Updated list: ${entry.title}`
                });
                break;
            }

            // Trigger real-time updates by updating timestamps
            const timestamp = new Date().toISOString();
            
            // Update user_games timestamp to trigger profile/games refresh
            await supabase
              .from('user_games')
              .update({ updated_at: timestamp })
              .eq('user_id', session.user.id)
              .eq('game_id', entry.game.id);

            // Update game_progress_history timestamp to trigger game-details refresh
            if (entry.type === 'progress') {
              await supabase
                .from('game_progress_history')
                .update({ updated_at: timestamp })
                .eq('user_id', session.user.id)
                .eq('game_id', entry.game.id)
                .order('created_at', { ascending: false })
                .limit(1);
            }
          } catch (activityError) {
            console.error('Error creating activity for journal entry:', activityError);
          }
        }
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
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform entries to match our interface
        const transformedEntries: JournalEntry[] = entries.map(entry => ({
          id: entry.id,
          type: entry.type,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          games: entry.game_list ? entry.game_list.map((g: ListGame) => ({
            id: g.id,
            name: g.name,
            cover_url: g.cover_url
          })) : [],
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
  }
}) 