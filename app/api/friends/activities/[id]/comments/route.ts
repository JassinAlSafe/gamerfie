import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { content } = await request.json();
    if (!content?.trim()) {
      return new NextResponse("Comment content is required", { status: 400 });
    }

    const { data, error } = await supabase
      .from("activity_comments")
      .insert({
        activity_id: params.id,
        user_id: session.user.id,
        content: content.trim(),
      })
      .select("*, user:profiles(username, avatar_url)")
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 