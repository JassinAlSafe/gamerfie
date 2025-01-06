import { create } from 'zustand';
import { FriendsState, FriendStatus, ActivityType, ActivityDetails, ActivityReaction, ActivityComment, Friend, OnlineStatus } from '../types/friend';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FriendsStore {
  friends: FriendsState['friends'];
  isLoading: FriendsState['isLoading'];
  error: FriendsState['error'];
  filter: FriendsState['filter'];
  activities: FriendsState['activities'];
  isLoadingActivities: FriendsState['isLoadingActivities'];
  activitiesPage: FriendsState['activitiesPage'];
  fetchFriends: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  createActivity: (type: ActivityType, gameId: string, details?: any) => Promise<void>;
  batchAchievements: (gameId: string, achievements: { name: string }[]) => Promise<void>;
  addFriend: (request: { friendId: string }) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  updateFriendStatus: (friendId: string, status: FriendStatus) => Promise<void>;
  setFilter: (filter: FriendStatus | 'all') => void;
  addReaction: (activityId: string, emoji: string) => Promise<void>;
  removeReaction: (activityId: string, emoji: string) => Promise<void>;
  addComment: (activityId: string, comment: string) => Promise<void>;
  
}

interface SupabaseFriendData {
  id: string;
  username: string;
  avatar_url: string | null;
  online_status?: OnlineStatus;
}

interface SupabaseFriendRecord {
  id: string;
  status: FriendStatus;
  user_id: string;
  friend_id: string;
  friend_profile: SupabaseFriendData;
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
      const supabase = createClientComponentClient();
      
      // Get current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // First get all friend relationships
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`);

      if (friendsError) throw friendsError;
      if (!friendsData) return;

      // Get all unique user IDs (both friend_id and user_id)
      const userIds = friendsData.map(friend => 
        friend.user_id === session.user.id ? friend.friend_id : friend.user_id
      );

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      if (!profilesData) return;

      // Create a map of user profiles for easy lookup
      const profileMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Transform the data to match our Friend type
      const transformedFriends = friendsData.map(friend => {
        const otherUserId = friend.user_id === session.user.id ? friend.friend_id : friend.user_id;
        const otherUser = profileMap.get(otherUserId);
        
        if (!otherUser) return null;

        return {
          id: friend.id,
          username: otherUser.username,
          avatar_url: otherUser.avatar_url || undefined,
          status: friend.status,
          online_status: otherUser.online_status || 'offline',
          sender_id: friend.user_id
        } as Friend;
      }).filter((friend): friend is Friend => friend !== null);

      set({ friends: transformedFriends, isLoading: false });
    } catch (error) {
      console.error('Error fetching friends:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addFriend: async (request: { friendId: string }) => {
    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Check if friendship already exists in either direction
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friends')
        .select('*')
        .or(
          `and(user_id.eq.${session.user.id},friend_id.eq.${request.friendId}),` +
          `and(user_id.eq.${request.friendId},friend_id.eq.${session.user.id})`
        )
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw checkError;
      }

      if (existingFriendship) {
        throw new Error('Friendship already exists');
      }

      // Create new friendship
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: session.user.id,
          friend_id: request.friendId,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Refresh friends list
      await get().fetchFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  },

  removeFriend: async (friendId: string) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendId);

      if (error) throw error;
      await get().fetchFriends();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateFriendStatus: async (friendId: string, status: FriendStatus) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from('friends')
        .update({ status })
        .eq('id', friendId);

      if (error) throw error;
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
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addReaction: async (activityId: string, emoji: string) => {
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('activity_reactions')
      .insert({
        activity_id: activityId,
        user_id: session.user.id,
        emoji: emoji
      });

    if (error) throw error;

    // Update local state
    set(state => ({
      ...state,
      activities: state.activities.map(activity => {
        if (activity.id === activityId) {
          const newReaction: ActivityReaction = {
            id: `temp_${Date.now()}`,
            activity_id: activityId,
            user_id: session.user.id,
            emoji: emoji,
            created_at: new Date().toISOString(),
            user: {
              id: session.user.id,
              username: session.user.user_metadata.username || 'Unknown',
              avatar_url: session.user.user_metadata.avatar_url
            }
          };
          
          return {
            ...activity,
            reactions: [...(activity.reactions || []), newReaction]
          };
        }
        return activity;
      })
    }));
  },

  removeReaction: async (activityId: string, emoji: string) => {
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('activity_reactions')
      .delete()
      .match({
        activity_id: activityId,
        user_id: session.user.id,
        emoji: emoji
      });

    if (error) throw error;

    // Update local state
    set(state => ({
      activities: state.activities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            reactions: (activity.reactions || []).filter(
              r => !(r.user_id === session.user.id && r.emoji === emoji)
            )
          };
        }
        return activity;
      })
    }));
  },

  addComment: async (activityId: string, comment: string) => {
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('activity_comments')
      .insert({
        activity_id: activityId,
        user_id: session.user.id,
        content: comment
      });

    if (error) throw error;

    // Update local state
    set(state => ({
      ...state,
      activities: state.activities.map(activity => {
        if (activity.id === activityId) {
          const newComment: ActivityComment = {
            id: `temp_${Date.now()}`,
            activity_id: activityId,
            user_id: session.user.id,
            content: comment,
            created_at: new Date().toISOString(),
            user: {
              id: session.user.id,
              username: session.user.user_metadata.username || 'Unknown',
              avatar_url: session.user.user_metadata.avatar_url
            }
          };
          
          return {
            ...activity,
            comments: [...(activity.comments || []), newComment]
          };
        }
        return activity;
      })
    }));
  },
}));