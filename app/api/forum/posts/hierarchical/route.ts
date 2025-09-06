import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Disable static generation for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const threadId = searchParams.get('thread_id');

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get hierarchical posts using our schema-qualified RPC function
    const { data: posts, error } = await supabase.rpc('get_thread_posts_hierarchical', {
      p_thread_id: threadId,
      p_limit: 100
    });

    if (error) {
      console.error("Database error fetching hierarchical posts:", {
        error,
        threadId,
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      // More specific error handling for connection issues
      if (error.code === '42P01') {
        console.error("Table not found error - possible schema/connection issue");
      }
      
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: posts || [],
      success: true
    });

  } catch (error) {
    console.error("Hierarchical posts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}