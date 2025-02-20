import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/utils/supabase-client';
import { QueryData, ReviewUpdateData } from '@/types/game';
import toast from 'react-hot-toast';

export function useGameMutations() {
  const queryClient = useQueryClient();

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

  const removeFromLibrary = useMutation<string, Error, string>(
    async (gameId) => {
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
    {
      onSuccess: (gameId) => {
        queryClient.setQueryData<QueryData>("userGames", (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              userGames: page.userGames.filter((game) => game.game_id !== gameId),
            })),
          };
        });
        queryClient.invalidateQueries("gameStats");
        toast.success("Game removed from library");
      },
      onError: () => {
        toast.error("Failed to remove game from library");
      },
    }
  );

  const onReviewUpdate = useMutation<ReviewUpdateData, Error, ReviewUpdateData>(
    async ({ gameId, rating, reviewText }) => {
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
    {
      onSuccess: ({ gameId, rating, reviewText }) => {
        queryClient.setQueryData<QueryData>("userGames", (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              userGames: page.userGames.map((game) =>
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
    }
  );

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
      queryClient.invalidateQueries(['userGames']);
    }
  });

  return {
    updateGameStatus,
    removeFromLibrary,
    onReviewUpdate,
    updateReview, // Add this to the returned object
  };
}