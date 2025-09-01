import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Friend } from '@/types/friend';

export function useUserSearch() {
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const supabase = createClient();

  const searchUsers = useCallback(async (query: string, currentUserId?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // IMPORTANT: Use getUser() not getSession() for security
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("No authenticated user");
      }

      // Get profiles that match the search query
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .limit(5);

      if (profilesError) throw profilesError;
      if (!profilesData) {
        setSearchResults([]);
        return;
      }

      // Get all friend relationships for these profiles
      const userIds = profilesData.map((profile) => profile.id);
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.in.(${userIds.join(
            ","
          )})),` +
            `and(friend_id.eq.${user.id},user_id.in.(${userIds.join(
              ","
            )}))`
        );

      if (friendsError) throw friendsError;

      // Transform profiles into Friend type with friendship status
      const transformedResults = profilesData
        .filter(profile => profile.id !== user.id) // Exclude current user
        .map((profile) => {
          const friendship = friendsData?.find(
            (f) => f.friend_id === profile.id || f.user_id === profile.id
          );

          return {
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            status: friendship?.status || null,
            sender_id: friendship?.user_id || null,
            online_status: profile.online_status || "offline",
          } as Friend;
        });

      setSearchResults(transformedResults);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchError(error instanceof Error ? error.message : "Failed to search users");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchUsers,
    clearSearch
  };
}