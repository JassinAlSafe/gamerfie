import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (categoryId) {
      // Get threads for specific category
      const offset = (page - 1) * limit;
      const { data: threads, error } = await supabase
        .rpc('get_category_threads', {
          p_category_id: categoryId,
          p_limit: limit,
          p_offset: offset
        });

      if (error) {
        console.error("Error fetching category threads:", error);
        return NextResponse.json(
          { error: "Failed to fetch threads" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        threads: threads || [],
        pagination: {
          page,
          limit,
          total: threads?.length || 0,
          hasMore: (threads?.length || 0) >= limit,
        }
      });
    } else {
      // Get all threads with details
      const offset = (page - 1) * limit;
      const { data: threads, error } = await supabase
        .from('forum_threads_with_details')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching threads:", error);
        return NextResponse.json(
          { error: "Failed to fetch threads" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        threads: threads || [],
        pagination: {
          page,
          limit,
          total: threads?.length || 0,
          hasMore: (threads?.length || 0) >= limit,
        }
      });
    }
  } catch (error) {
    console.error("Error fetching forum threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
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

    const { category_id, title, content } = await request.json();

    if (!category_id || !title || !content) {
      return NextResponse.json(
        { error: "Category ID, title, and content are required" },
        { status: 400 }
      );
    }

    // Ensure user profile exists before creating thread
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

    // Create thread in database
    const { data: newThread, error: insertError } = await supabase
      .from('forum_threads')
      .insert({
        category_id,
        title,
        content,
        author_id: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating forum thread:", insertError);
      return NextResponse.json(
        { error: "Failed to create thread" },
        { status: 500 }
      );
    }

    return NextResponse.json({ thread: newThread }, { status: 201 });
  } catch (error) {
    console.error("Error creating forum thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}