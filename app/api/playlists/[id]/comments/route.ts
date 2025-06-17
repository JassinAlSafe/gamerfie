import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  playlist_id: string;
  parent_id?: string | null;
  is_edited?: boolean;
  like_count?: number;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    display_name?: string;
  } | null;
}

interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  total: number;
}

// GET /api/playlists/[id]/comments - Fetch comments for a playlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // First, verify the playlist exists
    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", params.id)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Fetch comments with user data
    const { data: comments, error: commentsError } = await supabase
      .from("playlist_comments")
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
      .eq("playlist_id", params.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("playlist_comments")
      .select("*", { count: "exact", head: true })
      .eq("playlist_id", params.id);

    if (countError) {
      console.error("Error counting comments:", countError);
      return NextResponse.json(
        { error: "Failed to count comments" },
        { status: 500 }
      );
    }

    const totalComments = count || 0;
    const hasMore = offset + limit < totalComments;

    // Transform the response to handle the user relationship
    const transformedComments: Comment[] = (comments || []).map((comment: any) => ({
      ...comment,
      user: Array.isArray(comment.user) ? comment.user[0] : comment.user
    }));

    const response: CommentsResponse = {
      comments: transformedComments,
      hasMore,
      total: totalComments,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /api/playlists/[id]/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/playlists/[id]/comments - Create a new comment
export async function POST(
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

    // Verify the playlist exists
    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", params.id)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Create the comment
    const { data: comment, error: commentError } = await supabase
      .from("playlist_comments")
      .insert({
        content: content.trim(),
        user_id: user.id,
        playlist_id: params.id,
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        playlist_id,
        is_edited,
        user:profiles(
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    // Transform the response to handle the user relationship
    const transformedComment = comment ? {
      ...comment,
      user: Array.isArray(comment.user) ? comment.user[0] : comment.user
    } : null;

    return NextResponse.json({ comment: transformedComment }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/playlists/[id]/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}