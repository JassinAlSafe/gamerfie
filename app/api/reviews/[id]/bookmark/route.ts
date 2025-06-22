import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/services/reviewService";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const result = await ReviewService.toggleBookmark(reviewId);
    
    return NextResponse.json({
      bookmarked: result.bookmarked,
      count: result.count,
      message: result.bookmarked ? "Review bookmarked" : "Bookmark removed"
    });
  } catch (error) {
    console.error("[BOOKMARK POST] Error toggling bookmark:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to toggle bookmark", details: error instanceof Error ? error.message : String(error) },
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
    const bookmarked = await ReviewService.checkBookmarkStatus(reviewId);
    
    return NextResponse.json({ bookmarked });
  } catch (error) {
    console.error("[BOOKMARK GET] Error checking bookmark status:", error);
    return NextResponse.json(
      { error: "Failed to check bookmark status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}