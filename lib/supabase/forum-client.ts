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
        Row: ForumCategory;
        Insert: Omit<ForumCategory, 'id' | 'threads_count' | 'posts_count' | 'last_post_at' | 'last_post_user_id' | 'last_post_user' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ForumCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      forum_threads: {
        Row: ForumThread;
        Insert: Omit<ForumThread, 'id' | 'category' | 'author' | 'views_count' | 'replies_count' | 'likes_count' | 'last_post_at' | 'last_post_user_id' | 'last_post_user' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ForumThread, 'id' | 'created_at' | 'updated_at'>>;
      };
      forum_posts: {
        Row: ForumPost;
        Insert: Omit<ForumPost, 'id' | 'thread' | 'author' | 'likes_count' | 'is_liked' | 'parent_post' | 'replies' | 'replies_count' | 'depth' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ForumPost, 'id' | 'created_at' | 'updated_at'>>;
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
    Functions: ForumRpcFunctions;
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