/**
 * Activity Service - Comprehensive activity feed system
 * Based on the documented activity system architecture
 */

import { createClient } from '@/utils/supabase/client';
import { APIError } from '@/utils/api';
import type {
  Activity,
  EnhancedActivity,
  ActivityReaction,
  ActivityComment,
  CreateActivityData,
  ActivityFilters,
  ActivityStats,
  ActivityType,
  ReactionType,
  ActivityFeedResponse
} from '@/types/activity';

export class ActivityService {
  private static supabase = createClient();

  /**
   * Create a new activity
   */
  static async createActivity(data: CreateActivityData): Promise<Activity> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { data: activity, error } = await this.supabase
        .from('activity')
        .insert({
          user_id: user.id,
          type: data.type,
          game_id: data.game_id,
          achievement_id: data.achievement_id,
          review_id: data.review_id,
          friend_id: data.friend_id,
          challenge_id: data.challenge_id,
          collection_id: data.collection_id,
          metadata: data.metadata || {},
          is_public: data.is_public ?? true,
        })
        .select()
        .single();

      if (error) {
        throw new APIError('Failed to create activity', 500, 'DATABASE_ERROR', error);
      }

      return activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Get activity feed with enhanced data
   */
  static async getActivityFeed(
    filters: ActivityFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ActivityFeedResponse> {
    try {
      let query = this.supabase
        .from('activity')
        .select(`
          *,
          user:profiles!activity_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `);

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      if (filters.gameId) {
        query = query.eq('game_id', filters.gameId);
      }

      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Pagination
      const from = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      const { data: activities, error, count } = await query;

      if (error) {
        throw new APIError('Failed to fetch activities', 500, 'DATABASE_ERROR', error);
      }

      // Enhance activities with reaction and comment counts
      const enhancedActivities = await this.enhanceActivities(activities || []);

      return {
        activities: enhancedActivities,
        has_more: (count || 0) > from + limit,
        next_cursor: enhancedActivities.length === limit ? (page + 1).toString() : undefined,
        total_count: count || 0,
      };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  }

  /**
   * Get user's activity feed (for profile pages)
   */
  static async getUserActivity(
    userId: string,
    page: number = 1,
    limit: number = 20,
    includePrivate: boolean = false
  ): Promise<ActivityFeedResponse> {
    const filters: ActivityFilters = {
      user_id: userId,
    };

    if (!includePrivate) {
      filters.is_public = true;
    }

    return this.getActivityFeed(filters, page, limit);
  }

  /**
   * Get friends activity feed
   */
  static async getFriendsActivity(
    page: number = 1,
    limit: number = 20
  ): Promise<ActivityFeedResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      // Get user's friends first
      const { data: friendships } = await this.supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id);

      const friendIds = friendships?.map(f => f.friend_id) || [];
      friendIds.push(user.id); // Include own activities

      const filters: ActivityFilters = {
        is_public: true,
      };

      // Note: This would need a more complex query for production
      // For now, we'll get all public activities and filter client-side
      const result = await this.getActivityFeed(filters, page, limit);
      
      // Filter to only include friends' activities
      result.activities = result.activities.filter(activity => 
        friendIds.includes(activity.user_id)
      );

      return result;
    } catch (error) {
      console.error('Error fetching friends activity:', error);
      throw error;
    }
  }

  /**
   * React to an activity
   */
  static async reactToActivity(
    activityId: string,
    reactionType: ReactionType
  ): Promise<ActivityReaction> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      // Upsert reaction (update if exists, insert if not)
      const { data: reaction, error } = await this.supabase
        .from('activity_reactions')
        .upsert(
          {
            activity_id: activityId,
            user_id: user.id,
            reaction_type: reactionType,
          },
          {
            onConflict: 'activity_id,user_id,reaction_type',
          }
        )
        .select(`
          *,
          user:profiles!activity_reactions_user_id_fkey(username, avatar_url)
        `)
        .single();

      if (error) {
        throw new APIError('Failed to react to activity', 500, 'DATABASE_ERROR', error);
      }

      return reaction;
    } catch (error) {
      console.error('Error reacting to activity:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from activity
   */
  static async removeReaction(
    activityId: string,
    reactionType: ReactionType
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { error } = await this.supabase
        .from('activity_reactions')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) {
        throw new APIError('Failed to remove reaction', 500, 'DATABASE_ERROR', error);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Comment on an activity
   */
  static async commentOnActivity(
    activityId: string,
    content: string
  ): Promise<ActivityComment> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      if (!content.trim()) {
        throw new APIError('Comment content is required', 400, 'VALIDATION_ERROR');
      }

      const { data: comment, error } = await this.supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          user:profiles!activity_comments_user_id_fkey(username, avatar_url)
        `)
        .single();

      if (error) {
        throw new APIError('Failed to comment on activity', 500, 'DATABASE_ERROR', error);
      }

      return comment;
    } catch (error) {
      console.error('Error commenting on activity:', error);
      throw error;
    }
  }

  /**
   * Get activity stats for a user
   */
  static async getActivityStats(userId: string): Promise<ActivityStats> {
    try {
      const { data: activities, error } = await this.supabase
        .from('activity')
        .select('type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new APIError('Failed to fetch activity stats', 500, 'DATABASE_ERROR', error);
      }

      const stats: ActivityStats = {
        total_activities: activities?.length || 0,
        activities_by_type: {} as Record<ActivityType, number>,
        most_active_day: { date: '', count: 0 },
        recent_streak: { current: 0, longest: 0 },
      };

      // Calculate stats
      activities?.forEach(activity => {
        const type = activity.type as ActivityType;
        stats.activities_by_type[type] = (stats.activities_by_type[type] || 0) + 1;
      });

      // Calculate most active day and streaks
      // (This would be more complex in a real implementation)

      return stats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  /**
   * Delete an activity (own activities only)
   */
  static async deleteActivity(activityId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { error } = await this.supabase
        .from('activity')
        .delete()
        .eq('id', activityId)
        .eq('user_id', user.id);

      if (error) {
        throw new APIError('Failed to delete activity', 500, 'DATABASE_ERROR', error);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  /**
   * Enhance activities with reaction and comment counts
   * @private
   */
  private static async enhanceActivities(activities: Activity[]): Promise<EnhancedActivity[]> {
    if (!activities.length) return [];

    const activityIds = activities.map(a => a.id);

    // Get reaction counts
    const { data: reactionCounts } = await this.supabase
      .from('activity_reactions')
      .select('activity_id')
      .in('activity_id', activityIds);

    // Get comment counts
    const { data: commentCounts } = await this.supabase
      .from('activity_comments')
      .select('activity_id')
      .in('activity_id', activityIds);

    // Get current user's reactions
    const { data: { user } } = await this.supabase.auth.getUser();
    let userReactions: any[] = [];
    if (user) {
      const { data } = await this.supabase
        .from('activity_reactions')
        .select('activity_id, reaction_type')
        .in('activity_id', activityIds)
        .eq('user_id', user.id);
      userReactions = data || [];
    }

    // Build lookup maps
    const reactionCountMap = new Map<string, number>();
    reactionCounts?.forEach(r => {
      reactionCountMap.set(r.activity_id, (reactionCountMap.get(r.activity_id) || 0) + 1);
    });

    const commentCountMap = new Map<string, number>();
    commentCounts?.forEach(c => {
      commentCountMap.set(c.activity_id, (commentCountMap.get(c.activity_id) || 0) + 1);
    });

    const userReactionMap = new Map<string, ReactionType>();
    userReactions.forEach(ur => {
      userReactionMap.set(ur.activity_id, ur.reaction_type);
    });

    // Enhance activities
    return activities.map(activity => ({
      ...activity,
      user: activity.user || { id: '', username: 'Unknown', avatar_url: undefined },
      reactions_count: reactionCountMap.get(activity.id) || 0,
      comments_count: commentCountMap.get(activity.id) || 0,
      user_reaction: userReactionMap.get(activity.id),
      recent_comments: [], // TODO: Implement recent comments fetching
    })) as EnhancedActivity[];
  }

  /**
   * Helper function to create activity for game actions
   */
  static async createGameActivity(
    type: ActivityType,
    gameId: string,
    metadata: any = {}
  ): Promise<Activity> {
    return this.createActivity({
      type,
      game_id: gameId,
      metadata,
    });
  }

  /**
   * Helper function to create activity for review actions
   */
  static async createReviewActivity(
    reviewId: string,
    metadata: any = {}
  ): Promise<Activity> {
    return this.createActivity({
      type: 'review_added',
      review_id: reviewId,
      metadata,
    });
  }

  /**
   * Helper function to create activity for friend actions
   */
  static async createFriendActivity(
    friendId: string,
    metadata: any = {}
  ): Promise<Activity> {
    return this.createActivity({
      type: 'friend_added',
      friend_id: friendId,
      metadata,
    });
  }
}