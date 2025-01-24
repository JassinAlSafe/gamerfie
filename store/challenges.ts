import { create } from "zustand";
import { Challenge } from "@/types/challenge";

interface ChallengesState {
  challenge: Challenge | null;
  userChallenges: Challenge[];
  error: string | null;
  isLoading: boolean;
  fetchChallenge: (id: string) => Promise<void>;
  fetchUserChallenges: () => Promise<void>;
  clearError: () => void;
  createChallenge: (data: any) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set) => ({
  challenge: null,
  userChallenges: [],
  error: null,
  isLoading: false,
  fetchChallenge: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/challenges/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching challenge:", error);
        throw new Error(error.error || "Failed to fetch challenge");
      }

      const data = await response.json();
      set({ challenge: data, error: null });
    } catch (error) {
      console.error("Error in fetchChallenge:", error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch challenge" });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchUserChallenges: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log("Fetching user challenges...");
      const response = await fetch("/api/challenges/user");
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Error response from /api/challenges/user:", error);
        throw new Error(error.error || "Failed to fetch user challenges");
      }

      const data = await response.json();
      console.log("Received user challenges:", data);
      set({ userChallenges: data, error: null });
    } catch (error) {
      console.error("Error in fetchUserChallenges:", error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch user challenges" });
    } finally {
      set({ isLoading: false });
    }
  },
  createChallenge: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      const newChallenge = await response.json();
      set(state => ({ 
        userChallenges: [...state.userChallenges, newChallenge],
        error: null 
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create challenge' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  clearError: () => set({ error: null }),
})); 