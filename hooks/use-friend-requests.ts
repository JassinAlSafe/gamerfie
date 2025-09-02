/**
 * Hook for managing friend requests (sent and received)
 */

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Friend } from '@/types/friend';
import toast from 'react-hot-toast';

interface UseFriendRequestsReturn {
  sentRequests: Friend[];
  receivedRequests: Friend[];
  isLoading: boolean;
  error: string | null;
  fetchFriendRequests: () => Promise<void>;
  cancelSentRequest: (friendId: string) => Promise<void>;
  acceptReceivedRequest: (friendId: string) => Promise<void>;
  declineReceivedRequest: (friendId: string) => Promise<void>;
}

export function useFriendRequests(currentUserId?: string): UseFriendRequestsReturn {
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchFriendRequests = useCallback(async () => {
    if (!currentUserId) {
      console.log('No currentUserId provided to fetchFriendRequests');
      return;
    }

    console.log('Fetching friend requests for user:', currentUserId);
    setIsLoading(true);
    setError(null);

    try {
      // Get sent requests (user_id = currentUserId, status = pending) - basic query first
      console.log('Fetching sent requests for user_id:', currentUserId);
      const { data: sentFriendsData, error: sentError } = await supabase
        .from('friends')
        .select('id, friend_id, status, created_at')
        .eq('user_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (sentError) {
        console.error('Error fetching sent requests:', sentError);
        throw sentError;
      }

      // Get received requests (friend_id = currentUserId, status = pending) - basic query first
      console.log('Fetching received requests for friend_id:', currentUserId);
      const { data: receivedFriendsData, error: receivedError } = await supabase
        .from('friends')
        .select('id, user_id, status, created_at')
        .eq('friend_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (receivedError) {
        console.error('Error fetching received requests:', receivedError);
        throw receivedError;
      }

      // Get profiles for sent requests
      let sentProfilesData = [];
      if (sentFriendsData && sentFriendsData.length > 0) {
        const sentFriendIds = sentFriendsData.map(f => f.friend_id);
        const { data: sentProfiles, error: sentProfilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio')
          .in('id', sentFriendIds);
        
        if (sentProfilesError) {
          console.error('Error fetching sent request profiles:', sentProfilesError);
          throw sentProfilesError;
        }
        sentProfilesData = sentProfiles || [];
      }

      // Get profiles for received requests  
      let receivedProfilesData = [];
      if (receivedFriendsData && receivedFriendsData.length > 0) {
        const receivedSenderIds = receivedFriendsData.map(f => f.user_id);
        const { data: receivedProfiles, error: receivedProfilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, bio')
          .in('id', receivedSenderIds);
          
        if (receivedProfilesError) {
          console.error('Error fetching received request profiles:', receivedProfilesError);
          throw receivedProfilesError;
        }
        receivedProfilesData = receivedProfiles || [];
      }

      // Combine friends data with profile data
      const sentData = sentFriendsData?.map(friend => ({
        ...friend,
        friend_profile: sentProfilesData.find(p => p.id === friend.friend_id)
      })) || [];

      const receivedData = receivedFriendsData?.map(friend => ({
        ...friend,
        sender_profile: receivedProfilesData.find(p => p.id === friend.user_id)
      })) || [];

      console.log('Raw sent requests data:', sentData);
      console.log('Raw received requests data:', receivedData);

      // Transform sent requests
      const transformedSentRequests: Friend[] = (sentData || []).map(request => {
        console.log('Transforming sent request:', request);
        return {
          id: request.friend_profile?.id || '',
          username: request.friend_profile?.username || '',
          display_name: request.friend_profile?.display_name || '',
          bio: request.friend_profile?.bio || '',
          avatar_url: request.friend_profile?.avatar_url || '',
          status: 'pending' as const,
          sender_id: currentUserId,
          online_status: 'offline' as const,
        };
      });

      // Transform received requests
      const transformedReceivedRequests: Friend[] = (receivedData || []).map(request => {
        console.log('Transforming received request:', request);
        return {
          id: request.sender_profile?.id || '',
          username: request.sender_profile?.username || '',
          display_name: request.sender_profile?.display_name || '',
          bio: request.sender_profile?.bio || '',
          avatar_url: request.sender_profile?.avatar_url || '',
          status: 'pending' as const,
          sender_id: request.user_id,
          online_status: 'offline' as const,
        };
      });

      console.log('Transformed sent requests:', transformedSentRequests);
      console.log('Transformed received requests:', transformedReceivedRequests);

      setSentRequests(transformedSentRequests);
      setReceivedRequests(transformedReceivedRequests);

    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch friend requests');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, supabase]);

  const cancelSentRequest = useCallback(async (friendId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', currentUserId)
        .eq('friend_id', friendId)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Friend request cancelled');
      await fetchFriendRequests(); // Refresh the lists
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast.error('Failed to cancel friend request');
    }
  }, [currentUserId, supabase, fetchFriendRequests]);

  const acceptReceivedRequest = useCallback(async (friendId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('user_id', friendId)
        .eq('friend_id', currentUserId)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Friend request accepted!');
      await fetchFriendRequests(); // Refresh the lists
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  }, [currentUserId, supabase, fetchFriendRequests]);

  const declineReceivedRequest = useCallback(async (friendId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('user_id', friendId)
        .eq('friend_id', currentUserId)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Friend request declined');
      await fetchFriendRequests(); // Refresh the lists
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    }
  }, [currentUserId, supabase, fetchFriendRequests]);

  // Fetch requests when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      fetchFriendRequests();
    }
  }, [currentUserId, fetchFriendRequests]);

  return {
    sentRequests,
    receivedRequests,
    isLoading,
    error,
    fetchFriendRequests,
    cancelSentRequest,
    acceptReceivedRequest,
    declineReceivedRequest,
  };
}