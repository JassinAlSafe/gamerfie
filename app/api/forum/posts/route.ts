import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("thread_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Fetch posts for the thread from database
    const offset = (page - 1) * limit;
    const { data: posts, error } = await supabase
      .rpc('get_thread_posts', {
        p_thread_id: threadId,
        p_limit: limit,
        p_offset: offset
      });

    if (error) {
      console.error("Error fetching forum posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    // Increment view count
    await supabase.rpc('increment_thread_views', { thread_uuid: threadId });

    return NextResponse.json({ 
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: posts?.length || 0,
        hasMore: (posts?.length || 0) >= limit,
      }
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { thread_id, content, parent_post_id } = await request.json();

    if (!thread_id || !content) {
      return NextResponse.json(
        { error: "Thread ID and content are required" },
        { status: 400 }
      );
    }

    // Check if thread is locked
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('is_locked')
      .eq('id', thread_id)
      .single();

    if (thread?.is_locked) {
      return NextResponse.json({ error: 'Thread is locked' }, { status: 403 });
    }

    // Ensure user profile exists before creating post
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      const username = user.user_metadata?.username || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'User';
      
      await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          username: username,
          avatar_url: user.user_metadata?.avatar_url || null,
          bio: null
        });
    }

    // Create post in database
    const { data: newPost, error: insertError } = await supabase
      .from('forum_posts')
      .insert({
        thread_id,
        content,
        author_id: user.id,
        parent_post_id: parent_post_id || null
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating forum post:", insertError);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}