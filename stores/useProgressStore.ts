import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { Database } from '@/types/supabase';
import { FriendsService } from '@/services/friends-service';
import { ActivityType } from '@/types/friend';

type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

interface ProgressStore {
  playTime: number | null;
  completionPercentage: number | null;
  achievementsCompleted: number | null;
  status: GameStatus | null;
  completedAt: string | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string, gameId: string) => Promise<void>;
  updateGameStatus: (userId: string, gameId: string, status: GameStatus, gameData?: GameData) => Promise<void>;
  updateProgress: (userId: string, gameId: string, data: ProgressData) => Promise<void>;
}

interface GameData {
  id: string;
  name: string;
  cover_url?: string | null;
  rating?: number | null;
  first_release_date?: number | null;
  platforms?: Platform[];
  genres?: Genre[];
}

interface Platform {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface ProgressData {
  play_time?: number;
  completion_percentage?: number;
  achievements_completed?: number;
  status?: GameStatus;
  completed_at?: string | null;
}

export const useProgressStore = create<ProgressStore>((set) => ({
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
          status: data.status as GameStatus || null,
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

  updateGameStatus: async (userId, gameId, status, gameData) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();
    
    try {
      // First, ensure game exists in games table
      if (!gameData) throw new Error('Game data is required');

      const { error: gameError } = await supabase
        .from('games')
        .upsert({ 
          id: gameId,
          name: gameData.name,
          cover_url: gameData.cover_url
        }, { 
          onConflict: 'id' 
        });

      if (gameError) throw gameError;

      // Get current status before update
      const { data: currentData } = await supabase
        .from('user_games')
        .select('status')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .maybeSingle();

      const previousStatus = currentData?.status;

      // Then update user_games
      const { error: userGameError } = await supabase
        .from('user_games')
        .upsert({
          user_id: userId,
          game_id: gameId,
          status,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,game_id'
        });

      if (userGameError) throw userGameError;

      // Then ensure game exists in games table if gameData is provided
      if (gameData) {
        const { error: gameError } = await supabase
          .from('games')
          .upsert({
            id: gameId,
            name: gameData.name,
            cover_url: gameData.cover_url || null,
            rating: gameData.rating || null,
            first_release_date: gameData.first_release_date || null,
            platforms: gameData.platforms ? JSON.stringify(gameData.platforms) : null,
            genres: gameData.genres ? JSON.stringify(gameData.genres) : null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (gameError) {
          console.error('Error updating game data:', gameError);
          // Don't throw here as the status update was successful
        }
      }

      // Create activity based on status change
      if (status !== previousStatus) {
        let activityType: ActivityType | undefined;
        if (status === 'playing') {
          activityType = 'started_playing';
        } else if (status === 'completed') {
          activityType = 'completed';
        }

        if (activityType) {
          console.log('Creating activity:', {
            activity_type: activityType,
            game_id: gameId,
            previous_status: previousStatus,
            new_status: status
          });
          
          try {
            await FriendsService.createActivity({
              activity_type: activityType,
              game_id: gameId,
            });
            console.log('Activity created successfully');
          } catch (error) {
            console.error('Error creating activity:', error);
          }
        }
      }

      // Fetch fresh data after update
      const { data: updatedData, error: fetchError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single();

      if (fetchError) throw fetchError;

      // Update store with fresh data
      set({
        playTime: updatedData.play_time || null,
        completionPercentage: updatedData.completion_percentage || null,
        achievementsCompleted: updatedData.achievements_completed || null,
        status: updatedData.status as GameStatus || null,
        completedAt: updatedData.completed_at || null,
      });
      
      toast.success('Game status updated successfully');
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error('Failed to update game status');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProgress: async (userId, gameId, data) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();
    
    try {
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

      // Fetch fresh data after update
      const { data: updatedData, error: fetchError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single();

      if (fetchError) throw fetchError;

      // Update store with fresh data
      set({
        playTime: updatedData.play_time || null,
        completionPercentage: updatedData.completion_percentage || null,
        achievementsCompleted: updatedData.achievements_completed || null,
        status: updatedData.status as GameStatus || null,
        completedAt: updatedData.completed_at || null,
      });
      
      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
})); 