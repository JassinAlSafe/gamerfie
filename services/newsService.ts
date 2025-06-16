import { NewsPost, CreateNewsPost, UpdateNewsPost, NewsListResponse, NewsFilters } from '@/types/news';

export class NewsService {
  private static readonly API_BASE = '/api/news';

  static async getNewsPosts(filters: NewsFilters = {}): Promise<NewsListResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.category) searchParams.append('category', filters.category);
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.search) searchParams.append('search', filters.search);
      if (filters.page) searchParams.append('page', filters.page.toString());
      if (filters.limit) searchParams.append('limit', filters.limit.toString());

      const response = await fetch(`${this.API_BASE}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news posts: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        posts: data.posts || [],
        total: data.total || 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('Error fetching news posts:', error);
      throw error;
    }
  }

  static async getNewsPost(id: string): Promise<NewsPost> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('News post not found');
        }
        throw new Error(`Failed to fetch news post: ${response.statusText}`);
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error('Error fetching news post:', error);
      throw error;
    }
  }

  static async getNewsPostBySlug(slug: string): Promise<NewsPost> {
    try {
      // For now, we'll fetch all published posts and filter by slug
      // In production, you'd want to add a slug endpoint to the API
      const response = await this.getNewsPosts({ status: 'published', limit: 100 });
      const post = response.posts.find(p => p.slug === slug);
      
      if (!post) {
        throw new Error('News post not found');
      }

      return post;
    } catch (error) {
      console.error('Error fetching news post by slug:', error);
      throw error;
    }
  }

  static async createNewsPost(newsPost: CreateNewsPost): Promise<NewsPost> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsPost),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create news post: ${response.statusText}`);
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error('Error creating news post:', error);
      throw error;
    }
  }

  static async updateNewsPost(newsPost: UpdateNewsPost): Promise<NewsPost> {
    try {
      const { id, ...updateData } = newsPost;
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update news post: ${response.statusText}`);
      }

      const data = await response.json();
      return data.post;
    } catch (error) {
      console.error('Error updating news post:', error);
      throw error;
    }
  }

  static async deleteNewsPost(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete news post: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting news post:', error);
      throw error;
    }
  }

  static async getPublishedPosts(limit = 10, page = 1): Promise<NewsListResponse> {
    return this.getNewsPosts({
      status: 'published',
      limit,
      page
    });
  }

  static async getFeaturedPosts(limit = 5): Promise<NewsPost[]> {
    try {
      const response = await this.getNewsPosts({
        status: 'published',
        limit
      });
      
      // Return posts with badges or most recent ones
      return response.posts.filter(post => post.badge || post.category === 'Feature');
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  }
}