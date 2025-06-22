import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/api/lib/auth";
import { ReviewService } from "@/services/reviewService";
import type { CreateReviewData } from "@/types/review";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const gameId = searchParams.get('gameId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const isPublic = searchParams.get('isPublic') === 'true' ? true : 
                     searchParams.get('isPublic') === 'false' ? false : undefined;
    const orderBy = (searchParams.get('orderBy') || 'created_at') as 'created_at' | 'rating' | 'likes_count';
    const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';

    const response = await ReviewService.getReviews({
      limit,
      offset,
      gameId,
      userId,
      isPublic,
      orderBy,
      orderDirection,
    });

    return NextResponse.json(response);
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

    const review = await ReviewService.createReview(reviewData);

    return NextResponse.json(review, { status: 201 });
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