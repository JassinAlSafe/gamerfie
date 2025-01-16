import { create } from 'zustand';
import { GameList, CreateGameListDTO, UpdateGameListDTO, AddGameToListDTO } from '@/types/gameList';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface GameListStore {
  lists: GameList[];
  currentList: GameList | null;
  isLoading: boolean;
  error: string | null;
  fetchUserLists: () => Promise<void>;
  createList: (data: CreateGameListDTO) => Promise<GameList>;
  updateList: (listId: string, data: UpdateGameListDTO) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addGameToList: (listId: string, data: AddGameToListDTO) => Promise<void>;
  removeGameFromList: (listId: string, gameId: string) => Promise<void>;
  setCurrentList: (list: GameList | null) => void;
}

const supabase = createClientComponentClient();

export const useGameListStore = create<GameListStore>((set, get) => ({
  lists: [],
  currentList: null,
  isLoading: false,
  error: null,

  fetchUserLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('game_lists')
        .select(`
          *,
          games:game_list_items (
            *,
            game:games (*)
          )
        `)
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      set({ lists: data as GameList[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createList: async (data: CreateGameListDTO) => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data: list, error } = await supabase
        .from('game_lists')
        .insert([
          {
            ...data,
            user_id: session.session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      const lists = get().lists;
      set({ lists: [...lists, list as GameList] });
      return list as GameList;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateList: async (listId: string, data: UpdateGameListDTO) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('game_lists')
        .update(data)
        .eq('id', listId);

      if (error) throw error;

      const lists = get().lists.map(list =>
        list.id === listId ? { ...list, ...data } : list
      );
      set({ lists });
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
      const { error } = await supabase
        .from('game_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      const lists = get().lists.filter(list => list.id !== listId);
      set({ lists });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addGameToList: async (listId: string, data: AddGameToListDTO) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('game_list_items')
        .insert([
          {
            list_id: listId,
            game_id: data.gameId,
            notes: data.notes,
          },
        ]);

      if (error) throw error;

      // Refresh the list to get updated games
      await get().fetchUserLists();
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
      const { error } = await supabase
        .from('game_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('game_id', gameId);

      if (error) throw error;

      // Refresh the list to get updated games
      await get().fetchUserLists();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentList: (list: GameList | null) => {
    set({ currentList: list });
  },
})); 