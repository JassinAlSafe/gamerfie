import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if challenge exists
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("type")
      .eq("id", params.id)
      .single();

    if (challengeError) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get participants ordered by progress
    const { data: participants, error: participantsError } = await supabase
      .from("challenge_participants")
      .select(`
        user:user_id(id, username, avatar_url),
        progress,
        completed,
        updated_at
      `)
      .eq("challenge_id", params.id)
      .order("progress", { ascending: false })
      .order("updated_at", { ascending: true });

    if (participantsError) throw participantsError;

    // Format leaderboard data
    const rankings = participants?.map((p, index) => ({
      rank: index + 1,
      user_id: p.user.id,
      username: p.user.username,
      avatar_url: p.user.avatar_url,
      progress: p.progress,
      completed: p.completed,
      last_updated: p.updated_at,
    })) || [];

    return NextResponse.json({
      challenge_id: params.id,
      challenge_type: challenge.type,
      rankings,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
} 