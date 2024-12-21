import { create } from 'zustand';
import { FriendsState, FriendStatus, ActivityType, ActivityDetails, ActivityReaction, ActivityComment } from '../types/friend';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FriendsStore {
  friends: FriendsState['friends'];
  isLoading: FriendsState['isLoading'];
  error: FriendsState['error'];
  filter: FriendsState['filter'];
  activities: FriendsState['activities'];
  isLoadingActivities: FriendsState['isLoadingActivities'];
  activitiesPage: FriendsState['activitiesPage'];
  createActivity: (type: ActivityType, gameId: string, details?: any) => Promise<void>;
  batchAchievements: (gameId: string, achievements: { name: string }[]) => Promise<void>;
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  isLoading: false,
  error: null,
  filter: 'all',
  activities: [],
  isLoadingActivities: false,
  activitiesPage: 0,

  setFilter: (filter) => set({ filter }),

  fetchFriends: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/friends');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const friends = await response.json();
      set({ friends, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addFriend: async (request) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to add friend');
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove friend');
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateFriendStatus: async (friendId, status) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update friend status');
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Activity-related functions
  createActivity: async (type: ActivityType, gameId: string, details?: any) => {
    try {
      const response = await fetch('/api/friends/activities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_type: type, game_id: gameId, details }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create activity');
      }

      // Fetch updated activities
      await get().fetchActivities();
    } catch (error) {
      throw error;
    }
  },

  batchAchievements: async (gameId: string, achievements: { name: string }[]) => {
    if (achievements.length === 0) return;

    try {
      // If there's only one achievement, create a normal activity
      if (achievements.length === 1) {
        await get().createActivity('achievement', gameId, {
          name: achievements[0].name
        });
        return;
      }

      // For multiple achievements, create a batched activity
      await get().createActivity('achievement', gameId, {
        name: `${achievements.length} Achievements`,
        achievements: achievements,
        isBatched: true
      });
    } catch (error) {
      throw error;
    }
  },

  fetchActivities: async () => {
    try {
      set({ isLoadingActivities: true, error: null });
      const response = await fetch('/api/friends/activities?offset=0&include=reactions,comments');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const activities = await response.json();
      set({ activities, isLoadingActivities: false, activitiesPage: 1 });
    } catch (error) {
      set({ error: (error as Error).message, isLoadingActivities: false });
      throw error;
    }
  },

  loadMoreActivities: async () => {
    try {
      const page = get().activitiesPage;
      set({ isLoadingActivities: true, error: null });
      
      const response = await fetch(`/api/friends/activities?offset=${page * 20}&include=reactions,comments`);
      if (!response.ok) throw new Error('Failed to fetch more activities');
      const newActivities = await response.json();
      
      set(state => ({ 
        activities: [...state.activities, ...newActivities],
        isLoadingActivities: false,
        activitiesPage: page + 1
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoadingActivities: false });
      throw error;
    }
  },

  getGameActivities: async (gameId: string, page: number = 1) => {
    try {
      set({ isLoadingActivities: true, error: null });
      const response = await fetch(`/api/games/${gameId}/activities?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch game activities');
      const activities = await response.json();
      return activities;
    } catch (error) {
      set({ error: (error as Error).message, isLoadingActivities: false });
      throw error;
    } finally {
      set({ isLoadingActivities: false });
    }
  },

  addReaction: async (activityId: string, emoji: string): Promise<void> => {
    try {
      const response = await fetch(`/api/friends/activities/${activityId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!response.ok) throw new Error('Failed to add reaction');

      // Fetch updated activities
      await get().fetchActivities();
    } catch (error) {
      throw error;
    }
  },

  removeReaction: async (activityId: string, emoji: string): Promise<void> => {
    try {
      const response = await fetch(`/api/friends/activities/${activityId}/reactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!response.ok) throw new Error('Failed to remove reaction');

      // Fetch updated activities
      await get().fetchActivities();
    } catch (error) {
      throw error;
    }
  },

  addComment: async (activityId: string, content: string): Promise<void> => {
    try {
      const response = await fetch(`/api/friends/activities/${activityId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');

      // Fetch updated activities
      await get().fetchActivities();
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (commentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/friends/activities/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete comment');

      // Fetch updated activities
      await get().fetchActivities();
    } catch (error) {
      throw error;
    }
  },
}));