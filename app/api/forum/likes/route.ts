import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { type, id } = await request.json(); // type: 'post' | 'thread'

    if (!type || !id) {
      return NextResponse.json(
        { error: "Type and ID are required" },
        { status: 400 }
      );
    }

    if (type === 'post') {
      // Use the database function to toggle post like
      const { data, error } = await supabase.rpc('toggle_post_like', {
        p_post_id: id
      });

      if (error) {
        console.error("Error toggling post like:", error);
        return NextResponse.json(
          { error: "Failed to like post" },
          { status: 500 }
        );
      }

      // Check if the function returned success
      if (!data?.success) {
        return NextResponse.json(
          { error: data?.message || "Failed to like post" },
          { status: 500 }
        );
      }

      // Return only the needed fields for the frontend
      return NextResponse.json({
        liked: data.liked,
        likes_count: data.likes_count
      });
    } else if (type === 'thread') {
      // Use the database function to toggle thread like
      const { data, error } = await supabase.rpc('toggle_thread_like', {
        p_thread_id: id
      });

      if (error) {
        console.error("Error toggling thread like:", error);
        return NextResponse.json(
          { error: "Failed to like thread" },
          { status: 500 }
        );
      }

      // Check if the function returned success
      if (!data?.success) {
        return NextResponse.json(
          { error: data?.message || "Failed to like thread" },
          { status: 500 }
        );
      }

      // Return only the needed fields for the frontend
      return NextResponse.json({
        liked: data.liked,
        likes_count: data.likes_count
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error("Error handling like:", error);
    return NextResponse.json(
      { error: "Failed to handle like" },
      { status: 500 }
    );
  }
}