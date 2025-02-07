'use client';

import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createActivity } from '@/lib/activity/activity';
import { GameList, GameListItem, GameListStore } from '@/types/gamelist/game-list';

export const useGameListStore = create<GameListStore>((set, get) => ({
  lists: [],
  currentList: null,
  isLoading: false,
  error: null,
  publicLists: [],

  createList: async (title: string, description?: string, isPublic: boolean = false) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data: list, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: session.session.user.id,
          type: 'list',
          title,
          content: description,
          game_list: [],
          is_public: isPublic,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      const newList: GameList = {
        id: list.id,
        type: 'list',
        title: list.title,
        description: list.content || '',
        games: [],
        date: list.date,
        createdAt: list.created_at,
        updatedAt: list.updated_at,
        is_public: list.is_public,
        user_id: list.user_id,
        content: list.content
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

  updateList: async (listId: string, title: string, description?: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const updatedAt = new Date().toISOString();

      const { error } = await supabase
        .from('journal_entries')
        .update({
          title,
          content: description,
          updated_at: updatedAt
        })
        .eq('id', listId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set(state => ({
        lists: state.lists.map(list =>
          list.id === listId
            ? { 
                ...list, 
                title, 
                description: description ?? '', 
                content: description ?? '',
                updatedAt
              }
            : list
        ),
        currentList: state.currentList?.id === listId
          ? { 
              ...state.currentList, 
              title, 
              description: description ?? '',
              content: description ?? '',
              updatedAt
            }
          : state.currentList
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addGameToList: async (listId: string, gameId: string, gameName: string, coverUrl: string): Promise<void> => {
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

  removeGameFromList: async (listId: string, gameId: string): Promise<void> => {
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

  deleteList: async (listId: string): Promise<void> => {
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

  fetchUserLists: async (): Promise<void> => {
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
        type: 'list',
        title: entry.title,
        description: entry.content || '',
        games: entry.game_list || [],
        date: entry.date,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        is_public: entry.is_public,
        user_id: entry.user_id,
        content: entry.content
      }));

      set({ lists: transformedLists });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchListDetails: async (listId: string): Promise<void> => {
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
        type: 'list',
        title: data.title,
        description: data.content || '',
        games: data.game_list || [],
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        is_public: data.is_public,
        user_id: data.user_id,
        content: data.content
      };

      set({ currentList: list });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setListVisibility: async (listId: string, isPublic: boolean): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('journal_entries')
        .update({
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', listId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set(state => ({
        lists: state.lists.map(list =>
          list.id === listId
            ? { ...list, is_public: isPublic, updated_at: new Date().toISOString() }
            : list
        ),
        currentList: state.currentList?.id === listId
          ? { ...state.currentList, is_public: isPublic, updated_at: new Date().toISOString() }
          : state.currentList
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicLists: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*, profiles(username, avatar_url)')
        .eq('type', 'list')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedLists: GameList[] = data.map(entry => ({
        id: entry.id,
        type: 'list',
        title: entry.title,
        description: entry.content || '',
        games: entry.game_list || [],
        date: entry.date,
        content: entry.content,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        is_public: entry.is_public,
        user_id: entry.user_id,
        user: {
          username: entry.profiles?.username,
          avatar_url: entry.profiles?.avatar_url
        }
      }));

      set({ publicLists: transformedLists });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));