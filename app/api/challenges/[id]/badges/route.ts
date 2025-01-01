import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";


const assignBadgeSchema = z.object({
  badge_id: z.string().uuid(),
});

const claimBadgeSchema = z.object({
  badge_id: z.string().uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get challenge badges with badge details
    const { data: badges, error } = await supabase
      .from("challenge_badges")
      .select(`
        badge:badge_id (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq("challenge_id", params.id);

    if (error) throw error;

    return NextResponse.json(badges.map(b => b.badge));
  } catch (error) {
    console.error("Error fetching challenge badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge badges" },
      { status: 500 }
    );
  }
}

// Assign a badge to a challenge (challenge creator only)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Validate request body
    const body = await request.json();
    const { badge_id } = assignBadgeSchema.parse(body);

    // Insert the badge assignment
    const { error } = await supabase
      .from("challenge_badges")
      .insert({
        challenge_id: params.id,
        badge_id,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning badge to challenge:", error);
    return NextResponse.json(
      { error: "Failed to assign badge to challenge" },
      { status: 500 }
    );
  }
}

// Claim a badge (for challenge participants)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { badge_id } = claimBadgeSchema.parse(body);

    // Check if user can claim the badge
    const { data: canClaim, error: checkError } = await supabase
      .rpc("can_claim_badge", {
        p_user_id: session.user.id,
        p_badge_id: badge_id,
        p_challenge_id: params.id,
      });

    if (checkError) throw checkError;

    if (!canClaim) {
      return NextResponse.json(
        { error: "Cannot claim this badge" },
        { status: 400 }
      );
    }

    // Claim the badge
    const { error: claimError } = await supabase
      .from("user_badge_claims")
      .insert({
        user_id: session.user.id,
        badge_id,
        challenge_id: params.id,
      });

    if (claimError) throw claimError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error claiming badge:", error);
    return NextResponse.json(
      { error: "Failed to claim badge" },
      { status: 500 }
    );
  }
} 