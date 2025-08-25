export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  threads_count: number;
  posts_count: number;
  last_post_at?: string;
  last_post_user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  category_id: string;
  category?: ForumCategory;
  title: string;
  content: string;
  author_id: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  likes_count: number;
  last_post_at?: string;
  last_post_user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  thread?: ForumThread;
  content: string;
  author_id: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes_count: number;
  is_liked?: boolean;
  parent_post_id?: string;
  parent_post?: ForumPost;
  replies?: ForumPost[];
  created_at: string;
  updated_at: string;
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