import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

interface ProgressStore {
  playTime: number | null;
  completionPercentage: number | null;
  achievementsCompleted: number | null;
  status: string | null;
  completedAt: string | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string, gameId: string) => Promise<void>;
  updateGameStatus: (userId: string, gameId: string, status: string) => Promise<void>;
  updateProgress: (userId: string, gameId: string, data: any) => Promise<void>;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  playTime: null,
  completionPercentage: null,
  achievementsCompleted: null,
  status: null,
  completedAt: null,
  loading: false,
  error: null,

  fetchProgress: async (userId, gameId) => {
    set({ loading: true, error: null });
    const supabase = createClientComponentClient();

    try {
      const { data, error } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single();

      if (error) throw error;

      set({
        playTime: data?.play_time || null,
        completionPercentage: data?.completion_percentage || null,
        achievementsCompleted: data?.achievements_completed || null,
        status: data?.status || null,
        completedAt: data?.completed_at || null,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({ error: 'Failed to fetch progress' });
    } finally {
      set({ loading: false });
    }
  },

  updateGameStatus: async (userId, gameId, status) => {
    const supabase = createClientComponentClient();
    
    try {
      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          status,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      set({ status });
      toast.success('Game status updated successfully');
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error('Failed to update game status');
    }
  },

  updateProgress: async (userId, gameId, data) => {
    const supabase = createClientComponentClient();
    
    try {
      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      set(data);
      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  },
})); 