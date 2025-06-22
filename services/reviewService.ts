import { createClient } from '@/utils/supabase/client';
import type { Review, CreateReviewData, UpdateReviewData, ReviewsResponse, ReviewStats } from '@/types/review';

export class ReviewService {
  private static supabase = createClient();

  /**
   * Create a new review
   */
  static async createReview(data: CreateReviewData): Promise<Review> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: review, error } = await this.supabase
      .from('unified_reviews')
      .insert({
        user_id: user.id,
        game_id: data.game_id,
        rating: data.rating,
        review_text: data.review_text,
        is_public: data.is_public ?? true,
        playtime_at_review: data.playtime_at_review,
        is_recommended: data.is_recommended,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Manually fetch user data
    const { data: userData, error: userError } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return {
      ...review,
      user: userData || {
        id: user.id,
        username: 'Unknown User',
        display_name: null,
        avatar_url: null
      }
    };
  }

  /**
   * Update an existing review
   */
  static async updateReview(data: UpdateReviewData): Promise<Review> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: Partial<CreateReviewData> = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.review_text !== undefined) updateData.review_text = data.review_text;
    if (data.is_public !== undefined) updateData.is_public = data.is_public;
    if (data.playtime_at_review !== undefined) updateData.playtime_at_review = data.playtime_at_review;
    if (data.is_recommended !== undefined) updateData.is_recommended = data.is_recommended;

    const { data: review, error } = await this.supabase
      .from('unified_reviews')
      .update(updateData)
      .eq('id', data.id)
      .eq('user_id', user.id) // Ensure user can only update their own reviews
      .select('*')
      .single();

    if (error) throw error;

    // Manually fetch user data
    const { data: userData, error: userError } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return {
      ...review,
      user: userData || {
        id: user.id,
        username: 'Unknown User',
        display_name: null,
        avatar_url: null
      }
    };
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.supabase
      .from('unified_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id); // Ensure user can only delete their own reviews

    if (error) throw error;
  }

  /**
   * Get a single review by ID
   */
  static async getReview(reviewId: string): Promise<Review | null> {
    const { data: review, error } = await this.supabase
      .from('unified_reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Manually fetch related data
    const [userData, likesData, bookmarksData] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', review.user_id)
        .single(),
      this.supabase
        .from('review_likes')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId),
      this.supabase
        .from('review_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId)
    ]);

    return {
      ...review,
      user: userData.data || { id: review.user_id, username: 'Unknown User', display_name: null, avatar_url: null },
      likes_count: likesData.count || 0,
      bookmarks_count: bookmarksData.count || 0,
      comments_count: 0 // TODO: Add comments count when available
    };
  }

  /**
   * Get reviews with pagination and filtering
   */
  static async getReviews(options: {
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

    let query = this.supabase
      .from('unified_reviews')
      .select('*', { count: 'exact' });

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
        nextCursor: undefined,
      };
    }

    // Manually fetch related data for all reviews
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const reviewIds = reviews.map(r => r.id);

    const [usersData, likesData, bookmarksData] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds),
      this.supabase
        .from('review_likes')
        .select('review_id')
        .in('review_id', reviewIds),
      this.supabase
        .from('review_bookmarks')
        .select('review_id')
        .in('review_id', reviewIds)
    ]);

    // Create lookup maps
    const usersMap = new Map();
    (usersData.data || []).forEach(user => {
      usersMap.set(user.id, user);
    });

    const likesCounts = (likesData.data || []).reduce((acc: Record<string, number>, like) => {
      acc[like.review_id] = (acc[like.review_id] || 0) + 1;
      return acc;
    }, {});

    const bookmarksCounts = (bookmarksData.data || []).reduce((acc: Record<string, number>, bookmark) => {
      acc[bookmark.review_id] = (acc[bookmark.review_id] || 0) + 1;
      return acc;
    }, {});

    // Transform reviews with manual joins
    const transformedReviews = reviews.map(review => ({
      ...review,
      user: usersMap.get(review.user_id) || {
        id: review.user_id,
        username: 'Unknown User',
        display_name: null,
        avatar_url: null
      },
      likes_count: likesCounts[review.id] || 0,
      bookmarks_count: bookmarksCounts[review.id] || 0,
      comments_count: 0, // TODO: Add comments count when available
      // Add compatibility aliases
      is_liked: false, // TODO: Check user's like status when authenticated
      is_bookmarked: false, // TODO: Check user's bookmark status when authenticated
      helpfulness_score: 0
    }));

    return {
      reviews: transformedReviews,
      totalCount: count || 0,
      hasNextPage: (count || 0) > offset + limit,
      nextCursor: (count || 0) > offset + limit ? String(offset + limit) : undefined,
    };
  }

  /**
   * Get review statistics
   */
  static async getReviewStats(userId?: string): Promise<ReviewStats> {
    let query = this.supabase
      .from('unified_reviews')
      .select('rating');

    if (userId) query = query.eq('user_id', userId);
    query = query.eq('is_public', true);

    const { data: reviews, error } = await query;
    if (error) throw error;

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingsDistribution = reviews?.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    return {
      totalReviews,
      averageRating,
      ratingsDistribution,
      topGenres: [], // TODO: Calculate from game details when available
    };
  }

  /**
   * Like/Unlike a review
   */
  static async toggleLike(reviewId: string): Promise<{ liked: boolean; count: number }> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already liked
    const { data: existingLike, error: checkError } = await this.supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    let liked: boolean;

    if (existingLike) {
      // Unlike
      const { error } = await this.supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      liked = false;
    } else {
      // Like
      const { error } = await this.supabase
        .from('review_likes')
        .insert({ review_id: reviewId, user_id: user.id });
      
      if (error) throw error;
      liked = true;
    }

    // Get updated count
    const { count, error: countError } = await this.supabase
      .from('review_likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    if (countError) throw countError;

    return { liked, count: count || 0 };
  }

  /**
   * Bookmark/Unbookmark a review
   */
  static async toggleBookmark(reviewId: string): Promise<{ bookmarked: boolean; count: number }> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await this.supabase
      .from('review_bookmarks')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    let bookmarked: boolean;

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await this.supabase
        .from('review_bookmarks')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      bookmarked = false;
    } else {
      // Add bookmark
      const { error } = await this.supabase
        .from('review_bookmarks')
        .insert({ review_id: reviewId, user_id: user.id });
      
      if (error) throw error;
      bookmarked = true;
    }

    // Get updated count
    const { count, error: countError } = await this.supabase
      .from('review_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    if (countError) throw countError;

    return { bookmarked, count: count || 0 };
  }

  /**
   * Check if user has liked a review
   */
  static async checkLikeStatus(reviewId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await this.supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  /**
   * Check if user has bookmarked a review
   */
  static async checkBookmarkStatus(reviewId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await this.supabase
      .from('review_bookmarks')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  /**
   * Get user's review for a specific game
   */
  static async getUserGameReview(gameId: string, userId?: string): Promise<Review | null> {
    const targetUserId = userId || (await this.supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return null;

    const { data: review, error } = await this.supabase
      .from('unified_reviews')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Manually fetch user data
    const { data: userData } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', targetUserId)
      .single();

    return {
      ...review,
      user: userData || {
        id: targetUserId,
        username: 'Unknown User',
        display_name: null,
        avatar_url: null
      }
    };
  }
} 