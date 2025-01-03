import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const assignBadgeSchema = z.object({
  badge_id: z.string().uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get challenge badges with badge details through challenge_rewards
    const { data: rewards, error } = await supabase
      .from("challenge_rewards")
      .select(`
        badge_id,
        badge:badge_id (
          id,
          name,
          description,
          icon_url,
          type,
          rarity
        )
      `)
      .eq("challenge_id", params.id)
      .eq("type", "badge");

    if (error) throw error;

    // Map the results to return only the badge details
    const badges = rewards
      .filter(reward => reward.badge !== null)
      .map(reward => reward.badge);

    return NextResponse.json(badges);
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

    // Get the badge details first
    const { data: badge, error: badgeError } = await supabase
      .from("badges")
      .select("name, description")
      .eq("id", badge_id)
      .single();

    if (badgeError) throw badgeError;

    // Insert the badge as a reward
    const { error } = await supabase
      .from("challenge_rewards")
      .insert({
        challenge_id: params.id,
        type: "badge",
        badge_id,
        name: badge.name,
        description: badge.description
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