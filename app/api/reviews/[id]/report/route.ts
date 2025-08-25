import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthResult } from "@/app/api/lib/auth";
import { validateReviewId, validateReportReview } from "@/lib/validations/review";

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    
    // Validate request body with Zod
    const validation = validateReportReview(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid report data", details: validation.error },
        { status: 400 }
      );
    }
    
    const { user, supabase } = authResult;
    const reviewId = reviewIdValidation.data;
    const { reason, description } = validation.data;

    // Check if already reported
    const { data: existingReport, error: checkError } = await supabase
      .from("review_reports")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing report:", checkError);
      return NextResponse.json(
        { error: "Failed to check report status" },
        { status: 500 }
      );
    }

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this review" },
        { status: 409 }
      );
    }

    // Add report
    const { error: insertError } = await supabase
      .from("review_reports")
      .insert({
        review_id: reviewId,
        user_id: user.id,
        reason: reason,
        description: description,
        status: "pending",
      });

    if (insertError) {
      console.error("Error adding report:", insertError);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Report submitted successfully. Thank you for helping keep our community safe." 
    });
  } catch (error) {
    console.error("Unexpected error in report route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}