import { create } from "zustand";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengeLeaderboard,
} from "@/types/challenge";

interface ChallengesState {
  challenges: Challenge[];
  userChallenges: Challenge[];
  currentChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchChallenges: () => Promise<void>;
  fetchUserChallenges: () => Promise<void>;
  fetchChallengeById: (id: string) => Promise<void>;
  fetchLeaderboard: (challengeId: string) => Promise<ChallengeLeaderboard>;

  // Challenge operations
  createChallenge: (data: CreateChallengeInput) => Promise<void>;
  updateChallenge: (id: string, data: UpdateChallengeInput) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;

  // Participant operations
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  updateProgress: (challengeId: string, progress: number) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  userChallenges: [],
  currentChallenge: null,
  isLoading: false,
  error: null,

  fetchChallenges: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { data: challenges, error } = await supabase
        .from("challenges")
        .select(`
          *,
          creator:creator_id(id, username, avatar_url),
          participants:challenge_participants(
            user:user_id(id, username, avatar_url),
            joined_at,
            progress,
            completed
          ),
          rewards:challenge_rewards(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ challenges: challenges || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch challenges",
        isLoading: false,
      });
    }
  },

  fetchUserChallenges: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");

      const { data: challenges, error } = await supabase
        .from("challenge_participants")
        .select(`
          challenge:challenge_id(
            *,
            creator:creator_id(id, username, avatar_url),
            participants:challenge_participants(
              user:user_id(id, username, avatar_url),
              joined_at,
              progress,
              completed
            ),
            rewards:challenge_rewards(*)
          )
        `)
        .eq("user_id", session.user.id);

      if (error) throw error;

      set({
        userChallenges: challenges?.map(c => c.challenge) || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch user challenges",
        isLoading: false,
      });
    }
  },

  fetchChallengeById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { data: challenge, error } = await supabase
        .from("challenges")
        .select(`
          *,
          creator:creator_id(id, username, avatar_url),
          participants:challenge_participants(
            user:user_id(id, username, avatar_url),
            joined_at,
            progress,
            completed
          ),
          rewards:challenge_rewards(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      set({ currentChallenge: challenge, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch challenge",
        isLoading: false,
      });
    }
  },

  fetchLeaderboard: async (challengeId: string) => {
    try {
      const supabase = createClientComponentClient();

      const { data: participants, error } = await supabase
        .from("challenge_participants")
        .select(`
          user:user_id(id, username, avatar_url),
          progress,
          completed
        `)
        .eq("challenge_id", challengeId)
        .order("progress", { ascending: false });

      if (error) throw error;

      const rankings = participants?.map((p, index) => ({
        rank: index + 1,
        user_id: p.user.id,
        username: p.user.username,
        avatar_url: p.user.avatar_url,
        progress: p.progress,
        completed: p.completed,
      })) || [];

      return { challenge_id: challengeId, rankings };
    } catch (error) {
      throw error;
    }
  },

  createChallenge: async (data: CreateChallengeInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          start_date: new Date(data.start_date).toISOString(),
          end_date: new Date(data.end_date).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create challenge");
      }

      // Refresh challenges list
      await get().fetchChallenges();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create challenge",
        isLoading: false,
      });
      throw error;
    }
  },

  updateChallenge: async (id: string, data: UpdateChallengeInput) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("challenges")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      // Refresh current challenge and challenges list
      await Promise.all([
        get().fetchChallengeById(id),
        get().fetchChallenges(),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update challenge",
        isLoading: false,
      });
    }
  },

  deleteChallenge: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh challenges list
      await get().fetchChallenges();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete challenge",
        isLoading: false,
      });
    }
  },

  joinChallenge: async (challengeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challengeId,
          user_id: session.user.id,
          progress: 0,
          completed: false,
        });

      if (error) throw error;

      // Refresh current challenge and user challenges
      await Promise.all([
        get().fetchChallengeById(challengeId),
        get().fetchUserChallenges(),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to join challenge",
        isLoading: false,
      });
    }
  },

  leaveChallenge: async (challengeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Refresh current challenge and user challenges
      await Promise.all([
        get().fetchChallengeById(challengeId),
        get().fetchUserChallenges(),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to leave challenge",
        isLoading: false,
      });
    }
  },

  updateProgress: async (challengeId: string, progress: number) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("challenge_participants")
        .update({
          progress,
          completed: progress >= 100,
        })
        .eq("challenge_id", challengeId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Refresh current challenge and user challenges
      await Promise.all([
        get().fetchChallengeById(challengeId),
        get().fetchUserChallenges(),
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update progress",
        isLoading: false,
      });
    }
  },
})); 