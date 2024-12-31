import { create } from "zustand";
import { Challenge, ChallengeStatus, ChallengeType } from "@/types/challenge";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

interface ChallengeParticipant {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  joined_at: string;
  progress: number;
  completed: boolean;
  team_id: string | null;
}

interface ChallengeTeam {
  id: string;
  name: string;
  members: ChallengeParticipant[];
}

interface ChallengeGoal {
  id: string;
  challenge_id: string;
  type: string;
  target: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ChallengeReward {
  id: string;
  challenge_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ChallengeRule {
  id: string;
  challenge_id: string;
  rule: string;
  created_at: string;
  updated_at: string;
}

interface ChallengeResponse {
  challenge: Challenge & {
    creator: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    goals: ChallengeGoal[];
    participants: ChallengeParticipant[];
    teams: ChallengeTeam[];
    rewards: ChallengeReward[];
    rules: ChallengeRule[];
  };
}

interface ChallengesState {
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  activeChallenges: Challenge[];
  upcomingChallenges: Challenge[];
  completedChallenges: Challenge[];
  allChallenges: Challenge[];
  isLoading: boolean;
  filter: "all" | ChallengeType;
  statusFilter: "all" | ChallengeStatus;
  sortBy: "date" | "participants";
  setFilter: (_filter: "all" | ChallengeType) => void;
  setStatusFilter: (_status: "all" | ChallengeStatus) => void;
  setSortBy: (_sortBy: "date" | "participants") => void;
  applyFilters: () => void;
  fetchChallenges: (supabase: SupabaseClient) => Promise<void>;
  fetchActiveChallenges: (supabase: SupabaseClient) => Promise<void>;
  fetchUpcomingChallenges: (supabase: SupabaseClient) => Promise<void>;
  fetchAllChallenges: (supabase: SupabaseClient) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  filteredChallenges: [],
  activeChallenges: [],
  upcomingChallenges: [],
  completedChallenges: [],
  allChallenges: [],
  isLoading: false,
  filter: "all",
  statusFilter: "all",
  sortBy: "date",

  setFilter: (newFilter) => {
    set({ filter: newFilter });
    get().applyFilters();
  },

  setStatusFilter: (newStatus) => {
    set({ statusFilter: newStatus });
    get().applyFilters();
  },

  setSortBy: (newSort) => {
    set({ sortBy: newSort });
    get().applyFilters();
  },

  applyFilters: () => {
    const { challenges, filter, statusFilter, sortBy } = get();
    let filtered = [...challenges];

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((c) => c.type === filter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      } else {
        return (b.participants?.length || 0) - (a.participants?.length || 0);
      }
    });

    set({ filteredChallenges: filtered });
  },

  fetchAllChallenges: async (supabase) => {
    try {
      set({ isLoading: true });

      // First query: Get challenges with basic creator info
      const { data: challenges, error: challengesError } = await supabase
        .from("challenges")
        .select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (challengesError) throw challengesError;

      // Second query: Get participant counts using a raw count query
      const { count: participantCounts, error: countsError } = await supabase
        .from('challenge_participants')
        .select('challenge_id', { count: 'exact' });

      if (countsError) throw countsError;

      // Combine the data
      const transformedChallenges = challenges?.map(challenge => ({
        ...challenge,
        participant_count: participantCounts || 0
      }));

      set({ allChallenges: transformedChallenges, isLoading: false });
    } catch (error) {
      console.error("Error in fetchAllChallenges:", error);
      set({ isLoading: false });
    }
  },

  fetchChallenges: async (supabase) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("No authenticated user session");
      return;
    }

    set({ isLoading: true });
    console.log("Fetching challenges for user:", session.user.id);

    try {
      // First query: Get basic challenge participation info
      const { data: participations, error: participationsError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", session.user.id);

      if (participationsError) throw participationsError;

      if (!participations?.length) {
        set({
          challenges: [],
          activeChallenges: [],
          upcomingChallenges: [],
          completedChallenges: [],
          isLoading: false,
        });
        return;
      }

      // Second query: Get full challenge details
      const { data: challenges, error: challengesError } = await supabase
        .from("challenges")
        .select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url
          )
        `)
        .in(
          "id",
          participations.map((p) => p.challenge_id)
        );

      if (challengesError) throw challengesError;

      // Third query: Get participant info separately
      const { data: participants, error: participantsError } = await supabase
        .from("challenge_participants")
        .select(`
          challenge_id,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .in(
          "challenge_id",
          participations.map((p) => p.challenge_id)
        );

      if (participantsError) throw participantsError;

      // Combine the data
      const userChallenges = challenges?.map(challenge => ({
        ...challenge,
        participants: participants?.filter(p => p.challenge_id === challenge.id) || [],
        participant_count: participants?.filter(p => p.challenge_id === challenge.id).length || 0
      })) || [];

      // Filter challenges by status
      const now = new Date();
      const active = userChallenges.filter(c => {
        const startDate = new Date(c.start_date);
        const endDate = new Date(c.end_date);
        return startDate <= now && endDate >= now;
      });

      const upcoming = userChallenges.filter(c => {
        const startDate = new Date(c.start_date);
        return startDate > now;
      });

      const completed = userChallenges.filter(c => {
        const endDate = new Date(c.end_date);
        return endDate < now;
      });

      set({
        challenges: userChallenges,
        activeChallenges: active,
        upcomingChallenges: upcoming,
        completedChallenges: completed,
        isLoading: false,
      });

      get().applyFilters();
    } catch (error) {
      console.error("Error in fetchChallenges:", error);
      set({ isLoading: false });
    }
  },

  fetchActiveChallenges: async (supabase) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const now = new Date().toISOString();
      const { data: challenges, error } = await supabase
        .from("challenge_participants")
        .select(`
          challenge:challenge_id(
            *,
            creator:creator_id(
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq("user_id", session.user.id)
        .filter("challenge.start_date", "lte", now)
        .filter("challenge.end_date", "gte", now)
        .returns<ChallengeResponse[]>();

      if (error) throw error;

      set({ activeChallenges: challenges?.map(c => c.challenge) || [] });
    } catch (error) {
      console.error("Error fetching active challenges:", error);
    }
  },

  fetchUpcomingChallenges: async (supabase) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const now = new Date().toISOString();
      const { data: challenges, error } = await supabase
        .from("challenge_participants")
        .select(`
          challenge:challenge_id(
            *,
            creator:creator_id(
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq("user_id", session.user.id)
        .filter("challenge.start_date", "gt", now)
        .returns<ChallengeResponse[]>();

      if (error) throw error;

      set({ upcomingChallenges: challenges?.map(c => c.challenge) || [] });
    } catch (error) {
      console.error("Error fetching upcoming challenges:", error);
    }
  },
})); 