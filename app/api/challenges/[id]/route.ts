import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching challenge with ID:", params.id);
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Failed to verify authentication", details: sessionError },
        { status: 401 }
      );
    }

    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", session.user.id);

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch user profile", details: profileError },
        { status: 500 }
      );
    }

    if (!profile) {
      console.log("No profile found for user:", session.user.id);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    console.log("User profile found:", profile.id);

    // Try fetching the challenge in steps to identify where the issue might be
    
    // 1. First, get basic challenge info
    const { data: basicChallenge, error: basicError } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", params.id)
      .single();

    if (basicError) {
      console.error("Basic challenge fetch error:", basicError);
      return NextResponse.json(
        { error: "Failed to fetch basic challenge info", details: basicError },
        { status: 500 }
      );
    }

    if (!basicChallenge) {
      console.log("Challenge not found:", params.id);
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    console.log("Basic challenge info found:", {
      id: basicChallenge.id,
      title: basicChallenge.title,
    });

    // 2. Get creator info
    const { data: creator, error: creatorError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", basicChallenge.creator_id)
      .single();

    if (creatorError) {
      console.error("Creator fetch error:", creatorError);
    }

    // 3. Get goals
    const { data: goals, error: goalsError } = await supabase
      .from("challenge_goals")
      .select("id, type, target, description")
      .eq("challenge_id", params.id);

    if (goalsError) {
      console.error("Goals fetch error:", goalsError);
    }

    // 4. Get participants with their profiles
    const { data: participants, error: participantsError } = await supabase
      .from("challenge_participants")
      .select(
        `
        user_id,
        joined_at,
        user:profiles (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("challenge_id", params.id);

    if (participantsError) {
      console.error("Participants fetch error:", participantsError);
    }

    // 5. Get rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("challenge_rewards")
      .select("id, type, name, description")
      .eq("challenge_id", params.id);

    if (rewardsError) {
      console.error("Rewards fetch error:", rewardsError);
    }

    // 6. Get rules
    const { data: rules, error: rulesError } = await supabase
      .from("challenge_rules")
      .select("id, rule")
      .eq("challenge_id", params.id);

    if (rulesError) {
      console.error("Rules fetch error:", rulesError);
    }

    // Combine all the data
    const challenge = {
      ...basicChallenge,
      creator: creator || null,
      goals: goals || [],
      participants: participants || [],
      rewards: rewards || [],
      rules: rules || [],
    };

    console.log("Successfully assembled challenge data:", {
      id: challenge.id,
      title: challenge.title,
      goalsCount: challenge.goals.length,
      participantsCount: challenge.participants.length,
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error },
      { status: 500 }
    );
  }
} 