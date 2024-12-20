import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { emoji } = await request.json();
    if (!emoji) {
      return new NextResponse("Emoji is required", { status: 400 });
    }

    const { data, error } = await supabase
      .from("activity_reactions")
      .insert({
        activity_id: params.id,
        user_id: session.user.id,
        emoji,
      })
      .select("*, user:profiles(username, avatar_url)")
      .single();

    if (error) {
      if (error.code === "23505") { // Unique violation
        return new NextResponse("Already reacted with this emoji", { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding reaction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { emoji } = await request.json();
    if (!emoji) {
      return new NextResponse("Emoji is required", { status: 400 });
    }

    const { error } = await supabase
      .from("activity_reactions")
      .delete()
      .match({
        activity_id: params.id,
        user_id: session.user.id,
        emoji,
      });

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing reaction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 