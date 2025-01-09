import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Fetch challenge with all related data
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:profiles!creator_id(
          id,
          username,
          avatar_url
        ),
        participants:challenge_participants(
          user:profiles(
            id,
            username,
            avatar_url
          ),
          progress,
          completed,
          joined_at
        ),
        goals:challenge_goals(*),
        rewards:challenge_rewards(
          *,
          badge:badges(*)
        )
      `)
      .eq("id", params.id)
      .single();

    if (challengeError) {
      console.error("Error fetching challenge:", challengeError);
      return NextResponse.json(
        { error: "Failed to fetch challenge" },
        { status: 500 }
      );
    }

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get user's progress for this challenge
    const { data: userProgress, error: progressError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      console.error("Error fetching user progress:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch user progress" },
        { status: 500 }
      );
    }

    // Check if badges are claimed
    const { data: claimedBadges, error: badgesError } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", session.user.id)
      .eq("challenge_id", params.id);

    if (badgesError) {
      console.error("Error fetching claimed badges:", badgesError);
      return NextResponse.json(
        { error: "Failed to fetch claimed badges" },
        { status: 500 }
      );
    }

    // Mark claimed badges
    const claimedBadgeIds = new Set(claimedBadges?.map(b => b.badge_id) || []);
    const rewardsWithClaimStatus = challenge.rewards?.map(reward => ({
      ...reward,
      claimed: claimedBadgeIds.has(reward.badge_id)
        ? [{ user_id: session.user.id, badge_id: reward.badge_id, claimed_at: new Date().toISOString() }]
        : []
    }));

    return NextResponse.json({
      ...challenge,
      rewards: rewardsWithClaimStatus,
      userProgress
    });
  } catch (error) {
    console.error("Error in challenge details:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge details" },
      { status: 500 }
    );
  }
} 