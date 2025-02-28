import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: session, error: authError } = await supabase.auth.getSession();
    if (authError || !session.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: goals, error } = await supabase
      .from("challenge_goals")
      .select(`
        *,
        progress:challenge_participant_progress(progress)
      `)
      .eq("challenge_id", params.id)
      .eq("challenge_participant_progress.participant_id", session.session.user.id);

    if (error) {
      console.error("Error fetching goals:", error);
      return NextResponse.json(
        { error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error in goals route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: session, error: authError } = await supabase.auth.getSession();
    if (authError || !session.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, target, description } = body;

    // Verify user is challenge creator
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("creator_id")
      .eq("id", params.id)
      .single();

    if (challengeError || challenge.creator_id !== session.session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to add goals" },
        { status: 403 }
      );
    }

    const { data: goal, error } = await supabase
      .from("challenge_goals")
      .insert({
        challenge_id: params.id,
        type,
        target,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating goal:", error);
      return NextResponse.json(
        { error: "Failed to create goal" },
        { status: 500 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error in goals route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  _params: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: session, error: authError } = await supabase.auth.getSession();
    if (authError || !session.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { goalId, progress } = body;

    // Update or create progress record
    const { error } = await supabase
      .from("challenge_participant_progress")
      .upsert({
        participant_id: session.session.user.id,
        goal_id: goalId,
        progress,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "participant_id,goal_id",
      });

    if (error) {
      console.error("Error updating progress:", error);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in goals route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 