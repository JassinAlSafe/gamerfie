import { SupabaseClient } from "@supabase/supabase-js";
import type {
  ForumRpcFunctions,
  ThreadsWithDetailsResult,
  PostsWithDetailsResult,
  CategoriesWithStatsResult,
  SearchResult,
  ForumCategory,
  ForumThread,
  ForumPost,
  ForumPostLike,
  ForumThreadLike
} from "@/types/forum";

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      forum_categories: {
        Row: {
          id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
        };
        Update: Partial<{
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
        }>;
      };
      forum_threads: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          content: string;
          author_id: string;
          is_pinned: boolean;
          is_locked: boolean;
          views_count: number;
          replies_count: number;
          likes_count: number;
          last_post_at?: string | null;
          last_post_user_id?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          title: string;
          content: string;
          author_id: string;
          is_pinned?: boolean;
          is_locked?: boolean;
        };
        Update: Partial<{
          category_id: string;
          title: string;
          content: string;
          is_pinned: boolean;
          is_locked: boolean;
        }>;
      };
      forum_posts: {
        Row: {
          id: string;
          thread_id: string;
          content: string;
          author_id: string;
          parent_post_id?: string | null;
          depth: number;
          likes_count: number;
          replies_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          thread_id: string;
          content: string;
          author_id: string;
          parent_post_id?: string | null;
        };
        Update: Partial<{
          content: string;
        }>;
      };
      forum_post_likes: {
        Row: ForumPostLike;
        Insert: Omit<ForumPostLike, 'id' | 'created_at'>;
        Update: Partial<Omit<ForumPostLike, 'id' | 'created_at'>>;
      };
      forum_thread_likes: {
        Row: ForumThreadLike;
        Insert: Omit<ForumThreadLike, 'id' | 'created_at'>;
        Update: Partial<Omit<ForumThreadLike, 'id' | 'created_at'>>;
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
        };
      };
    };
    Views: {
      forum_categories_with_stats: {
        Row: CategoriesWithStatsResult;
      };
      forum_threads_with_details: {
        Row: ThreadsWithDetailsResult;
      };
      forum_posts_with_details: {
        Row: PostsWithDetailsResult;
      };
    };
    Functions: {
      get_thread_posts_hierarchical: {
        Args: { p_thread_id: string; p_limit: number };
        Returns: PostsWithDetailsResult[];
      };
      create_forum_post_nested: {
        Args: { p_thread_id: string; p_content: string; p_author_id: string; p_parent_post_id?: string };
        Returns: PostsWithDetailsResult[];
      };
      get_post_context: {
        Args: { p_post_id: string };
        Returns: (PostsWithDetailsResult & { context_type: string })[];
      };
      get_posts_by_depth: {
        Args: { p_thread_id: string; p_parent_id?: string; p_max_depth: number; p_limit: number };
        Returns: (PostsWithDetailsResult & { has_children: boolean })[];
      };
      toggle_thread_like: {
        Args: { p_thread_id: string; p_user_id: string };
        Returns: { liked: boolean; likes_count: number };
      };
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string };
        Returns: { liked: boolean; likes_count: number };
      };
      search_forum_content: {
        Args: { p_query: string; p_type?: 'all' | 'threads' | 'posts'; p_category_id?: string; p_limit: number; p_offset: number };
        Returns: SearchResult[];
      };
    };
  };
}

// Type-safe forum client wrapper
export class ForumSupabaseClient {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Category operations
  async getCategories() {
    return this.supabase
      .from('forum_categories_with_stats')
      .select('*')
      .order('name');
  }

  async getCategoryById(id: string) {
    return this.supabase
      .from('forum_categories')
      .select('*')
      .eq('id', id)
      .single();
  }

  async createCategory(data: Database['public']['Tables']['forum_categories']['Insert']) {
    return this.supabase
      .from('forum_categories')
      .insert(data)
      .select()
      .single();
  }

  async updateCategory(id: string, data: Database['public']['Tables']['forum_categories']['Update']) {
    return this.supabase
      .from('forum_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }

  // Thread operations
  async getThreads(options: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    orderBy?: 'newest' | 'oldest' | 'popular';
  } = {}) {
    const { limit = 20, offset = 0, categoryId, orderBy = 'newest' } = options;

    if (categoryId) {
      return this.supabase.rpc('get_category_threads', {
        p_category_id: categoryId,
        p_limit: limit,
        p_offset: offset
      });
    }

    let query = this.supabase
      .from('forum_threads_with_details')
      .select('*');

    switch (orderBy) {
      case 'newest':
        query = query
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: true });
        break;
      case 'popular':
        query = query
          .order('is_pinned', { ascending: false })
          .order('hot_score', { ascending: false });
        break;
    }

