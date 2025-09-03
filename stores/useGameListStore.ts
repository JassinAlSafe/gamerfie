'use client';

import { create } from 'zustand';
import { createClient } from "@/utils/supabase/client";
import { createActivity } from '@/lib/activity/activity';
import { GameList, GameListItem, GameListStore } from '@/types/gamelist/game-list';



export const useGameListStore = create<GameListStore>((set, get) => {
  const supabase = createClient();

  // SECURITY FIX: Helper function to get current user via server validation
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Not authenticated');
    return user;
  };

  // Helper function to validate required parameters
  const validateRequired = (params: Record<string, any>, required: string[]) => {
    for (const field of required) {
      if (!params[field]) {
        throw new Error(`${field} is required`);
      }
    }
  };

  return {
    lists: [],
    currentList: null,
    isLoading: false,
    error: null,
    publicLists: [],

    createList: async (title: string, description?: string, isPublic: boolean = false) => {
      validateRequired({ title }, ['title']);
      
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();

        const { data: list, error } = await supabase
          .from('journal_entries')
          .insert([{
            user_id: user.id,
            type: 'list',
            title: title.trim(),
            content: description?.trim() || null,
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
          type: 'list' as const,
          title: list.title,
          content: list.content,
          games: [],
          date: list.date,
          createdAt: list.created_at,
          updatedAt: list.updated_at,
          isPublic: list.is_public,
          user_id: list.user_id,
          user: {
            username: user.user_metadata?.username || 'Unknown User',
            avatar_url: user.user_metadata?.avatar_url || null
          }
        };

        set(state => ({ lists: [...state.lists, newList] }));
        return newList;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create list';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateList: async (listId: string, title: string, description?: string): Promise<void> => {
      validateRequired({ listId, title }, ['listId', 'title']);
      
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();
        const updatedAt = new Date().toISOString();

        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: title.trim(),
            content: description?.trim() || null,
            updated_at: updatedAt
          })
          .eq('id', listId)
          .eq('user_id', user.id);

        if (error) throw error;

        set(state => ({
          lists: state.lists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  title: title.trim(),
                  content: description?.trim() || list.content,
                  updatedAt
                }
              : list
          ),
          currentList: state.currentList?.id === listId
            ? {
                ...state.currentList,
                title: title.trim(),
                content: description?.trim() || state.currentList.content,
                updatedAt
              }
            : state.currentList
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update list';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    addGameToList: async (listId: string, gameId: string, gameName: string, coverUrl: string): Promise<void> => {
      validateRequired({ listId, gameId, gameName }, ['listId', 'gameId', 'gameName']);
      
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();
        const list = get().lists.find(l => l.id === listId);
        if (!list) throw new Error('List not found');

        // Check if game is already in the list
        if (list.games.some(game => game.id === gameId)) {
          throw new Error('Game is already in this list');
        }

        const newGame: GameListItem = {
          id: gameId,
          name: gameName.trim(),
          cover_url: coverUrl || null,
          added_at: new Date().toISOString()
        };

        const updatedGames = [...(list.games || []), newGame];
        const updatedAt = new Date().toISOString();

        const { error } = await supabase
          .from('journal_entries')
          .update({
            game_list: updatedGames,
            updated_at: updatedAt
          })
          .eq('id', listId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Create activity
        try {
          await createActivity('added_to_list', gameId, {
            name: gameName.trim(),
            comment: `Added ${gameName.trim()} to list: ${list.title}`
          });
        } catch (activityError) {
          console.warn('Failed to create activity:', activityError);
          // Don't fail the operation if activity creation fails
        }

        set(state => ({
          lists: state.lists.map(l =>
            l.id === listId
              ? { ...l, games: updatedGames, updatedAt }
              : l
          ),
          currentList: state.currentList?.id === listId
            ? { ...state.currentList, games: updatedGames, updatedAt }
            : state.currentList
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add game to list';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    removeGameFromList: async (listId: string, gameId: string) => {
      validateRequired({ listId, gameId }, ['listId', 'gameId']);
      
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();
        const list = get().lists.find(l => l.id === listId);
        if (!list) throw new Error('List not found');

        const updatedGames = list.games.filter(g => g.id !== gameId);
        const updatedAt = new Date().toISOString();

        const { error } = await supabase
          .from('journal_entries')
          .update({
            game_list: updatedGames,
            updated_at: updatedAt
          })
          .eq('id', listId)
          .eq('user_id', user.id);

        if (error) throw error;

        set(state => ({
          lists: state.lists.map(l =>
            l.id === listId
              ? { ...l, games: updatedGames, updatedAt }
              : l
          ),
          currentList: state.currentList?.id === listId
            ? { ...state.currentList, games: updatedGames, updatedAt }
            : state.currentList
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove game from list';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteList: async (listId: string): Promise<void> => {
      validateRequired({ listId }, ['listId']);
      
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();

        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', listId)
          .eq('user_id', user.id);

        if (error) throw error;

        set(state => ({
          lists: state.lists.filter(l => l.id !== listId),
          currentList: state.currentList?.id === listId ? null : state.currentList
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete list';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    fetchUserLists: async (): Promise<void> => {
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();

        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('type', 'list')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedLists: GameList[] = (data || []).map(entry => {
          let games: GameListItem[] = [];
          
          // Handle games parsing - check both game_list and content fields
          if (Array.isArray(entry.game_list)) {
            games = entry.game_list;
          } else if (entry.game_list && typeof entry.game_list === 'string') {
            try {
              const parsed = JSON.parse(entry.game_list);
              games = Array.isArray(parsed) ? parsed : [];
            } catch (parseError) {
              console.warn('Error parsing games from game_list field:', parseError);
            }
          }
          
          // If no games found in game_list, try content field
          if (games.length === 0 && entry.content) {
            try {
              if (entry.content.startsWith('[')) {
                const parsed = JSON.parse(entry.content);
                games = Array.isArray(parsed) ? parsed : [];
              }
            } catch (parseError) {
              console.warn('Error parsing games from content field:', parseError);
            }
          }
          
          return {
            id: entry.id,
            type: 'list',
            title: entry.title,
            content: entry.content || '',
            games,
            date: entry.date,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
            isPublic: entry.is_public,
            user_id: entry.user_id
          };
        });

        set({ lists: transformedLists });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user lists';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    fetchListDetails: async (listId: string): Promise<void> => {
      validateRequired({ listId }, ['listId']);
      
      set({ isLoading: true, error: null });
      try {
        // First, get the journal entry
        const { data: listData, error: listError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', listId)
          .single();

        if (listError) throw listError;

        if (!listData) {
          throw new Error('List not found');
        }

        // Then, get the user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', listData.user_id)
          .single();

        let games: GameListItem[] = [];
        
        // Handle games parsing - check both game_list and content fields
        if (Array.isArray(listData.game_list)) {
          games = listData.game_list;
        } else if (listData.game_list && typeof listData.game_list === 'string') {
          try {
            const parsed = JSON.parse(listData.game_list);
            games = Array.isArray(parsed) ? parsed : [];
          } catch (parseError) {
            console.warn('Error parsing games from game_list field:', parseError);
          }
        }
        
        // If no games found in game_list, try content field
        if (games.length === 0 && listData.content) {
          try {
            if (listData.content.startsWith('[')) {
              const parsed = JSON.parse(listData.content);
              games = Array.isArray(parsed) ? parsed : [];
            }
          } catch (parseError) {
            console.warn('Error parsing games from content field:', parseError);
          }
        }

        const list: GameList = {
          id: listData.id,
          type: 'list' as const,
          title: listData.title,
          content: listData.content,
          games,
          date: listData.date,
          createdAt: listData.created_at,
          updatedAt: listData.updated_at,
          isPublic: listData.is_public,
          user_id: listData.user_id,
          user: {
            username: profileData?.username || 'Unknown User',
            avatar_url: profileData?.avatar_url || null
          }
        };

        set({ currentList: list });
      } catch (error) {
        console.error('Error fetching list details:', error, { listId });
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch list details';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    setListVisibility: async (listId: string, isPublic: boolean): Promise<void> => {
      validateRequired({ listId }, ['listId']);
      
      set({ isLoading: true, error: null });
      try {
        const user = await getCurrentUser();
        const updatedAt = new Date().toISOString();

        const { error } = await supabase
          .from('journal_entries')
          .update({
            is_public: isPublic,
            updated_at: updatedAt
          })
          .eq('id', listId)
          .eq('user_id', user.id);

        if (error) throw error;

        set(state => ({
          lists: state.lists.map(list =>
            list.id === listId
              ? { ...list, isPublic, updatedAt }
              : list
          ),
          currentList: state.currentList?.id === listId
            ? { ...state.currentList, isPublic, updatedAt }
            : state.currentList
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update list visibility';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    fetchPublicLists: async (): Promise<void> => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*, profiles(username, avatar_url)')
          .eq('type', 'list')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedLists: GameList[] = (data || []).map(entry => {
          let games: GameListItem[] = [];
          
          // Handle games parsing - check both game_list and content fields
          if (Array.isArray(entry.game_list)) {
            games = entry.game_list;
          } else if (entry.game_list && typeof entry.game_list === 'string') {
            try {
              const parsed = JSON.parse(entry.game_list);
              games = Array.isArray(parsed) ? parsed : [];
            } catch (parseError) {
              console.warn('Error parsing games from game_list field:', parseError);
            }
          }
          
          // If no games found in game_list, try content field
          if (games.length === 0 && entry.content) {
            try {
              if (entry.content.startsWith('[')) {
                const parsed = JSON.parse(entry.content);
                games = Array.isArray(parsed) ? parsed : [];
              }
            } catch (parseError) {
              console.warn('Error parsing games from content field:', parseError);
            }
          }
          
          return {
            id: entry.id,
            type: 'list',
            title: entry.title,
            content: entry.content || '',
            games,
            date: entry.date,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
            isPublic: entry.is_public,
            user_id: entry.user_id,
            user: {
              username: (entry.profiles as any)?.username || 'Unknown User',
              avatar_url: (entry.profiles as any)?.avatar_url || null
            }
          };
        });

        set({ publicLists: transformedLists });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch public lists';
        set({ error: errorMessage });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    }
  };
});