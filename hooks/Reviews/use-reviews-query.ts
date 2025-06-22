import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useSupabase } from '@/components/providers/supabase-provider';
import { GameReview } from './types';

const REVIEWS_PER_PAGE = 6;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Query key factory for better cache management
export const reviewsQueryKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewsQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...reviewsQueryKeys.lists(), filters] as const,
  details: () => [...reviewsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewsQueryKeys.details(), id] as const,
};

interface ReviewsQueryResult {
  reviews: GameReview[];
  totalCount: number;
  hasNextPage: boolean;
}

export function useReviewsQuery(initialData?: GameReview[]) {
  const { supabase } = useSupabase();

  return useInfiniteQuery({
    queryKey: reviewsQueryKeys.lists(),
    queryFn: async ({ pageParam = 0 }): Promise<ReviewsQueryResult> => {
      console.log(`🔍 Fetching community reviews page ${pageParam + 1}`);
      
      // Get current user for interaction status and private reviews
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Get total count efficiently from unified_reviews table
      const { count: totalCount } = await supabase
        .from('unified_reviews')
        .select('*', { count: 'exact', head: true })
        .or(`is_public.eq.true${currentUser ? `,user_id.eq.${currentUser.id}` : ''}`);

      // Fetch paginated reviews with community interaction data
      const from = pageParam * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data: reviewsData, error } = await supabase
        .from('unified_reviews')
        .select(`
          id,
          game_id,
          user_id,
          rating,
          review_text,
          is_public,
          playtime_at_review,
          is_recommended,
          helpfulness_score,
          created_at,
          updated_at
        `)
        .or(`is_public.eq.true${currentUser ? `,user_id.eq.${currentUser.id}` : ''}`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch users data manually and interaction counts
      const reviewIds = reviewsData?.map(r => r.id) || [];
      const userIds = [...new Set(reviewsData?.map(r => r.user_id) || [])];
      
      const [usersData, likesData, bookmarksData, userLikesData, userBookmarksData] = await Promise.all([
        // Get users data
        supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds),
          
        // Get likes count for each review
        supabase
          .from('review_likes')
          .select('review_id')
          .in('review_id', reviewIds),
        
        // Get bookmarks count for each review  
        supabase
          .from('review_bookmarks')
          .select('review_id')
          .in('review_id', reviewIds),
          
        // Get current user's likes
        currentUser ? supabase
          .from('review_likes')
          .select('review_id')
          .eq('user_id', currentUser.id)
          .in('review_id', reviewIds) : { data: [] },
          
        // Get current user's bookmarks
        currentUser ? supabase
          .from('review_bookmarks')
          .select('review_id')
          .eq('user_id', currentUser.id)
          .in('review_id', reviewIds) : { data: [] }
      ]);

      // Count interactions per review
      const likesCounts = (likesData.data || []).reduce((acc: Record<string, number>, like) => {
        acc[like.review_id] = (acc[like.review_id] || 0) + 1;
        return acc;
      }, {});
      
      const bookmarksCounts = (bookmarksData.data || []).reduce((acc: Record<string, number>, bookmark) => {
        acc[bookmark.review_id] = (acc[bookmark.review_id] || 0) + 1;
        return acc;
      }, {});
      
      const userLikes = new Set((userLikesData.data || []).map(like => like.review_id));
      const userBookmarks = new Set((userBookmarksData.data || []).map(bookmark => bookmark.review_id));
      
      // Create users map for quick lookup
      const usersMap = new Map();
      (usersData.data || []).forEach(user => {
        usersMap.set(user.id, user);
      });

      // Transform data with community interaction info
      const transformedReviews = reviewsData?.map((review: any) => ({
        ...review,
        user: usersMap.get(review.user_id) || {
          id: review.user_id,
          username: "Unknown User",
          avatar_url: null
        },
        game_details: undefined, // Will be populated by separate query
        likes_count: likesCounts[review.id] || 0,
        bookmarks_count: bookmarksCounts[review.id] || 0,
        is_liked: userLikes.has(review.id),
        is_bookmarked: userBookmarks.has(review.id)
      })) as GameReview[] || [];

      return {
        reviews: transformedReviews,
        totalCount: totalCount || 0,
        hasNextPage: (totalCount || 0) > (pageParam + 1) * REVIEWS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME, // Renamed from cacheTime in v5
    initialData: initialData ? {
      pages: [{
        reviews: initialData,
        totalCount: initialData.length,
        hasNextPage: true
      }],
      pageParams: [0]
    } : undefined,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: 'always', // Always refetch on component mount for fresh data
  });
}

// Separate hook for reviews stats with independent caching
export function useReviewsStatsQuery() {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ['reviews', 'stats'],
    queryFn: async () => {
      console.log('📊 Fetching community reviews stats');
      
      const { data: statsData, error } = await supabase
        .from('unified_reviews')
        .select('rating, review_text')
        .eq('is_public', true);

      if (error) throw error;

      // Calculate stats
      const totalReviews = statsData?.length || 0;
      const averageRating = totalReviews > 0 
        ? statsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      const ratingsDistribution = statsData?.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      return {
        totalReviews,
        averageRating,
        ratingsDistribution,
        topGenres: [] // Will be populated when game details are available
      };
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}