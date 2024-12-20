import { create } from 'zustand';
import { FriendsService } from '../services/friends-service';
import { FriendsState, FriendStatus, ActivityType } from '../types/friend';

export const useFriendsStore = create<FriendsState>((set, get) => ({
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
      const friends = await FriendsService.getFriends();
      set({ friends, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addFriend: async (request) => {
    try {
      set({ isLoading: true, error: null });
      await FriendsService.addFriend(request);
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    try {
      set({ isLoading: true, error: null });
      await FriendsService.removeFriend(friendId);
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateFriendStatus: async (friendId, status) => {
    try {
      set({ isLoading: true, error: null });
      await FriendsService.updateFriendStatus(friendId, status);
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  createActivity: async (activity_type: ActivityType, game_id?: string, details?: any) => {
    try {
      set({ isLoadingActivities: true, error: null });
      await FriendsService.createActivity({ activity_type, game_id, details });
      await get().fetchActivities();
    } catch (error) {
      set({ error: (error as Error).message, isLoadingActivities: false });
      throw error;
    }
  },

  fetchActivities: async () => {
    try {
      set({ isLoadingActivities: true, error: null });
      const activities = await FriendsService.getFriendActivities();
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
      
      const newActivities = await FriendsService.getFriendActivities(page);
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

  addReaction: async (activityId: string, emoji: string) => {
    try {
      const reaction = await FriendsService.addReaction(activityId, emoji);
      set(state => ({
        activities: state.activities.map(activity => {
          if (activity.id === activityId) {
            return {
              ...activity,
              reactions: [...(activity.reactions || []), reaction]
            };
          }
          return activity;
        })
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeReaction: async (activityId: string, emoji: string) => {
    try {
      await FriendsService.removeReaction(activityId, emoji);
      set(state => ({
        activities: state.activities.map(activity => {
          if (activity.id === activityId) {
            return {
              ...activity,
              reactions: (activity.reactions || []).filter(r => r.emoji !== emoji)
            };
          }
          return activity;
        })
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addComment: async (activityId: string, content: string) => {
    try {
      const comment = await FriendsService.addComment(activityId, content);
      set(state => ({
        activities: state.activities.map(activity => {
          if (activity.id === activityId) {
            return {
              ...activity,
              comments: [...(activity.comments || []), comment]
            };
          }
          return activity;
        })
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      await FriendsService.deleteComment(commentId);
      set(state => ({
        activities: state.activities.map(activity => ({
          ...activity,
          comments: (activity.comments || []).filter(c => c.id !== commentId)
        }))
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  }
}));