import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (participantError) throw participantError;

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this challenge" },
        { status: 400 }
      );
    }

    // Leave the challenge
    const { error: leaveError } = await supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (leaveError) throw leaveError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to leave challenge:", error);
    return NextResponse.json(
      { error: "Failed to leave challenge" },
      { status: 500 }
    );
  }
} 