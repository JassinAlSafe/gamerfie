import { useMutation, useQueryClient } from 'react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QueryData, ReviewUpdateData } from '@/types/game';
import toast from 'react-hot-toast';

export function useGameMutations() {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();

  const updateGameStatus = async (gameId: string, status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_games")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (error) throw error;

      // Refresh the games data
      queryClient.invalidateQueries(['games']);
      toast.success("Game status updated");
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error("Failed to update game status");
      throw error;
    }
  };

  const removeFromLibrary = useMutation<string, Error, string>(
    async (gameId) => {
      const { data: { user } } = await supabase.auth.getUser();
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

  const updateReview = useMutation({
    mutationFn: async ({ gameId, review }: { gameId: string; review: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("game_reviews")
        .upsert({
          user_id: user.id,
          game_id: gameId,
          review_text: review,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { gameId, review };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userGames']);
      toast.success("Review updated successfully");
    },
    onError: () => {
      toast.error("Failed to update review");
    }
  });

  return {
    updateGameStatus,
    removeFromLibrary,
    updateReview,
  };
}