import { create } from 'zustand';
import { createClient } from "@/utils/supabase/client";
import { Database } from '@/types/supabase';
import { useFriendsStore } from "./useFriendsStore";

type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

interface GameData {
  play_time?: number | null;
  completion_percentage?: number | null;
  achievements_completed?: number | null;
}

interface ProgressData {
  play_time?: number;
  completion_percentage?: number;
  achievements_completed?: number;
}

interface PlayTimeEntry {
  date: string;
  hours: number;
}

interface AchievementEntry {
  date: string;
  count: number;
}

interface ProgressStore {
  play_time: number | null;
  completion_percentage: number | null;
  achievements_completed: number | null;
  playTimeHistory: PlayTimeEntry[];
  achievementHistory: AchievementEntry[];
  loading: boolean;
  error: string | null;
  fetchProgress: (userId: string, gameId: string) => Promise<void>;
  updateGameStatus: (userId: string, gameId: string, status: GameStatus, gameData?: GameData) => Promise<void>;
  updateProgress: (userId: string, gameId: string, data: ProgressData) => Promise<void>;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  play_time: null,
  completion_percentage: null,
  achievements_completed: null,
  playTimeHistory: [],
  achievementHistory: [],
  loading: false,
  error: null,

  fetchProgress: async (userId: string, gameId: string) => {
    set({ loading: true, error: null });
    const supabase = createClient();

    try {
      // Ensure gameId is a string
      const gameIdString = gameId.toString();

      // Fetch current progress
      const { data: currentProgress, error: progressError } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .single();

      // Handle the case where no progress record exists
      let progress = null;
      if (progressError) {
        if (progressError.code === 'PGRST116') {
          // No rows found - this is expected for games not yet added to library
          progress = null;
        } else {
          throw progressError;
        }
      } else {
        progress = currentProgress;
      }

      // Fetch playtime history
      const { data: playTimeData, error: playTimeError } = await supabase
        .from("game_progress_history")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .order("created_at", { ascending: true });

      if (playTimeError) throw playTimeError;

      // Fetch achievement history
      const { data: achievementData, error: achievementError } = await supabase
        .from("game_achievement_history")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .order("created_at", { ascending: true });

      if (achievementError) throw achievementError;

      // Process history data
      const playTimeHistory = playTimeData?.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        hours: entry.play_time || 0
      })) || [];

      const achievementHistory = achievementData?.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        count: entry.achievements_completed || 0
      })) || [];

      // Set state with proper defaults for when no progress exists
      set({
        play_time: progress?.play_time ?? 0,
        completion_percentage: progress?.completion_percentage ?? 0,
        achievements_completed: progress?.achievements_completed ?? 0,
        playTimeHistory,
        achievementHistory,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Set defaults on error
      set({ 
        play_time: 0,
        completion_percentage: 0,
        achievements_completed: 0,
        playTimeHistory: [],
        achievementHistory: [],
        error: (error as Error).message, 
        loading: false 
      });
    }
  },

  updateGameStatus: async (userId: string, gameId: string, status: GameStatus, gameData?: GameData) => {
    set({ loading: true });
    const supabase = createClient();

    try {
      // Ensure gameId is a string
      const gameIdString = gameId.toString();

      // First check if the record exists
      const { data: existingRecord } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .single();

      let updateResult;
      
      if (existingRecord) {
        // Update existing record
        updateResult = await supabase
          .from("user_games")
          .update({
            status,
            play_time: gameData?.play_time ?? existingRecord.play_time,
            completion_percentage: gameData?.completion_percentage ?? existingRecord.completion_percentage,
            achievements_completed: gameData?.achievements_completed ?? existingRecord.achievements_completed,
            last_played_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("game_id", gameIdString);
      } else {
        // Insert new record
        updateResult = await supabase
          .from("user_games")
          .insert({
            user_id: userId,
            game_id: gameIdString,
            status,
            play_time: gameData?.play_time,
            completion_percentage: gameData?.completion_percentage,
            achievements_completed: gameData?.achievements_completed,
            last_played_at: new Date().toISOString(),
          });
      }

      if (updateResult.error) {
        throw updateResult.error;
      }

      // Update local state
      set({
        loading: false,
        play_time: gameData?.play_time ?? null,
        completion_percentage: gameData?.completion_percentage ?? null,
        achievements_completed: gameData?.achievements_completed ?? null,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProgress: async (userId: string, gameId: string, data: ProgressData) => {
    set({ loading: true });
    const supabase = createClient();

    try {
      // Ensure gameId is a string
      const gameIdString = gameId.toString();

      // First check if the game record exists, if not create it with default status
      const { data: existingGame } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .single();

      if (!existingGame) {
        // Insert new record with default status if it doesn't exist
        const { error: insertError } = await supabase
          .from("user_games")
          .insert({
            user_id: userId,
            game_id: gameIdString,
            status: 'playing', // Default to playing when updating progress
            play_time: data.play_time,
            completion_percentage: data.completion_percentage,
            achievements_completed: data.achievements_completed,
            last_played_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from("user_games")
          .update({
            play_time: data.play_time,
            completion_percentage: data.completion_percentage,
            achievements_completed: data.achievements_completed,
            last_played_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("game_id", gameIdString);

        if (updateError) throw updateError;
      }

      // Record progress history (optional - don't fail if tables don't exist)
      try {
        await supabase
          .from("game_progress_history")
          .insert({
            user_id: userId,
            game_id: gameIdString,
            play_time: data.play_time,
            completion_percentage: data.completion_percentage,
          });
      } catch (historyError) {
        console.warn("Could not record progress history:", historyError);
      }

      // Record achievement history if achievements were updated (optional)
      if (data.achievements_completed !== undefined) {
        try {
          await supabase
            .from("game_achievement_history")
            .insert({
              user_id: userId,
              game_id: gameIdString,
              achievements_completed: data.achievements_completed,
            });
        } catch (achievementError) {
          console.warn("Could not record achievement history:", achievementError);
        }
      }

      // Update challenge progress (optional - don't fail if challenges system is not working)
      try {
        const { data: participations } = await supabase
          .from("challenge_participants")
          .select("challenge_id")
          .eq("user_id", userId)
          .eq("completed", false);

        const challengeIds = participations?.map(p => p.challenge_id) || [];

        if (challengeIds.length > 0) {
          const { data: activeGameChallenges } = await supabase
            .from("challenges")
            .select(`
              id,
              goals:challenge_goals(*)
            `)
            .eq("status", "active")
            .in("id", challengeIds)
            .filter("goals.type", "eq", "play_time");

          // Update progress for each active challenge
          for (const challenge of activeGameChallenges || []) {
            try {
              await fetch(`/api/challenges/${challenge.id}/progress`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              });
            } catch (challengeError) {
              console.warn("Could not update challenge progress:", challengeError);
            }
          }
        }
      } catch (challengeError) {
        console.warn("Could not update challenge progress:", challengeError);
      }

      // Update local state
      set(state => ({
        loading: false,
        play_time: data.play_time ?? state.play_time,
        completion_percentage: data.completion_percentage ?? state.completion_percentage,
        achievements_completed: data.achievements_completed ?? state.achievements_completed,
        playTimeHistory: [
          ...state.playTimeHistory,
          {
            date: new Date().toLocaleDateString(),
            hours: data.play_time || 0,
          },
        ],
        achievementHistory: data.achievements_completed
          ? [
              ...state.achievementHistory,
              {
                date: new Date().toLocaleDateString(),
                count: data.achievements_completed,
              },
            ]
          : state.achievementHistory,
      }));

      // Create activities for significant progress updates (optional)
      try {
        if (data.completion_percentage === 100) {
          await useFriendsStore.getState().createActivity("completed", gameIdString);
        } else if (data.completion_percentage) {
          await useFriendsStore.getState().createActivity("progress", gameIdString, {
            progress: data.completion_percentage
          });
        }
      } catch (activityError) {
        console.warn("Could not create activity:", activityError);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  }
})); 