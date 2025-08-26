import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  ForumCategory,
  ForumThread,
  ForumPost,
  ThreadsResponse,
  PostsResponse,
  CategoriesResponse,
  SearchResponse,
  ThreadFormData,
  PostFormData,
  CategoryFormData,
  ThreadQueryParams,
  PostQueryParams,
  SearchParams,
  ForumApiError,
  RateLimitError
} from '@/types/forum';

// API client functions with proper typing
class ForumApiClient {
  private static async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error: ForumApiError = {
        code: data.code || 'UNKNOWN_ERROR',
        message: data.error || 'An error occurred',
        field: data.field,
        details: data.details
      };
      throw error;
    }
    
    return data;
  }

  static async getCategories(): Promise<CategoriesResponse> {
    const response = await fetch('/api/forum/categories');
    return this.handleResponse<CategoriesResponse>(response);
  }

  static async createCategory(data: CategoryFormData): Promise<{ category: ForumCategory }> {
    const response = await fetch('/api/forum/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ category: ForumCategory }>(response);
  }

  static async getThreads(params: Partial<ThreadQueryParams> = {}): Promise<ThreadsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
    
    const response = await fetch(`/api/forum/threads?${searchParams}`);
    return this.handleResponse<ThreadsResponse>(response);
  }

  static async createThread(data: ThreadFormData): Promise<{ thread: ForumThread }> {
    const response = await fetch('/api/forum/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ thread: ForumThread }>(response);
  }

  static async getPosts(params: PostQueryParams): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
    
    const response = await fetch(`/api/forum/posts?${searchParams}`);
    return this.handleResponse<PostsResponse>(response);
  }

  static async createPost(data: PostFormData): Promise<{ post: ForumPost }> {
    const response = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ post: ForumPost }>(response);
  }

  static async searchContent(params: Partial<SearchParams>): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key === 'query' ? 'q' : key, String(value));
      }
    });
    
    const response = await fetch(`/api/forum/search?${searchParams}`);
    return this.handleResponse<SearchResponse>(response);
  }

  static async toggleLike(targetId: string, targetType: 'thread' | 'post'): Promise<{ liked: boolean; likes_count: number }> {
    const response = await fetch('/api/forum/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_id: targetId, target_type: targetType }),
    });
    return this.handleResponse<{ liked: boolean; likes_count: number }>(response);
  }
}

// Query keys factory for consistent caching
export const forumQueryKeys = {
  all: ['forum'] as const,
  categories: () => [...forumQueryKeys.all, 'categories'] as const,
  threads: () => [...forumQueryKeys.all, 'threads'] as const,
  thread: (params: Partial<ThreadQueryParams>) => [...forumQueryKeys.threads(), params] as const,
  posts: (params: PostQueryParams) => [...forumQueryKeys.all, 'posts', params] as const,
  search: (params: Partial<SearchParams>) => [...forumQueryKeys.all, 'search', params] as const,
};

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: forumQueryKeys.categories(),
    queryFn: ForumApiClient.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ForumApiClient.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.categories() });
    },
  });
}

// Threads hooks
export function useThreads(params: Partial<ThreadQueryParams> = {}) {
  return useQuery({
    queryKey: forumQueryKeys.thread(params),
    queryFn: () => ForumApiClient.getThreads(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ForumApiClient.createThread,
    onSuccess: (_data, variables) => {
      // Invalidate threads queries
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.threads() });
      // Invalidate category-specific queries
      queryClient.invalidateQueries({ 
        queryKey: forumQueryKeys.thread({ category_id: variables.category_id }) 
      });
      // Update categories cache to reflect new thread count
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.categories() });
    },
  });
}

// Posts hooks
export function usePosts(params: PostQueryParams) {
  return useQuery({
    queryKey: forumQueryKeys.posts(params),
    queryFn: () => ForumApiClient.getPosts(params),
    enabled: !!params.thread_id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ForumApiClient.createPost,
    onSuccess: (_data, variables) => {
      // Invalidate posts for this thread
      queryClient.invalidateQueries({ 
        queryKey: forumQueryKeys.posts({ thread_id: variables.thread_id, page: 1, limit: 50 }) 
      });
      // Invalidate thread queries to update reply counts
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.threads() });
    },
  });
}

