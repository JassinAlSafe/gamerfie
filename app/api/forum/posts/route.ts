import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  ForumApiErrorHandler,
  ForumApiResponse,
  withAuthenticatedUser,
  withDatabaseErrorHandling,
  validateRequestBody,
  validateSearchParams,
  ensureUserProfile,
  checkThreadPermissions,
  createPaginationMeta
} from "@/app/api/lib/forum-helpers";
import { validateCreatePost, validatePostQuery } from "@/lib/validations/forum";
import type { 
  PostsResponse, 
  PostResponse, 
  PostsWithDetailsResult,
  ForumPost 
} from "@/types/forum";
import type { AuthResult } from "@/app/api/lib/auth";

export async function GET(request: NextRequest): Promise<NextResponse<PostsResponse>> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const validation = validateSearchParams(searchParams, validatePostQuery);
    if (!validation.success) {
      return validation.response;
    }
    
    const { page, limit, thread_id } = validation.data;
    const offset = (page - 1) * limit;

    // Fetch posts for the thread using RPC
    const result = await withDatabaseErrorHandling<PostsWithDetailsResult[]>(
      async () => await supabase.rpc('get_thread_posts', {
        p_thread_id: thread_id,
        p_limit: limit,
        p_offset: offset
      })
    );

    if (!result.success) {
      return result.response;
    }

    // Increment view count (fire and forget - don't wait for result)
    void supabase.rpc('increment_thread_views', { thread_uuid: thread_id });

    const pagination = createPaginationMeta(page, limit, result.data.length);

    return ForumApiResponse.paginated(
      { posts: result.data },
      pagination
    );
  } catch (error) {
    console.error("Unexpected error fetching forum posts:", error);
    return ForumApiErrorHandler.internalError('Failed to fetch posts');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<PostResponse>> {
  return withAuthenticatedUser(async (auth: AuthResult) => {
    try {
      // Validate request body
      const validation = await validateRequestBody(request, validateCreatePost);
      if (!validation.success) {
        return validation.response;
      }

      const postData = validation.data;

      // Check thread permissions
      const permissionCheck = await checkThreadPermissions(
        auth.supabase,
        postData.thread_id,
        auth.user.id,
        'write'
      );

      if (permissionCheck instanceof NextResponse) {
        return permissionCheck;
      }

      if (!permissionCheck.allowed) {
        return ForumApiErrorHandler.forbiddenError('Thread is locked');
      }

      // Ensure user profile exists
      const profileResult = await ensureUserProfile(
        auth.supabase, 
        auth.user.id,
        { email: auth.user.email }
      );
      
      if (profileResult instanceof NextResponse) {
        return profileResult;
      }

      // Create post in database
      const result = await withDatabaseErrorHandling<ForumPost>(
        () => auth.supabase
          .from('forum_posts')
          .insert({
            ...postData,
            author_id: auth.user.id
          })
          .select()
          .single()
      );

      if (!result.success) {
        return result.response;
      }

      return ForumApiResponse.created({
        post: result.data
      });
    } catch (error) {
      console.error("Unexpected error creating forum post:", error);
      return ForumApiErrorHandler.internalError('Failed to create post');
    }
  });
}