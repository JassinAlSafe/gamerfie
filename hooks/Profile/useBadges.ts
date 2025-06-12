import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  type: 'challenge' | 'achievement' | 'special' | 'community';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

interface UserBadge {
  badge: Badge;
  claimed_at: string;
  challenge_id?: string;
  isNew?: boolean;
}

export function useBadges(userId?: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUserBadges = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_badges')
        .select(`
          claimed_at,
          challenge_id,
          badge:badges(
            id,
            name,
            description,
            icon_url,
            type,
            rarity,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('claimed_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching user badges:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Transform data and mark recent badges as new (within last 7 days)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const userBadges = (data || [])
        .filter(item => item.badge) // Filter out null badges
        .map(item => ({
          badge: item.badge as Badge,
          claimed_at: item.claimed_at,
          challenge_id: item.challenge_id,
          isNew: new Date(item.claimed_at) > weekAgo
        }));

      setBadges(userBadges);
    } catch (err) {
      console.error('Error in fetchUserBadges:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchUserBadges();
  }, [fetchUserBadges]);

  const recentBadges = badges.filter(badge => badge.isNew);
  const totalBadges = badges.length;

  return {
    badges,
    recentBadges,
    totalBadges,
    isLoading,
    error,
    refetch: fetchUserBadges
  };
}