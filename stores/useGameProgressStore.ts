'use client';

import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createActivity } from '@/lib/activity';

interface PlayTimeEntry {
  date: string;
  hours: number;
}

interface AchievementEntry {
  date: string;
  count: number;
}

interface GameProgressStore {
  isLoading: boolean;
  error: string | null;
  currentStatus: string | null;
  progress: number | null;
  playTime: number | null;
  achievementsCompleted: number | null;
  playTimeHistory: PlayTimeEntry[];
  achievementHistory: AchievementEntry[];
  updateGameStatus: (gameId: string, status: string, gameData?: any) => Promise<void>;
  updateProgress: (gameId: string, data: {
    completion_percentage?: number | null;
    play_time?: number | null;
    achievements_completed?: number | null;
  }) => Promise<void>;
  fetchGameProgress: (gameId: string) => Promise<void>;
}

export const useGameProgressStore = create<GameProgressStore>((set, get) => ({
  isLoading: false,
  error: null,
  currentStatus: null,
  progress: null,
  playTime: null,
  achievementsCompleted: null,
  playTimeHistory: [],
  achievementHistory: [],

  updateGameStatus: async (gameId: string, status: string, gameData?: any) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      // First ensure game exists in games table
      if (gameData) {
        const { error: gameError } = await supabase
          .from('games')
          .upsert({
            id: gameId,
            ...gameData
          }, { onConflict: 'id' });

        if (gameError) throw gameError;
      }

      // Update user_games table
      const { error: userGameError } = await supabase
        .from('user_games')
        .upsert({
          user_id: session.session.user.id,
          game_id: gameId,
          status,
          progress: status === 'completed' ? 100 : get().progress,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,game_id' });

      if (userGameError) throw userGameError;

      set(state => ({
        currentStatus: status,
        progress: status === 'completed' ? 100 : state.progress
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProgress: async (gameId: string, data: {
    completion_percentage?: number | null;
    play_time?: number | null;
    achievements_completed?: number | null;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const timestamp = new Date().toISOString();

      // Update user_games table
      const { error: updateError } = await supabase
        .from('user_games')
        .upsert({
          user_id: session.session.user.id,
          game_id: gameId,
          progress: data.completion_percentage,
          play_time: data.play_time,
          achievements_completed: data.achievements_completed,
          updated_at: timestamp
        }, { onConflict: 'user_id,game_id' });

      if (updateError) throw updateError;

      // Record progress history
      if (data.play_time !== undefined) {
        const { error: historyError } = await supabase
          .from('game_progress_history')
          .insert({
            user_id: session.session.user.id,
            game_id: gameId,
            play_time: data.play_time,
            completion_percentage: data.completion_percentage,
            achievements_completed: data.achievements_completed,
            created_at: timestamp
          });

        if (historyError) throw historyError;
      }

      set(state => ({
        progress: data.completion_percentage ?? state.progress,
        playTime: data.play_time ?? state.playTime,
        achievementsCompleted: data.achievements_completed ?? state.achievementsCompleted
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGameProgress: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      // Fetch current progress
      const { data: progressData, error: currentError } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('game_id', gameId);

      if (currentError) throw currentError;

      // Get the most recent progress or null if none exists
      const currentProgress = progressData?.[0] || null;

      // If no progress exists yet, set default values and return early
      if (!currentProgress) {
        set({
          currentStatus: null,
          progress: null,
          playTime: null,
          achievementsCompleted: null,
          playTimeHistory: [],
          achievementHistory: []
        });
        return;
      }

      // Fetch progress history only if we have current progress
      const { data: history = [], error: historyError } = await supabase
        .from('game_progress_history')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (historyError) throw historyError;

      // Transform history data
      const playTimeHistory = (history || []).map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        hours: entry.play_time || 0
      }));

      const achievementHistory = (history || []).map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        count: entry.achievements_completed || 0
      }));

      set({
        currentStatus: currentProgress.status || null,
        progress: currentProgress.progress || null,
        playTime: currentProgress.play_time || null,
        achievementsCompleted: currentProgress.achievements_completed || null,
        playTimeHistory,
        achievementHistory
      });
    } catch (error) {
      set({ error: (error as Error).message });
      // Don't throw the error, just log it
      console.error('Error fetching game progress:', error);
    } finally {
      set({ isLoading: false });
    }
  }
})); 