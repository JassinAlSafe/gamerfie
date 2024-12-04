import { useState, useEffect, useCallback, useRef } from 'react';
import { createSupabaseClient } from '@/utils/supabaseClient'; // Ensure this client is centralized
import { type Profile } from '@/types/profile';
import { type Game } from '@/types/game';
import toast from 'react-hot-toast';

interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
  hearted_games: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats>({
    total_played: 0,
    played_this_year: 0,
    backlog: 0,
    hearted_games: 0,
  });

  const supabase = createSupabaseClient();
  const mounted = useRef(false);

  const calculateGameStats = useCallback((games: Game[]): GameStats => {
    const currentYear = new Date().getFullYear();
    return games.reduce(
      (stats, game) => {
        if (game.status === 'completed' || game.status === 'playing') {
          stats.total_played++;
          if (new Date(game.updated_at).getFullYear() === currentYear) {
            stats.played_this_year++;
          }
        } else if (game.status === 'want_to_play') {
          stats.backlog++;
        }
        if (game.isHearted) {
          stats.hearted_games++;
        }
        return stats;
      },
      { total_played: 0, played_this_year: 0, backlog: 0, hearted_games: 0 }
    );
  }, []);

  const updateGameStats = useCallback(
    (games: Game[]) => {
      const newStats = calculateGameStats(games);
      setGameStats(newStats);
    },
    [calculateGameStats]
  );

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const updateGameHeart = useCallback(
    async (gameId: string, isHearted: boolean) => {
      if (!profile) return;

      const toastId = toast.loading('Updating...');
      try {
        if (isHearted) {
          await supabase.from('hearted_games').insert({
            user_id: profile.id,
            game_id: gameId,
          });
        } else {
          await supabase
            .from('hearted_games')
            .delete()
            .match({ user_id: profile.id, game_id: gameId });
        }

        fetchProfile(); // Refresh the profile and stats after update
        toast.success('Game status updated', { id: toastId });
      } catch (error) {
        console.error('Error updating game heart status:', error);
        toast.error('Failed to update game status', { id: toastId });
      }
    },
    [profile, supabase]
  );

  const fetchProfile = useCallback(async () => {
    if (!mounted.current) return;

    setIsLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;

      const [profileResponse, gamesResponse, heartedGamesResponse] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('user_games').select('*').eq('user_id', user.id),
          supabase.from('hearted_games').select('game_id').eq('user_id', user.id),
        ]);

      if (profileResponse.error) throw profileResponse.error;
      if (gamesResponse.error) throw gamesResponse.error;
      if (heartedGamesResponse.error) throw heartedGamesResponse.error;

      const gamesWithHeartStatus = gamesResponse.data.map((game) => ({
        ...game,
        isHearted: heartedGamesResponse.data.some(
          (hg) => hg.game_id === game.id
        ),
      }));

      setProfile(profileResponse.data);
      updateGameStats(gamesWithHeartStatus);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [supabase, updateGameStats]);

  useEffect(() => {
    mounted.current = true;
    fetchProfile();

    return () => {
      mounted.current = false;
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile?.id) return;

    const subscription = supabase
      .channel('hearted_games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hearted_games',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id, supabase, fetchProfile]);

  return {
    profile,
    isLoading,
    gameStats,
    updateProfile,
    updateGameStats,
    updateGameHeart,
    fetchProfile,
  };
}