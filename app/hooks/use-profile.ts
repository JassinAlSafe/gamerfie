import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchProfile, updateProfile, fetchUserGames } from '@/lib/api';
import { Game } from '@/types';
import { Profile } from '@/types/index';
import { GameStats } from '@/types/index';
import { toast } from 'react-hot-toast';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    total_played: 0,
    played_this_year: 0,
    backlog: 0,
  });

  const supabase = createClientComponentClient();

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

  const updateGameStats = useCallback(async (userId: string) => {
    try {
      const { games } = await fetchUserGames(userId);
      const newStats = calculateGameStats(games);
      setGameStats(newStats);
    } catch (error) {
      console.error('Error updating game stats:', error);
    }
  }, [calculateGameStats]);

  const updateProfileData = async (updates: Partial<Profile>) => {
    if (!profile) return;

    try {
      const updatedProfile = await updateProfile(profile.id, updates);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const fetchedProfile = await fetchProfile();
        setProfile(fetchedProfile);
        await updateGameStats(fetchedProfile.id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [updateGameStats]);

  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` }, (payload) => {
        setProfile(payload.new as Profile);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, profile?.id]);

  return {
    profile,
    isLoading,
    error,
    gameStats,
    updateProfile: updateProfileData,
    updateGameStats,
  };
}

