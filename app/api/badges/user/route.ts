import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const awardBadgeSchema = z.object({
  user_id: z.string().uuid(),
  badge_id: z.string().uuid(),
  challenge_id: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's badges with badge details and challenge info
    const { data: userBadges, error } = await supabase
      .from("user_badges")
      .select(`
        awarded_at,
        badge:badge_id (*),
        challenge:awarded_from_challenge_id (
          id,
          title
        )
      `)
      .eq("user_id", session.user.id)
      .order("awarded_at", { ascending: false });

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
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = awardBadgeSchema.parse(body);

    // Use the award_badge_to_user function
    const { data, error } = await supabase.rpc(
      "award_badge_to_user",
      {
        p_user_id: validatedData.user_id,
        p_badge_id: validatedData.badge_id,
        p_challenge_id: validatedData.challenge_id,
      }
    );

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "User already has this badge" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Error awarding badge:", error);
    return NextResponse.json(
      { error: "Failed to award badge" },
      { status: 500 }
    );
  }
} 