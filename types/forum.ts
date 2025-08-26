export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  threads_count: number;
  posts_count: number;
  last_post_at?: string;
  last_post_user_id?: string;
  last_post_user?: Pick<UserProfile, 'id' | 'username' | 'avatar_url'>;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  category_id: string;
  category?: Pick<ForumCategory, 'id' | 'name' | 'color' | 'icon'>;
  title: string;
  content: string;
  author_id: string;
  author?: Pick<UserProfile, 'id' | 'username' | 'avatar_url'>;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  likes_count: number;
  last_post_at?: string;
  last_post_user_id?: string;
  last_post_user?: Pick<UserProfile, 'id' | 'username' | 'avatar_url'>;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  thread?: ForumThread;
  content: string;
  author_id: string;
  author?: Pick<UserProfile, 'id' | 'username' | 'avatar_url'>;
  likes_count: number;
  is_liked?: boolean;
  parent_post_id?: string;
  parent_post?: ForumPost;
  replies?: ForumPost[];
  created_at: string;
  updated_at: string;
}

export interface ForumPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface ForumThreadLike {
  id: string;
  thread_id: string;
  user_id: string;
  created_at: string;
}

export interface SearchResult {
  id: string;
  type: 'thread' | 'post';
  title?: string;
  content: string;
  author_id: string;
  category_id: string;
  created_at: string;
  relevance: number;
}

export interface ForumStats {
  total_threads: number;
  total_posts: number;
  total_users: number;
  active_users_today: number;
}

export interface CreateThreadRequest {
  category_id: string;
  title: string;
  content: string;
}

export interface CreatePostRequest {
  thread_id: string;
  content: string;
  parent_post_id?: string;
}