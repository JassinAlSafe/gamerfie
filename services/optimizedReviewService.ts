/**
 * Optimized Review Service with Zero N+1 Queries
 * Uses single batch queries and database views for maximum performance
 */

import { createClient } from '@/utils/supabase/client';
import type { Review, CreateReviewInput, UpdateReviewInput, ReviewsResponse } from '@/types/review';

export class OptimizedReviewService {
  private static supabase = createClient();

  /**
   * Get reviews with all related data in a single optimized query
   * Uses CTEs (Common Table Expressions) for maximum efficiency
   */
  static async getReviewsOptimized(options: {
    limit?: number;
    offset?: number;
    gameId?: string;
    userId?: string;
    isPublic?: boolean;
    orderBy?: 'created_at' | 'rating' | 'likes_count';
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<ReviewsResponse> {
    const {
      limit = 20,
      offset = 0,
      gameId,
      userId,
      isPublic,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;

    const { data: { user: currentUser } } = await this.supabase.auth.getUser();
    const currentUserId = currentUser?.id || null;

    // Single optimized query using CTEs and joins
    const query = `
      WITH filtered_reviews AS (
        SELECT 
          r.id, r.user_id, r.game_id, r.rating, r.review_text, 
          r.is_public, r.playtime_at_review, r.is_recommended, 
          r.created_at, r.updated_at,
          -- User data joined directly
          p.username, p.display_name, p.avatar_url,
          -- Stats from aggregated counts
          COALESCE(likes.likes_count, 0) as likes_count,
          COALESCE(bookmarks.bookmarks_count, 0) as bookmarks_count,
          -- Current user interactions
          CASE WHEN user_likes.review_id IS NOT NULL THEN true ELSE false END as is_liked,
          CASE WHEN user_bookmarks.review_id IS NOT NULL THEN true ELSE false END as is_bookmarked
        FROM reviews r
        LEFT JOIN profiles p ON r.user_id = p.id
        LEFT JOIN (
          SELECT review_id, COUNT(*) as likes_count
          FROM review_likes
          GROUP BY review_id
        ) likes ON r.id = likes.review_id
        LEFT JOIN (
          SELECT review_id, COUNT(*) as bookmarks_count
          FROM review_bookmarks
          GROUP BY review_id
        ) bookmarks ON r.id = bookmarks.review_id
        LEFT JOIN (
          SELECT review_id
          FROM review_likes
          WHERE user_id = $1
        ) user_likes ON r.id = user_likes.review_id
        LEFT JOIN (
          SELECT review_id
          FROM review_bookmarks
          WHERE user_id = $1
        ) user_bookmarks ON r.id = user_bookmarks.review_id
        WHERE 1=1
        ${gameId ? 'AND r.game_id = $2' : ''}
        ${userId ? `AND r.user_id = $${gameId ? '3' : '2'}` : ''}
        ${isPublic !== undefined ? `AND r.is_public = $${gameId && userId ? '4' : gameId || userId ? '3' : '2'}` : ''}
      ),
      total_count AS (
        SELECT COUNT(*) as total FROM filtered_reviews
      )
      SELECT 
        fr.*,
        tc.total as total_count
      FROM filtered_reviews fr
      CROSS JOIN total_count tc
      ORDER BY 
        CASE WHEN $${Object.keys(options).length + 2} = 'created_at' THEN fr.created_at END ${orderDirection === 'desc' ? 'DESC' : 'ASC'},
        CASE WHEN $${Object.keys(options).length + 2} = 'rating' THEN fr.rating END ${orderDirection === 'desc' ? 'DESC' : 'ASC'},
        CASE WHEN $${Object.keys(options).length + 2} = 'likes_count' THEN fr.likes_count END ${orderDirection === 'desc' ? 'DESC' : 'ASC'}
      LIMIT $${Object.keys(options).length + 3} OFFSET $${Object.keys(options).length + 4}
    `;

    // Build parameters array
    const params: any[] = [currentUserId];
    if (gameId) params.push(gameId);
    if (userId) params.push(userId);
    if (isPublic !== undefined) params.push(isPublic);
    params.push(orderBy, limit, offset);

    const { data: results, error } = await this.supabase.rpc('execute_optimized_reviews_query', {
      query_sql: query,
      query_params: params
    });

    if (error) throw error;
    if (!results || results.length === 0) {
      return {
        reviews: [],
        totalCount: 0,
        hasNextPage: false,
        nextCursor: undefined
      };
    }

    const totalCount = results[0]?.total_count || 0;
    
    // Transform results into Review objects
    const reviews: Review[] = results.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      game_id: row.game_id,
      rating: row.rating,
      review_text: row.review_text,
      is_public: row.is_public,
      playtime_at_review: row.playtime_at_review,
      is_recommended: row.is_recommended,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username || 'Unknown User',
        display_name: row.display_name,
        avatar_url: row.avatar_url
      },
      likes_count: row.likes_count,
      bookmarks_count: row.bookmarks_count,
      comments_count: 0, // Not implemented yet
      user_has_liked: row.is_liked,
      user_has_bookmarked: row.is_bookmarked,
      // Compatibility aliases
      is_liked: row.is_liked,
      is_bookmarked: row.is_bookmarked,
      helpfulness_score: 0
    }));

