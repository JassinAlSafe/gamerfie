import { create } from 'zustand';
import { FriendsState, ActivityType } from "../types/friend";
import { FriendsService } from '../services/friends-service';

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  isLoading: false,
  error: null,
  filter: 'all',
  activities: [],
  isLoadingActivities: false,
  activitiesPage: 0,

  setFilter: (filter) => {
    set({ filter });
    get().fetchFriends();
  },

  fetchFriends: async () => {
    try {
      set({ isLoading: true, error: null });
      const filter = get().filter;
      const friends = await FriendsService.getFriends(filter !== 'all' ? filter : undefined);
      set({ friends, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
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
      await get().fetchActivities(); // Refresh activities after creating a new one
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
  }
}));