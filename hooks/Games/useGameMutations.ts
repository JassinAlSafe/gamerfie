import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

interface ReviewUpdateData {
  gameId: string;
  rating: number;
  reviewText: string;
}

export function useGameMutations() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const updateGameStatus = async (gameId: string, status: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update game status');
      }

      // Optionally refresh the games data or update local state
      // You might want to call any refresh functions from your games store here
    } catch (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
  };

  const removeFromLibrary = useMutation({
    mutationFn: async (gameId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", gameId);
      if (error) throw error;
      return gameId;
    },
    onSuccess: (gameId: string) => {
      queryClient.setQueryData(["userGames"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages?.map((page: any) => ({
            ...page,
            userGames: page.userGames?.filter((game: any) => game.game_id !== gameId),
          })),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["gameStats"] });
      toast.success("Game removed from library");
    },
    onError: () => {
      toast.error("Failed to remove game from library");
    },
  });

  const onReviewUpdate = useMutation({
    mutationFn: async ({ gameId, rating, reviewText }: ReviewUpdateData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("game_reviews").upsert({
        user_id: user.id,
        game_id: gameId,
        rating,
        review_text: reviewText,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return { gameId, rating, reviewText };
    },
    onSuccess: ({ gameId, rating, reviewText }: ReviewUpdateData) => {
      queryClient.setQueryData(["userGames"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages?.map((page: any) => ({
            ...page,
            userGames: page.userGames?.map((game: any) =>
              game.game_id === gameId
                ? { ...game, review: { rating, text: reviewText } }
                : game
            ),
          })),
        };
      });
      toast.success("Review updated successfully");
    },
    onError: () => {
      toast.error("Failed to update review");
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ gameId, review }: { gameId: string; review: string }) => {
      const response = await fetch(`/api/games/${gameId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review })
      });
      if (!response.ok) throw new Error('Failed to update review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGames'] });
    }
  });

  return {
    updateGameStatus,
    removeFromLibrary,
    onReviewUpdate,
    updateReview, // Add this to the returned object
  };
}