import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateSession } from "@/lib/auth-session-validation";
import { z } from "zod";

// Disable static generation for this route
export const dynamic = 'force-dynamic';

const createPostSchema = z.object({
  thread_id: z.string().uuid("Invalid thread ID"),
  content: z.string().min(1, "Content cannot be empty").max(10000, "Content too long"),
  parent_post_id: z.union([
    z.string().uuid("Invalid parent post ID"),
    z.null(),
    z.undefined(),
    z.literal("")
  ]).optional().transform(val => {
    // Transform empty string to null for database compatibility
    if (val === "" || val === undefined) return null;
    return val;
  }),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Validate authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("Nested post API received body:", body);
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation failed:", validation.error.flatten());
      return NextResponse.json(
        { 
          error: "Invalid input", 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { thread_id, content, parent_post_id } = validation.data;

    // Check if thread exists and is not locked using schema-safe function
    const { data: threadValidation, error: threadError } = await supabase.rpc('validate_forum_thread', {
      p_thread_id: thread_id
    });

    if (threadError) {
      console.error("Database error validating thread:", threadError);
      return NextResponse.json(
        { error: "Failed to validate thread" },
        { status: 500 }
      );
    }

    if (!threadValidation || threadValidation.length === 0 || !threadValidation[0]?.thread_exists) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    if (threadValidation[0].is_locked) {
      return NextResponse.json(
        { error: "Thread is locked" },
        { status: 403 }
      );
    }

    // If parent_post_id is provided, verify it exists and belongs to this thread using schema-safe function
    if (parent_post_id) {
      const { data: parentValidation, error: parentError } = await supabase.rpc('validate_forum_parent_post', {
        p_post_id: parent_post_id,
        p_thread_id: thread_id
      });

      if (parentError) {
        console.error("Database error validating parent post:", parentError);
        return NextResponse.json(
          { error: "Failed to validate parent post" },
          { status: 500 }
        );
      }

      if (!parentValidation || parentValidation.length === 0 || !parentValidation[0]?.is_valid) {
        return NextResponse.json(
          { error: "Invalid parent post" },
          { status: 400 }
        );
      }
    }

    // Create the post using our nested RPC function
    const { data: createdPosts, error: createError } = await supabase.rpc('create_forum_post_nested', {
      p_thread_id: thread_id,
      p_content: content,
      p_author_id: user.id,
      p_parent_post_id: parent_post_id || null
    });

    if (createError) {
      console.error("Database error creating nested post:", createError);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    }

    if (!createdPosts || createdPosts.length === 0) {
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    }

    const post = createdPosts[0];

    return NextResponse.json({
      post,
      success: true,
      message: "Post created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Create nested post API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}