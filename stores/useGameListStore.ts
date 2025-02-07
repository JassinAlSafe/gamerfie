'use client';

import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createActivity } from '@/lib/activity/activity';
import { GameList, GameListItem, GameListStore } from '@/types/gamelist/game-list';
import { Database } from '@/types/supabase';
import * as Sentry from "@sentry/nextjs";

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
        content: list.content,
        user: {
          username: session?.session?.user?.username || 'Unknown User',
          avatar_url: session?.session?.user?.user_metadata?.avatar_url || ''
        }
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
      const supabase = createClientComponentClient<Database>();
      
      // First, get the journal entry
      const { data: listData, error: listError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;

      // Then, get the user's profile
      if (listData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', listData.user_id)
          .single();

        let games = [];
        if (listData?.content && listData.content.startsWith('[')) {
          try {
            games = JSON.parse(listData.content);
          } catch (parseError) {
            console.error('Error parsing games:', parseError);
          }
        }

        const list: GameList = {
          id: listData.id,
          type: 'list',
          title: listData.title,
          description: listData.content && !listData.content.startsWith('[') ? listData.content : '',
          games: games,
          date: listData.date,
          createdAt: listData.created_at,
          updatedAt: listData.updated_at,
          is_public: listData.is_public,
          user_id: listData.user_id,
          content: listData.content,
          user: {
            username: profileData?.username || 'Unknown User',
            avatar_url: profileData?.avatar_url
          }
        };

        set({ currentList: list });
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: 'fetchListDetails',
          listId
        }
      });
      console.error('Supabase error:', error);
      set({ error: (error as Error).message });
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