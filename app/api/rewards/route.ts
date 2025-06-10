import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get all claimed badges with challenge and badge details
    const { data: claimedBadges, error } = await supabase
      .from("user_badge_claims")
      .select(`
        *,
        challenge:challenge_id(
          title
        ),
        badge:badge_id(
          name,
          description,
          type,
          rarity
        )
      `)
      .eq("user_id", user.id)
      .order("claimed_at", { ascending: false });

    if (error) {
      console.error("Error fetching claimed badges:", error);
      return NextResponse.json(
        { error: "Failed to fetch claimed badges" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const formattedRewards = claimedBadges.map((claim) => ({
      id: claim.badge_id,
      name: claim.badge?.name,
      description: claim.badge?.description,
      type: claim.badge?.type,
      rarity: claim.badge?.rarity,
      challenge_id: claim.challenge_id,
      challenge_title: claim.challenge?.title,
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