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
    
    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let liked: boolean;
    
    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      liked = false;
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from('review_likes')
        .insert({ review_id: reviewId, user_id: user.id });
      
      if (insertError) throw insertError;
      liked = true;
    }

    // Get updated count
    const { count, error: countError } = await supabase
      .from('review_likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    if (countError) throw countError;
    
    return NextResponse.json({
      liked,
      count: count || 0,
      message: liked ? "Review liked" : "Like removed"
    });
  } catch (error) {
    console.error("[LIKE POST] Error toggling like:", error);
    
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
    const authResult = await authenticateRequest();
    if (!isAuthResult(authResult)) {
      return NextResponse.json({ liked: false }); // Return false if not authenticated
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
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return NextResponse.json({ liked: !!data });
  } catch (error) {
    console.error("[LIKE GET] Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}