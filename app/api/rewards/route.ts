import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Get all claimed rewards with challenge and reward details
    const { data: rewards, error } = await supabase
      .from("claimed_rewards")
      .select(`
        *,
        challenge:challenge_id(
          title
        ),
        reward:reward_id(
          name,
          description,
          type
        )
      `)
      .eq("user_id", session.user.id)
      .order("claimed_at", { ascending: false });

    if (error) {
      console.error("Error fetching rewards:", error);
      return NextResponse.json(
        { error: "Failed to fetch rewards" },
        { status: 500 }
      );
    }

    // Transform the data to match the ClaimedReward type
    const formattedRewards = rewards.map((claim) => ({
      id: claim.reward_id,
      name: claim.reward.name,
      description: claim.reward.description,
      type: claim.reward.type,
      challenge_id: claim.challenge_id,
      challenge_title: claim.challenge.title,
      claimed_at: claim.claimed_at,
    }));

    return NextResponse.json(formattedRewards);
  } catch (error) {
    console.error("Error in rewards fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 