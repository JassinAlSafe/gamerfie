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
    
    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Validate request
    const body = await request.json();
    const { badgeId, challengeId } = claimBadgeSchema.parse(body);

    // Check eligibility
    const { data: challenge } = await supabase
      .from("challenges")
      .select(`
        *,
        participants:challenge_participants(
          progress,
          completed
        )
      `)
      .eq("id", challengeId)
      .single();

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const userParticipation = challenge.participants?.find(
      p => p.user_id === session.user.id
    );

    if (!userParticipation?.completed) {
      return NextResponse.json(
        { error: "Challenge must be completed to claim badge" },
        { status: 403 }
      );
    }

    // Check for existing claim (idempotency)
    const { data: existingClaim } = await supabase
      .from("user_badges")
      .select()
      .match({
        user_id: session.user.id,
        badge_id: badgeId,
        challenge_id: challengeId,
      })
      .single();

    if (existingClaim) {
      return NextResponse.json({ 
        success: true,
        message: "Badge already claimed" 
      });
    }

    // Claim badge
    const { error: claimError } = await supabase
      .from("user_badges")
      .insert({
        user_id: session.user.id,
        badge_id: badgeId,
        challenge_id: challengeId,
      });

    if (claimError) throw claimError;

    return NextResponse.json({ 
      success: true,
      message: "Badge claimed successfully" 
    });

  } catch (error) {
    console.error("Error claiming badge:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to claim badge",
        details: error 
      },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
} 