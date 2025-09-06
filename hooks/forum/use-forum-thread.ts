import { useState, useCallback } from "react";
import { ThreadsWithDetailsResult } from "@/types/forum";

interface UseForumThreadOptions {
  initialThread: ThreadsWithDetailsResult;
}

export function useForumThread({ initialThread }: UseForumThreadOptions) {
  const [thread, setThread] = useState(initialThread);

  // Update thread like status optimistically
  const updateThreadLike = useCallback((liked: boolean, likesCount: number) => {
    setThread(prevThread => ({
      ...prevThread,
      is_liked: liked,
      likes_count: likesCount
    }));
  }, []);

  // Update thread views count
  const incrementViews = useCallback(() => {
    setThread(prevThread => ({
      ...prevThread,
      views_count: prevThread.views_count + 1
    }));
  }, []);

  // Update thread reply count when new posts are added
  const updateReplyCount = useCallback((increment: number = 1) => {
    setThread(prevThread => ({
      ...prevThread,
      replies_count: prevThread.replies_count + increment
    }));
  }, []);

  return {
    thread,
    setThread,
    updateThreadLike,
    incrementViews,
    updateReplyCount,
  };
}