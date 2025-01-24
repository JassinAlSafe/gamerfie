import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "../../middleware";

interface RouteParams {
  params: {
    id: string;
  };
}

type HandlerContext = {
  supabase: any;
  session: {
    user: {
      id: string;
    };
  };
};

async function handler(
  request: NextRequest,
  { params }: RouteParams,
  { supabase, session }: HandlerContext
): Promise<NextResponse> {
  try {
    // Check if user is already a participant
    const { data: existingParticipant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (participantError && participantError.code !== "PGRST116") {
      console.error("Error checking participant:", participantError);
      return NextResponse.json(
        { error: "Failed to check participant status" },
        { status: 500 }
      );
    }

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Already participating in this challenge" },
        { status: 400 }
      );
    }

    // Get challenge details to check max participants
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("max_participants, participants:challenge_participants(count), status")
      .eq("id", params.id)
      .single();

    if (challengeError) {
      console.error("Error fetching challenge:", challengeError);
      return NextResponse.json(
        { error: "Failed to fetch challenge details" },
        { status: 500 }
      );
    }

    // Check if challenge is in a joinable state
    if (challenge.status !== "upcoming" && challenge.status !== "active") {
      return NextResponse.json(
        { error: "This challenge is not open for joining" },
        { status: 400 }
      );
    }

    // Check if challenge is full
    if (
      challenge.max_participants &&
      challenge.participants[0].count >= challenge.max_participants
    ) {
      return NextResponse.json(
        { error: "Challenge is full" },
        { status: 400 }
      );
    }

    // Join the challenge
    const { error: joinError } = await supabase
      .from("challenge_participants")
      .insert({
        challenge_id: params.id,
        user_id: session.user.id,
        progress: 0,
        completed: false,
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (joinError) {
      console.error("Error joining challenge:", joinError);
      return NextResponse.json(
        { error: "Failed to join challenge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Successfully joined challenge" });
  } catch (error) {
    console.error("Error in join challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler); 