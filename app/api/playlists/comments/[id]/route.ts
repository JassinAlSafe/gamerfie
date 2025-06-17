import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// PUT /api/playlists/comments/[id] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { content } = body;

    // Validate input
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Content too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the comment exists and belongs to the user
    const { data: existingComment, error: fetchError } = await supabase
      .from("playlist_comments")
      .select("id, user_id, content")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You can only edit your own comments" },
        { status: 403 }
      );
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await supabase
      .from("playlist_comments")
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
        is_edited: true,
      })
      .eq("id", params.id)
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        playlist_id,
        parent_id,
        is_edited,
        like_count,
        user:profiles(
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .single();

    if (updateError) {
      console.error("Error updating comment:", updateError);
      return NextResponse.json(
        { error: "Failed to update comment" },
        { status: 500 }
      );
    }

    // Transform the response to handle the user relationship
    const transformedComment = updatedComment ? {
      ...updatedComment,
      user: Array.isArray(updatedComment.user) ? updatedComment.user[0] : updatedComment.user
    } : null;

    return NextResponse.json({ comment: transformedComment });
  } catch (error) {
    console.error("Unexpected error in PUT /api/playlists/comments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/comments/[id] - Delete a comment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the comment exists and belongs to the user
    const { data: existingComment, error: fetchError } = await supabase
      .from("playlist_comments")
      .select("id, user_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("playlist_comments")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/playlists/comments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}