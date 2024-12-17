import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { Database } from '@/types/supabase';

interface ProgressStore {
  playTime: number | null;
  completionPercentage: number | null;
  achievementsCompleted: number | null;
  status: string | null;
  completedAt: string | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string, gameId: string) => Promise<void>;
  updateGameStatus: (userId: string, gameId: string, status: string, gameData?: GameData) => Promise<void>;
  updateProgress: (userId: string, gameId: string, data: any, gameData?: GameData) => Promise<void>;
}

interface GameData {
  id: string;
  name: string;
  cover_url?: string;
  rating?: number;
  first_release_date?: number;
  platforms?: any[];
  genres?: any[];
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
    const supabase = createClientComponentClient<Database>();

    try {
      const { data, error } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({
          playTime: data.play_time || null,
          completionPercentage: data.completion_percentage || null,
          achievementsCompleted: data.achievements_completed || null,
          status: data.status || null,
          completedAt: data.completed_at || null,
        });
      } else {
        set({
          playTime: null,
          completionPercentage: null,
          achievementsCompleted: null,
          status: null,
          completedAt: null,
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({ error: 'Failed to fetch progress' });
    } finally {
      set({ loading: false });
    }
  },

  updateGameStatus: async (userId, gameId, status, gameData?: GameData) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();
    
    try {
      // First ensure game exists in games table
      if (gameData) {
        const { error: gameError } = await supabase
          .from('games')
          .upsert({
            id: gameId,
            name: gameData.name,
            cover_url: gameData.cover_url,
            rating: gameData.rating,
            first_release_date: gameData.first_release_date,
            platforms: gameData.platforms ? JSON.stringify(gameData.platforms) : null,
            genres: gameData.genres ? JSON.stringify(gameData.genres) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (gameError) throw gameError;
      }

      // Then update user_games
      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          status,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,game_id'
        });

      if (error) throw error;

      // Fetch fresh data
      const { data: updatedData, error: fetchError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single();

      if (fetchError) throw fetchError;

      set({
        playTime: updatedData.play_time || null,
        completionPercentage: updatedData.completion_percentage || null,
        achievementsCompleted: updatedData.achievements_completed || null,
        status: updatedData.status || null,
        completedAt: updatedData.completed_at || null,
      });
      
      toast.success('Game status updated successfully');
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error('Failed to update game status');
    } finally {
      set({ loading: false });
    }
  },

  updateProgress: async (userId, gameId, data, gameData?: GameData) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();
    
    try {
      // First ensure game exists in games table
      if (gameData) {
        const { error: gameError } = await supabase
          .from('games')
          .upsert({
            id: gameId,
            name: gameData.name,
            cover_url: gameData.cover_url,
            rating: gameData.rating,
            first_release_date: gameData.first_release_date,
            platforms: gameData.platforms ? JSON.stringify(gameData.platforms) : null,
            genres: gameData.genres ? JSON.stringify(gameData.genres) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (gameError) throw gameError;
      }

      // Then update user_games
      const { error } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          ...data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,game_id'
        });

      if (error) throw error;

      // Fetch fresh data
      const { data: updatedData, error: fetchError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single();

      if (fetchError) throw fetchError;

      set({
        playTime: updatedData.play_time || null,
        completionPercentage: updatedData.completion_percentage || null,
        achievementsCompleted: updatedData.achievements_completed || null,
        status: updatedData.status || null,
        completedAt: updatedData.completed_at || null,
      });
      
      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      set({ loading: false });
    }
  },
})); 