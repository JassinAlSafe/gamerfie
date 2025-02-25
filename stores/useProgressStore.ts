import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();

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

      if (progressError) throw progressError;

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
      const playTimeHistory = playTimeData.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        hours: entry.play_time
      }));

      const achievementHistory = achievementData.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString(),
        count: entry.achievements_completed
      }));

      set({
        play_time: currentProgress?.play_time || null,
        completion_percentage: currentProgress?.completion_percentage || null,
        achievements_completed: currentProgress?.achievements_completed || null,
        playTimeHistory,
        achievementHistory,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateGameStatus: async (userId: string, gameId: string, status: GameStatus, gameData?: GameData) => {
    set({ loading: true });
    const supabase = createClientComponentClient<Database>();

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
    const supabase = createClientComponentClient<Database>();

    try {
      // Ensure gameId is a string
      const gameIdString = gameId.toString();

      // Update current progress
      const { error: progressError } = await supabase
        .from("user_games")
        .upsert(
          {
            user_id: userId,
            game_id: gameIdString,
            play_time: data.play_time,
            completion_percentage: data.completion_percentage,
            achievements_completed: data.achievements_completed,
            last_played_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,game_id',
            ignoreDuplicates: false
          }
        );

      if (progressError) throw progressError;

      // Record progress history
      const { error: historyError } = await supabase
        .from("game_progress_history")
        .insert({
          user_id: userId,
          game_id: gameIdString,
          play_time: data.play_time,
          completion_percentage: data.completion_percentage,
        });

      if (historyError) throw historyError;

      // Record achievement history if achievements were updated
      if (data.achievements_completed !== undefined) {
        const { error: achievementError } = await supabase
          .from("game_achievement_history")
          .insert({
            user_id: userId,
            game_id: gameIdString,
            achievements_completed: data.achievements_completed,
          });

        if (achievementError) throw achievementError;
      }

      // First get the user's active challenge participations
      const { data: participations, error: participationsError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", userId)
        .eq("completed", false);

      if (participationsError) throw participationsError;

      const challengeIds = participations?.map(p => p.challenge_id) || [];

      // Then get active challenges with goals for this game
      const { data: activeGameChallenges, error: challengesError } = await supabase
        .from("challenges")
        .select(`
          id,
          goals:challenge_goals(*)
        `)
        .eq("status", "active")
        .in("id", challengeIds)
        .filter("goals.type", "eq", "play_time");

      if (challengesError) throw challengesError;

      // Update progress for each active challenge
      for (const challenge of activeGameChallenges || []) {
        await fetch(`/api/challenges/${challenge.id}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Empty body since the endpoint will calculate progress
        });
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

      // Create activities for significant progress updates
      if (data.completion_percentage === 100) {
        await useFriendsStore.getState().createActivity("completed", gameIdString);
      } else if (data.completion_percentage) {
        await useFriendsStore.getState().createActivity("progress", gameIdString, {
          progress: data.completion_percentage
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  }
})); 