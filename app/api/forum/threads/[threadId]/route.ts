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
  ThreadResponse,
  ForumThread,
  ForumThreadWithDetails
} from "@/types/forum";
import type { AuthResult } from "@/app/api/lib/auth";

/**
 * Check if user can delete a thread
 * Users can delete their own threads (if no replies or within time limit)
 * Admins/moderators can delete any thread
 */
async function canDeleteThread(
  supabase: any,
  threadId: string,
  userId: string,
  userRole?: string
): Promise<{ canDelete: boolean; thread?: ForumThread; reason?: string }> {
  // Get thread with reply count
  const { data: thread, error } = await supabase
    .from('forum_threads')
    .select('*, replies_count')
    .eq('id', threadId)
    .single();

  if (error || !thread) {
    return { canDelete: false, reason: 'Thread not found' };
  }

  // Admin and moderators can delete any thread
  if (userRole === 'admin' || userRole === 'moderator') {
    return { canDelete: true, thread };
  }

  // Users can only delete their own threads
  if (thread.author_id !== userId) {
    return { canDelete: false, thread, reason: 'You can only delete your own threads' };
  }

  // Check if thread has replies - only allow deletion if no replies (or within grace period)
  const createdAt = new Date(thread.created_at);
  const now = new Date();
  const timeDifferenceHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const gracePeriodHours = 1; // Allow deletion within 1 hour even with replies

  if (thread.replies_count > 0 && timeDifferenceHours > gracePeriodHours) {
    return { 
      canDelete: false, 
      thread, 
      reason: 'Cannot delete threads with replies after 1 hour' 
    };
  }

  return { canDelete: true, thread };
}

/**
 * Delete a thread and handle cascading deletions
 */
async function deleteThread(
  supabase: any,
  threadId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    if (hardDelete) {
      // Hard delete: Remove thread and cascade to all posts, likes, etc.
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Soft delete: Mark thread as deleted and lock it
      const { error } = await supabase
        .from('forum_threads')
        .update({
          title: '[Deleted Thread]',
          content: '[This thread has been deleted]',
          is_locked: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId);

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
 * GET /api/forum/threads/[threadId] - Get a specific thread
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
): Promise<NextResponse<ThreadResponse>> {
  try {
    const supabase = await createClient();
    const { threadId } = params;

    if (!threadId) {
      return ForumApiErrorHandler.validationError('Thread ID is required');
    }

    // Get thread with author and category details
    const result = await withDatabaseErrorHandling<ForumThreadWithDetails>(
      async () => await supabase
        .rpc('get_thread_with_details', { 
          p_thread_id: threadId 
        })
        .single()
    );

    if (!result.success) {
      return result.response;
    }

    if (!result.data) {
      return ForumApiErrorHandler.notFound('Thread not found');
    }

    // Increment view count (non-blocking)
    supabase
      .from('forum_threads')
      .update({ views_count: result.data.views_count + 1 })
      .eq('id', threadId)
      .then()
      .catch((error) => {
        console.warn('Failed to increment thread view count:', error);
      });

    return ForumApiResponse.success({
      thread: result.data
    });
  } catch (error) {
    console.error("Unexpected error fetching thread:", error);
    return ForumApiErrorHandler.internalError('Failed to fetch thread');
  }
}

/**
 * DELETE /api/forum/threads/[threadId] - Delete a thread
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { threadId: string } }
): Promise<NextResponse<ThreadResponse>> {
  return withAuthenticatedUser(async (auth: AuthResult) => {
    try {
      const { threadId } = params;
      const { searchParams } = new URL(request.url);
      const hardDelete = searchParams.get('hard') === 'true';

      if (!threadId) {
        return ForumApiErrorHandler.validationError('Thread ID is required');
      }

      // Ensure user profile exists
      const profileResult = await ensureUserProfile(auth.user.id, auth.supabase);
      if (!profileResult.success) {
        return profileResult.response;
      }

      const userProfile = profileResult.data;

      // Check if user can delete this thread
      const { canDelete, thread, reason } = await canDeleteThread(
        auth.supabase,
        threadId,
        auth.user.id,
        userProfile.role
      );

      if (!canDelete) {
        return ForumApiErrorHandler.forbidden(reason || 'You do not have permission to delete this thread');
      }

      if (!thread) {
        return ForumApiErrorHandler.notFound('Thread not found');
      }

      // Only admins can perform hard deletes
      const performHardDelete = hardDelete && userProfile.role === 'admin';

      // Delete the thread
      const deleteResult = await deleteThread(auth.supabase, threadId, performHardDelete);
      
      if (!deleteResult.success) {
        console.error(`Failed to delete thread ${threadId}:`, deleteResult.error);
        return ForumApiErrorHandler.internalError('Failed to delete thread');
      }

      // Update category stats
      try {
        await auth.supabase.rpc('update_category_stats', {
          p_category_id: thread.category_id
        });
      } catch (error) {
        // Non-critical error - log but don't fail the request
        console.warn('Failed to update category stats after thread deletion:', error);
      }

      return ForumApiResponse.success({
        message: performHardDelete ? 'Thread permanently deleted' : 'Thread deleted',
        thread: {
          ...thread,
          title: performHardDelete ? undefined : '[Deleted Thread]',
          content: performHardDelete ? undefined : '[This thread has been deleted]'
        }
      });
    } catch (error) {
      console.error("Unexpected error deleting thread:", error);
      return ForumApiErrorHandler.internalError('Failed to delete thread');
    }
  });
}

/**
 * PATCH /api/forum/threads/[threadId] - Update thread (lock/unlock, pin/unpin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { threadId: string } }
): Promise<NextResponse<ThreadResponse>> {
  return withAuthenticatedUser(async (auth: AuthResult) => {
    try {
      const { threadId } = params;
      const body = await request.json();

      if (!threadId) {
        return ForumApiErrorHandler.validationError('Thread ID is required');
      }

      // Ensure user profile exists
      const profileResult = await ensureUserProfile(auth.user.id, auth.supabase);
      if (!profileResult.success) {
        return profileResult.response;
      }

      const userProfile = profileResult.data;

      // Only moderators and admins can lock/unlock or pin/unpin threads
      if (userProfile.role !== 'admin' && userProfile.role !== 'moderator') {
        return ForumApiErrorHandler.forbidden('You do not have permission to modify this thread');
      }

      // Validate allowed updates
      const allowedUpdates = ['is_locked', 'is_pinned'];
      const updates: Partial<ForumThread> = {};
      
      for (const [key, value] of Object.entries(body)) {
        if (allowedUpdates.includes(key) && typeof value === 'boolean') {
          (updates as any)[key] = value;
        }
      }

      if (Object.keys(updates).length === 0) {
        return ForumApiErrorHandler.validationError('No valid updates provided');
      }

      updates.updated_at = new Date().toISOString();

      // Update the thread
      const result = await withDatabaseErrorHandling<ForumThread>(
        async () => await auth.supabase
          .from('forum_threads')
          .update(updates)
          .eq('id', threadId)
          .select()
          .single()
      );

      if (!result.success) {
        return result.response;
      }

      return ForumApiResponse.success({
        thread: result.data,
        message: 'Thread updated successfully'
      });
    } catch (error) {
      console.error("Unexpected error updating thread:", error);
      return ForumApiErrorHandler.internalError('Failed to update thread');
    }
  });
}