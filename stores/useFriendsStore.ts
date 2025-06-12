import { create } from 'zustand';
import { 
  FriendsState, 
  FriendStatus, 
  Friend,
  FriendActivity
} from '../types/friend';
import { ActivityType, ActivityDetails } from '../types/activity';
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

export const useFriendsStore = create<FriendsStore>((set, get) => {
  const supabase = createClient();

  // Helper function to get current user session
  const getCurrentUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session?.user) throw new Error('No authenticated user');
    return session.user;
  };

  return {
    friends: [],
    isLoading: false,
    error: null,
    filter: 'all',
    activities: [],
    isLoadingActivities: false,
    activitiesPage: 0,

    setFilter: (filter) => set({ filter }),

    fetchFriends: async () => {
      const fetchWithTimeout = async () => {
        set({ isLoading: true, error: null });
        
        const user = await getCurrentUser();

        // Fetch friends relationships
        const { data: friendships, error: friendsError } = await supabase
          .from('friends')
          .select('*')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (friendsError) {
          console.warn('Friends feature not available:', friendsError.message);
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
          const friendId = friendship.user_id === user.id 
            ? friendship.friend_id 
            : friendship.user_id;
          if (friendId) friendIds.add(friendId);
        });

        if (friendIds.size === 0) {
          set({ friends: [], isLoading: false });
          return;
        }

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

        const friends: Friend[] = friendships
           .map((friendship) => {
             // Determine which ID is the friend (not the current user)
             const friendId = friendship.user_id === user.id 
               ? friendship.friend_id 
               : friendship.user_id;

             const friendProfile = profilesMap.get(friendId);
             if (!friendProfile) return null;

             const friend: Friend = {
               id: friendProfile.id,
               username: friendProfile.username,
               display_name: friendProfile.display_name || undefined,
               bio: friendProfile.bio || undefined,
               avatar_url: friendProfile.avatar_url || undefined,
               status: friendship.status as FriendStatus,
               online_status: 'offline' as const,
               sender_id: friendship.user_id,
             };
             return friend;
           })
           .filter((friend): friend is Friend => friend !== null);

        set({ friends, isLoading: false });
      };

      try {
        // Add timeout to prevent infinite loading
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Friends fetch timeout after 8 seconds')), 8000)
        );
        
        await Promise.race([fetchWithTimeout(), timeout]);
      } catch (error) {
        console.warn('Error fetching friends (timeout or table issue):', error);
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
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform to expected format with proper type checking
        const transformedActivities: FriendActivity[] = (data.activities || []).map((activity) => ({
          id: activity.id,
          type: activity.activity_type,
          user_id: activity.user_id,
          game_id: activity.game_id,
          timestamp: activity.created_at,
          created_at: activity.created_at,
          details: activity.details || {},
          reactions: activity.reactions || [],
          comments: activity.comments || [],
          user: {
            id: activity.user_id,
            username: activity.username || 'Unknown User',
            avatar_url: activity.avatar_url,
          },
          game: activity.game_name ? {
            id: activity.game_id,
            name: activity.game_name,
            cover_url: activity.game_cover_url,
          } : null,
        }));

        set({ activities: transformedActivities, isLoadingActivities: false });
      } catch (error) {
        console.warn('Error fetching optimized activities:', error);
        
        // Fallback to direct database query if API fails
        try {
          const user = await getCurrentUser();

          const { data: activities, error: activitiesError } = await supabase
            .from('friend_activities')
            .select(`
              *,
              user:profiles!user_id(id, username, avatar_url),
              game:games!game_id(id, name, cover_url)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (activitiesError) {
            // If friend_activities table doesn't exist, that's okay - just set empty array
            console.warn('Activities feature not available:', activitiesError.message);
            set({ activities: [], isLoadingActivities: false });
            return;
          }
          
          // Transform fallback data to expected format
          const transformedActivities: FriendActivity[] = (activities || []).map((activity) => ({
            id: activity.id,
            type: activity.activity_type || activity.type,
            user_id: activity.user_id,
            game_id: activity.game_id,
            timestamp: activity.created_at,
            created_at: activity.created_at,
            details: activity.details || {},
            reactions: [],
            comments: [],
            user: activity.user ? {
              id: activity.user.id,
              username: activity.user.username || 'Unknown User',
              avatar_url: activity.user.avatar_url,
            } : {
              id: activity.user_id,
              username: 'Unknown User',
              avatar_url: null,
            },
            game: activity.game ? {
              id: activity.game.id,
              name: activity.game.name,
              cover_url: activity.game.cover_url,
            } : null,
          }));
          
          set({ activities: transformedActivities, isLoadingActivities: false });
        } catch (fallbackError) {
          console.warn('Activities feature not available:', fallbackError);
          set({ activities: [], isLoadingActivities: false });
        }
      }
    },

    createActivity: async (activity_type: ActivityType, game_id?: string, details?: ActivityDetails) => {
      try {
        const user = await getCurrentUser();

        // Create activity with basic structure
        const activityData = {
          user_id: user.id,
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to create activity';
        set({ error: errorMessage });
        throw error;
      }
    },

    addFriend: async (request: { friendId: string }) => {
      try {
        const user = await getCurrentUser();

        if (!request.friendId) {
          throw new Error('Friend ID is required');
        }

        const { error } = await supabase
          .from('friends')
          .insert({
            user_id: user.id,
            friend_id: request.friendId,
            status: 'pending'
          });

        if (error) throw error;
        await get().fetchFriends();
      } catch (error) {
        console.error('Error adding friend:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add friend';
        set({ error: errorMessage });
        throw error;
      }
    },

    removeFriend: async (friendId: string) => {
      try {
        set({ isLoading: true, error: null });

        if (!friendId) {
          throw new Error('Friend ID is required');
        }
        
        const { error } = await supabase
          .from('friends')
          .delete()
          .eq('id', friendId);

        if (error) throw error;
        await get().fetchFriends();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove friend';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    updateFriendStatus: async (friendId: string, status: FriendStatus) => {
      try {
        set({ isLoading: true, error: null });

        if (!friendId) {
          throw new Error('Friend ID is required');
        }

        const { error } = await supabase
          .from('friends')
          .update({ status })
          .eq('id', friendId);

        if (error) throw error;
        await get().fetchFriends();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update friend status';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    addReaction: async (activityId: string, emoji: string) => {
      try {
        const user = await getCurrentUser();

        if (!activityId || !emoji) {
          throw new Error('Activity ID and emoji are required');
        }

        const { error } = await supabase
          .from('activity_reactions')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            emoji
          });

        if (error) throw error;
        await get().fetchActivities();
      } catch (error) {
        console.error('Error adding reaction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add reaction';
        set({ error: errorMessage });
        throw error;
      }
    },

    removeReaction: async (activityId: string, emoji: string) => {
      try {
        const user = await getCurrentUser();

        if (!activityId || !emoji) {
          throw new Error('Activity ID and emoji are required');
        }

        const { error } = await supabase
          .from('activity_reactions')
          .delete()
          .match({
            activity_id: activityId,
            user_id: user.id,
            emoji
          });

        if (error) throw error;
        await get().fetchActivities();
      } catch (error) {
        console.error('Error removing reaction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove reaction';
        set({ error: errorMessage });
        throw error;
      }
    },

    addComment: async (activityId: string, comment: string) => {
      try {
        const user = await getCurrentUser();

        if (!activityId || !comment.trim()) {
          throw new Error('Activity ID and comment content are required');
        }

        const { error } = await supabase
          .from('activity_comments')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            content: comment.trim()
          });

        if (error) throw error;
        await get().fetchActivities();
      } catch (error) {
        console.error('Error adding comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
        set({ error: errorMessage });
        throw error;
      }
    },

    deleteComment: async (commentId: string) => {
      try {
        if (!commentId) {
          throw new Error('Comment ID is required');
        }

        const { error } = await supabase
          .from('activity_comments')
          .delete()
          .eq('id', commentId);

        if (error) throw error;
        await get().fetchActivities();
      } catch (error) {
        console.error('Error deleting comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
        set({ error: errorMessage });
        throw error;
      }
    },

    loadMoreActivities: async () => {
      // Implementation for pagination - could be enhanced with proper page tracking
      await get().fetchActivities();
    },

    getGameActivities: async (gameId: string, page: number = 0): Promise<FriendActivity[]> => {
      try {
        if (!gameId) {
          throw new Error('Game ID is required');
        }

        const offset = page * 10;
        const limit = 10;
        
        const { data: activities, error } = await supabase
          .from('friend_activities')
          .select('*')
          .eq('game_id', gameId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

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
        if (!gameId || !achievements.length) {
          throw new Error('Game ID and achievements are required');
        }

        // Create achievement activities in parallel for better performance
        const activityPromises = achievements.map(achievement =>
          get().createActivity('achievement_unlocked', gameId, {
            achievement: achievement.name
          })
        );

        await Promise.all(activityPromises);
      } catch (error) {
        console.error('Error batch creating achievements:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to batch create achievements';
        set({ error: errorMessage });
        throw error;
      }
    },
  };
});