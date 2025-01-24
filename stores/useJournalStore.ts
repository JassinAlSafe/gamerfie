'use client';

import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createActivity } from '@/lib/activity';


interface Game {
  id: string;
  name: string;
  cover_url: string;
}

interface JournalEntry {
  id: string;
  type: 'progress' | 'review' | 'daily' | 'list';
  title?: string;
  content?: string;
  date: string;
  created_at: string;
  updated_at: string;
  game?: Game;
  progress?: number;
  rating?: number;
  hours_played?: number;
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
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const entryData = {
        user_id: session.session.user.id,
        type,
        title: data.title,
        content: data.content,
        date: data.date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        game_id: data.game?.id,
        game: data.game?.name,
        cover_url: data.game?.cover_url,
        progress: data.progress,
        rating: data.rating,
        hours_played: data.hours_played
      };

      const { data: entry, error } = await supabase
        .from('journal_entries')
        .insert([entryData])
        .select('*')
        .single();

      if (error) throw error;

      const newEntry: JournalEntry = {
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
      };

      // Create activity and sync progress for game-related entries
      if (type === 'progress' && data.game?.id) {
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

          if (userGameError) throw userGameError;
        }
      } else if (type === 'review' && data.game?.id) {
        await createActivity('review', data.game.id, {
          comment: data.content,
          rating: data.rating,
        });
      }

      // Update the entries list with the new entry
      set(state => {
        const newEntries = [newEntry, ...state.entries].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { entries: newEntries };
      });

      return newEntry;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEntry: async (entryId: string, data: Partial<JournalEntry>) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const updateData = {
        title: data.title,
        content: data.content,
        progress: data.progress,
        hours_played: data.hours_played,
        rating: data.rating,
        game_id: data.game?.id,
        game: data.game?.name,
        cover_url: data.game?.cover_url,
        updated_at: new Date().toISOString()
      };

      const { data: updatedEntry, error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', entryId)
        .eq('user_id', session.session.user.id)
        .select('*')
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

          if (userGameError) throw userGameError;
        }
      } else if (data.type === 'review' && data.game?.id) {
        await createActivity('review', data.game.id, {
          comment: data.content,
          rating: data.rating,
        });
      }

      // Transform the updated entry
      const transformedEntry: JournalEntry = {
        ...updatedEntry,
        game: updatedEntry.game_id ? {
          id: updatedEntry.game_id,
          name: updatedEntry.game,
          cover_url: updatedEntry.cover_url
        } : undefined
      };

      // Update both entries and currentEntry with the transformed data
      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === entryId ? transformedEntry : entry
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        currentEntry: state.currentEntry?.id === entryId ? transformedEntry : state.currentEntry
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
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
        entries: state.entries.filter(entry => entry.id !== entryId),
        currentEntry: state.currentEntry?.id === entryId ? null : state.currentEntry
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

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

      set({ entries: transformedEntries });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEntryById: async (entryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', session.session.user.id)
        .single();

      if (error) throw error;

      const entry: JournalEntry = {
        id: data.id,
        type: data.type,
        title: data.title,
        content: data.content,
        date: data.date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        game: data.game_id ? {
          id: data.game_id,
          name: data.game,
          cover_url: data.cover_url
        } : undefined,
        progress: data.progress,
        rating: data.rating,
        hours_played: data.hours_played
      };

      set({ currentEntry: entry });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
})); 