import { useForumPosts } from "./use-forum-posts";
import { useForumThread } from "./use-forum-thread";
import { useForumLikes } from "./use-forum-likes";
import { ThreadsWithDetailsResult, PostsWithDetailsResult } from "@/types/forum";

interface UseForumOptions {
  thread: ThreadsWithDetailsResult;
  initialPosts?: PostsWithDetailsResult[];
}

/**
 * Composite hook that combines all forum functionality
 * Provides a single interface for managing forum threads and posts
 */
export function useForum({ thread: initialThread, initialPosts = [] }: UseForumOptions) {
  // Thread management
  const { 
    thread, 
    setThread, 
    updateThreadLike, 
    incrementViews,
    updateReplyCount 
  } = useForumThread({ initialThread });

  // Posts management
  const {
    posts,
    setPosts,
    isLoadingPosts,
    isSubmitting,
    createPost,
    updatePostLike,
    refreshPosts,
  } = useForumPosts({ 
    threadId: thread.id, 
    initialPosts 
  });

  // Likes management with callbacks to update state
  const {
    likePost,
    likeThread,
    isLiking,
    isAuthenticated,
  } = useForumLikes({
    onPostLikeUpdate: updatePostLike,
    onThreadLikeUpdate: updateThreadLike,
  });

  // Wrapper for creating posts that also updates thread reply count
  const handleCreatePost = async (content: string, parentPostId?: string) => {
    const post = await createPost({ content, parentPostId });
    if (post) {
      updateReplyCount(1);
    }
    return post;
  };

  return {
    // Thread data and operations
    thread,
    setThread,
    incrementViews,
    
    // Posts data and operations
    posts,
    setPosts,
    isLoadingPosts,
    isSubmitting,
    createPost: handleCreatePost,
    refreshPosts,
    
    // Like operations
    likePost,
    likeThread,
    isLiking,
    
    // Auth state
    isAuthenticated,
  };
}