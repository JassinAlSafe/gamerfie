import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface ProgressState {
  playTime: number | null;
  status: string | null;
  completedAt: string | null;
  completionPercentage: number;
  achievementsCompleted: number;
  loading: boolean;
  error: Error | null;
  fetchProgress: (userId: string, gameId: string) => Promise<void>;
  updateProgress: (userId: string, gameId: string, data: {
    play_time?: number;
    completion_percentage?: number;
    achievements_completed?: number;
    status?: string;
    completed_at?: string | null;
  }) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  playTime: null,
  status: null,
  completedAt: null,
  completionPercentage: 0,
  achievementsCompleted: 0,
  loading: false,
  error: null,

  fetchProgress: async (userId: string, gameId: string) => {
    const supabase = createClientComponentClient<Database>();
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('user_games')
        .select('play_time, status, completed_at, completion_percentage, achievements_completed')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .maybeSingle();

      if (!data) {
        set({
          playTime: 0,
          status: null,
          completedAt: null,
          completionPercentage: 0,
          achievementsCompleted: 0,
          loading: false
        });
        return;
      }

      set({
        playTime: data.play_time || 0,
        status: data.status || null,
        completedAt: data.completed_at || null,
        completionPercentage: data.completion_percentage || 0,
        achievementsCompleted: data.achievements_completed || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching game progress:', error);
      set({ 
        error: error as Error, 
        loading: false,
        playTime: 0,
        status: null,
        completedAt: null,
        completionPercentage: 0,
        achievementsCompleted: 0
      });
    }
  },

  updateProgress: async (userId: string, gameId: string, data: {
    play_time?: number;
    completion_percentage?: number;
    achievements_completed?: number;
    status?: string;
    completed_at?: string | null;
  }) => {
    const supabase = createClientComponentClient<Database>();
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,game_id'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update local state with all the new values
      set(state => ({
        playTime: data.play_time ?? state.playTime,
        status: data.status ?? state.status,
        completedAt: data.completed_at ?? state.completedAt,
        completionPercentage: data.completion_percentage ?? state.completionPercentage,
        achievementsCompleted: data.achievements_completed ?? state.achievementsCompleted,
        loading: false
      }));

      console.log('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      set({ 
        error: error as Error, 
        loading: false 
      });
      throw error;
    }
  }
})); 