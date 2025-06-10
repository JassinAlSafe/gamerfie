import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

// Direct implementation instead of using withParticipantAuth middleware
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (participantError) {
      return NextResponse.json(
        { error: "Failed to check participant status" },
        { status: 500 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this challenge" },
        { status: 403 }
      );
    }

    // Leave the challenge
    const { error: leaveError } = await supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (leaveError) {
      console.error("Error leaving challenge:", leaveError);
      return NextResponse.json(
        { error: "Failed to leave challenge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Successfully left challenge" });
  } catch (error) {
    console.error("Failed to leave challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 