import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '@/utils/supabase-client';
import { QueryData, GameStatus } from '@/types/game';
import toast from 'react-hot-toast';

export function useGameMutations() {
  const queryClient = useQueryClient();

  const updateGameStatus = useMutation(
    async ({ gameId, status }: { gameId: string; status: GameStatus }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_games")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (error) throw error;
      return { gameId, status };
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<QueryData>("userGames", (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              userGames: page.userGames.map((game) =>
                game.game_id === data.gameId
                  ? { ...game, status: data.status }
                  : game
              ),
            })),
          };
        });
        toast.success("Game status updated");
      },
      onError: () => toast.error("Failed to update game status"),
    }
  );

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

  return {
    updateGameStatus,
    removeFromLibrary,
  };
}