// Search hooks
export function useSearchContent(params: Partial<SearchParams>) {
  return useQuery({
    queryKey: forumQueryKeys.search(params),
    queryFn: () => ForumApiClient.searchContent(params),
    enabled: !!params.query && params.query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Like hooks
export function useToggleLike() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: ({ targetId, targetType }: { targetId: string; targetType: 'thread' | 'post' }) =>
      ForumApiClient.toggleLike(targetId, targetType),
    onSuccess: (_data, variables) => {
      // Update all relevant queries
      if (variables.targetType === 'thread') {
        queryClient.invalidateQueries({ queryKey: forumQueryKeys.threads() });
      } else {
        queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      }
    },
    onError: (error: ForumApiError) => {
      // Handle authentication errors by redirecting to login
      if (error.code === 'AUTH_ERROR' || error.code === 'UNAUTHORIZED') {
        // You might want to use a different approach based on your auth setup
        console.warn('Authentication required for liking content');
      }
    },
  });
}

// Infinite query hook for threads (for pagination)
export function useInfiniteThreads(params: Partial<ThreadQueryParams> = {}) {
  return useQuery({
    queryKey: [...forumQueryKeys.thread(params), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      return ForumApiClient.getThreads({ ...params, page: pageParam });
    },
    // Note: useInfiniteQuery would be used here in a real implementation
    // This is simplified for demonstration
  });
}

// Error handling hook
export function useForumErrorHandler() {
  const handleError = (error: ForumApiError) => {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return {
          title: 'Validation Error',
          message: error.message,
          field: error.field,
        };
      case 'AUTH_ERROR':
      case 'UNAUTHORIZED':
        return {
          title: 'Authentication Required',
          message: 'Please sign in to continue',
        };
      case 'FORBIDDEN':
        return {
          title: 'Access Denied',
          message: error.message,
        };
      case 'NOT_FOUND':
        return {
          title: 'Not Found',
          message: error.message,
        };
      case 'RATE_LIMIT_EXCEEDED':
        return {
          title: 'Rate Limited',
          message: `Too many requests. Please try again in ${(error as RateLimitError).retryAfter || 60} seconds.`,
        };
      default:
        return {
          title: 'Error',
          message: error.message || 'An unexpected error occurred',
        };
    }
  };

  return { handleError };
}

// Type-safe optimistic updates helper
export function useOptimisticForumUpdates() {
  const queryClient = useQueryClient();

  const optimisticallyUpdateThread = (threadId: string, updates: Partial<ForumThread>) => {
    queryClient.setQueryData(
      forumQueryKeys.threads(),
      (oldData: ThreadsResponse | undefined) => {
        if (!oldData?.threads) return oldData;
        
        return {
          ...oldData,
          threads: oldData.threads.map(thread =>
            thread.id === threadId ? { ...thread, ...updates } : thread
          ),
        };
      }
    );
  };

  const optimisticallyUpdatePost = (_postId: string, _updates: Partial<ForumPost>) => {
    // Update all posts queries that might contain this post
    queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
  };

  return {
    optimisticallyUpdateThread,
    optimisticallyUpdatePost,
  };
}

// Custom hook for handling forum permissions
export function useForumPermissions() {
  const user = useAuthStore(state => state.user);

  const canCreateCategory = () => {
    // Add your permission logic here
    return !!user; // Simple example
  };

  const canCreateThread = (_categoryId?: string) => {
    return !!user;
  };

  const canCreatePost = (_threadId?: string) => {
    return !!user;
  };

  const canModerateThread = (thread: ForumThread) => {
    return user?.id === thread.author_id;
  };

  const canModeratePost = (post: ForumPost) => {
    return user?.id === post.author_id;
  };

  return {
    canCreateCategory,
    canCreateThread,
    canCreatePost,
    canModerateThread,
    canModeratePost,
  };
}