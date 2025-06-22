import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useSupabase } from '@/components/providers/supabase-provider';
import { GameReview } from './types';

const REVIEWS_PER_PAGE = 20;
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
      console.log(`🔍 Fetching reviews page ${pageParam + 1}`);
      
      // Get current user for private reviews
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Get total count efficiently
      const { count: totalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'review')
        .or(`is_public.eq.true${currentUser ? `,user_id.eq.${currentUser.id}` : ''}`);

      // Fetch paginated reviews
      const from = pageParam * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data: reviewsData, error } = await supabase
        .from('journal_entries')
        .select(`
          id,
          game_id,
          user_id,
          rating,
          content,
          is_public,
          created_at,
          updated_at,
          user:profiles!user_id(id, username, avatar_url)
        `)
        .eq('type', 'review')
        .or(`is_public.eq.true${currentUser ? `,user_id.eq.${currentUser.id}` : ''}`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data
      const transformedReviews = reviewsData?.map((review: any) => ({
        ...review,
        review_text: review.content,
        user: Array.isArray(review.user) ? review.user[0] : review.user,
        game_details: undefined, // Will be populated by separate query
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
      console.log('📊 Fetching reviews stats');
      
      const { data: statsData, error } = await supabase
        .from('journal_entries')
        .select('rating, content')
        .eq('type', 'review')
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