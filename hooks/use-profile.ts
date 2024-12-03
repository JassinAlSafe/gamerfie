import { useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Game } from '@/types';
import { Profile } from '../types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

export function useProfile() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const profileQuery = useQuery(
    ['profile'],
    async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const gamesQuery = useQuery(
    ['games'],
    async () => {
      if (!profileQuery.data) return [];
      const { data, error } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", profileQuery.data.id);

      if (error) throw error;
      return data;
    },
    {
      enabled: !!profileQuery.data,
    }
  );

  const calculateGameStats = useCallback((games: Game[]): GameStats => {
    const currentYear = new Date().getFullYear();
    return games.reduce(
      (stats, game) => {
        if (game.status === "completed" || game.status === "playing") {
          stats.total_played++;
          if (new Date(game.updated_at).getFullYear() === currentYear) {
            stats.played_this_year++;
          }
        } else if (game.status === "want_to_play") {
          stats.backlog++;
        }
        return stats;
      },
      { total_played: 0, played_this_year: 0, backlog: 0 }
    );
  }, []);

  const gameStats = useMemo(() => calculateGameStats(gamesQuery.data || []), [gamesQuery.data, calculateGameStats]);

  const updateProfileMutation = useMutation(
    async (updates: Partial<Profile>) => {
      if (!profileQuery.data) throw new Error("No profile data");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileQuery.data.id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
        toast.success("Profile updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    }
  );

  const updateGameStatsMutation = useMutation(
    async (games: Game[]) => {
      // Implement the logic to update game stats in the database
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['games']);
        toast.success("Game stats updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update game stats");
      },
    }
  );

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || gamesQuery.isLoading,
    gameStats,
    updateProfile: updateProfileMutation.mutate,
    updateGameStats: updateGameStatsMutation.mutate,
  };
}