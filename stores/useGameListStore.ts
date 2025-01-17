'use client';

import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createActivity } from '@/lib/activity';

interface GameListItem {
  id: string;
  name: string;
  cover_url: string;
  added_at: string;
}

interface GameList {
  id: string;
  title: string;
  description?: string;
  games: GameListItem[];
  created_at: string;
  updated_at: string;
}

interface GameListStore {
  lists: GameList[];
  currentList: GameList | null;
  isLoading: boolean;
  error: string | null;
  createList: (title: string, description?: string) => Promise<GameList>;
  updateList: (listId: string, title: string, description?: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addGameToList: (listId: string, gameId: string, gameName: string, coverUrl: string) => Promise<void>;
  removeGameFromList: (listId: string, gameId: string) => Promise<void>;
  fetchUserLists: () => Promise<void>;
  fetchListDetails: (listId: string) => Promise<void>;
}

export const useGameListStore = create<GameListStore>((set, get) => ({
  lists: [],
  currentList: null,
  isLoading: false,
  error: null,

  createList: async (title: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      // Create journal entry for the list
      const { data: list, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: session.session.user.id,
          type: 'list',
          title,
          content: description,
          game_list: [], // Initialize empty game list
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      const newList: GameList = {
        id: list.id,
        title: list.title,
        description: list.content,
        games: [],
        created_at: list.created_at,
        updated_at: list.updated_at
      };

      set(state => ({ lists: [...state.lists, newList] }));
      return newList;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateList: async (listId: string, title: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('journal_entries')
        .update({
          title,
          content: description,
          updated_at: new Date().toISOString()
        })
        .eq('id', listId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set(state => ({
        lists: state.lists.map(list =>
          list.id === listId
            ? { ...list, title, description, updated_at: new Date().toISOString() }
            : list
        ),
        currentList: state.currentList?.id === listId
          ? { ...state.currentList, title, description, updated_at: new Date().toISOString() }
          : state.currentList
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addGameToList: async (listId: string, gameId: string, gameName: string, coverUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const list = get().lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const newGame: GameListItem = {
        id: gameId,
        name: gameName,
        cover_url: coverUrl,
        added_at: new Date().toISOString()
      };

      const updatedGames = [...(list.games || []), newGame];

      const { error } = await supabase
        .from('journal_entries')
        .update({
          game_list: updatedGames,
          updated_at: new Date().toISOString()
        })
        .eq('id', listId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      // Create activity
      await createActivity('added_to_list', gameId, {
        name: gameName,
        comment: `Added ${gameName} to list: ${list.title}`
      });

      set(state => ({
        lists: state.lists.map(l =>
          l.id === listId
            ? { ...l, games: updatedGames, updated_at: new Date().toISOString() }
            : l
        ),
        currentList: state.currentList?.id === listId
          ? { ...state.currentList, games: updatedGames, updated_at: new Date().toISOString() }
          : state.currentList
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeGameFromList: async (listId: string, gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const list = get().lists.find(l => l.id === listId);
      if (!list) throw new Error('List not found');

      const updatedGames = list.games.filter(g => g.id !== gameId);

      const { error } = await supabase
        .from('journal_entries')
        .update({
          game_list: updatedGames,
          updated_at: new Date().toISOString()
        })
        .eq('id', listId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set(state => ({
        lists: state.lists.map(l =>
          l.id === listId
            ? { ...l, games: updatedGames, updated_at: new Date().toISOString() }
            : l
        ),
        currentList: state.currentList?.id === listId
          ? { ...state.currentList, games: updatedGames, updated_at: new Date().toISOString() }
          : state.currentList
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteList: async (listId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', listId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set(state => ({
        lists: state.lists.filter(l => l.id !== listId),
        currentList: state.currentList?.id === listId ? null : state.currentList
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('type', 'list')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedLists: GameList[] = data.map(entry => ({
        id: entry.id,
        title: entry.title,
        description: entry.content,
        games: entry.game_list || [],
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));

      set({ lists: transformedLists });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchListDetails: async (listId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', listId)
        .eq('user_id', session.session.user.id)
        .single();

      if (error) throw error;

      const list: GameList = {
        id: data.id,
        title: data.title,
        description: data.content,
        games: data.game_list || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      set({ currentList: list });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
})); 