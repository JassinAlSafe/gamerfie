import { create } from 'zustand';
import { createClient } from "@/utils/supabase/client";
import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user', 
        isLoading: false 
      });
    }
  },
})); 