import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const awardBadgeSchema = z.object({
  user_id: z.string().uuid(),
  badge_id: z.string().uuid(),
  challenge_id: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user's session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's badges with badge details and challenge info
    const { data: userBadges, error } = await supabase
      .from("user_badge_claims")
      .select(`
        claimed_at,
        badge:badge_id (*),
        challenge:challenge_id (
          id,
          title
        )
      `)
      .eq("user_id", user.id)
      .order("claimed_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(userBadges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch user badges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!adminCheck) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = awardBadgeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { user_id, badge_id, challenge_id } = validation.data;

    // Check if badge was already awarded to this user
    const { data: existingClaim } = await supabase
      .from("user_badge_claims")
      .select("id")
      .eq("user_id", user_id)
      .eq("badge_id", badge_id)
      .single();

    if (existingClaim) {
      return NextResponse.json(
        { error: "Badge already awarded to this user" },
        { status: 409 }
      );
    }

    // Award the badge
    const { data: newClaim, error } = await supabase
      .from("user_badge_claims")
      .insert({
        user_id,
        badge_id,
        challenge_id,
        claimed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    console.error("Error awarding badge:", error);
    return NextResponse.json(
      { error: "Failed to award badge" },
      { status: 500 }
    );
  }
} 