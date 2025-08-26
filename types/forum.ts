// Base database entity types
export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

// Lightweight user profile for relations
export type UserProfileSummary = Pick<UserProfile, 'id' | 'username' | 'avatar_url'>;

export interface ForumCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  threads_count: number;
  posts_count: number;
  last_post_at?: string | null;
  last_post_user_id?: string | null;
  last_post_user?: UserProfileSummary | null;
  created_at: string;
  updated_at: string;
}

// Category with computed stats (from database view)
export interface ForumCategoryWithStats extends ForumCategory {
  active_users_count: number;
  recent_activity_score: number;
}

// Lightweight category for thread relations
export type CategorySummary = Pick<ForumCategory, 'id' | 'name' | 'color' | 'icon'>;

export interface ForumThread {
  id: string;
  category_id: string;
  category?: CategorySummary | null;
  title: string;
  content: string;
  author_id: string;
  author?: UserProfileSummary | null;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  likes_count: number;
  last_post_at?: string | null;
  last_post_user_id?: string | null;
  last_post_user?: UserProfileSummary | null;
  created_at: string;
  updated_at: string;
}

// Thread with additional computed fields (from database view)
export interface ForumThreadWithDetails extends ForumThread {
  is_liked?: boolean;
  participant_count: number;
  hot_score: number;
}

// Minimal thread info for lists
export type ThreadSummary = Pick<ForumThread, 'id' | 'title' | 'author_id' | 'created_at'>;

export interface ForumPost {
  id: string;
  thread_id: string;
  thread?: ThreadSummary | null;
  content: string;
  author_id: string;
  author?: UserProfileSummary | null;
  likes_count: number;
  is_liked?: boolean;
  parent_post_id?: string | null;
  parent_post?: ForumPost | null;
  replies?: ForumPost[];
  replies_count?: number;
  depth: number;
  created_at: string;
  updated_at: string;
}

// Post with additional computed fields (from database view)
export interface ForumPostWithDetails extends ForumPost {
  thread_title?: string;
  category_id?: string;
  is_thread_locked?: boolean;
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
  title?: string | null;
  content: string;
  author_id: string;
  author?: UserProfileSummary | null;
  category_id: string;
  category?: CategorySummary | null;
  thread_id?: string | null; // For posts, reference to parent thread
  created_at: string;
  relevance: number;
  snippet: string; // Highlighted search snippet
}

export interface ForumStats {
  total_threads: number;
  total_posts: number;
  total_users: number;
  active_users_today: number;
  popular_categories: string[];
  trending_topics: string[];
}

// API Response Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

// Specific API Response Types
export interface CategoriesResponse extends ApiResponse<ForumCategoryWithStats[]> {
  categories: ForumCategoryWithStats[];
}

export interface ThreadsResponse extends ApiResponse<ForumThreadWithDetails[]> {
  threads: ForumThreadWithDetails[];
  pagination: PaginationMeta;
}

export interface PostsResponse extends ApiResponse<ForumPostWithDetails[]> {
  posts: ForumPostWithDetails[];
  pagination: PaginationMeta;
}

export interface SearchResponse extends ApiResponse<SearchResult[]> {
  results: SearchResult[];
  pagination: PaginationMeta;
  query: string;
  searchTime: number;
}

export interface StatsResponse extends ApiResponse<ForumStats> {
  stats: ForumStats;
}

// Single entity responses
export interface CategoryResponse extends ApiResponse<ForumCategory> {
  category: ForumCategory;
}

export interface ThreadResponse extends ApiResponse<ForumThread> {
  thread: ForumThread;
}

export interface PostResponse extends ApiResponse<ForumPost> {
  post: ForumPost;
}

// Error Types
export interface ForumError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ForumError {
  code: 'VALIDATION_ERROR';
  field: string;
  validationDetails: Record<string, string[]>;
}

export interface AuthError extends ForumError {
  code: 'AUTH_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN';
}

export interface DatabaseError extends ForumError {
  code: 'DATABASE_ERROR' | 'NOT_FOUND' | 'CONSTRAINT_VIOLATION';
  constraint?: string;
}

export interface RateLimitError extends ForumError {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter: number;
}

export type ForumApiError = ValidationError | AuthError | DatabaseError | RateLimitError;

// Database Function Return Types
export interface ThreadsWithDetailsResult {
  id: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  title: string;
  content: string;
  author_id: string;
  author_username?: string;
  author_avatar_url?: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  likes_count: number;
  is_liked?: boolean;
  last_post_at?: string;
  last_post_user_id?: string;
  last_post_username?: string;
  last_post_avatar_url?: string;
  participant_count: number;
  hot_score: number;
  created_at: string;
  updated_at: string;
}

