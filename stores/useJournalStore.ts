import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import { ActivityType } from '@/types/activity'
import toast from 'react-hot-toast'
// import { JournalGameData } from '@/types/game'

interface JournalGameData {
  id: string;
  name: string;
  cover_url?: string;
}

export type JournalEntryType = 'progress' | 'review' | 'daily' | 'list' | 'note' | 'achievement'

export interface JournalEntry {
  id: string
  type: JournalEntryType
  date: string
  title: string
  content: string
  game?: JournalGameData
  progress?: number
  hoursPlayed?: number
  rating?: number
  is_public?: boolean
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
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
      throw error;
    }
  };

  return {
    entries: [],
    loading: false,
    error: null,
    isLoading: false,

    addEntry: async (entry) => {
      try {
        set({ loading: true, error: null })
        const supabase = createClient()
        // SECURITY FIX: Use getUser() not getSession() for database operations
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('No authenticated user')

        // If there's a game, ensure it exists in the database
        if (entry.game?.id) {
          // First, try to get the game
          const { data: existingGame, error: getGameError } = await supabase
            .from('games')
            .select('id, name, cover_url')
            .eq('id', entry.game.id)
            .single()

          if (getGameError && getGameError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking game:', getGameError)
            throw new Error('Failed to verify game existence')
          }

          // If game doesn't exist, add it
          if (!existingGame) {
            const { error: insertError } = await supabase
              .from('games')
              .insert({
                id: entry.game.id,
                name: entry.game.name,
                cover_url: entry.game.cover_url,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              throw new Error('Failed to add game to database')
            }
          }
        }

        // Insert the entry into the journal_entries table
        const { data: newEntry, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
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
            is_public: entry.is_public ?? true,
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
          is_public: newEntry.is_public,
          createdAt: newEntry.created_at,
          updatedAt: newEntry.updated_at,
        }

        set(state => ({
          entries: [transformedEntry, ...state.entries],
          loading: false,
        }))

        // If this is a progress entry, update user_games and game_progress_history
        if (entry.type === 'progress' && entry.game?.id && entry.progress !== undefined) {
          try {
            // Get current user_games entry if it exists
            const { data: existingUserGame } = await supabase
              .from('user_games')
              .select('*')
              .eq('user_id', user.id)
              .eq('game_id', entry.game.id)
              .single()

            // Update user_games with merged data
            const { error: updateError } = await supabase
              .from('user_games')
              .upsert({
                user_id: user.id,
                game_id: entry.game.id,
                completion_percentage: entry.progress,
                play_time: entry.hoursPlayed ?? existingUserGame?.play_time ?? 0,
                last_played_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: entry.progress === 100 ? 'completed' : (existingUserGame?.status || 'playing'),
                // Preserve other fields if they exist
                achievements_completed: existingUserGame?.achievements_completed,
                notes: existingUserGame?.notes,
              }, {
                onConflict: 'user_id,game_id'
              })

            if (updateError) throw updateError

            // Record progress history
            const { error: historyError } = await supabase
              .from('game_progress_history')
              .insert({
                user_id: user.id,
                game_id: entry.game.id,
                play_time: entry.hoursPlayed,
                completion_percentage: entry.progress,
              })

            if (historyError) {
              // Silent fail for progress history as it's not critical
            }
          } catch (error) {
            // Don't throw here, allow the journal entry to be saved even if progress update fails
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
                  }).catch(() => {})
                } else {
                  await createActivity('progress', entry.game.id, {
                    progress: entry.progress,
                    comment: entry.content || `Made progress: ${entry.progress}%`
                  }).catch(() => {})
                }
                break
              case 'review':
                await createActivity('review', entry.game.id, {
                  comment: `Rated ${entry.game.name} ${entry.rating}/10 - ${entry.content}`
                }).catch(() => {})
                break
              case 'daily':
                await createActivity('started_playing', entry.game.id, {
                  comment: entry.content
                }).catch(() => {})
                break
              case 'list':
                await createActivity('want_to_play', entry.game.id, {
                  comment: `Added ${entry.game.name} to list: ${entry.title}`
                }).catch(() => {})
                break
            }
          } catch (activityError) {
            // Don't throw here, allow the journal entry to be saved even if activity creation fails
          }
        }

        toast.success('Entry added successfully')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add entry';
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error
      }
    },

    updateEntry: async (id: string, entry) => {
      try {
        set({ loading: true, error: null })
        const supabase = createClient()
        // SECURITY FIX: Use getUser() not getSession() for database operations
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('No authenticated user')

        // If there's a game, verify it exists first
        if (entry.game?.id) {
          const { count, error: gameCheckError } = await supabase
            .from('games')
            .select('*', { count: 'exact', head: true })
            .eq('id', entry.game.id)

          if (gameCheckError) {
            throw new Error('Failed to verify game existence')
          }

          if (count === 0) {
            throw new Error(`Game with ID ${entry.game.id} not found in the database. Please make sure the game exists before adding an entry.`)
          }
        }

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
            is_public: entry.is_public,
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
          is_public: updatedEntry.is_public,
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
              .eq('user_id', user.id)
              .eq('game_id', entry.game.id)
              .single();

            // Update user_games with merged data
            const { error: updateError } = await supabase
              .from('user_games')
              .upsert({
                user_id: user.id,
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
                user_id: user.id,
                game_id: entry.game.id,
                play_time: entry.hoursPlayed,
                completion_percentage: entry.progress,
                created_at: new Date().toISOString(),
              });

            if (historyError) {
              // Silent fail for progress history as it's not critical
            }
          } catch (error) {
            // Silent fail for progress updates
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
              .eq('user_id', user.id)
              .eq('game_id', entry.game.id);

            // Update game_progress_history timestamp to trigger game-details refresh
            if (entry.type === 'progress') {
              await supabase
                .from('game_progress_history')
                .update({ updated_at: timestamp })
                .eq('user_id', user.id)
                .eq('game_id', entry.game.id)
                .order('created_at', { ascending: false })
                .limit(1);
            }
          } catch (activityError) {
            // Silent fail for activity creation
          }
        }

        toast.success('Entry updated successfully')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update entry';
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error
      }
    },

    deleteEntry: async (id) => {
      try {
        set({ loading: true, error: null })
        const supabase = createClient()
        // SECURITY FIX: Use getUser() not getSession() for database operations
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('No authenticated user')

        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)

        if (error) throw error

        set(state => ({
          entries: state.entries.filter(e => e.id !== id),
          loading: false,
        }))

        toast.success('Entry deleted successfully')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete entry';
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        throw error
      }
    },

    setEntries: (entries) => set({ entries }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchEntries: async () => {
      try {
        // Check if we already have entries data and not currently loading
        if (get().entries.length > 0 && !get().loading) {
          return; // Use cached data
        }
        
        set({ loading: true, error: null, isLoading: true });
        const supabase = createClient();
        // SECURITY FIX: Use getUser() not getSession() for database operations
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          set({ loading: false, error: 'No authenticated user', isLoading: false });
          return;
        }

        // Use a more efficient query with pagination and ordering
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50); // Limit to most recent 50 entries for initial load

        if (error) {
          set({ loading: false, error: error.message, isLoading: false });
          return;
        }

        // Transform the data to match our JournalEntry interface
        const transformedEntries = data.map(entry => ({
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
          is_public: entry.is_public,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at,
        }));

        set({ entries: transformedEntries, loading: false, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load journal entries';
        set({ 
          loading: false, 
          error: errorMessage, 
          isLoading: false 
        });
      }
    },
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
  }
})