import { create } from "zustand";
import { Challenge, ChallengeGoal, ChallengeTeam } from "@/types/challenge";

interface ChallengesState {
  fetchChallengeById: (
    id: string
  ) => Promise<
    | (Challenge & {
        goals: ChallengeGoal[];
        teams: (ChallengeTeam & { progress: number })[];
      })
    | undefined
  >;
  updateGoalProgress: (
    challengeId: string,
    goalId: string,
    progress: number
  ) => Promise<void>;
  createTeam: (challengeId: string, name: string) => Promise<string>;
  joinTeam: (challengeId: string, teamId: string) => Promise<void>;
  leaveTeam: (challengeId: string) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>(() => ({
  fetchChallengeById: async (id) => {
    const response = await fetch(`/api/challenges/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error("Failed to fetch challenge");
    }
    const challenge = await response.json();

    // Fetch goals
    const goalsResponse = await fetch(`/api/challenges/${id}/goals`);
    if (!goalsResponse.ok) throw new Error("Failed to fetch goals");
    const goals = await goalsResponse.json();

    // Fetch teams
    const teamsResponse = await fetch(`/api/challenges/${id}/teams`);
    if (!teamsResponse.ok) throw new Error("Failed to fetch teams");
    const teams = await teamsResponse.json();

    return {
      ...challenge,
      goals,
      teams,
    };
  },

  updateGoalProgress: async (challengeId, goalId, progress) => {
    const response = await fetch(`/api/challenges/${challengeId}/goals`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ goalId, progress }),
    });

    if (!response.ok) {
      throw new Error("Failed to update progress");
    }
  },

  createTeam: async (challengeId, name) => {
    const response = await fetch(`/api/challenges/${challengeId}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Failed to create team");
    }

    const team = await response.json();
    return team.id;
  },

  joinTeam: async (challengeId, teamId) => {
    const response = await fetch(`/api/challenges/${challengeId}/teams`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamId, action: "join" }),
    });

    if (!response.ok) {
      throw new Error("Failed to join team");
    }
  },

  leaveTeam: async (challengeId) => {
    const response = await fetch(`/api/challenges/${challengeId}/teams`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "leave" }),
    });

    if (!response.ok) {
      throw new Error("Failed to leave team");
    }
  },
})); 