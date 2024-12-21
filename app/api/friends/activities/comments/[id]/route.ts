import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase
      .from("activity_comments")
      .delete()
      .match({
        id: params.id,
        user_id: session.user.id,
      });

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 