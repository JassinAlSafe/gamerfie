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
      // Toggle post like
      const { data: existingLike } = await supabase
        .from('forum_post_likes')
        .select()
        .eq('post_id', id)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);

        return NextResponse.json({ liked: false });
      } else {
        // Like
        const { error } = await supabase
          .from('forum_post_likes')
          .insert({ post_id: id, user_id: user.id });

        if (error) {
          console.error("Error creating post like:", error);
          return NextResponse.json(
            { error: "Failed to like post" },
            { status: 500 }
          );
        }

        return NextResponse.json({ liked: true });
      }
    } else if (type === 'thread') {
      // Toggle thread like
      const { data: existingLike } = await supabase
        .from('forum_thread_likes')
        .select()
        .eq('thread_id', id)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('forum_thread_likes')
          .delete()
          .eq('thread_id', id)
          .eq('user_id', user.id);

        return NextResponse.json({ liked: false });
      } else {
        // Like
        const { error } = await supabase
          .from('forum_thread_likes')
          .insert({ thread_id: id, user_id: user.id });

        if (error) {
          console.error("Error creating thread like:", error);
          return NextResponse.json(
            { error: "Failed to like thread" },
            { status: 500 }
          );
        }

        return NextResponse.json({ liked: true });
      }
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