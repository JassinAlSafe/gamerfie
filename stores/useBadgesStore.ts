import { create } from 'zustand';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url?: string;
}

interface BadgesState {
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  fetchBadges: () => Promise<void>;
}

export const useBadgesStore = create<BadgesState>((set) => ({
  badges: [],
  isLoading: false,
  error: null,

  fetchBadges: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      set({ badges: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching badges:', error);
      set({ 
        error: 'Failed to fetch badges',
        isLoading: false 
      });
    }
  },
})); 