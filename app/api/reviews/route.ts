import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthResult } from "@/app/api/lib/auth";
import { ReviewService } from "@/services/reviewService";
import { validateCreateReview, validateReviewsQuery } from "@/lib/validations/review";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryValidation = validateReviewsQuery(Object.fromEntries(searchParams.entries()));
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error },
        { status: 400 }
      );
    }

    const params = queryValidation.data;

    // Use the optimized ReviewService instead of manual queries
    const result = await ReviewService.getReviews({
      limit: params.limit,
      offset: params.offset,
      gameId: params.gameId,
      userId: params.userId,
      isPublic: params.isPublic,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection
    });

    return NextResponse.json(result);

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
    if (!isAuthResult(authResult)) {
      return authResult; // Return the error response
    }

    const body = await request.json();
    
    // Validate request body with Zod
    const validation = validateCreateReview(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid review data", details: validation.error },
        { status: 400 }
      );
    }

    // Use the optimized ReviewService
    const review = await ReviewService.createReview(validation.data);
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