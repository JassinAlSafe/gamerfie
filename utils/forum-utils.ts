import type {
  ForumThread,
  ForumPost,
  ForumCategory,
  UserProfile,
  ThreadSortOption,
  PostSortOption,
  ForumApiError
} from '@/types/forum';

/**
 * Forum utility functions with type safety
 */

// Date formatting utilities
export function formatForumDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // For older dates, show the actual date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDetailedForumDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Thread utilities
export function getThreadStatusText(thread: ForumThread): string {
  if (thread.is_pinned && thread.is_locked) {
    return 'Pinned & Locked';
  }
  if (thread.is_pinned) {
    return 'Pinned';
  }
  if (thread.is_locked) {
    return 'Locked';
  }
  return 'Open';
}

export function getThreadStatusColor(thread: ForumThread): 'green' | 'red' | 'blue' | 'gray' {
  if (thread.is_locked) {
    return 'red';
  }
  if (thread.is_pinned) {
    return 'blue';
  }
  return 'green';
}

export function isThreadActive(thread: ForumThread, hoursThreshold = 24): boolean {
  if (!thread.last_post_at) {
    return false;
  }
  
  const lastActivity = new Date(thread.last_post_at);
  const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  
  return lastActivity > threshold;
}

export function calculateThreadHotScore(thread: ForumThread): number {
  // Simple algorithm to calculate thread "hotness"
  const ageInHours = (Date.now() - new Date(thread.created_at).getTime()) / (1000 * 60 * 60);
  const likesWeight = thread.likes_count * 2;
  const repliesWeight = thread.replies_count * 1.5;
  const viewsWeight = thread.views_count * 0.1;
  const pinnedBonus = thread.is_pinned ? 50 : 0;
  
  // Decay factor based on age
  const decayFactor = Math.max(0.1, 1 - (ageInHours / (24 * 7))); // Decay over a week
  
  return (likesWeight + repliesWeight + viewsWeight + pinnedBonus) * decayFactor;
}

// Post utilities
export function getPostDepthColor(depth: number): string {
  const colors = [
    'border-l-blue-300',
    'border-l-green-300',
    'border-l-purple-300',
    'border-l-orange-300',
    'border-l-pink-300',
    'border-l-indigo-300',
  ];
  
  return colors[Math.min(depth, colors.length - 1)] || colors[colors.length - 1];
}

export function canReplyToPost(post: ForumPost, maxDepth = 5): boolean {
  return post.depth < maxDepth;
}

export function truncateContent(content: string, maxLength = 200): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  const truncated = content.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.slice(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

// Category utilities
export function getCategoryIconWithFallback(category: ForumCategory): string {
  return category.icon || '📁';
}

export function getCategoryColorClass(color: string | null | undefined): string {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  return colorMap[color || 'blue'] || colorMap.blue;
}

// User utilities
export function getUserDisplayName(user: UserProfile | null | undefined): string {
  if (!user) {
    return 'Anonymous';
  }
  
  return user.username || 'User';
}

export function getUserAvatarUrl(user: UserProfile | null | undefined): string | null {
  return user?.avatar_url || null;
}

export function getUserInitials(user: UserProfile | null | undefined): string {
  if (!user?.username) {
    return 'U';
  }
  
  return user.username
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Search utilities
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function generateSearchSnippet(content: string, searchTerm: string, maxLength = 150): string {
  if (!searchTerm.trim()) {
    return truncateContent(content, maxLength);
  }
  
  const lowerContent = content.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const termIndex = lowerContent.indexOf(lowerTerm);
  
  if (termIndex === -1) {
    return truncateContent(content, maxLength);
  }
  
  const halfLength = Math.floor(maxLength / 2);
  const start = Math.max(0, termIndex - halfLength);
  const end = Math.min(content.length, termIndex + searchTerm.length + halfLength);
  
  let snippet = content.slice(start, end);
  
  if (start > 0) {
    snippet = '...' + snippet;
  }
  if (end < content.length) {
    snippet = snippet + '...';
  }
  
  return snippet;
}

// Sorting utilities
export function sortThreads(threads: ForumThread[], sortBy: ThreadSortOption): ForumThread[] {
  return [...threads].sort((a, b) => {
    // Always prioritize pinned threads
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'popular':
        return b.likes_count - a.likes_count;
      case 'most_replies':
        return b.replies_count - a.replies_count;
      case 'most_views':
        return b.views_count - a.views_count;
      default:
        return 0;
    }
  });
}

export function sortPosts(posts: ForumPost[], sortBy: PostSortOption): ForumPost[] {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'most_liked':
        return b.likes_count - a.likes_count;
      default:
        return 0;
    }
  });
}

// Validation utilities
export function isValidThreadTitle(title: string): boolean {
  return title.trim().length >= 1 && title.trim().length <= 200;
}

export function isValidPostContent(content: string): boolean {
  return content.trim().length >= 1 && content.trim().length <= 10000;
}

export function isValidCategoryName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 100;
}

export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return username.length >= 1 && 
         username.length <= 50 && 
         usernameRegex.test(username);
}

// Error utilities
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    const forumError = error as ForumApiError;
    if (forumError.message) {
      return forumError.message;
    }
    
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  
  return 'An unexpected error occurred';
}

export function isForumApiError(error: unknown): error is ForumApiError {
  return typeof error === 'object' && 
         error !== null && 
         'code' in error && 
         'message' in error;
}

// URL utilities
export function generateThreadSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
  
  return `${slug}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1];
}

// Content moderation utilities
export function containsProfanity(content: string): boolean {
  // This is a simple implementation - in practice, you'd use a more sophisticated system
  const profanityWords = ['spam', 'inappropriate']; // Add your list
  const lowerContent = content.toLowerCase();
  
  return profanityWords.some(word => lowerContent.includes(word));
}

export function sanitizeContent(content: string): string {
  // Basic HTML sanitization - in practice, use a library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// Statistics utilities
export function calculateEngagementScore(thread: ForumThread): number {
  const replies = thread.replies_count || 0;
  const likes = thread.likes_count || 0;
  const views = thread.views_count || 0;
  
  // Weighted engagement score
  return (replies * 3) + (likes * 2) + (views * 0.1);
}

export function getThreadActivityLevel(thread: ForumThread): 'low' | 'medium' | 'high' {
  const score = calculateEngagementScore(thread);
  
  if (score < 10) return 'low';
  if (score < 50) return 'medium';
  return 'high';
}

// Type guards
export function hasAuthor(item: ForumThread | ForumPost): item is (ForumThread | ForumPost) & { author: UserProfile } {
  return item.author !== null && item.author !== undefined;
}

export function hasCategory(thread: ForumThread): thread is ForumThread & { category: ForumCategory } {
  return thread.category !== null && thread.category !== undefined;
}

export function isReply(post: ForumPost): boolean {
  return post.parent_post_id !== null && post.parent_post_id !== undefined;
}