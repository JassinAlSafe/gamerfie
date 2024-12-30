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

      const { data: challenges, error } = await supabase
        .from("challenges")
        .select(`
          *,
          creator:creator_id(
            id,
            username,
            avatar_url
          ),
          participants:challenge_participants(
            user:user_id(
              id,
              username,
              avatar_url
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all challenges:", error);
        throw error;
      }

      set({ allChallenges: challenges || [], isLoading: false });
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
      // First, check if the user has any challenges
      const { count, error: countError } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (countError) {
        console.error("Error checking challenge count:", countError);
        throw countError;
      }

      console.log("Number of challenges found:", count);

      if (count === 0) {
        console.log("No challenges found for user");
        set({
          challenges: [],
          activeChallenges: [],
          upcomingChallenges: [],
          completedChallenges: [],
          isLoading: false,
        });
        return;
      }

      // Simplified query to get just the basic challenge data first
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
        .returns<ChallengeResponse[]>();

      if (error) {
        console.error("Error fetching challenges:", error);
        throw error;
      }

      console.log("Raw challenges data:", challenges);

      const userChallenges = challenges?.map(c => c.challenge) || [];
      console.log("Processed user challenges:", userChallenges);

      const now = new Date();
      const active = userChallenges.filter((c) => {
        const startDate = new Date(c.start_date);
        const endDate = new Date(c.end_date);
        const isActive = startDate <= now && endDate >= now;
        console.log(`Challenge ${c.id} active status:`, isActive, { startDate, endDate, now });
        return isActive;
      });

      const upcoming = userChallenges.filter((c) => {
        const startDate = new Date(c.start_date);
        const isUpcoming = startDate > now;
        console.log(`Challenge ${c.id} upcoming status:`, isUpcoming, { startDate, now });
        return isUpcoming;
      });

      const completed = userChallenges.filter((c) => {
        const endDate = new Date(c.end_date);
        const isCompleted = endDate < now;
        console.log(`Challenge ${c.id} completed status:`, isCompleted, { endDate, now });
        return isCompleted;
      });

      console.log("Active challenges:", active);
      console.log("Upcoming challenges:", upcoming);
      console.log("Completed challenges:", completed);

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