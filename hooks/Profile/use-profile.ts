import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Profile } from '@/types/profile';
import { useCallback } from 'react';

interface ProfileStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}

export function useProfile() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  // Get user session with optimized caching
  const { data: session, error: sessionError } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Get user profile with optimized caching
  const { data: profile, error: profileError } = useQuery({
    queryKey: ['profile', session?.id],
    queryFn: async () => {
      if (!session?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const defaultStats: ProfileStats = {
    total_played: 0,
    played_this_year: 0,
    backlog: 0
  };

  // Get game stats with optimized caching
  const { data: gameStats = defaultStats, isLoading: isStatsLoading } = useQuery<ProfileStats | null>({
    queryKey: ['gameStats', session?.id],
    queryFn: async () => {
      if (!session?.id) return null;

      // Get current year
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1).toISOString();

      // Get all user games
      const { data: userGames, error } = await supabase
        .from('user_games')
        .select('status, created_at')
        .eq('user_id', session.id);

      if (error) throw error;

      // Calculate stats
      const stats: ProfileStats = {
        total_played: userGames.filter(game => 
          game.status === 'completed' || game.status === 'playing'
        ).length,
        played_this_year: userGames.filter(game => 
          (game.status === 'completed' || game.status === 'playing') && 
          new Date(game.created_at) >= new Date(startOfYear)
        ).length,
        backlog: userGames.filter(game => 
          game.status === 'want_to_play'
        ).length
      };

      return stats;
    },
    enabled: !!session?.id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const error = sessionError || profileError;
  const isLoading = !session || (!profile && !profileError);

  // Optimized update function with cache invalidation
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!session?.id) throw new Error('No authenticated user');
    
    // Optimistic update
    queryClient.setQueryData(['profile', session.id], (oldData: Profile | undefined) => {
      return oldData ? { ...oldData, ...updates } : oldData;
    });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.id);
      
      if (error) throw error;
      
      // Invalidate and refetch on success
      queryClient.invalidateQueries({ queryKey: ['profile', session.id] });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['profile', session.id] });
      throw error;
    }
  }, [session?.id, supabase, queryClient]);

  return {
    profile,
    isLoading,
    error,
    gameStats,
    isStatsLoading,
    updateProfile
  };
}