import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Mock data for now - will be replaced with actual database queries
    const mockThreads = [
      {
        id: "thread-1",
        category_id: categoryId || "general",
        title: "What's your favorite game of 2024?",
        content: "I'm curious to hear what games have stood out to you this year. For me, it's been Baldur's Gate 3 - the depth of storytelling is incredible!",
        author_id: "user-1",
        author: {
          id: "user-1",
          username: "GameMaster2024",
          avatar_url: null,
        },
        is_pinned: false,
        is_locked: false,
        views_count: 156,
        replies_count: 23,
        likes_count: 45,
        last_post_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updated_at: new Date().toISOString(),
      },
      {
        id: "thread-2",
        category_id: categoryId || "general",
        title: "Looking for co-op game recommendations",
        content: "My friend and I are looking for good co-op games to play together. We've already played It Takes Two and Portal 2. Any suggestions?",
        author_id: "user-2",
        author: {
          id: "user-2",
          username: "CoopGamer",
          avatar_url: null,
        },
        is_pinned: true,
        is_locked: false,
        views_count: 89,
        replies_count: 15,
        likes_count: 22,
        last_post_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    const filteredThreads = categoryId 
      ? mockThreads.filter(thread => thread.category_id === categoryId)
      : mockThreads;

    return NextResponse.json({ 
      threads: filteredThreads,
      pagination: {
        page,
        limit,
        total: filteredThreads.length,
        hasMore: false,
      }
    });
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

    // TODO: Implement actual database creation
    // For now, return success response
    const newThread = {
      id: `thread-${Date.now()}`,
      category_id,
      title,
      content,
      author_id: user.id,
      author: {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || "Unknown",
        avatar_url: user.user_metadata?.avatar_url || null,
      },
      is_pinned: false,
      is_locked: false,
      views_count: 1,
      replies_count: 0,
      likes_count: 0,
      last_post_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ thread: newThread }, { status: 201 });
  } catch (error) {
    console.error("Error creating forum thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}