import { useState, useCallback, useRef } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import toast from "react-hot-toast";
import { GameReview } from "./types";

interface ReviewsDataState {
  reviews: GameReview[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  page: number;
  totalCount: number;
}

const REVIEWS_PER_PAGE = 20;

export function useReviewsData(initialReviews?: GameReview[] | null) {
  const [state, setState] = useState<ReviewsDataState>({
    reviews: initialReviews || [],
    isLoading: false, // Don't show loading if we have initial data
    error: null,
    hasNextPage: initialReviews ? true : false, // Assume more data if we have initial reviews
    page: 1,
    totalCount: initialReviews?.length || 0
  });

  const { supabase } = useSupabase();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Get current user to include their private reviews
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Get total count efficiently
      const { count: totalCount, error: countError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'review')
        .or(`is_public.eq.true${currentUser ? `,user_id.eq.${currentUser.id}` : ''}`);

      if (countError) throw countError;

      // Fetch paginated reviews with minimal data first
      const from = (page - 1) * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data: reviewsData, error: reviewsError } = await supabase
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

      if (reviewsError) throw reviewsError;

      // Transform data without game details (will be loaded separately)
      const transformedReviews = reviewsData?.map((review: any) => ({
        ...review,
        review_text: review.content,
        user: Array.isArray(review.user) ? review.user[0] : review.user,
        game_details: undefined // Will be hydrated by useGameDetails
      })) as GameReview[] || [];

      setState(prev => ({
        ...prev,
        reviews: append ? [...prev.reviews, ...transformedReviews] : transformedReviews,
        isLoading: false,
        hasNextPage: (totalCount || 0) > page * REVIEWS_PER_PAGE,
        totalCount: totalCount || 0,
        page
      }));

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error("Error fetching reviews:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load reviews";
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));

      toast.error(errorMessage);
    }
  }, [supabase]);

  const loadMoreReviews = useCallback(() => {
    if (!state.isLoading && state.hasNextPage) {
      fetchReviews(state.page + 1, true);
    }
  }, [fetchReviews, state.isLoading, state.hasNextPage, state.page]);

  const refetchReviews = useCallback(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    ...state,
    fetchReviews,
    loadMoreReviews,
    refetchReviews,
    cleanup
  };
}