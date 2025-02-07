import { create } from "zustand";
import type { Challenge, ChallengeStatus, ChallengeType, ChallengeGoal, ChallengeTeam } from "@/types/challenge";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

interface ChallengesState {
  challenges: Challenge[];
  challenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  filter: "all" | ChallengeType;
  statusFilter: "all" | ChallengeStatus;
  sortBy: "date" | "participants";

  // Computed getters
  getFilteredChallenges: () => Challenge[];
  getActiveChallenges: () => Challenge[];
  getUpcomingChallenges: () => Challenge[];
  getCompletedChallenges: () => Challenge[];
  getAllChallenges: () => Challenge[];

  // Challenge Actions
  setFilter: (_filter: "all" | ChallengeType) => void;
  setStatusFilter: (_status: "all" | ChallengeStatus) => void;
  setSortBy: (_sortBy: "date" | "participants") => void;
  fetchChallenges: (_supabase: SupabaseClient) => Promise<void>;
  fetchChallenge: (_id: string) => Promise<Challenge & {
    goals: ChallengeGoal[];
    teams: ChallengeTeam[];
  } | null>;
  clearError: () => void;

  // Team Management
  createTeam: (_challengeId: string, _name: string) => Promise<string>;
  joinTeam: (_challengeId: string, _teamId: string) => Promise<void>;
  leaveTeam: (_challengeId: string) => Promise<void>;

  // Goal Management
  updateGoalProgress: (_challengeId: string, _goalId: string, _progress: number) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  challenge: null,
  isLoading: false,
  error: null,
  filter: "all",
  statusFilter: "all",
  sortBy: "date",

  // Rest of the implementation remains the same...
  // ... (copy the rest of the implementation from your existing file)
})); 