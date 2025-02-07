import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useFriendsStore } from './useFriendsStore'
import { ActivityType } from '@/types/activity'
import toast from 'react-hot-toast'

export type JournalEntryType = 'progress' | 'review' | 'daily' | 'list' | 'note' | 'achievement'

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

interface JournalStore {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
  createEntry: (type: JournalEntry['type'], data: Partial<JournalEntry>) => Promise<JournalEntry>;
  updateEntry: (entryId: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  fetchEntries: () => Promise<void>;
  fetchEntryById: (entryId: string) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,

  createEntry: async (type: JournalEntry['type'], data: Partial<JournalEntry>) => {
    set({ isLoading: true, error: null });
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
        set({ loading: true, error: null })
        const supabase = createClientComponentClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) throw new Error('No authenticated user')

        // Debug logging
        console.log('Adding entry with game:', {
          gameId: entry.game?.id,
          gameName: entry.game?.name,
          entryType: entry.type,
        })

        // If there's a game, ensure it exists in the database
        if (entry.game?.id) {
          console.log('Checking game:', entry.game.id)
          const { count, error: gameCheckError } = await supabase
            .from('games')
            .select('*', { count: 'exact', head: true })
            .eq('id', entry.game.id)

          if (gameCheckError) {
            console.error('Error checking game existence:', gameCheckError)
          }

          // If game doesn't exist, add it
          if (count === 0) {
            console.log('Game not found, adding to database:', entry.game)
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
              console.error('Error adding game to database:', insertError)
              throw new Error('Failed to add game to database')
            }
          }
        }

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

        // If this is a progress entry, update user_games and game_progress_history
        if (entry.type === 'progress' && entry.game?.id && entry.progress !== undefined) {
          try {
            // Get current user_games entry if it exists
            const { data: existingUserGame } = await supabase
              .from('user_games')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('game_id', entry.game.id)
              .single()

            // Update user_games with merged data
            const { error: updateError } = await supabase
              .from('user_games')
              .upsert({
                user_id: session.user.id,
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
                user_id: session.user.id,
                game_id: entry.game.id,
                play_time: entry.hoursPlayed,
                completion_percentage: entry.progress,
              })

            if (historyError) {
              console.error('Error recording progress history:', historyError)
            }
          } catch (error) {
            console.error('Error updating game progress:', error)
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
                  }).catch(e => console.error('Activity creation failed:', e))
                } else {
                  await createActivity('progress', entry.game.id, {
                    progress: entry.progress,
                    comment: entry.content || `Made progress: ${entry.progress}%`
                  }).catch(e => console.error('Activity creation failed:', e))
                }
                break
              case 'review':
                await createActivity('review', entry.game.id, {
                  comment: `Rated ${entry.game.name} ${entry.rating}/10 - ${entry.content}`
                }).catch(e => console.error('Activity creation failed:', e))
                break
              case 'daily':
                await createActivity('started_playing', entry.game.id, {
                  comment: entry.content
                }).catch(e => console.error('Activity creation failed:', e))
                break
              case 'list':
                await createActivity('want_to_play', entry.game.id, {
                  comment: `Added ${entry.game.name} to list: ${entry.title}`
                }).catch(e => console.error('Activity creation failed:', e))
                break
            }
          } catch (activityError) {
            console.error('Error creating activity for journal entry:', activityError)
            // Don't throw here, allow the journal entry to be saved even if activity creation fails
          }
        }

        toast.success('Entry added successfully')
      } catch (error) {
        console.error('Error adding journal entry:', error)
        set({ error: (error as Error).message, loading: false })
        toast.error(error instanceof Error ? error.message : 'Failed to add entry')
        throw error
      }
    },

    updateEntry: async (id: string, entry) => {
      try {
        set({ loading: true, error: null })
        const supabase = createClientComponentClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) throw new Error('No authenticated user')

        // If there's a game, verify it exists first
        if (entry.game?.id) {
          const { count, error: gameCheckError } = await supabase
            .from('games')
            .select('*', { count: 'exact', head: true })
            .eq('id', entry.game.id)

          if (gameCheckError) {
            console.error('Error checking game existence:', gameCheckError)
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

      if (error) throw error;

      // Create activity and sync progress for game-related entries
      if (data.type === 'progress' && data.game?.id) {
        await createActivity('progress', data.game.id, {
          comment: data.content,
          progress: data.progress,
        });

        // Sync with user_games table directly
        if (data.progress !== undefined) {
          const { error: userGameError } = await supabase
            .from('user_games')
            .upsert({
              user_id: session.session.user.id,
              game_id: data.game.id,
              completion_percentage: data.progress,
              play_time: data.hours_played,
              status: data.progress === 100 ? 'completed' : 'playing',
              last_played_at: new Date().toISOString()
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

        toast.success('Entry updated successfully')
      } catch (error) {
        console.error('Error updating journal entry:', error)
        set({ error: (error as Error).message, loading: false })
        toast.error('Failed to update entry')
        throw error
      }
    },

  deleteEntry: async (entryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

        set(state => ({
          entries: state.entries.filter(e => e.id !== id),
          loading: false,
        }))

        toast.success('Entry deleted successfully')
      } catch (error) {
        console.error('Error deleting journal entry:', error)
        set({ error: (error as Error).message, loading: false })
        toast.error('Failed to delete entry')
        throw error
      }
    },

    setEntries: (entries) => set({ entries }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedEntries: JournalEntry[] = data.map(entry => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        content: entry.content,
        date: entry.date,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        game: entry.game_id ? {
          id: entry.game_id,
          name: entry.game,
          cover_url: entry.cover_url
        } : undefined,
        progress: entry.progress,
        rating: entry.rating,
        hours_played: entry.hours_played
      }));

        set({ entries: transformedEntries, loading: false })
      } catch (error) {
        console.error('Error fetching journal entries:', error)
        set({ error: (error as Error).message, loading: false })
        toast.error('Failed to load journal entries')
        throw error
      }
    },
  }
})); 