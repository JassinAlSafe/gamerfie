import { create } from 'zustand';
import { 
  FriendsState, 
  FriendStatus, 
  Friend, 
  OnlineStatus,
  SupabaseFriendData,
  SupabaseFriendRecord 
} from '../types/friend';
import { ActivityType, ActivityDetails, ActivityReaction, ActivityComment } from '../types/activity';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type FriendsStore = Omit<FriendsState, 'setFilter'> & {
  setFilter: (filter: FriendStatus | 'all') => void;
  batchAchievements: (gameId: string, achievements: { name: string }[]) => Promise<void>;
  fetchFriends: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  createActivity: (activity_type: ActivityType, game_id?: string, details?: ActivityDetails) => Promise<void>;
  addFriend: (request: { friendId: string }) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  updateFriendStatus: (friendId: string, status: FriendStatus) => Promise<void>;
  addReaction: (activityId: string, emoji: string) => Promise<void>;
  removeReaction: (activityId: string, emoji: string) => Promise<void>;
  addComment: (activityId: string, comment: string) => Promise<void>;
  loadMoreActivities: () => Promise<void>;
  getGameActivities: (gameId: string, page: number) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
};

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
      // Check if we already have friends data and not currently loading
      if (get().friends.length > 0 && !get().isLoading) {
        return; // Use cached data
      }
      
      set({ isLoading: true, error: null });
      const supabase = createClientComponentClient();
      
      // Get current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // First get all friend relationships
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`)
        .order('updated_at', { ascending: false });

      if (friendsError) throw friendsError;
      if (!friendsData || friendsData.length === 0) {
        set({ friends: [], isLoading: false });
        return;
      }

      // Get all unique user IDs (both friend_id and user_id)
      const userIds = friendsData.map(friend => 
        friend.user_id === session.user.id ? friend.friend_id : friend.user_id
      );

      // Fetch profiles for all users in a single query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      if (!profilesData) {
        set({ friends: [], isLoading: false });
        return;
      }

      // Create a map of user profiles for efficient lookup
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

      // Check existing friendship in both directions
      const { data: existingFriendships, error: checkError } = await supabase
        .from('friends')
        .select('*')
        .or(
          `and(user_id.eq.${session.user.id},friend_id.eq.${request.friendId}),` +
          `and(user_id.eq.${request.friendId},friend_id.eq.${session.user.id})`
        );

      if (checkError) throw checkError;
      
      if (existingFriendships && existingFriendships.length > 0) {
        const friendship = existingFriendships[0];
        if (friendship.status === 'pending') {
          if (friendship.user_id === session.user.id) {
            throw new Error('Friend request already sent');
          } else {
            throw new Error('Friend request already received from this user');
          }
        } else if (friendship.status === 'accepted') {
          throw new Error('You are already friends with this user');
        } else if (friendship.status === 'blocked') {
          throw new Error('Unable to send friend request');
        }
      }

      // Order the UUIDs so smaller one is always user_id
      const [user_id, friend_id] = [session.user.id, request.friendId]
        .sort((a, b) => a.localeCompare(b));

      // Create new friendship with ordered IDs
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id,
          friend_id,
          status: 'pending'
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          throw new Error('A friendship already exists with this user');
        }
        throw insertError;
      }

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
  createActivity: async (activity_type: ActivityType, game_id?: string, details?: ActivityDetails) => {
    try {
      const response = await fetch('/api/friends/activities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_type, game_id, details }),
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
      // Check if we already have activities data and not currently loading
      if (get().activities.length > 0 && !get().isLoadingActivities) {
        return; // Use cached data
      }
      
      set({ isLoadingActivities: true, error: null });
      
      // Use AbortController to handle timeouts and cancellations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch('/api/friends/activities?offset=0&include=reactions,comments', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=300', // Cache for 5 minutes
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Failed to fetch activities');
        const activities = await response.json();
        
        set({ activities, isLoadingActivities: false, activitiesPage: 1 });
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw fetchError;
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoadingActivities: false });
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

  loadMoreActivities: async () => {
    try {
      const nextPage = get().activitiesPage + 1;
      const response = await fetch(`/api/friends/activities?offset=${nextPage * 20}&include=reactions,comments`);
      if (!response.ok) throw new Error('Failed to fetch more activities');
      const newActivities = await response.json();
      
      set(state => ({
        activities: [...state.activities, ...newActivities],
        activitiesPage: nextPage,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  getGameActivities: async (gameId: string, page: number = 0) => {
    try {
      const response = await fetch(`/api/games/${gameId}/activities?offset=${page * 20}`);
      if (!response.ok) throw new Error('Failed to fetch game activities');
      return response.json();
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (commentId: string) => {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('activity_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // Update local state
    set(state => ({
      activities: state.activities.map(activity => ({
        ...activity,
        comments: activity.comments?.filter(c => c.id !== commentId)
      }))
    }));
  },
}));