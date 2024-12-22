import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("status, max_participants")
      .eq("id", params.id)
      .single();

    if (challengeError) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.status !== "upcoming" && challenge.status !== "active") {
      return NextResponse.json(
        { error: "Challenge is not open for joining" },
        { status: 400 }
      );
    }

    // Check if max participants limit is reached
    if (challenge.max_participants) {
      const { count, error: countError } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact" })
        .eq("challenge_id", params.id);

      if (countError) throw countError;

      if (count && count >= challenge.max_participants) {
        return NextResponse.json(
          { error: "Challenge has reached maximum participants" },
          { status: 400 }
        );
      }
    }

    // Check if user is already a participant
    const { data: existing, error: existingError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json(
        { error: "Already joined this challenge" },
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
      });

    if (joinError) throw joinError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to join challenge:", error);
    return NextResponse.json(
      { error: "Failed to join challenge" },
      { status: 500 }
    );
  }
} 