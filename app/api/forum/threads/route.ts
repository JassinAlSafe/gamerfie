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
  createPaginationMeta
} from "@/app/api/lib/forum-helpers";
import { validateCreateThread, validateThreadQuery } from "@/lib/validations/forum";
import { withCsrfProtection } from "@/lib/csrf-protection";
import type { 
  ThreadsResponse, 
  ThreadResponse, 
  ThreadsWithDetailsResult,
  ForumThread 
} from "@/types/forum";
import type { AuthResult } from "@/app/api/lib/auth";

export async function GET(request: NextRequest): Promise<NextResponse<ThreadsResponse>> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const validation = validateSearchParams(searchParams, validateThreadQuery);
    if (!validation.success) {
      return validation.response;
    }
    
    const { page, limit, category_id } = validation.data;
    const offset = (page - 1) * limit;

    let result;
    if (category_id) {
      // Get threads for specific category using RPC
      result = await withDatabaseErrorHandling<ThreadsWithDetailsResult[]>(
        () => supabase.rpc('get_category_threads', {
          p_category_id: category_id,
          p_limit: limit,
          p_offset: offset
        })
      );
    } else {
      // Get all threads with details from view
      result = await withDatabaseErrorHandling<ThreadsWithDetailsResult[]>(
        () => supabase
          .from('forum_threads_with_details')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)
      );
    }

    if (!result.success) {
      return result.response;
    }

    const pagination = createPaginationMeta(page, limit, result.data.length);

    return ForumApiResponse.paginated(
      { threads: result.data },
      pagination
    );
  } catch (error) {
    console.error("Unexpected error fetching forum threads:", error);
    return ForumApiErrorHandler.internalError('Failed to fetch threads');
  }
}

async function createThreadHandler(request: NextRequest): Promise<NextResponse<ThreadResponse>> {
  return withAuthenticatedUser(async (auth: AuthResult) => {
    try {
      // Validate request body
      const validation = await validateRequestBody(request, validateCreateThread);
      if (!validation.success) {
        return validation.response;
      }

      const threadData = validation.data;

      // Ensure user profile exists
      const profileResult = await ensureUserProfile(
        auth.supabase, 
        auth.user.id,
        { email: auth.user.email }
      );
      
      if (profileResult instanceof NextResponse) {
        return profileResult;
      }

      // Create thread in database
      const result = await withDatabaseErrorHandling<ForumThread>(
        () => auth.supabase
          .from('forum_threads')
          .insert({
            ...threadData,
            author_id: auth.user.id
          })
          .select()
          .single()
      );

      if (!result.success) {
        return result.response;
      }

      return ForumApiResponse.created({
        thread: result.data
      });
    } catch (error) {
      console.error("Unexpected error creating forum thread:", error);
      return ForumApiErrorHandler.internalError('Failed to create thread');
    }
  });
}

// Export CSRF-protected POST handler
export const POST = withCsrfProtection(createThreadHandler);