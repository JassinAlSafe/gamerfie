import { create } from "zustand";
import type { Challenge, ChallengeStatus, ChallengeType, ChallengeGoal, ChallengeTeam } from "@/types/challenge";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  createChallenge: (_data: Partial<Challenge>) => Promise<string>;
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

  // Computed getters
  getFilteredChallenges: () => {
    const state = get();
    let filtered = state.challenges;

    if (state.filter !== "all") {
      filtered = filtered.filter((c: Challenge) => c.type === state.filter);
    }

    if (state.statusFilter !== "all") {
      filtered = filtered.filter((c: Challenge) => c.status === state.statusFilter);
    }

    return filtered.sort((a: Challenge, b: Challenge) => {
      if (state.sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (b.participant_count || 0) - (a.participant_count || 0);
      }
    });
  },

  getActiveChallenges: () => {
    const state = get();
    return state.challenges.filter((c: Challenge) => c.status === "active");
  },

  getUpcomingChallenges: () => {
    const state = get();
    return state.challenges.filter((c: Challenge) => c.status === "upcoming");
  },

  getCompletedChallenges: () => {
    const state = get();
    return state.challenges.filter((c: Challenge) => c.status === "completed");
  },

  getAllChallenges: () => {
    const state = get();
    return state.challenges;
  },

  // Actions
  setFilter: (filter) => set({ filter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSortBy: (sortBy) => set({ sortBy }),

  fetchChallenges: async (supabase) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ challenges: data || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch challenges',
        isLoading: false 
      });
    }
  },

  fetchChallenge: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // This would need actual implementation based on your API
      const response = await fetch(`/api/challenges/${id}`);
      if (!response.ok) throw new Error('Failed to fetch challenge');
      
      const challenge = await response.json();
      set({ challenge, isLoading: false });
      return challenge;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch challenge',
        isLoading: false 
      });
      return null;
    }
  },

  createChallenge: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create challenge');
      }
      
      const result = await response.json();
      set((state) => ({
        challenges: [...state.challenges, result.challenge],
        isLoading: false,
      }));
      
      return result.challenge.id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create challenge',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Team Management
  createTeam: async (challengeId, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/challenges/${challengeId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) throw new Error('Failed to create team');
      
      const result = await response.json();
      set({ isLoading: false });
      return result.team.id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create team',
        isLoading: false 
      });
      throw error;
    }
  },

  joinTeam: async (challengeId, teamId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/challenges/${challengeId}/teams/${teamId}/join`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to join team');
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join team',
        isLoading: false 
      });
      throw error;
    }
  },

  leaveTeam: async (challengeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/challenges/${challengeId}/teams/leave`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to leave team');
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to leave team',
        isLoading: false 
      });
      throw error;
    }
  },

  // Goal Management
  updateGoalProgress: async (challengeId, goalId, progress) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/challenges/${challengeId}/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });
      
      if (!response.ok) throw new Error('Failed to update goal progress');
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goal progress',
        isLoading: false 
      });
      throw error;
    }
  },
})); 