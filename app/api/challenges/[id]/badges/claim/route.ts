import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Badge claim endpoint is working" });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("POST request received:", {
    params,
    url: request.url
  });

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    if (!body.badge_id) {
      return NextResponse.json(
        { error: "Badge ID is required" },
        { status: 400 }
      );
    }

    // Check if already claimed
    const { data: existingClaim, error: claimCheckError } = await supabase
      .from("user_badges")
      .select()
      .eq("user_id", session.user.id)
      .eq("badge_id", body.badge_id)
      .eq("challenge_id", params.id)
      .single();

    if (claimCheckError && claimCheckError.code !== 'PGRST116') {
      console.error("Error checking existing claim:", claimCheckError);
      return NextResponse.json(
        { error: "Failed to check badge claim status" },
        { status: 500 }
      );
    }

    if (existingClaim) {
      return NextResponse.json(
        { error: "Badge already claimed" },
        { status: 409 }
      );
    }

    // Insert the claim
    const { error: claimError } = await supabase
      .from("user_badges")
      .insert({
        user_id: session.user.id,
        badge_id: body.badge_id,
        challenge_id: params.id,
      });

    if (claimError) {
      console.error("Error claiming badge:", claimError);
      return NextResponse.json(
        { error: claimError.message || "Failed to claim badge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Badge claimed successfully"
    });
  } catch (error) {
    console.error("Error in badge claim:", error);
    return NextResponse.json(
      { error: "Failed to claim badge" },
      { status: 500 }
    );
  }
} 