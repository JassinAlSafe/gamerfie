import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const claimBadgeSchema = z.object({
  badgeId: z.string().uuid(),
  challengeId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { badgeId, challengeId } = claimBadgeSchema.parse(body);

    // Check if the badge exists and is assigned to the challenge
    const { data: reward, error: rewardError } = await supabase
      .from("challenge_rewards")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("badge_id", badgeId)
      .eq("type", "badge")
      .single();

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: "Badge not found or not assigned to this challenge" },
        { status: 404 }
      );
    }

    // Check if the user has completed the challenge
    const { data: participant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("completed")
      .eq("challenge_id", challengeId)
      .eq("user_id", session.user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "You are not a participant in this challenge" },
        { status: 403 }
      );
    }

    if (!participant.completed) {
      return NextResponse.json(
        { error: "You must complete the challenge before claiming the badge" },
        { status: 403 }
      );
    }

    // Check if the badge is already claimed
    const { data: existingClaim } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("badge_id", badgeId)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (existingClaim) {
      // If already claimed, return success
      return NextResponse.json({ success: true });
    }

    // Claim the badge
    const { error: insertError } = await supabase
      .from("user_badges")
      .upsert({
        user_id: session.user.id,
        badge_id: badgeId,
        challenge_id: challengeId,
      });

    if (insertError) {
      console.error("Error claiming badge:", insertError);
      return NextResponse.json(
        { error: "Failed to claim badge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error claiming badge:", error);
    return NextResponse.json(
      { error: "Failed to claim badge" },
      { status: 500 }
    );
  }
} 