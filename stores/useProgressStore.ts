import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useFriendsStore } from "./useFriendsStore";

type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

interface GameData {
  playTime?: number | null;
  completionPercentage?: number | null;
  achievementsCompleted?: number | null;
}

interface ProgressData {
  playTime?: number;
  completionPercentage?: number;
  achievementsCompleted?: number;
}

interface ProgressStore {
  playTime: number | null;
  completionPercentage: number | null;
  achievementsCompleted: number | null;
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string, gameId: string) => Promise<void>;
  updateGameStatus: (userId: string, gameId: string, status: GameStatus, gameData?: GameData, comment?: string) => Promise<void>;
  updateProgress: (userId: string, gameId: string, data: ProgressData) => Promise<void>;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  playTime: null,
  completionPercentage: null,
  achievementsCompleted: null,
  loading: false,
  error: null,

  fetchProgress: async (userId: string, gameId: string) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();

    try {
      const { data, error } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .single();

      if (error) throw error;

      if (data) {
        set({
          playTime: data.play_time || null,
          completionPercentage: data.completion_percentage || null,
          achievementsCompleted: data.achievements_completed || null,
        });
      }

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateGameStatus: async (userId: string, gameId: string, status: GameStatus, gameData?: GameData, comment?: string) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();

    try {
      // First check if the record exists
      const { data: existingRecord } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .single();

      let updateResult;
      
      if (existingRecord) {
        // Update existing record
        updateResult = await supabase
          .from("user_games")
          .update({
            status,
            play_time: gameData?.playTime ?? existingRecord.play_time,
            completion_percentage: gameData?.completionPercentage ?? existingRecord.completion_percentage,
            achievements_completed: gameData?.achievementsCompleted ?? existingRecord.achievements_completed,
          })
          .eq("user_id", userId)
          .eq("game_id", gameId);
      } else {
        // Insert new record
        updateResult = await supabase
          .from("user_games")
          .insert({
            user_id: userId,
            game_id: gameId,
            status,
            play_time: gameData?.playTime,
            completion_percentage: gameData?.completionPercentage,
            achievements_completed: gameData?.achievementsCompleted,
          });
      }

      if (updateResult.error) {
        throw updateResult.error;
      }

      // Create an activity with the comment if provided
      if (status === "completed") {
        await useFriendsStore.getState().createActivity("completed", gameId, { comment });
      } else if (status === "playing") {
        await useFriendsStore.getState().createActivity("started_playing", gameId, { comment });
      }

      // Update local state
      set({
        loading: false,
        playTime: gameData?.playTime ?? null,
        completionPercentage: gameData?.completionPercentage ?? null,
        achievementsCompleted: gameData?.achievementsCompleted ?? null,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProgress: async (userId: string, gameId: string, data: ProgressData) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();

    try {
      const { error } = await supabase
        .from("user_games")
        .upsert(
          {
            user_id: userId,
            game_id: gameId,
            play_time: data.playTime,
            completion_percentage: data.completionPercentage,
            achievements_completed: data.achievementsCompleted,
          },
          {
            onConflict: 'user_id,game_id',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;

      // Update local state
      set({
        loading: false,
        playTime: data.playTime ?? null,
        completionPercentage: data.completionPercentage ?? null,
        achievementsCompleted: data.achievementsCompleted ?? null,
      });

      // Create an activity for significant progress updates
      if (data.completionPercentage === 100) {
        await useFriendsStore.getState().createActivity("completed", gameId);
      } else if (data.completionPercentage) {
        await useFriendsStore.getState().createActivity("progress", gameId, {
          progress: data.completionPercentage
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
})); 