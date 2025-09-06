import { useCallback, useState } from "react";
import { useCsrfProtectedFetch } from "@/hooks/use-csrf-token";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import toast from "react-hot-toast";

type LikeType = 'post' | 'thread';

interface LikeResult {
  liked: boolean;
  likes_count: number;
}

interface UseForumLikesOptions {
  onPostLikeUpdate?: (postId: string, liked: boolean, likesCount: number) => void;
  onThreadLikeUpdate?: (liked: boolean, likesCount: number) => void;
}

export function useForumLikes({ 
  onPostLikeUpdate, 
  onThreadLikeUpdate 
}: UseForumLikesOptions = {}) {
  const { fetchWithCsrf, isReady } = useCsrfProtectedFetch();
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const { openDialog } = useAuthDialog();
  const [isLiking, setIsLiking] = useState(false);
  
  const isAuthenticated = isInitialized && !!user;

  const toggleLike = useCallback(async (type: LikeType, id: string) => {
    // Check authentication
    if (!isAuthenticated) {
      openDialog({
        defaultTab: "signin",
        actionContext: type === 'post' ? "to like this post" : "to like this thread"
      });
      return null;
    }

    // Check CSRF readiness
    if (!isReady) {
      toast.error("Please wait...");
      return null;
    }

    // Prevent double-clicking
    if (isLiking) return null;

    setIsLiking(true);

    try {
      const response = await fetchWithCsrf("/api/forum/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, id }),
      });

      if (response.ok) {
        const result: LikeResult = await response.json();
        
        // Call the appropriate update callback
        if (type === 'post' && onPostLikeUpdate) {
          onPostLikeUpdate(id, result.liked, result.likes_count);
        } else if (type === 'thread' && onThreadLikeUpdate) {
          onThreadLikeUpdate(result.liked, result.likes_count);
        }
        
        toast.success(result.liked ? "Liked!" : "Removed like");
        return result;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to like");
        return null;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to like");
      return null;
    } finally {
      setIsLiking(false);
    }
  }, [isAuthenticated, isReady, isLiking, fetchWithCsrf, openDialog, onPostLikeUpdate, onThreadLikeUpdate]);

  const likePost = useCallback((postId: string) => {
    return toggleLike('post', postId);
  }, [toggleLike]);

  const likeThread = useCallback((threadId: string) => {
    return toggleLike('thread', threadId);
  }, [toggleLike]);

  return {
    likePost,
    likeThread,
    isLiking,
    isAuthenticated,
  };
}