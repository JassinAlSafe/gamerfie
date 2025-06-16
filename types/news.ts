export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category: 'Product Update' | 'Feature' | 'Announcement' | 'Security' | 'Community';
  status: 'draft' | 'published';
  badge?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_id?: string;
  comments_enabled?: boolean;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
    display_name?: string;
  };
}

export interface CreateNewsPost {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category: NewsPost['category'];
  status?: NewsPost['status'];
  badge?: string;
  published_at?: string;
  comments_enabled?: boolean;
}

export interface UpdateNewsPost extends Partial<CreateNewsPost> {
  id: string;
}

export interface NewsListResponse {
  posts: NewsPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NewsFilters {
  category?: NewsPost['category'];
  status?: NewsPost['status'];
  search?: string;
  page?: number;
  limit?: number;
}

export interface NewsComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
    display_name?: string;
  };
}

export interface CreateNewsComment {
  post_id: string;
  content: string;
}

export interface UpdateNewsComment {
  id: string;
  content: string;
}

export interface CommentsResponse {
  comments: NewsComment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}