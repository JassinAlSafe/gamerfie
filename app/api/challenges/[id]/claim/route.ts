import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is a participant and has completed the challenge
    const { data: participant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("completed")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (participantError) {
      console.error("Error checking participant:", participantError);
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

    if (!participant.completed) {
      return NextResponse.json(
        { error: "Challenge not completed" },
        { status: 400 }
      );
    }

    // Check if rewards were already claimed
    const { data: existingClaim, error: claimError } = await supabase
      .from("claimed_rewards")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (claimError && claimError.code !== "PGRST116") {
      console.error("Error checking claimed rewards:", claimError);
      return NextResponse.json(
        { error: "Failed to check claimed rewards" },
        { status: 500 }
      );
    }

    if (existingClaim) {
      return NextResponse.json(
        { error: "Rewards already claimed" },
        { status: 400 }
      );
    }

    // Get challenge rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("challenge_rewards")
      .select("*")
      .eq("challenge_id", params.id);

    if (rewardsError) {
      console.error("Error fetching rewards:", rewardsError);
      return NextResponse.json(
        { error: "Failed to fetch rewards" },
        { status: 500 }
      );
    }

    // Claim rewards
    const claimedRewards = rewards.map((reward) => ({
      user_id: session.user.id,
      challenge_id: params.id,
      reward_id: reward.id,
      claimed_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("claimed_rewards")
      .insert(claimedRewards);

    if (insertError) {
      console.error("Error claiming rewards:", insertError);
      return NextResponse.json(
        { error: "Failed to claim rewards" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Rewards claimed successfully",
      rewards: rewards,
    });
  } catch (error) {
    console.error("Error in claim rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 