    return query.range(offset, offset + limit - 1);
  }

  async getThreadById(id: string) {
    return this.supabase
      .from('forum_threads')
      .select(`
        *,
        category:forum_categories(id, name, color, icon),
        author:user_profiles(id, username, avatar_url)
      `)
      .eq('id', id)
      .single();
  }

  async createThread(data: Database['public']['Tables']['forum_threads']['Insert']) {
    return this.supabase
      .from('forum_threads')
      .insert(data)
      .select()
      .single();
  }

  async updateThread(id: string, data: Database['public']['Tables']['forum_threads']['Update']) {
    return this.supabase
      .from('forum_threads')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }

  async incrementThreadViews(threadId: string) {
    return this.supabase.rpc('increment_thread_views', {
      thread_uuid: threadId
    });
  }

  // Post operations
  async getThreadPosts(threadId: string, options: {
    limit?: number;
    offset?: number;
  } = {}) {
    const { limit = 50, offset = 0 } = options;
    
    return this.supabase.rpc('get_thread_posts', {
      p_thread_id: threadId,
      p_limit: limit,
      p_offset: offset
    });
  }

  // New hierarchical post operations
  async getThreadPostsHierarchical(threadId: string, options: {
    limit?: number;
  } = {}) {
    const { limit = 100 } = options;
    
    return this.supabase.rpc('get_thread_posts_hierarchical', {
      p_thread_id: threadId,
      p_limit: limit
    });
  }

  async createPostNested(data: {
    thread_id: string;
    content: string;
    author_id: string;
    parent_post_id?: string;
  }) {
    return this.supabase.rpc('create_forum_post_nested', {
      p_thread_id: data.thread_id,
      p_content: data.content,
      p_author_id: data.author_id,
      p_parent_post_id: data.parent_post_id || null
    });
  }

  async getPostContext(postId: string) {
    return this.supabase.rpc('get_post_context', {
      p_post_id: postId
    });
  }

  async getPostsByDepth(threadId: string, options: {
    parentId?: string;
    maxDepth?: number;
    limit?: number;
  } = {}) {
    const { parentId, maxDepth = 2, limit = 50 } = options;
    
    return this.supabase.rpc('get_posts_by_depth', {
      p_thread_id: threadId,
      p_parent_id: parentId || null,
      p_max_depth: maxDepth,
      p_limit: limit
    });
  }

  async getPostById(id: string) {
    return this.supabase
      .from('forum_posts')
      .select(`
        *,
        thread:forum_threads(id, title),
        author:user_profiles(id, username, avatar_url)
      `)
      .eq('id', id)
      .single();
  }

  async createPost(data: Database['public']['Tables']['forum_posts']['Insert']) {
    return this.supabase
      .from('forum_posts')
      .insert(data)
      .select()
      .single();
  }

  async updatePost(id: string, data: Database['public']['Tables']['forum_posts']['Update']) {
    return this.supabase
      .from('forum_posts')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }

  // Like operations
  async toggleThreadLike(threadId: string, userId: string) {
    return this.supabase.rpc('toggle_thread_like', {
      p_thread_id: threadId,
      p_user_id: userId
    });
  }

  async togglePostLike(postId: string, userId: string) {
    return this.supabase.rpc('toggle_post_like', {
      p_post_id: postId,
      p_user_id: userId
    });
  }

  // Search operations
  async searchContent(options: {
    query: string;
    type?: 'all' | 'threads' | 'posts';
    categoryId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { query, type = 'all', categoryId, limit = 20, offset = 0 } = options;
    
    return this.supabase.rpc('search_forum_content', {
      p_query: query,
      p_type: type,
      p_category_id: categoryId,
      p_limit: limit,
      p_offset: offset
    });
  }

  // Stats operations
  async getForumStats() {
    return this.supabase.rpc('get_forum_stats');
  }

  // User operations
  async getUserProfile(userId: string) {
    return this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
  }

  async createUserProfile(data: {
    id: string;
    username: string;
    avatar_url?: string | null;
    bio?: string | null;
  }) {
    return this.supabase
      .from('user_profiles')
      .insert(data)
      .select()
      .single();
  }

  // Permission checks
  async checkThreadPermissions(threadId: string, userId: string) {
    const { data: thread, error } = await this.supabase
      .from('forum_threads')
      .select('id, is_locked, author_id')
      .eq('id', threadId)
      .single();

    if (error) {
      return { error };
    }

    return {
      data: {
        canRead: true,
        canWrite: !thread.is_locked,
        canModerate: thread.author_id === userId,
        thread
      }
    };
  }

  // Batch operations for performance
  async getThreadsWithPosts(threadIds: string[], postsLimit = 3) {
    // This would be implemented as a more efficient batch operation
    // For now, we'll use individual queries
    const threadPromises = threadIds.map(id => this.getThreadById(id));
    const postPromises = threadIds.map(id => 
      this.getThreadPosts(id, { limit: postsLimit, offset: 0 })
    );

    const [threads, posts] = await Promise.all([
      Promise.all(threadPromises),
      Promise.all(postPromises)
    ]);

    return { threads, posts };
  }

  // Raw supabase client access for advanced operations
  get raw() {
    return this.supabase;
  }
}

// Helper function to create a forum client from a regular Supabase client
export function createForumClient(supabase: SupabaseClient): ForumSupabaseClient {
  return new ForumSupabaseClient(supabase as SupabaseClient<Database>);
}

// Type guards for RPC function results
export function isThreadsWithDetails(data: unknown): data is ThreadsWithDetailsResult[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'title' in item &&
    'author_username' in item
  );
}

export function isPostsWithDetails(data: unknown): data is PostsWithDetailsResult[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'content' in item &&
    'thread_id' in item
  );
}

export function isCategoriesWithStats(data: unknown): data is CategoriesWithStatsResult[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'threads_count' in item
  );
}

export function isSearchResults(data: unknown): data is SearchResult[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'type' in item &&
    'relevance' in item
  );
}

// Type exports for external use
export type ForumClient = ForumSupabaseClient;
export type { Database as ForumDatabase };