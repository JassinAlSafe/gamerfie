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

interface ChallengeMedia {
  id: string;
  media_type: string;
  url: string;
  created_at: string;
}

interface ChallengeWithDetails extends Challenge {
  challenge_goals?: ChallengeGoal[];
  challenge_participants?: ChallengeParticipant[];
  challenge_rewards?: ChallengeReward[];
  challenge_media?: ChallengeMedia[];
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
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (b.participant_count || 0) - (a.participant_count || 0);
      }
    });

    set({ filteredChallenges: filtered });
  },

  fetchAllChallenges: async (supabase) => {
    try {
      set({ isLoading: true });

      // Build the query parameters
      const queryParams = new URLSearchParams();
      const { filter, statusFilter, sortBy } = get();
      
      if (filter !== "all") {
        queryParams.append("filter", filter);
      }
      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter);
      }
      if (sortBy) {
        queryParams.append("sort", sortBy);
      }

      // Use the API endpoint with query parameters
      const response = await fetch(`/api/challenges?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Failed to fetch challenges');
      }
      const challenges = await response.json();

      console.log("Raw challenges from DB:", challenges);

      // Transform the data to include participant count and media
      const transformedChallenges = challenges?.map((challenge: ChallengeWithDetails) => ({
        ...challenge,
        participant_count: challenge.participant_count || 0,
        goals: challenge.challenge_goals || [],
        participants: challenge.challenge_participants || [],
        rewards: challenge.challenge_rewards || [],
        media: challenge.challenge_media || [],
      })) || [];

      console.log("Transformed challenges:", transformedChallenges);

      // Update challenge statuses based on dates
      const now = new Date();
      const updatedChallenges = transformedChallenges.map((challenge: Challenge) => {
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        
        // Default to the stored status if dates are invalid
        let status = challenge.status;
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Invalid dates for challenge ${challenge.id}:`, { start: challenge.start_date, end: challenge.end_date });
        } else {
          if (startDate > now) {
            status = 'upcoming';
          } else if (endDate < now) {
            status = 'completed';
          } else {
            status = 'active';
          }
        }

        return { ...challenge, status };
      });

      console.log("Updated challenges with status:", updatedChallenges);

      // Filter challenges by status
      const active = updatedChallenges.filter((c: Challenge) => c.status === 'active');
      const upcoming = updatedChallenges.filter((c: Challenge) => c.status === 'upcoming');
      const completed = updatedChallenges.filter((c: Challenge) => c.status === 'completed');

      set({
        challenges: updatedChallenges,
        activeChallenges: active,
        upcomingChallenges: upcoming,
        completedChallenges: completed,
        allChallenges: updatedChallenges,
        isLoading: false,
      });

      // Apply any existing filters
      get().applyFilters();
    } catch (error) {
      console.error("Error fetching challenges:", error);
      set({ 
        challenges: [],
        activeChallenges: [],
        upcomingChallenges: [],
        completedChallenges: [],
        allChallenges: [],
        isLoading: false 
      });
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
          creator:creator_id(
            id,
            username,
            avatar_url
          ),
          challenge_media(
            id,
            media_type,
            url
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
          user:user_id(
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

      // Update challenge statuses based on dates
      const now = new Date();
      const updatedChallenges = userChallenges.map(challenge => {
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        let status = challenge.status;

        if (startDate > now) {
          status = 'upcoming';
        } else if (endDate < now) {
          status = 'completed';
        } else {
          status = 'active';
        }

        return { ...challenge, status };
      });

      // Filter challenges by status
      const active = updatedChallenges.filter(c => c.status === 'active');
      const upcoming = updatedChallenges.filter(c => c.status === 'upcoming');
      const completed = updatedChallenges.filter(c => c.status === 'completed');

      set({
        challenges: updatedChallenges,
        allChallenges: updatedChallenges,
        activeChallenges: active,
        upcomingChallenges: upcoming,
        completedChallenges: completed,
        isLoading: false,
      });

      // Apply filters to update filteredChallenges
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