
/**
 * Simple friends page handlers hook
 * Implements the missing TODO functionality while keeping original design
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShareType } from '@/types/profile-modal.types';
import { createClient } from '@/utils/supabase/client';

interface UseFriendsHandlersProps {
  currentUserId?: string;
}

export function useFriendsHandlers({ currentUserId }: UseFriendsHandlersProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleFollowUser = useCallback(async (userId: string) => {
    if (!currentUserId) {
      console.warn('Cannot follow user: currentUserId is not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: currentUserId,
          following_id: userId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error following user:', error);
        throw new Error(`Failed to follow user: ${error.message}`);
      }

      console.log('Successfully followed user:', userId);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  }, [currentUserId, supabase]);

  const handleUnfollowUser = useCallback(async (userId: string) => {
    if (!currentUserId) {
      console.warn('Cannot unfollow user: currentUserId is not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        throw new Error(`Failed to unfollow user: ${error.message}`);
      }

      console.log('Successfully unfollowed user:', userId);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  }, [currentUserId, supabase]);

  const handleMessageUser = useCallback((userId: string) => {
    router.push(`/messages?userId=${userId}`);
  }, [router]);

  const handleShareProfile = useCallback(async (userId: string, shareType: ShareType) => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    
    try {
      switch (shareType) {
        case 'link':
          await navigator.clipboard.writeText(profileUrl);
          console.log('Profile link copied to clipboard');
          break;
          
        case 'twitter':
          const twitterText = 'Check out this amazing gaming profile on Gamerfie!';
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(profileUrl)}`;
          window.open(twitterUrl, '_blank', 'noopener,noreferrer');
          break;
          
        case 'discord':
          const discordMessage = `Check out this gaming profile: ${profileUrl}`;
          await navigator.clipboard.writeText(discordMessage);
          console.log('Discord message copied to clipboard');
          break;
          
        default:
          console.log('Sharing profile:', userId, 'via', shareType);
      }
    } catch (error) {
      console.error('Failed to share profile:', error);
    }
  }, []);

  return {
    handleFollowUser,
    handleUnfollowUser,
    handleMessageUser,
    handleShareProfile,
  };
}