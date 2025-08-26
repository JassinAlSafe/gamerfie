import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  ForumApiErrorHandler,
  ForumApiResponse,
  withAuthenticatedUser,
  withDatabaseErrorHandling,
  ensureUserProfile
} from "@/app/api/lib/forum-helpers";
import type { 
  PostResponse,
  ForumPost,
  ForumPostWithDetails
} from "@/types/forum";
import type { AuthResult } from "@/app/api/lib/auth";

/**
 * Check if user can delete a post
 * Users can delete their own posts, admins/moderators can delete any post
 */
async function canDeletePost(
  supabase: any,
  postId: string,
  userId: string,
  userRole?: string
): Promise<{ canDelete: boolean; post?: ForumPost }> {
  // First get the post details
  const { data: post, error } = await supabase
    .from('forum_posts')
    .select('*, thread:forum_threads(is_locked)')
    .eq('id', postId)
    .single();

  if (error || !post) {
    return { canDelete: false };
  }

  // Check if thread is locked (only admins can delete from locked threads)
  if (post.thread?.is_locked && userRole !== 'admin') {
    return { canDelete: false, post };
  }

  // Admin and moderators can delete any post
  if (userRole === 'admin' || userRole === 'moderator') {
    return { canDelete: true, post };
  }

  // Users can only delete their own posts
  if (post.author_id === userId) {
    return { canDelete: true, post };
  }

  return { canDelete: false, post };
}

/**
 * Soft delete or hard delete a post with proper cascade handling
 */
async function deletePost(
  supabase: any,
  postId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    if (hardDelete) {
      // Hard delete: Remove post and cascade to replies and likes
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Soft delete: Mark as deleted and clear content
      const { error } = await supabase
        .from('forum_posts')
        .update({
          content: '[This post has been deleted]',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * GET /api/forum/posts/[postId] - Get a specific post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
): Promise<NextResponse<PostResponse>> {
  try {
    const supabase = await createClient();
    const { postId } = params;

    if (!postId) {
      return ForumApiErrorHandler.validationError('Post ID is required');
    }

    // Get post with author and thread details
    const result = await withDatabaseErrorHandling<ForumPostWithDetails>(
      async () => await supabase
        .rpc('get_post_with_details', { 
          p_post_id: postId 
        })
        .single()
    );

    if (!result.success) {
      return result.response;
    }

    if (!result.data) {
      return ForumApiErrorHandler.notFound('Post not found');
    }

    return ForumApiResponse.success({
      post: result.data
    });
  } catch (error) {
    console.error("Unexpected error fetching post:", error);
    return ForumApiErrorHandler.internalError('Failed to fetch post');
  }
}

/**
 * DELETE /api/forum/posts/[postId] - Delete a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
): Promise<NextResponse<PostResponse>> {
  return withAuthenticatedUser(async (auth: AuthResult) => {
    try {
      const { postId } = params;
      const { searchParams } = new URL(request.url);
      const hardDelete = searchParams.get('hard') === 'true';

      if (!postId) {
        return ForumApiErrorHandler.validationError('Post ID is required');
      }

      // Ensure user profile exists
      const profileResult = await ensureUserProfile(auth.user.id, auth.supabase);
      if (!profileResult.success) {
        return profileResult.response;
      }

      const userProfile = profileResult.data;

      // Check if user can delete this post
      const { canDelete, post } = await canDeletePost(
        auth.supabase,
        postId,
        auth.user.id,
        userProfile.role
      );

      if (!canDelete) {
        return ForumApiErrorHandler.forbidden('You do not have permission to delete this post');
      }

      if (!post) {
        return ForumApiErrorHandler.notFound('Post not found');
      }

      // Only admins can perform hard deletes
      const performHardDelete = hardDelete && userProfile.role === 'admin';

      // Delete the post
      const deleteResult = await deletePost(auth.supabase, postId, performHardDelete);
      
      if (!deleteResult.success) {
        console.error(`Failed to delete post ${postId}:`, deleteResult.error);
        return ForumApiErrorHandler.internalError('Failed to delete post');
      }

      // Update thread reply count and last post info
      try {
        await auth.supabase.rpc('update_thread_stats', {
          p_thread_id: post.thread_id
        });
      } catch (error) {
        // Non-critical error - log but don't fail the request
        console.warn('Failed to update thread stats after post deletion:', error);
      }

      return ForumApiResponse.success({
        message: performHardDelete ? 'Post permanently deleted' : 'Post deleted',
        post: {
          ...post,
          content: performHardDelete ? undefined : '[This post has been deleted]'
        }
      });
    } catch (error) {
      console.error("Unexpected error deleting post:", error);
      return ForumApiErrorHandler.internalError('Failed to delete post');
    }
  });
}