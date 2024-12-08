
import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "@/utils/game-utils";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Profile } from "@/types/index";

export function useProfile() {
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setProfile(data.user);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const { data: stats } = useQuery(["userStats", profile?.id], () =>
    fetchUserStats(supabase, profile.id),
    {
      enabled: !!profile?.id,
    }
  );

  const updateProfile = async (updatedProfile: Profile) => {
    try {
      const { data, error } = await supabase.auth.updateUser(updatedProfile);
      if (error) throw error;
      setProfile(data.user);
    } catch (error) {
      setError(error);
    }
  };

  return {
    profile,
    isLoading,
    error,
    gameStats: stats,
    updateProfile,
  };
}