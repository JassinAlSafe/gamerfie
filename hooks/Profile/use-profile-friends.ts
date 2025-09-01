import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { Friend, FriendStatus } from '@/types/friend';

const QUERY_KEYS = {
  friends: ['profile', 'friends'] as const,
  friendRequests: ['profile', 'friend-requests'] as const,
};

export function useProfileFriends() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch friends with React Query
  const {
    data: friends = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.friends,
    queryFn: async (): Promise<Friend[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Fetch friends relationships
      const { data: friendships, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (friendsError) throw friendsError;
      if (!friendships || friendships.length === 0) return [];

      // Get all unique friend IDs
      const friendIds = friendships.map(friendship => 
        friendship.user_id === user.id ? friendship.friend_id : friendship.user_id
      ).filter(Boolean);

      if (friendIds.length === 0) return [];

      // Fetch friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, created_at')
        .in('id', friendIds);

      if (profilesError) throw profilesError;

      // Map friendships to friends with profiles
      return friendships.map(friendship => {
        const friendId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
        const profile = profiles?.find(p => p.id === friendId);
        
        return {
          id: friendship.id,
          user_id: user.id,
          friend_id: friendId,
          status: friendship.status as FriendStatus,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
          profile: profile ? {
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            created_at: profile.created_at
          } : null
        };
      }).filter(friend => friend.profile !== null);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRequests });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friends });
    },
  });

  return {
    friends,
    isLoading,
    error,
    refetch,
    addFriend: addFriendMutation.mutate,
    removeFriend: removeFriendMutation.mutate,
    isAddingFriend: addFriendMutation.isPending,
    isRemovingFriend: removeFriendMutation.isPending,
  };
}