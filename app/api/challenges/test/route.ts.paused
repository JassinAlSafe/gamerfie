import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function POST() {
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

    console.log("Creating test badge...");
    // Create a test badge
    const { data: badge, error: badgeError } = await supabase
      .from("badges")
      .insert({
        name: "Test Achievement",
        description: "Badge for completing the test challenge",
        icon_url: "/badges/test-badge.svg"
      })
      .select()
      .single();

    if (badgeError) {
      console.error("Badge creation error:", badgeError);
      return NextResponse.json(
        { error: "Failed to create badge: " + badgeError.message },
        { status: 500 }
      );
    }

    console.log("Creating test challenge...");
    // Create a test challenge
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert({
        title: "Test Challenge",
        description: "A test challenge to try out the badge system",
        type: "competitive",
        status: "active",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        min_participants: 1,
        max_participants: null,
        creator_id: session.user.id
      })
      .select()
      .single();

    if (challengeError) {
      console.error("Challenge creation error:", challengeError);
      return NextResponse.json(
        { error: "Failed to create challenge: " + challengeError.message },
        { status: 500 }
      );
    }

    console.log("Adding test goal...");
    // Add a test goal
    const { error: goalError } = await supabase
      .from("challenge_goals")
      .insert({
        challenge_id: challenge.id,
        type: "play_time",
        target: 1,
        description: "Play for 1 hour"
      });

    if (goalError) {
      console.error("Goal creation error:", goalError);
      return NextResponse.json(
        { error: "Failed to create goal: " + goalError.message },
        { status: 500 }
      );
    }

    console.log("Adding badge reward...");
    // Add the badge as a reward
    const { error: rewardError } = await supabase
      .from("challenge_rewards")
      .insert({
        challenge_id: challenge.id,
        type: "badge",
        name: badge.name,
        description: badge.description,
        badge_id: badge.id
      });

    if (rewardError) {
      console.error("Reward creation error:", rewardError);
      return NextResponse.json(
        { error: "Failed to create reward: " + rewardError.message },
        { status: 500 }
      );
    }

    console.log("Linking badge to challenge...");
    // Link badge to challenge
    const { error: linkError } = await supabase
      .from("challenge_badges")
      .insert({
        challenge_id: challenge.id,
        badge_id: badge.id
      });

    if (linkError) {
      console.error("Badge linking error:", linkError);
      return NextResponse.json(
        { error: "Failed to link badge: " + linkError.message },
        { status: 500 }
      );
    }

    console.log("Joining challenge...");
    // Join the challenge
    const { error: joinError } = await supabase
      .from("challenge_participants")
      .insert({
        challenge_id: challenge.id,
        user_id: session.user.id,
        progress: 0
      });

    if (joinError) {
      console.error("Join challenge error:", joinError);
      return NextResponse.json(
        { error: "Failed to join challenge: " + joinError.message },
        { status: 500 }
      );
    }

    console.log("Test challenge created successfully!");
    return NextResponse.json({
      success: true,
      challenge_id: challenge.id,
      badge_id: badge.id
    });
  } catch (error) {
    console.error("Unexpected error creating test challenge:", error);
    return NextResponse.json(
      { error: "Unexpected error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 