import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get all participants with their progress
    const { data: participants, error: participantsError } = await supabase
      .from("challenge_participants")
      .select(`
        user_id,
        progress,
        completed,
        user:profiles!inner(
          username,
          avatar_url
        )
      `)
      .eq("challenge_id", params.id)
      .order("progress", { ascending: false });

    if (participantsError) {
      return NextResponse.json(
        { error: "Failed to fetch participants", details: participantsError },
        { status: 500 }
      );
    }

    // Transform and rank participants
    const rankings = participants.map((participant, index) => ({
      rank: index + 1,
      user_id: participant.user_id,
      username: participant.user.username,
      avatar_url: participant.user.avatar_url,
      progress: participant.progress,
      completed: participant.completed,
    }));

    return NextResponse.json({
      challenge_id: params.id,
      rankings,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 