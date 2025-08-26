import { create } from 'zustand';
import { createClient } from "@/utils/supabase/client";
import { useFriendsStore } from "./useFriendsStore";
import { formatDisplayDate } from "@/utils/date-formatting";

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

// Helper function for parameter validation
const validateParams = (userId: string, gameId: string): void => {
  if (!userId?.trim()) {
    throw new Error('User ID is required');
  }
  if (!gameId?.trim()) {
    throw new Error('Game ID is required');
  }
};

// Helper function to normalize game ID
const normalizeGameId = (gameId: string): string => {
  return gameId.toString().trim();
};

// Helper function for safe error handling
const handleError = (error: unknown, context: string): string => {
  console.error(`${context}:`, error);
  if (error instanceof Error) {
    return error.message;
  }
  return `An unexpected error occurred during ${context}`;
};

export const useProgressStore = create<ProgressStore>((set, get) => ({
  play_time: null,
  completion_percentage: null,
  achievements_completed: null,
  playTimeHistory: [],
  achievementHistory: [],
  loading: false,
  error: null,

  fetchProgress: async (userId: string, gameId: string) => {
    try {
      validateParams(userId, gameId);
      set({ loading: true, error: null });
      
      const supabase = createClient();
      const gameIdString = normalizeGameId(gameId);

      // Fetch current progress
      const { data: currentProgress, error: progressError } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
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

      // Process history data with safe parsing
      const playTimeHistory = playTimeData?.map(entry => ({
        date: formatDisplayDate(entry.created_at),
        hours: Number(entry.play_time) || 0
      })) || [];

      const achievementHistory = achievementData?.map(entry => ({
        date: formatDisplayDate(entry.created_at),
        count: Number(entry.achievements_completed) || 0
      })) || [];

      // Set state with proper defaults
      set({
        play_time: currentProgress?.play_time ?? 0,
        completion_percentage: currentProgress?.completion_percentage ?? 0,
        achievements_completed: currentProgress?.achievements_completed ?? 0,
        playTimeHistory,
        achievementHistory,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = handleError(error, 'fetching progress');
      set({ 
        play_time: 0,
        completion_percentage: 0,
        achievements_completed: 0,
        playTimeHistory: [],
        achievementHistory: [],
        error: errorMessage, 
        loading: false 
      });
    }
  },

  updateGameStatus: async (userId: string, gameId: string, status: GameStatus, gameData?: GameData) => {
    try {
      validateParams(userId, gameId);
      if (!status) {
        throw new Error('Game status is required');
      }
      
      set({ loading: true, error: null });
      
      const supabase = createClient();
      const gameIdString = normalizeGameId(gameId);

      // Check if record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

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
            play_time: gameData?.play_time || 0,
            completion_percentage: gameData?.completion_percentage || 0,
            achievements_completed: gameData?.achievements_completed || 0,
            last_played_at: new Date().toISOString(),
          });
      }

      if (updateResult.error) {
        throw updateResult.error;
      }

      // Update local state
      set({
        loading: false,
        play_time: gameData?.play_time ?? get().play_time,
        completion_percentage: gameData?.completion_percentage ?? get().completion_percentage,
        achievements_completed: gameData?.achievements_completed ?? get().achievements_completed,
        error: null,
      });
    } catch (error) {
      const errorMessage = handleError(error, 'updating game status');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateProgress: async (userId: string, gameId: string, data: ProgressData) => {
    try {
      validateParams(userId, gameId);
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Progress data is required');
      }
      
      set({ loading: true, error: null });
      
      const supabase = createClient();
      const gameIdString = normalizeGameId(gameId);

      // Validate progress data ranges
      if (data.completion_percentage !== undefined && (data.completion_percentage < 0 || data.completion_percentage > 100)) {
        throw new Error('Completion percentage must be between 0 and 100');
      }
      if (data.play_time !== undefined && data.play_time < 0) {
        throw new Error('Play time cannot be negative');
      }
      if (data.achievements_completed !== undefined && data.achievements_completed < 0) {
        throw new Error('Achievements completed cannot be negative');
      }

      // Check if game record exists
      const { data: existingGame, error: fetchError } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameIdString)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingGame) {
        // Insert new record with default status
        const { error: insertError } = await supabase
          .from("user_games")
          .insert({
            user_id: userId,
            game_id: gameIdString,
            status: 'playing',
            play_time: data.play_time || 0,
            completion_percentage: data.completion_percentage || 0,
            achievements_completed: data.achievements_completed || 0,
            last_played_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from("user_games")
          .update({
            play_time: data.play_time ?? existingGame.play_time,
            completion_percentage: data.completion_percentage ?? existingGame.completion_percentage,
            achievements_completed: data.achievements_completed ?? existingGame.achievements_completed,
            last_played_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("game_id", gameIdString);

        if (updateError) throw updateError;
      }

      // Record progress history (optional)
      try {
        if (data.play_time !== undefined || data.completion_percentage !== undefined) {
          await supabase
            .from("game_progress_history")
            .insert({
              user_id: userId,
              game_id: gameIdString,
              play_time: data.play_time,
              completion_percentage: data.completion_percentage,
            });
        }
      } catch (historyError) {
        console.warn("Could not record progress history:", historyError);
      }

      // Record achievement history (optional)
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

      // Update challenge progress (optional)
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
      const currentState = get();
      set({
        loading: false,
        play_time: data.play_time ?? currentState.play_time,
        completion_percentage: data.completion_percentage ?? currentState.completion_percentage,
        achievements_completed: data.achievements_completed ?? currentState.achievements_completed,
        playTimeHistory: data.play_time !== undefined ? [
          ...currentState.playTimeHistory,
          {
            date: formatDisplayDate(new Date()),
            hours: data.play_time,
          },
        ] : currentState.playTimeHistory,
        achievementHistory: data.achievements_completed !== undefined ? [
          ...currentState.achievementHistory,
          {
            date: formatDisplayDate(new Date()),
            count: data.achievements_completed,
          },
        ] : currentState.achievementHistory,
        error: null,
      });

      // Create activities for significant progress updates (optional)
      try {
        if (data.completion_percentage === 100) {
          await useFriendsStore.getState().createActivity("completed", gameIdString);
        } else if (data.completion_percentage !== undefined && data.completion_percentage > 0) {
          await useFriendsStore.getState().createActivity("progress", gameIdString, {
            progress: data.completion_percentage
          });
        }
      } catch (activityError) {
        console.warn("Could not create activity:", activityError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'updating progress');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  }
})); 