import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Profile, type Game, type GameStats } from '@/types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const updateGameStats = useCallback((games: Game[]) => {
    const newStats = calculateGameStats(games);
    setGameStats(newStats);
  }, [calculateGameStats]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) throw error;

    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        const [profileResponse, gamesResponse] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("user_games").select("*").eq("user_id", user.id)
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (gamesResponse.error) throw gamesResponse.error;

        setProfile(profileResponse.data);
        updateGameStats(gamesResponse.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, updateGameStats]);

  return {
    profile,
    isLoading,
    gameStats,
    updateProfile,
    updateGameStats,
  };
}