export interface PostsWithDetailsResult {
  id: string;
  thread_id: string;
  thread_title?: string;
  content: string;
  author_id: string;
  author_username?: string;
  author_avatar_url?: string;
  likes_count: number;
  is_liked?: boolean;
  parent_post_id?: string;
  replies_count: number;
  depth: number;
  is_thread_locked?: boolean;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesWithStatsResult {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  threads_count: number;
  posts_count: number;
  active_users_count: number;
  recent_activity_score: number;
  last_post_at?: string;
  last_post_user_id?: string;
  last_post_username?: string;
  last_post_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// RPC Function Signatures
export interface ForumRpcFunctions {
  get_category_threads: (args: {
    p_category_id: string;
    p_limit: number;
    p_offset: number;
  }) => ThreadsWithDetailsResult[];
  
  get_thread_posts: (args: {
    p_thread_id: string;
    p_limit: number;
    p_offset: number;
  }) => PostsWithDetailsResult[];
  
  increment_thread_views: (args: {
    thread_uuid: string;
  }) => void;
  
  toggle_thread_like: (args: {
    p_thread_id: string;
    p_user_id: string;
  }) => { liked: boolean; likes_count: number };
  
  toggle_post_like: (args: {
    p_post_id: string;
    p_user_id: string;
  }) => { liked: boolean; likes_count: number };
  
  search_forum_content: (args: {
    p_query: string;
    p_type?: 'all' | 'threads' | 'posts';
    p_category_id?: string;
    p_limit: number;
    p_offset: number;
  }) => SearchResult[];
  
  get_forum_stats: () => ForumStats;
}

// Type guards for runtime type checking
export function isForumThread(obj: unknown): obj is ForumThread {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ForumThread).id === 'string' &&
    typeof (obj as ForumThread).title === 'string' &&
    typeof (obj as ForumThread).content === 'string' &&
    typeof (obj as ForumThread).author_id === 'string'
  );
}

export function isForumPost(obj: unknown): obj is ForumPost {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ForumPost).id === 'string' &&
    typeof (obj as ForumPost).thread_id === 'string' &&
    typeof (obj as ForumPost).content === 'string' &&
    typeof (obj as ForumPost).author_id === 'string'
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ValidationError).code === 'VALIDATION_ERROR' &&
    typeof (error as ValidationError).field === 'string'
  );
}

// Utility types for form handling
export type ThreadFormData = Pick<ForumThread, 'title' | 'content'> & {
  category_id: string;
};

export type PostFormData = Pick<ForumPost, 'content'> & {
  thread_id: string;
  parent_post_id?: string;
};

export type CategoryFormData = Pick<ForumCategory, 'name' | 'description' | 'icon' | 'color'>;

// Sort options for different views
export type ThreadSortOption = 'newest' | 'oldest' | 'popular' | 'most_replies' | 'most_views';
export type PostSortOption = 'newest' | 'oldest' | 'most_liked';
export type SearchSortOption = 'relevance' | 'newest' | 'oldest';

// Query parameter types (from validation schemas)
export type ThreadQueryParams = {
  page: number;
  limit: number;
  category_id?: string;
  search?: string;
  sort: 'newest' | 'oldest' | 'popular' | 'most_replies';
  pinned_only?: boolean;
};

export type PostQueryParams = {
  page: number;
  limit: number;
  thread_id: string;
};

export type SearchParams = {
  query: string;
  type: 'all' | 'threads' | 'posts';
  category_id?: string;
  page: number;
  limit: number;
};

// Filter options
export interface ThreadFilters {
  category_id?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  author_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface PostFilters {
  thread_id?: string;
  author_id?: string;
  parent_post_id?: string;
  date_from?: string;
  date_to?: string;
}

// Activity and notification types
export interface ForumActivity {
  id: string;
  type: 'thread_created' | 'post_created' | 'thread_liked' | 'post_liked' | 'thread_replied';
  user_id: string;
  target_id: string;
  target_type: 'thread' | 'post';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ForumNotification {
  id: string;
  user_id: string;
  type: 'thread_reply' | 'post_reply' | 'thread_mention' | 'post_mention' | 'thread_like' | 'post_like';
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// Legacy request types - use validation schemas instead
// @deprecated - Use CreateThreadData from validations/forum.ts
export interface CreateThreadRequest {
  category_id: string;
  title: string;
  content: string;
}

// @deprecated - Use CreatePostData from validations/forum.ts
export interface CreatePostRequest {
  thread_id: string;
  content: string;
  parent_post_id?: string;
}