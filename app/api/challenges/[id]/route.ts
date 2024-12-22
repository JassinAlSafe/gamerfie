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

    const { data: challenge, error } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed
        ),
        rewards:challenge_rewards(*),
        rules:challenge_rules(*),
        tags:challenge_tags(*)
      `)
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(challenge);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is the creator
    const { data: challenge, error: fetchError } = await supabase
      .from("challenges")
      .select("creator_id")
      .eq("id", params.id)
      .single();

    if (fetchError) throw fetchError;

    if (challenge.creator_id !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can update the challenge" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { error: updateError } = await supabase
      .from("challenges")
      .update(json)
      .eq("id", params.id);

    if (updateError) throw updateError;

    // Fetch updated challenge
    const { data: updatedChallenge, error: fetchUpdatedError } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed
        ),
        rewards:challenge_rewards(*),
        rules:challenge_rules(*),
        tags:challenge_tags(*)
      `)
      .eq("id", params.id)
      .single();

    if (fetchUpdatedError) throw fetchUpdatedError;

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error("Failed to update challenge:", error);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is the creator
    const { data: challenge, error: fetchError } = await supabase
      .from("challenges")
      .select("creator_id")
      .eq("id", params.id)
      .single();

    if (fetchError) throw fetchError;

    if (challenge.creator_id !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can delete the challenge" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("challenges")
      .delete()
      .eq("id", params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete challenge:", error);
    return NextResponse.json(
      { error: "Failed to delete challenge" },
      { status: 500 }
    );
  }
} 