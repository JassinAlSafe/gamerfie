import { create } from "zustand";
import { Challenge, ChallengeStatus, ChallengeType, ChallengeFormData } from "@/types/challenge";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  setFilter: (_filter: "all" | ChallengeType) => void;
  setStatusFilter: (_status: "all" | ChallengeStatus) => void;
  setSortBy: (_sortBy: "date" | "participants") => void;
  fetchChallenges: (_supabase: SupabaseClient) => Promise<void>;
  createChallenge: (_data: ChallengeFormData) => Promise<string>;
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

  createChallenge: async (data: ChallengeFormData) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // 1. Create the challenge
      const { data: challenge, error } = await supabase
        .from("challenges")
        .insert({
          title: data.title,
          description: data.description,
          type: data.type,
          status: "upcoming",
          start_date: data.start_date,
          end_date: data.end_date,
          min_participants: data.min_participants,
          max_participants: data.max_participants,
          creator_id: session.user.id,
          requirements: data.requirements,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Upload cover image if exists
      if (data.imageFile) {
        try {
          // Upload the image using the user's ID in the path
          const filePath = `challenge-covers/${challenge.id}/cover`;
          const { error: uploadError } = await supabase.storage
            .from('challenges')
            .upload(filePath, data.imageFile, {
              cacheControl: '3600',
              upsert: true,
              contentType: data.imageFile.type // Explicitly set content type
            });

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            if (uploadError.message.includes('Bucket not found')) {
              throw new Error('Storage bucket not configured. Please contact administrator.');
            }
            throw uploadError;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('challenges')
            .getPublicUrl(filePath);

          // Create media record
          const { error: mediaError } = await supabase.from('challenge_media').insert({
            challenge_id: challenge.id,
            media_type: 'cover',
            url: publicUrl,
          });

          if (mediaError) {
            console.error('Error creating media record:', mediaError);
            throw mediaError;
          }
        } catch (error) {
          console.error('Error handling image upload:', error);
          // Continue with challenge creation even if image upload fails
        }
      }

      // 3. Create goals
      await supabase.from("challenge_goals").insert(
        data.goals.map((goal) => ({
          challenge_id: challenge.id,
          type: goal.type,
          target: goal.target,
          description: goal.description,
        }))
      );

      // 4. Create rules
      await supabase.from("challenge_rules").insert(
        data.rules.map((rule) => ({
          challenge_id: challenge.id,
          rule,
        }))
      );

      // 5. Create rewards
      await supabase.from("challenge_rewards").insert(
        data.rewards.map((reward) => ({
          challenge_id: challenge.id,
          type: reward.type,
          name: reward.name,
          description: reward.description,
          badge_id: reward.badge_id,
        }))
      );

      // Refresh challenges list
      await get().fetchChallenges(supabase);
      
      set({ isLoading: false });
      return challenge.id;
    } catch (error) {
      console.error('Error creating challenge:', error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to create challenge",
        isLoading: false 
      });
      throw error;
    }
  }
})); 