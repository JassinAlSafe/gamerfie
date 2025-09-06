import { useState, useEffect, useCallback } from "react";
import { PostsWithDetailsResult } from "@/types/forum";
import { useCsrfProtectedFetch } from "@/hooks/use-csrf-token";
import toast from "react-hot-toast";

interface UseForumPostsOptions {
  threadId: string;
  initialPosts?: PostsWithDetailsResult[];
}

interface CreatePostParams {
  content: string;
  parentPostId?: string;
}

export function useForumPosts({ threadId, initialPosts = [] }: UseForumPostsOptions) {
  const { fetchWithCsrf, isReady } = useCsrfProtectedFetch();
  const [posts, setPosts] = useState<PostsWithDetailsResult[]>(initialPosts);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load hierarchical posts
  const loadPosts = useCallback(async () => {
    if (!isReady) return;
    
    setIsLoadingPosts(true);
    try {
      const response = await fetchWithCsrf(`/api/forum/posts/hierarchical?thread_id=${threadId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      }
    } catch (error) {
      console.error("Failed to load hierarchical posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [threadId, isReady, fetchWithCsrf]);

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Create a new post
  const createPost = useCallback(async ({ content, parentPostId }: CreatePostParams) => {
    if (!content.trim()) {
      toast.error("Please write something before posting");
      return null;
    }

    if (!isReady) {
      toast.error("Please wait for security initialization...");
      return null;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithCsrf("/api/forum/posts/nested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: threadId,
          content: content,
          parent_post_id: parentPostId || null,
        }),
      });

      if (response.ok) {
        const { post } = await response.json();
        
        // Optimistically add the new post to the state immediately
        if (post) {
          // For root-level posts (no parent)
          if (!parentPostId) {
            setPosts(prevPosts => [...prevPosts, post]);
          } else {
            // For nested replies, update the parent's reply count and insert the new post
            setPosts(prevPosts => {
              const updatedPosts = [...prevPosts];
              
              // Update parent reply count
              const postsWithUpdatedCount = updatedPosts.map(p => {
                if (p.id === parentPostId) {
                  return { ...p, replies_count: (p.replies_count || 0) + 1 };
                }
                return p;
              });
              
              // Find where to insert the new post (after its parent)
              const parentIndex = postsWithUpdatedCount.findIndex(p => p.id === parentPostId);
              if (parentIndex !== -1) {
                postsWithUpdatedCount.splice(parentIndex + 1, 0, post);
              } else {
                postsWithUpdatedCount.push(post);
              }
              
              return postsWithUpdatedCount;
            });
          }
        }
        
        toast.success("Reply posted successfully!");
        
        // Background refresh for consistency
        fetchWithCsrf(`/api/forum/posts/hierarchical?thread_id=${threadId}`)
          .then(res => res.json())
          .then(data => {
            if (data.posts) {
              setPosts(data.posts);
            }
          })
          .catch(err => console.error("Background refresh failed:", err));
        
        return post;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to post reply");
        return null;
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to post reply");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [threadId, isReady, fetchWithCsrf]);

  // Update a post's like status optimistically
  const updatePostLike = useCallback((postId: string, liked: boolean, likesCount: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: liked, likes_count: likesCount }
          : post
      )
    );
  }, []);

  return {
    posts,
    setPosts,
    isLoadingPosts,
    isSubmitting,
    createPost,
    updatePostLike,
    refreshPosts: loadPosts,
  };
}