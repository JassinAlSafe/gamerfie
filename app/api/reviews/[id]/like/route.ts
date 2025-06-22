import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/services/reviewService";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const result = await ReviewService.toggleLike(reviewId);
    
    return NextResponse.json({
      liked: result.liked,
      count: result.count,
      message: result.liked ? "Review liked" : "Like removed"
    });
  } catch (error) {
    console.error("[LIKE POST] Error toggling like:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to toggle like", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const liked = await ReviewService.checkLikeStatus(reviewId);
    
    return NextResponse.json({ liked });
  } catch (error) {
    console.error("[LIKE GET] Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}