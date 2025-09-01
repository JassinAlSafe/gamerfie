import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { FriendActivity } from '@/types/activity';

const QUERY_KEYS = {
  activities: ['profile', 'activities'] as const,
  gameActivities: (gameId: string) => ['profile', 'activities', 'game', gameId] as const,
};

export function useProfileActivities(limit = 10) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch activities with React Query
  const {
    data: activities = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...QUERY_KEYS.activities, limit],
    queryFn: async (): Promise<FriendActivity[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get user's friends first to fetch their activities
      const { data: friendships } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!friendships || friendships.length === 0) return [];

      // Get friend IDs
      const friendIds = friendships.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );
      
      // Include user's own activities
      friendIds.push(user.id);

      // Fetch activities from friends and user
      const { data, error: activitiesError } = await supabase
        .from('friend_activities')
        .select(`
          id,
          user_id,
          activity_type,
          game_id,
          details,
          created_at,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          games:game_id (
            id,
            name,
            cover_url
          ),
          reactions:activity_reactions (
            id,
            user_id,
            emoji,
            created_at,
            user:profiles!user_id (
              id,
              username,
              avatar_url
            )
          ),
          comments:activity_comments (
            id,
            user_id,
            content,
            created_at,
            user:profiles!user_id (
              id,
              username,
              avatar_url
            )
          )
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activitiesError) throw activitiesError;

      return data?.map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        type: activity.activity_type, // Map to expected field name
        activity_type: activity.activity_type,
        game_id: activity.game_id,
        details: activity.details,
        created_at: activity.created_at,
        timestamp: activity.created_at, // For compatibility
        user: {
          id: activity.profiles?.id || '',
          username: activity.profiles?.username || '',
          display_name: activity.profiles?.display_name || '',
          avatar_url: activity.profiles?.avatar_url || null,
        },
        game: activity.games ? {
          id: activity.games.id,
          name: activity.games.name,
          cover_url: activity.games.cover_url,
        } : null,
        reactions: (activity.reactions || []).map(reaction => ({
          id: reaction.id,
          user_id: reaction.user_id,
          activity_id: activity.id,
          emoji: reaction.emoji,
          reaction_type: reaction.emoji, // For compatibility
          created_at: reaction.created_at,
          user: {
            id: reaction.user?.id || '',
            username: reaction.user?.username || '',
            avatar_url: reaction.user?.avatar_url || null,
          }
        })),
        comments: (activity.comments || []).map(comment => ({
          id: comment.id,
          user_id: comment.user_id,
          activity_id: activity.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user?.id || '',
            username: comment.user?.username || '',
            avatar_url: comment.user?.avatar_url || null,
          }
        })),
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - activities are more dynamic
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: {
      activity_type: string;
      game_id?: string;
      details?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('friend_activities')
        .insert({
          user_id: user.id,
          ...activityData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities });
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ activityId, emoji }: { activityId: string; emoji: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Check if user already has a reaction to this activity
      const { data: existingReaction } = await supabase
        .from('activity_reactions')
        .select('emoji')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // If same emoji, remove it (toggle)
        if (existingReaction.emoji === emoji) {
          const { error } = await supabase
            .from('activity_reactions')
            .delete()
            .eq('activity_id', activityId)
            .eq('user_id', user.id);
          if (error) throw error;
          return;
        }
        // If different emoji, update it
        const { error } = await supabase
          .from('activity_reactions')
          .update({ emoji })
          .eq('activity_id', activityId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('activity_reactions')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            emoji
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ activityId, content }: { activityId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('activity_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities });
    },
  });

  return {
    activities,
    isLoading,
    error,
    refetch,
    createActivity: createActivityMutation.mutate,
    isCreatingActivity: createActivityMutation.isPending,
    addReaction: addReactionMutation.mutate,
    isAddingReaction: addReactionMutation.isPending,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}

// Hook for game-specific activities
export function useGameActivities(gameId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: QUERY_KEYS.gameActivities(gameId),
    queryFn: async (): Promise<FriendActivity[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('friend_activities')
        .select(`
          id,
          user_id,
          activity_type,
          game_id,
          details,
          created_at,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data?.map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        type: activity.activity_type, // Map to expected field name
        activity_type: activity.activity_type,
        game_id: activity.game_id,
        details: activity.details,
        created_at: activity.created_at,
        timestamp: activity.created_at, // For compatibility
        user: {
          id: activity.profiles?.id || '',
          username: activity.profiles?.username || '',
          display_name: activity.profiles?.display_name || '',
          avatar_url: activity.profiles?.avatar_url || null,
        },
        game: null, // Not needed for game-specific activities
        reactions: [], // Empty for game-specific activities
        comments: [], // Empty for game-specific activities
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!gameId,
  });
}