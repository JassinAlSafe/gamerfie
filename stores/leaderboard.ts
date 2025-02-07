import { create } from "zustand";
import { ChallengeLeaderboard } from "@/types/challenge";

interface LeaderboardStore {
  leaderboard: ChallengeLeaderboard | null;
  error: string | null;
  isLoading: boolean;
  fetchLeaderboard: (challengeId: string) => Promise<void>;
}

export const useLeaderboard = create<LeaderboardStore>((set) => ({
  leaderboard: null,
  error: null,
  isLoading: false,
  fetchLeaderboard: async (challengeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/challenges/${challengeId}/leaderboard`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();
      set({ leaderboard: data, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch leaderboard" });
    } finally {
      set({ isLoading: false });
    }
  },
})); 