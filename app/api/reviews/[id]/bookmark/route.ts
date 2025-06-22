import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthResult } from "@/app/api/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest();
    if (!isAuthResult(authResult)) {
      return authResult; // Return the error response
    }

    const { supabase } = authResult;
    const reviewId = params.id;

    // Use the enhanced toggle_review_bookmark function
    const { data: result, error } = await supabase.rpc('toggle_review_bookmark', {
      review_id: reviewId
    });

    if (error) throw error;
    
    return NextResponse.json({
      bookmarked: result.bookmarked,
      count: result.bookmarks_count,
      message: result.bookmarked ? "Review bookmarked" : "Bookmark removed"
    });
  } catch (error) {
    console.error("[BOOKMARK POST] Error toggling bookmark:", error);
    
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
    const authResult = await authenticateRequest();
    if (!isAuthResult(authResult)) {
      return NextResponse.json({ bookmarked: false }); // Return false if not authenticated
    }

    const { user, supabase } = authResult;
    const reviewId = params.id;

    const { data, error } = await supabase
      .from('review_bookmarks')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return NextResponse.json({ bookmarked: !!data });
  } catch (error) {
    console.error("[BOOKMARK GET] Error checking bookmark status:", error);
    return NextResponse.json(
      { error: "Failed to check bookmark status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}