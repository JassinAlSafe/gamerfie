import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
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

    console.log("Fetching challenges for user:", session.user.id);

    // First get the challenge participants
    const { data: participations, error: participationsError } = await supabase
      .from("challenge_participants")
      .select("challenge_id")
      .eq("user_id", session.user.id);

    if (participationsError) {
      console.error("Error fetching participations:", participationsError);
      return NextResponse.json(
        { error: "Failed to fetch participations", details: participationsError },
        { status: 500 }
      );
    }

    if (!participations || participations.length === 0) {
      console.log("No participations found");
      return NextResponse.json([]);
    }

    console.log("Found participations:", participations);

    // Then get the challenges with all related data
    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select(`
        id,
        title,
        description,
        type,
        status,
        start_date,
        end_date,
        goal_type,
        goal_target,
        min_participants,
        max_participants,
        created_at,
        updated_at,
        creator:creator_id (
          id,
          username,
          avatar_url
        ),
        participants:challenge_participants (
          user:profiles (
            id,
            username,
            avatar_url
          ),
          joined_at,
          progress,
          completed
        ),
        rewards:challenge_rewards (
          id,
          type,
          name,
          description
        ),
        rules:challenge_rules (
          id,
          rule
        )
      `)
      .in("id", participations.map(p => p.challenge_id));

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError);
      return NextResponse.json(
        { error: "Failed to fetch challenges", details: challengesError },
        { status: 500 }
      );
    }

    console.log("Successfully fetched challenges:", challenges?.length || 0);

    return NextResponse.json(challenges || []);
  } catch (error) {
    console.error("Error in GET /api/challenges/user:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 