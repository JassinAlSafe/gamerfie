import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  start_date: Date;
  end_date: Date;
  goal: {
    type: "complete_games" | "win_games" | "achieve_score";
    target: number;
  };
  max_participants?: number;
  rewards: string[];
  rules: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  participants_count: number;
  status: "upcoming" | "active" | "completed";
  challenge_participants?: {
    user_id: string;
    joined_at: string;
    progress: number;
  }[];
}

interface ChallengesState {
  challenges: Challenge[];
  userChallenges: Challenge[];
  isLoading: boolean;
  error: string | null;
  fetchChallenges: () => Promise<void>;
  fetchUserChallenges: (session: any) => Promise<void>;
  createChallenge: (challenge: Omit<Challenge, "id" | "created_by" | "created_at" | "updated_at" | "participants_count" | "status">) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  userChallenges: [],
  isLoading: false,
  error: null,

  fetchChallenges: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ challenges: data as Challenge[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchUserChallenges: async (session) => {
    try {
      set({ isLoading: true, error: null });

      if (!session?.user?.id) {
        console.log("No valid user in session");
        set({ userChallenges: [], isLoading: false });
        return;
      }

      console.log("Fetching challenges for user:", session.user.id);

      // First get all challenges where the user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from("challenge_participants")
        .select(`
          challenge_id,
          joined_at,
          progress,
          challenge:challenges (
            id,
            title,
            description,
            type,
            start_date,
            end_date,
            max_participants,
            created_at,
            updated_at,
            status,
            goal_type,
            goal_target,
            creator_id,
            rewards:challenge_rewards(
              name,
              description,
              type
            ),
            rules:challenge_rules(
              rule
            )
          )
        `)
        .eq("user_id", session.user.id);

      if (participantError) {
        console.error("Error fetching participant data:", participantError);
        throw participantError;
      }

      console.log("User's participant data:", participantData);

      if (!participantData || participantData.length === 0) {
        console.log("No challenges found for user");
        set({ userChallenges: [], isLoading: false });
        return;
      }

      const challenges = participantData
        .filter(participant => participant.challenge) // Filter out any null challenges
        .map(participant => ({
          ...participant.challenge,
          // Construct the goal object from the separate columns
          goal: {
            type: participant.challenge.goal_type,
            target: participant.challenge.goal_target
          },
          // Map rewards and rules from their respective tables
          rewards: participant.challenge.rewards?.map(r => r.name) || [],
          rules: participant.challenge.rules?.map(r => r.rule) || [],
          // Map creator_id to created_by for consistency
          created_by: participant.challenge.creator_id,
          // Set participants_count to 0 since it's not in the database
          participants_count: 0,
          // Mark the challenge as active since the user is participating
          status: participant.challenge.end_date > new Date().toISOString() ? 'active' : 'completed',
          challenge_participants: [{
            user_id: session.user.id,
            joined_at: participant.joined_at,
            progress: participant.progress
          }]
        }));

      console.log("Transformed challenges:", challenges);
      set({ userChallenges: challenges as Challenge[], isLoading: false });
    } catch (error) {
      console.error("Error in fetchUserChallenges:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createChallenge: async (challenge) => {
    try {
      set({ isLoading: true, error: null });
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.from("challenges").insert([
        {
          ...challenge,
          created_by: user.id,
          status: "upcoming",
          participants_count: 0,
        },
      ]);

      if (error) throw error;

      const updatedChallenges = [...get().challenges];
      if (data) {
        updatedChallenges.unshift(data[0] as Challenge);
      }

      set({ challenges: updatedChallenges, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  joinChallenge: async (challengeId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("Please sign in to join challenges");
      }

      console.log("Joining challenge:", challengeId, "for user:", session.user.id);

      const { data: insertData, error } = await supabase.from("challenge_participants").insert([
        {
          challenge_id: challengeId,
          user_id: session.user.id,
          joined_at: new Date().toISOString(),
          progress: 0
        },
      ]).select();

      if (error) {
        console.error("Error inserting participant:", error);
        throw error;
      }

      console.log("Successfully joined challenge:", insertData);

      // Update participants count
      const { data: rpcData, error: rpcError } = await supabase.rpc("increment_participants_count", {
        challenge_id: challengeId,
      });

      if (rpcError) {
        console.error("Error incrementing participants count:", rpcError);
        throw rpcError;
      }
      console.log("Updated participants count:", rpcData);

      // Refresh both challenges and user challenges
      console.log("Refreshing challenges...");
      await Promise.all([
        get().fetchChallenges(),
        get().fetchUserChallenges(session)
      ]);
      console.log("Challenges refreshed");

      set({ isLoading: false });
    } catch (error) {
      console.error("Error joining challenge:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  leaveChallenge: async (challengeId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("Please sign in to leave challenges");
      }

      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .match({ challenge_id: challengeId, user_id: session.user.id });

      if (error) throw error;

      // Update participants count
      const { error: rpcError } = await supabase.rpc("decrement_participants_count", {
        challenge_id: challengeId,
      });

      if (rpcError) throw rpcError;

      // Refresh both challenges and user challenges
      await Promise.all([
        get().fetchChallenges(),
        get().fetchUserChallenges(session)
      ]);

      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
})); 