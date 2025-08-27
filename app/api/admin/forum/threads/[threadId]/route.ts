import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { withAuthenticatedUser } from "@/app/api/lib/forum-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  return withAuthenticatedUser(async (auth) => {
    try {
      const { threadId } = params;
      const body = await request.json();
      const { action } = body;

      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (action) {
        case "pin":
          updateData.is_pinned = true;
          break;
        case "unpin":
          updateData.is_pinned = false;
          break;
        case "lock":
          updateData.is_locked = true;
          break;
        case "unlock":
          updateData.is_locked = false;
          break;
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }

      const { data, error } = await auth.supabase
        .from("forum_threads")
        .update(updateData)
        .eq("id", threadId)
        .select()
        .single();

      if (error) {
        console.error("Error updating thread:", error);
        return NextResponse.json(
          { error: "Failed to update thread" },
          { status: 500 }
        );
      }

      return NextResponse.json({ thread: data });
    } catch (error) {
      console.error("Unexpected error updating thread:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  return withAuthenticatedUser(async (auth) => {
    try {
      const { threadId } = params;

      // Delete related posts first
      const { error: postsError } = await auth.supabase
        .from("forum_posts")
        .delete()
        .eq("thread_id", threadId);

      if (postsError) {
        console.error("Error deleting thread posts:", postsError);
        return NextResponse.json(
          { error: "Failed to delete thread posts" },
          { status: 500 }
        );
      }

      // Delete thread likes
      const { error: likesError } = await auth.supabase
        .from("forum_thread_likes")
        .delete()
        .eq("thread_id", threadId);

      if (likesError) {
        console.error("Error deleting thread likes:", likesError);
        // Continue anyway, this is not critical
      }

      // Delete the thread
      const { error } = await auth.supabase
        .from("forum_threads")
        .delete()
        .eq("id", threadId);

      if (error) {
        console.error("Error deleting thread:", error);
        return NextResponse.json(
          { error: "Failed to delete thread" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Unexpected error deleting thread:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}