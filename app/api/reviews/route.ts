import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/api/lib/auth";
import { createClient } from "@/utils/supabase/server";
import type { CreateReviewData } from "@/types/review";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const gameId = searchParams.get('gameId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const isPublic = searchParams.get('isPublic') === 'true' ? true : 
                     searchParams.get('isPublic') === 'false' ? false : undefined;
    const orderBy = (searchParams.get('orderBy') || 'created_at') as 'created_at' | 'rating' | 'likes_count';
    const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';

    let query = supabase
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
      return NextResponse.json({
        reviews: [],
        totalCount: count || 0,
        hasNextPage: false,
        nextCursor: undefined,
      });
    }

    // Manually fetch related data for all reviews
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const reviewIds = reviews.map(r => r.id);

    const [usersData, likesData, bookmarksData] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds),
      supabase
        .from('review_likes')
        .select('review_id')
        .in('review_id', reviewIds),
      supabase
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
      comments_count: 0,
      is_liked: false,
      is_bookmarked: false,
      helpfulness_score: 0
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      totalCount: count || 0,
      hasNextPage: (count || 0) > offset + limit,
      nextCursor: (count || 0) > offset + limit ? String(offset + limit) : undefined,
    });
  } catch (error) {
    console.error("[REVIEWS GET] Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const supabase = await createClient();
    const body = await request.json();
    
    const reviewData: CreateReviewData = {
      game_id: body.game_id,
      rating: body.rating,
      review_text: body.review_text,
      is_public: body.is_public ?? true,
      playtime_at_review: body.playtime_at_review,
      is_recommended: body.is_recommended,
    };

    // Validate required fields
    if (!reviewData.game_id || !reviewData.rating) {
      return NextResponse.json(
        { error: "Missing required fields: game_id and rating are required" },
        { status: 400 }
      );
    }

    if (reviewData.rating < 1 || reviewData.rating > 10) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Create the review using server-side Supabase client
    const { data: review, error } = await supabase
      .from('unified_reviews')
      .insert({
        user_id: user.id,
        game_id: reviewData.game_id,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        is_public: reviewData.is_public,
        playtime_at_review: reviewData.playtime_at_review,
        is_recommended: reviewData.is_recommended,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    const reviewWithUser = {
      ...review,
      user: userData || {
        id: user.id,
        username: 'Unknown User',
        display_name: null,
        avatar_url: null
      }
    };

    return NextResponse.json(reviewWithUser, { status: 201 });
  } catch (error) {
    console.error("[REVIEWS POST] Error creating review:", error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: "You have already reviewed this game" },
          { status: 409 }
        );
      }
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create review", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 