    return {
      reviews,
      totalCount,
      hasNextPage: totalCount > offset + limit,
      nextCursor: totalCount > offset + limit ? String(offset + limit) : undefined
    };
  }

  /**
   * Fallback to the original service for compatibility
   * This uses the individual_review_stats view for better performance
   */
  static async getReviewsFallback(options: {
    limit?: number;
    offset?: number;
    gameId?: string;
    userId?: string;
    isPublic?: boolean;
    orderBy?: 'created_at' | 'rating' | 'likes_count';
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<ReviewsResponse> {
    const {
      limit = 20,
      offset = 0,
      gameId,
      userId,
      isPublic,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;

    const { data: { user: currentUser } } = await this.supabase.auth.getUser();

    // Use the individual_review_stats view for optimized queries
    let query = this.supabase
      .from('individual_review_stats')
      .select(`
        id, user_id, game_id, rating, review_text, is_public, 
        playtime_at_review, is_recommended, created_at, updated_at,
        likes_count, bookmarks_count, comments_count
      `, { count: 'exact' });

    // Apply filters
    if (gameId) query = query.eq('game_id', gameId);
    if (userId) query = query.eq('user_id', userId);
    if (isPublic !== undefined) query = query.eq('is_public', isPublic);

    // Apply ordering
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) throw error;
    if (!reviews || reviews.length === 0) {
      return {
        reviews: [],
        totalCount: count || 0,
        hasNextPage: false,
        nextCursor: undefined
      };
    }

    // Single batch query for all user profiles
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const { data: usersData } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    const usersMap = new Map(
      (usersData || []).map(user => [user.id, user])
    );

    // Single batch query for current user interactions
    const reviewIds = reviews.map(r => r.id);
    let userLikes: Set<string> = new Set();
    let userBookmarks: Set<string> = new Set();

    if (currentUser) {
      const [likesData, bookmarksData] = await Promise.all([
        this.supabase
          .from('review_likes')
          .select('review_id')
          .eq('user_id', currentUser.id)
          .in('review_id', reviewIds),
        this.supabase
          .from('review_bookmarks')
          .select('review_id')
          .eq('user_id', currentUser.id)
          .in('review_id', reviewIds)
      ]);

      userLikes = new Set((likesData.data || []).map(like => like.review_id));
      userBookmarks = new Set((bookmarksData.data || []).map(bookmark => bookmark.review_id));
    }

    // Transform reviews with all data pre-loaded
    const transformedReviews: Review[] = reviews.map(review => ({
      ...review,
      user: usersMap.get(review.user_id) || {
        id: review.user_id,
        username: 'Unknown User',
        display_name: null,
        avatar_url: null
      },
      user_has_liked: userLikes.has(review.id),
      user_has_bookmarked: userBookmarks.has(review.id),
      // Compatibility aliases
      is_liked: userLikes.has(review.id),
      is_bookmarked: userBookmarks.has(review.id),
      helpfulness_score: 0
    }));

    return {
      reviews: transformedReviews,
      totalCount: count || 0,
      hasNextPage: (count || 0) > offset + limit,
      nextCursor: (count || 0) > offset + limit ? String(offset + limit) : undefined
    };
  }

  /**
   * Get a single review with all related data
   */
  static async getReviewOptimized(reviewId: string): Promise<Review | null> {
    const { data: { user: currentUser } } = await this.supabase.auth.getUser();

    const { data: review, error } = await this.supabase
      .from('individual_review_stats')
      .select(`
        id, user_id, game_id, rating, review_text, is_public, 
        playtime_at_review, is_recommended, created_at, updated_at,
        likes_count, bookmarks_count, comments_count
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Single batch query for user and interactions
    const [userData, userInteractions] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', review.user_id)
        .single(),
      
      currentUser ? Promise.all([
        this.supabase
          .from('review_likes')
          .select('id')
          .eq('review_id', reviewId)
          .eq('user_id', currentUser.id)
          .maybeSingle(),
        this.supabase
          .from('review_bookmarks')
          .select('id')
          .eq('review_id', reviewId)
          .eq('user_id', currentUser.id)
          .maybeSingle()
      ]) : [{ data: null }, { data: null }]
    ]);

    return {
      ...review,
      user: userData.data || { 
        id: review.user_id, 
        username: 'Unknown User', 
        display_name: null, 
        avatar_url: null 
      },
      user_has_liked: currentUser ? !!userInteractions[0]?.data : false,
      user_has_bookmarked: currentUser ? !!userInteractions[1]?.data : false,
      // Compatibility aliases
      is_liked: currentUser ? !!userInteractions[0]?.data : false,
      is_bookmarked: currentUser ? !!userInteractions[1]?.data : false,
      helpfulness_score: 0
    };
  }
}