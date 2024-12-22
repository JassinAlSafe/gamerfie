import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if challenge is active
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("status")
      .eq("id", params.id)
      .single();

    if (challengeError) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.status !== "active") {
      return NextResponse.json(
        { error: "Challenge is not active" },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (participantError) throw participantError;

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this challenge" },
        { status: 400 }
      );
    }

    const json = await request.json();
    const progress = json.progress;

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: "Invalid progress value" },
        { status: 400 }
      );
    }

    // Update progress
    const { error: updateError } = await supabase
      .from("challenge_participants")
      .update({
        progress,
        completed: progress >= 100,
        updated_at: new Date().toISOString(),
      })
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
} 