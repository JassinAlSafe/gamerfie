import { NextResponse } from "next/server";
import { withParticipantAuth } from "../../middleware";

interface RouteParams {
  params: {
    id: string;
  };
}

type HandlerContext = {
  supabase: any;
  session: {
    user: {
      id: string;
    };
  };
  participant: any;
};

export const POST = withParticipantAuth(async (
  request: Request,
  { params }: RouteParams,
  { supabase, session }: HandlerContext
) => {
  try {
    // Leave the challenge
    const { error: leaveError } = await supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (leaveError) {
      console.error("Error leaving challenge:", leaveError);
      return NextResponse.json(
        { error: "Failed to leave challenge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Successfully left challenge" });
  } catch (error) {
    console.error("Failed to leave challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 