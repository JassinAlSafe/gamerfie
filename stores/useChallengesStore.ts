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
    const { challenges, filter, statusFilter, sortBy } = get();
    let filtered = [...challenges];

    if (filter !== "all") {
      filtered = filtered.filter((c) => c.type === filter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return (b.participant_count || 0) - (a.participant_count || 0);
    });

    return filtered;
  },

  getActiveChallenges: () => {
    const { challenges } = get();
    return challenges.filter((c) => c.status === "active");
  },

  getUpcomingChallenges: () => {
    const { challenges } = get();
    return challenges.filter((c) => c.status === "upcoming");
  },

  getCompletedChallenges: () => {
    const { challenges } = get();
    return challenges.filter((c) => c.status === "completed");
  },

  getAllChallenges: () => {
    return get().challenges;
  },

  // Challenge Actions
  setFilter: (_filter: "all" | ChallengeType) => set({ filter: _filter }),
  setStatusFilter: (_status: "all" | ChallengeStatus) => set({ statusFilter: _status }),
  setSortBy: (_sortBy: "date" | "participants") => set({ sortBy: _sortBy }),
  clearError: () => set({ error: null }),

  fetchChallenge: async (_id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/challenges/${_id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch challenge");
      }

      // Fetch additional data
      const [goalsResponse, teamsResponse] = await Promise.all([
        fetch(`/api/challenges/${_id}/goals`),
        fetch(`/api/challenges/${_id}/teams`)
      ]);

      if (!goalsResponse.ok) throw new Error("Failed to fetch goals");
      if (!teamsResponse.ok) throw new Error("Failed to fetch teams");

      const [goals, teams] = await Promise.all([
        goalsResponse.json(),
        teamsResponse.json()
      ]);

      const data = await response.json();
      const challenge = {
        ...data,
        goals,
        teams
      };
      set({ challenge, error: null });
      return challenge;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch challenge" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchChallenges: async (_supabase: SupabaseClient) => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session?.user) {
      console.log("No authenticated user session");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data: challenges, error: challengesError } = await _supabase
        .from("challenges")
        .select(`
          *,
          creator:creator_id(
            id,
            username,
            avatar_url
          ),
          challenge_participants(
            user_id,
            progress,
            completed,
            joined_at,
            user:user_id(
              id,
              username,
              avatar_url
            )
          ),
          challenge_goals(
            id,
            type,
            target,
            description
          ),
          challenge_rewards(
            id,
            type,
            name,
            description,
            badge_id
          ),
          challenge_media(
            id,
            media_type,
            url
          )
        `);

      if (challengesError) throw challengesError;

      const now = new Date();
      const transformedChallenges = challenges?.map(challenge => {
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        
        let status = challenge.status;
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          if (now < startDate) {
            status = 'upcoming';
          } else if (now > endDate) {
            status = 'completed';
          } else {
            status = 'active';
          }
        }

        return {
          ...challenge,
          status,
          participant_count: challenge.challenge_participants?.length || 0,
          participants: challenge.challenge_participants || [],
          goals: challenge.challenge_goals || [],
          rewards: challenge.challenge_rewards || [],
          media: challenge.challenge_media || [],
        };
      }) || [];

      set({ challenges: transformedChallenges, error: null });
    } catch (error) {
      console.error("Error fetching challenges:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch challenges",
        isLoading: false 
      });
    }
  },

  // Team Management
  createTeam: async (_challengeId: string, _name: string) => {
    const response = await fetch(`/api/challenges/${_challengeId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: _name }),
    });

    if (!response.ok) throw new Error("Failed to create team");
    const team = await response.json();
    return team.id;
  },

  joinTeam: async (_challengeId: string, _teamId: string) => {
    const response = await fetch(`/api/challenges/${_challengeId}/teams`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: _teamId, action: "join" }),
    });

    if (!response.ok) throw new Error("Failed to join team");
  },

  leaveTeam: async (_challengeId: string) => {
    const response = await fetch(`/api/challenges/${_challengeId}/teams`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    });

    if (!response.ok) throw new Error("Failed to leave team");
  },

  // Goal Management
  updateGoalProgress: async (_challengeId: string, _goalId: string, _progress: number) => {
    const response = await fetch(`/api/challenges/${_challengeId}/goals`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: _goalId, progress: _progress }),
    });

    if (!response.ok) throw new Error("Failed to update progress");
  },
})); 