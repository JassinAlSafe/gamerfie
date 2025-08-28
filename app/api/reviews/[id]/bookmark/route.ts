import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthResult } from "@/app/api/lib/auth";
import { validateReviewId } from "@/lib/validations/review";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest();
    if (!isAuthResult(authResult)) {
      return authResult; // Return the error response
    }

    // Validate review ID
    const reviewIdValidation = validateReviewId(params.id);
    if (!reviewIdValidation.success) {
      return NextResponse.json(
        { error: reviewIdValidation.error },
        { status: 400 }
      );
    }

    const { supabase } = authResult;
    const reviewId = reviewIdValidation.data;

    // Use direct database queries instead of RPC to avoid auth context issues
    const { user } = authResult;
    
    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from('review_bookmarks')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let bookmarked: boolean;
    
    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('review_bookmarks')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      bookmarked = false;
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('review_bookmarks')
        .insert({ review_id: reviewId, user_id: user.id });
      
      if (insertError) throw insertError;
      bookmarked = true;
    }

    // Get updated count
    const { count, error: countError } = await supabase
      .from('review_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    if (countError) throw countError;
    
    return NextResponse.json({
      bookmarked,
      count: count || 0,
      message: bookmarked ? "Review bookmarked" : "Bookmark removed"
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

    // Validate review ID
    const reviewIdValidation = validateReviewId(params.id);
    if (!reviewIdValidation.success) {
      return NextResponse.json(
        { error: reviewIdValidation.error },
        { status: 400 }
      );
    }

    const { user, supabase } = authResult;
    const reviewId = reviewIdValidation.data;

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