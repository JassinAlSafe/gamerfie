import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function POST(
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

    const json = await request.json();
    const { progress } = json;

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: "Invalid progress value" },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (participantError) {
      console.error("Error checking participant:", participantError);
      return NextResponse.json(
        { error: "Failed to check participant status" },
        { status: 500 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this challenge" },
        { status: 403 }
      );
    }

    // Update progress
    const { error: updateError } = await supabase
      .from("challenge_participants")
      .update({
        progress,
        completed: progress === 100,
        updated_at: new Date().toISOString(),
      })
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating progress:", updateError);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("Error in progress update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 