import { create } from 'zustand';
import { 
  FriendsState, 
  FriendStatus, 
  Friend,
  FriendActivity
} from '../types/friend';
import { ActivityType, ActivityDetails, ActivityReaction, ActivityComment } from '../types/activity';
import { createClient } from '@/utils/supabase/client';

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
  getGameActivities: (gameId: string, page?: number) => Promise<FriendActivity[]>;
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
      set({ isLoading: true, error: null });
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ friends: [], isLoading: false });
        return;
      }

      // Fetch friends from the friends table
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`);

      if (error) {
        // If table doesn't exist or relationship is broken, gracefully handle it
        console.warn('Friends feature not available:', error.message);
        set({ friends: [], isLoading: false });
        return;
      }

      if (!friendships || friendships.length === 0) {
        set({ friends: [], isLoading: false });
        return;
      }

      // Get all unique friend IDs to fetch their profiles
      const friendIds = new Set<string>();
      friendships.forEach(friendship => {
        const friendId = friendship.user_id === session.user.id 
          ? friendship.friend_id 
          : friendship.user_id;
        friendIds.add(friendId);
      });

      // Fetch profiles for all friends
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .in('id', Array.from(friendIds));

      if (profilesError) {
        console.warn('Error fetching friend profiles:', profilesError.message);
        set({ friends: [], isLoading: false });
        return;
      }

      // Create a map of profiles for quick lookup
      const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      const friends: Friend[] = friendships?.map((friendship) => {
        // Determine which ID is the friend (not the current user)
        const friendId = friendship.user_id === session.user.id 
          ? friendship.friend_id 
          : friendship.user_id;

        const friendProfile = profilesMap.get(friendId);
        if (!friendProfile) return null;

        return {
          id: friendProfile.id,
          username: friendProfile.username,
          avatar_url: friendProfile.avatar_url || undefined,
          status: friendship.status,
          online_status: 'offline' as const,
          sender_id: friendship.user_id,
        };
      }).filter(Boolean) as Friend[];

      set({ friends, isLoading: false });
    } catch (error) {
      console.warn('Error fetching friends (table may not exist):', error);
      // Set empty friends array if there's any error
      set({ friends: [], isLoading: false, error: null });
    }
  },

  fetchActivities: async () => {
    try {
      set({ isLoadingActivities: true, error: null });
      
      // Use the optimized social activity feed API
      const response = await fetch('/api/social/activity-feed?limit=20');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform to expected format
      const transformedActivities = data.activities?.map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        user_id: activity.user_id,
        game_id: activity.game_id,
        timestamp: activity.created_at,
        created_at: activity.created_at,
        details: activity.details,
        reactions: activity.reactions || [],
        comments: activity.comments || [],
        user: {
          id: activity.user_id,
          username: activity.username,
          avatar_url: activity.avatar_url,
        },
        game: activity.game_name ? {
          id: activity.game_id,
          name: activity.game_name,
          cover_url: activity.game_cover_url,
        } : null,
      })) || [];

      set({ activities: transformedActivities, isLoadingActivities: false });
    } catch (error) {
      console.warn('Error fetching optimized activities:', error);
      // Fallback to direct database query
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          set({ activities: [], isLoadingActivities: false });
          return;
        }

        const { data: activities, error } = await supabase
          .from('friend_activities')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        set({ activities: activities || [], isLoadingActivities: false });
      } catch (fallbackError) {
        console.warn('Fallback activities fetch failed:', fallbackError);
        set({ activities: [], isLoadingActivities: false });
      }
    }
  },

  createActivity: async (activity_type: ActivityType, game_id?: string, details?: ActivityDetails) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Create activity with basic structure
      const activityData = {
        user_id: session.user.id,
        activity_type,
        game_id: game_id || null,
        details: details || {},
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('friend_activities')
        .insert(activityData);

      if (error) throw error;

      // Refresh activities
      await get().fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  addFriend: async (request: { friendId: string }) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: session.user.id,
          friend_id: request.friendId,
          status: 'pending'
        });

      if (error) throw error;
      await get().fetchFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  },

  removeFriend: async (friendId: string) => {
    try {
      set({ isLoading: true, error: null });
      const supabase = createClient();
      
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
      const supabase = createClient();

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

  addReaction: async (activityId: string, emoji: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('activity_reactions')
        .insert({
          activity_id: activityId,
          user_id: session.user.id,
          emoji
        });

      if (error) throw error;
      await get().fetchActivities();
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  removeReaction: async (activityId: string, emoji: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('activity_reactions')
        .delete()
        .match({
          activity_id: activityId,
          user_id: session.user.id,
          emoji
        });

      if (error) throw error;
      await get().fetchActivities();
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  addComment: async (activityId: string, comment: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          user_id: session.user.id,
          content: comment
        });

      if (error) throw error;
      await get().fetchActivities();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('activity_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await get().fetchActivities();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  loadMoreActivities: async () => {
    // Implementation for pagination
    await get().fetchActivities();
  },

  getGameActivities: async (gameId: string, page?: number): Promise<FriendActivity[]> => {
    try {
      const supabase = createClient();
      
      const { data: activities, error } = await supabase
        .from('friend_activities')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .range(page ? page * 10 : 0, page ? (page + 1) * 10 - 1 : 9);

      if (error) throw error;
      
      // Return the activities instead of updating state
      return activities || [];
    } catch (error) {
      console.error('Error fetching game activities:', error);
      throw error;
    }
  },

  batchAchievements: async (gameId: string, achievements: { name: string }[]) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Create achievement activities
      const activityPromises = achievements.map(achievement =>
        get().createActivity('achievement_unlocked', gameId, {
          achievement: achievement.name
        })
      );

      await Promise.all(activityPromises);
    } catch (error) {
      console.error('Error batch creating achievements:', error);
      throw error;
    }
  },
}));