import { NextRequest, NextResponse } from "next/server";
import { withAuthenticatedUser } from "@/app/api/lib/forum-helpers";

export async function PATCH(request: NextRequest) {
  return withAuthenticatedUser(async (auth) => {
    try {
      const body = await request.json();
      const { threadIds, action } = body;

      if (!Array.isArray(threadIds) || threadIds.length === 0) {
        return NextResponse.json(
          { error: "Thread IDs array is required" },
          { status: 400 }
        );
      }

      const updateData: any = {
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
        case "delete":
          // Handle delete separately
          return handleBulkDelete(auth, threadIds);
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }

      const { data, error } = await auth.supabase
        .from("forum_threads")
        .update(updateData)
        .in("id", threadIds)
        .select();

      if (error) {
        console.error("Error bulk updating threads:", error);
        return NextResponse.json(
          { error: "Failed to update threads" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        updatedCount: data.length 
      });
    } catch (error) {
      console.error("Unexpected error bulk updating threads:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

async function handleBulkDelete(auth: any, threadIds: string[]) {
  try {
    // Delete related posts first
    const { error: postsError } = await auth.supabase
      .from("forum_posts")
      .delete()
      .in("thread_id", threadIds);

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
      .in("thread_id", threadIds);

    if (likesError) {
      console.error("Error deleting thread likes:", likesError);
      // Continue anyway, this is not critical
    }

    // Delete the threads
    const { error } = await auth.supabase
      .from("forum_threads")
      .delete()
      .in("id", threadIds);

    if (error) {
      console.error("Error bulk deleting threads:", error);
      return NextResponse.json(
        { error: "Failed to delete threads" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: threadIds.length 
    });
  } catch (error) {
    console.error("Unexpected error bulk deleting threads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}