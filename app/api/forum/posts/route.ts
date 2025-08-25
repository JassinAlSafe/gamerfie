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

    // Mock data for now - will be replaced with actual database queries
    const mockPosts = [
      {
        id: "post-1",
        thread_id: threadId,
        content: "Great question! I've been absolutely loving Tears of the Kingdom. The building mechanics add so much creativity to exploration.",
        author_id: "user-3",
        author: {
          id: "user-3",
          username: "ZeldaFan",
          avatar_url: null,
        },
        likes_count: 12,
        is_liked: false,
        parent_post_id: null,
        replies: [],
        created_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        updated_at: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        id: "post-2",
        thread_id: threadId,
        content: "I have to agree with ZeldaFan! But I'm also really enjoying Hogwarts Legacy. The magic system is so well done.",
        author_id: "user-4",
        author: {
          id: "user-4",
          username: "WizardGamer",
          avatar_url: null,
        },
        likes_count: 8,
        is_liked: false,
        parent_post_id: null,
        replies: [
          {
            id: "post-3",
            thread_id: threadId,
            content: "Yes! The spell combinations in Hogwarts Legacy are amazing. Have you tried the Room of Requirement yet?",
            author_id: "user-5",
            author: {
              id: "user-5",
              username: "HogwartsFan",
              avatar_url: null,
            },
            likes_count: 3,
            is_liked: false,
            parent_post_id: "post-2",
            created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            updated_at: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
        created_at: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
        updated_at: new Date(Date.now() - 2400000).toISOString(),
      },
    ];

    return NextResponse.json({ 
      posts: mockPosts,
      pagination: {
        page,
        limit,
        total: mockPosts.length,
        hasMore: false,
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

    // TODO: Implement actual database creation
    // For now, return success response
    const newPost = {
      id: `post-${Date.now()}`,
      thread_id,
      content,
      author_id: user.id,
      author: {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || "Unknown",
        avatar_url: user.user_metadata?.avatar_url || null,
      },
      likes_count: 0,
      is_liked: false,
      parent_post_id: parent_post_id || null,
      replies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}