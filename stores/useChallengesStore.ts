import { create } from "zustand";
import { Challenge, ChallengeStatus, ChallengeType } from "@/types/challenge";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

interface ChallengesState {
  challenges: Challenge[];
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

  // Actions
  setFilter: (filter: "all" | ChallengeType) => void;
  setStatusFilter: (status: "all" | ChallengeStatus) => void;
  setSortBy: (sortBy: "date" | "participants") => void;
  fetchChallenges: (supabase: SupabaseClient) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  isLoading: false,
  error: null,
  filter: "all",
  statusFilter: "all",
  sortBy: "date",

  // Computed getters
  getFilteredChallenges: () => {
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

  // Actions
  setFilter: (newFilter) => set({ filter: newFilter }),
  setStatusFilter: (newStatus) => set({ statusFilter: newStatus }),
  setSortBy: (newSort) => set({ sortBy: newSort }),

  fetchChallenges: async (supabase) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("No authenticated user session");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch all challenges with their details
      const { data: challenges, error: challengesError } = await supabase
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

      // Transform and update challenge statuses based on dates
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

      set({ challenges: transformedChallenges, isLoading: false });
    } catch (error) {
      console.error("Error fetching challenges:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch challenges",
        isLoading: false 
      });
    }
  },
})); 