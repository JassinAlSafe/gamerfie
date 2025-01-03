import { create } from 'zustand';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Challenge, ChallengeDetails, CreateChallengeRequest } from '@/types/challenge';

interface ChallengeState {
  challenges: Challenge[];
  activeChallenges: Challenge[];
  currentChallenge: ChallengeDetails | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchChallenges: () => Promise<void>;
  fetchChallengeById: (id: string) => Promise<void>;
  createChallenge: (challengeData: CreateChallengeRequest) => Promise<string>;
  updateChallenge: (id: string, data: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  
  // Challenge Participation
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  updateProgress: (challengeId: string, progress: number) => Promise<void>;
  claimReward: (challengeId: string, rewardId: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  activeChallenges: [],
  currentChallenge: null,
  isLoading: false,
  error: null,

  fetchChallenges: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:creator_id(id, username, avatar_url),
          participants:challenge_participants(
            user:profiles(id, username, avatar_url),
            progress,
            completed,
            joined_at
          ),
          rewards:challenge_rewards(
            id,
            badge_id,
            badge:badges(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeChallenges = data.filter(c => c.status === 'active');
      
      set({ 
        challenges: data,
        activeChallenges,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching challenges:', error);
      set({ 
        error: 'Failed to fetch challenges',
        isLoading: false 
      });
    }
  },

  fetchChallengeById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`/api/challenges/${id}`);
      if (!response.ok) throw new Error('Failed to fetch challenge');
      
      const challenge = await response.json();
      set({ currentChallenge: challenge, isLoading: false });
    } catch (error) {
      console.error('Error fetching challenge:', error);
      set({ 
        error: 'Failed to fetch challenge details',
        isLoading: false 
      });
    }
  },

  createChallenge: async (challengeData: CreateChallengeRequest) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Create challenge
      const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .insert({
          title: challengeData.title,
          description: challengeData.description,
          type: challengeData.type,
          status: "upcoming",
          start_date: challengeData.start_date,
          end_date: challengeData.end_date,
          min_participants: challengeData.min_participants,
          max_participants: challengeData.max_participants,
          creator_id: session.user.id,
          cover_url: challengeData.cover_url,
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // Add goals
      if (challengeData.goals?.length) {
        const { error: goalsError } = await supabase
          .from("challenge_goals")
          .insert(
            challengeData.goals.map(goal => ({
              challenge_id: challenge.id,
              type: goal.type,
              target: goal.target,
              description: goal.description
            }))
          );

        if (goalsError) throw goalsError;
      }

      // Add rewards
      if (challengeData.rewards?.length) {
        const { error: rewardsError } = await supabase
          .from("challenge_rewards")
          .insert(
            challengeData.rewards.map(reward => ({
              challenge_id: challenge.id,
              type: reward.type,
              name: reward.name,
              description: reward.description,
              badge_id: reward.badge_id
            }))
          );

        if (rewardsError) throw rewardsError;
      }

      // Add rules
      if (challengeData.rules?.length) {
        const { error: rulesError } = await supabase
          .from("challenge_rules")
          .insert(
            challengeData.rules.map(rule => ({
              challenge_id: challenge.id,
              rule: rule
            }))
          );

        if (rulesError) throw rulesError;
      }

      // Refresh challenges list
      await get().fetchChallenges();
      
      set({ isLoading: false });
      return challenge.id;
    } catch (error) {
      console.error('Error creating challenge:', error);
      set({ 
        error: 'Failed to create challenge',
        isLoading: false 
      });
      throw error;
    }
  },

  updateProgress: async (challengeId: string, progress: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`/api/challenges/${challengeId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) throw new Error('Failed to update progress');

      // Update local state
      const currentChallenge = get().currentChallenge;
      if (currentChallenge && currentChallenge.id === challengeId) {
        set({
          currentChallenge: {
            ...currentChallenge,
            userProgress: {
              ...currentChallenge.userProgress,
              progress,
              completed: progress >= 100
            }
          }
        });
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating progress:', error);
      set({ 
        error: 'Failed to update progress',
        isLoading: false 
      });
      throw error;
    }
  },

  claimReward: async (challengeId: string, rewardId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`/api/challenges/${challengeId}/badges/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge_id: rewardId }),
      });

      if (!response.ok) throw new Error('Failed to claim reward');

      // Refresh challenge details to update claimed status
      await get().fetchChallengeById(challengeId);
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error claiming reward:', error);
      set({ 
        error: 'Failed to claim reward',
        isLoading: false 
      });
      throw error;
    }
  },

  // ... implement other actions
})); 