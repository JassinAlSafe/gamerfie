import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { JournalEntry } from '@/types/journal';

const QUERY_KEYS = {
  reviews: ['profile', 'reviews'] as const,
  userReviews: (userId: string) => ['profile', 'reviews', userId] as const,
};

export function useProfileReviews(limit = 5) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch user's reviews/journal entries
  const {
    data: reviews = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...QUERY_KEYS.reviews, limit],
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error: reviewsError } = await supabase
        .from('journal_entries')
        .select(`
          id,
          user_id,
          game_id,
          title,
          content,
          rating,
          play_time,
          status,
          is_spoiler,
          is_public,
          created_at,
          updated_at,
          games:game_id (
            id,
            name,
            cover_url,
            release_date
          )
        `)
        .eq('user_id', user.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (reviewsError) throw reviewsError;

      return data?.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        game_id: entry.game_id,
        title: entry.title,
        content: entry.content,
        rating: entry.rating,
        play_time: entry.play_time,
        status: entry.status,
        is_spoiler: entry.is_spoiler,
        is_public: entry.is_public,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        game: entry.games ? {
          id: entry.games.id,
          name: entry.games.name,
          cover_url: entry.games.cover_url,
          release_date: entry.games.release_date,
        } : null,
      })) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - reviews don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      game_id: string;
      title: string;
      content: string;
      rating?: number;
      play_time?: number;
      status?: string;
      is_spoiler?: boolean;
      is_public?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          ...reviewData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: {
      id: string;
      title?: string;
      content?: string;
      rating?: number;
      play_time?: number;
      status?: string;
      is_spoiler?: boolean;
      is_public?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user owns the review

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure user owns the review

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    },
  });

  return {
    reviews,
    isLoading,
    error,
    refetch,
    createReview: createReviewMutation.mutate,
    updateReview: updateReviewMutation.mutate,
    deleteReview: deleteReviewMutation.mutate,
    isCreatingReview: createReviewMutation.isPending,
    isUpdatingReview: updateReviewMutation.isPending,
    isDeletingReview: deleteReviewMutation.isPending,
  };
}

// Hook to get reviews for a specific user (public only)
export function useUserReviews(userId: string, limit = 10) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...QUERY_KEYS.userReviews(userId), limit],
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          id,
          user_id,
          game_id,
          title,
          content,
          rating,
          play_time,
          status,
          is_spoiler,
          is_public,
          created_at,
          updated_at,
          games:game_id (
            id,
            name,
            cover_url,
            release_date
          )
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        game_id: entry.game_id,
        title: entry.title,
        content: entry.content,
        rating: entry.rating,
        play_time: entry.play_time,
        status: entry.status,
        is_spoiler: entry.is_spoiler,
        is_public: entry.is_public,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        game: entry.games ? {
          id: entry.games.id,
          name: entry.games.name,
          cover_url: entry.games.cover_url,
          release_date: entry.games.release_date,
        } : null,
      })) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  });
}