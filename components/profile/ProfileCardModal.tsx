"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCardModalProps, ProfileModalUser, ProfileModalStats, ProfileCardProps, ShareType } from "@/types/profile-modal.types";
import { ProfileModalError, createProfileModalError, getErrorMessage, shouldAllowRetry } from "@/types/profile-modal-errors.types";
import { ProfileModalErrorBoundary } from "./ProfileModalErrorBoundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, UserPlus, UserMinus, Eye, Share2, Gamepad2, Trophy, Clock, Star, Users, Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ShareDropdownProps {
  isOpen: boolean;
  userId: string;
  username: string;
  onShare: (shareType: ShareType) => void;
  onClose: () => void;
}

// Share dropdown component
const ShareDropdown = React.memo<ShareDropdownProps>(({ isOpen, userId, username, onShare, onClose: _onClose }) => {
  const [copied, setCopied] = useState(false);

  const profileUrl = useMemo(() => `${window.location.origin}/profile/${userId}`, [userId]);

  // Cleanup timer to prevent memory leaks
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      onShare('link');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [profileUrl, onShare]);

  const handleTwitterShare = useCallback(() => {
    const text = `Check out ${username}'s gaming profile on Gamerfie!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank');
    onShare('twitter');
  }, [username, profileUrl, onShare]);

  const handleDiscordShare = useCallback(() => {
    // Discord doesn't have a direct share URL, so we copy a formatted message
    const message = `Check out ${username}'s gaming profile: ${profileUrl}`;
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
    });
    onShare('discord');
  }, [username, profileUrl, onShare]);

  if (!isOpen) return null;

  return (
    <div 
      id="share-dropdown"
      role="menu" 
      aria-labelledby="share-button"
      className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl z-50"
    >
      <div className="p-2 space-y-1">
        <button
          onClick={handleCopyLink}
          role="menuitem"
          aria-describedby={copied ? "copy-status" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        
        <button
          onClick={handleTwitterShare}
          role="menuitem"
          aria-label={`Share ${username}'s profile on X (Twitter)`}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </button>
        
        <button
          onClick={handleDiscordShare}
          role="menuitem"
          aria-label={`Copy ${username}'s profile link for Discord`}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0003 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
          </svg>
          Copy for Discord
        </button>
      </div>
    </div>
  );
});

export const ProfileCardModal: React.FC<ProfileCardModalProps> = ({
  isOpen,
  userId,
  onClose,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  currentUserId,
}) => {
  const [user, setUser] = useState<ProfileModalUser | null>(null);
  const [stats, setStats] = useState<ProfileModalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ProfileModalError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  // const [isFriend, setIsFriend] = useState(false); // TODO: Implement friend status when needed

  const supabase = useMemo(() => createClient(), []);

  // Define functions before useEffects to avoid temporal dead zone
  const checkRelationshipStatus = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // Use database functions to check real relationship status
      const [followingResult] = await Promise.all([
        supabase.rpc('is_user_following', { 
          follower_uuid: currentUserId, 
          following_uuid: userId 
        }),
        supabase.rpc('are_users_friends', { 
          user1_uuid: currentUserId, 
          user2_uuid: userId 
        })
      ]);

      if (!followingResult.error) {
        setIsFollowing(followingResult.data || false);
      }

      // setIsFriend(friendsResult.data || false); // TODO: Implement when friend status is needed in UI
    } catch (err) {
      console.error('Error checking relationship status:', err);
    }
  }, [currentUserId, userId, supabase]);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user profile with new fields
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          bio,
          email,
          location,
          website,
          created_at,
          last_seen_at,
          is_online
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Map actual profile data to modal user interface
      const userData: ProfileModalUser = {
        id: profileData.id,
        username: profileData.username,
        displayName: profileData.display_name,
        email: profileData.email,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        created_at: profileData.created_at,
        isOnline: profileData.is_online || false,
        lastSeen: profileData.last_seen_at || new Date().toISOString(),
      };

      // Use the new database function to get comprehensive stats
      const { data: statsResult, error: statsError } = await supabase
        .rpc('get_user_profile_stats', { user_uuid: userId });

      if (statsError) {
        console.error('Error fetching stats:', statsError);
        // Fallback to basic queries if function fails
        const [
          { count: gamesCount },
          { count: reviewsCount },
          { count: friendsCount }
        ] = await Promise.all([
          supabase.from('user_games').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('friends').select('*', { count: 'exact', head: true }).or(`user_id.eq.${userId},friend_id.eq.${userId}`).eq('status', 'accepted')
        ]);

        const { count: completedCount } = await supabase
          .from('user_games')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');

        const statsData: ProfileModalStats = {
          gamesPlayed: gamesCount || 0,
          gamesCompleted: completedCount || 0,
          completionPercentage: gamesCount ? Math.round((completedCount || 0) / gamesCount * 100) : 0,
          totalHours: 0,
          achievementsUnlocked: 0,
          reviewsWritten: reviewsCount || 0,
          friendsCount: friendsCount || 0,
          followersCount: 0,
          followingCount: 0,
        };
        setStats(statsData);
      } else {
        // Use real data from database function
        const statsData: ProfileModalStats = {
          gamesPlayed: statsResult.gamesPlayed || 0,
          gamesCompleted: statsResult.gamesCompleted || 0,
          completionPercentage: statsResult.completionPercentage || 0,
          totalHours: statsResult.totalHours || 0,
          achievementsUnlocked: statsResult.achievementsUnlocked || 0,
          reviewsWritten: statsResult.reviewsWritten || 0,
          friendsCount: statsResult.friendsCount || 0,
          followersCount: statsResult.followersCount || 0,
          followingCount: statsResult.followingCount || 0,
        };
        setStats(statsData);
      }

      setUser(userData);

      // Check friendship/following status if currentUserId is provided
      if (currentUserId && currentUserId !== userId) {
        await checkRelationshipStatus();
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      
      // Determine specific error type
      let profileError: ProfileModalError;
      
      if (err && typeof err === 'object' && 'code' in err) {
        const supabaseError = err as { code: string; message: string };
        
        switch (supabaseError.code) {
          case 'PGRST116': // No rows returned
            profileError = createProfileModalError.profileNotFound(userId);
            break;
          case '42501': // Permission denied
            profileError = createProfileModalError.permissionDenied();
            break;
          case 'PGRST301': // Rate limited
            profileError = createProfileModalError.rateLimited();
            break;
          default:
            profileError = createProfileModalError.networkError(supabaseError.message);
        }
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        profileError = createProfileModalError.networkError('Network connection failed');
      } else {
        profileError = createProfileModalError.unknownError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
      }
      
      setError(profileError);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [userId, currentUserId, supabase, checkRelationshipStatus]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    if (!error || !shouldAllowRetry(error) || retryCount >= 3) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchUserData();
  }, [error, retryCount, fetchUserData]);

  // Reset state when modal opens/closes
  const resetModalState = useCallback(() => {
    setUser(null);
    setStats(null);
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
    setIsFollowing(false);
    setIsShareDropdownOpen(false);
  }, []);

  // Fetch user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      resetModalState();
      fetchUserData();
    } else if (!isOpen) {
      resetModalState();
    }
  }, [isOpen, userId, fetchUserData, resetModalState]);

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (isShareDropdownOpen) {
          setIsShareDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isShareDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.share-dropdown-container')) {
          setIsShareDropdownOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isShareDropdownOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) return;
    
    try {
      // Insert follow relationship
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: currentUserId,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        return;
      }

      setIsFollowing(true);
      if (onFollow) {
        onFollow(userId);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserId) return;
    
    try {
      // Remove follow relationship
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        return;
      }

      setIsFollowing(false);
      if (onUnfollow) {
        onUnfollow(userId);
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(userId);
    }
  };

  const handleShare = (shareType: ShareType) => {
    if (onShare) {
      onShare(userId, shareType);
    }
    setIsShareDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <ProfileModalErrorBoundary onRetry={() => {
      resetModalState();
      fetchUserData();
    }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[400px] mx-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
          aria-describedby="profile-modal-description"
        >
          {/* Compact Profile Card Content */}
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden relative">
            {/* Close Button - Inside the card */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white hover:bg-gray-800/50 h-7 w-7 p-0 rounded-lg"
              aria-label="Close profile modal"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading profile...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  Profile Unavailable
                </h3>
                
                <p className="text-red-400 mb-4 text-sm max-w-sm mx-auto">
                  {getErrorMessage(error)}
                </p>
                
                <div className="flex gap-2 justify-center">
                  {shouldAllowRetry(error) && retryCount < 3 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry} 
                      className="h-8 px-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      disabled={isRetrying}
                      aria-label={isRetrying ? 'Retrying...' : 'Retry loading profile'}
                    >
                      {isRetrying ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : null}
                      {isRetrying ? 'Retrying...' : 'Try Again'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose} 
                    className="h-8 px-3 text-gray-400 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
                
                {retryCount >= 3 && (
                  <p className="text-gray-500 text-xs mt-3">
                    Maximum retry attempts reached
                  </p>
                )}
              </div>
            ) : user && stats ? (
              <CompactProfileCard
                user={user}
                stats={stats}
                isFollowing={isFollowing}
                isCurrentUser={currentUserId === userId}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onMessage={handleMessage}
                onShare={handleShare}
                isShareDropdownOpen={isShareDropdownOpen}
                setIsShareDropdownOpen={setIsShareDropdownOpen}
              />
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </ProfileModalErrorBoundary>
  );
};

// Extended props for CompactProfileCard
interface CompactProfileCardProps extends ProfileCardProps {
  isShareDropdownOpen: boolean;
  setIsShareDropdownOpen: (open: boolean) => void;
}

// Compact Profile Card Component (inspired by Dribbble design)
const CompactProfileCard = React.memo<CompactProfileCardProps>(({
  user,
  stats,
  isFollowing,
  isCurrentUser,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  isShareDropdownOpen,
  setIsShareDropdownOpen,
}) => {
  // Memoize expensive calculation
  const completionRate = useMemo(() => 
    stats.gamesPlayed > 0 ? Math.round((stats.gamesCompleted / stats.gamesPlayed) * 100) : 0,
    [stats.gamesPlayed, stats.gamesCompleted]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-8"
    >
      {/* Header with Avatar and Basic Info */}
      <div className="text-center mb-4">
        <div className="relative inline-block mb-3">
          <Avatar className="w-20 h-20 border-2 border-gray-700 shadow-lg">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
              {user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Online Status Indicator */}
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        <h2 id="profile-modal-title" className="text-xl font-bold text-white mb-1">{user.username}</h2>
        {user.displayName && user.displayName !== user.username && (
          <p className="text-gray-400 text-sm mb-1">{user.displayName}</p>
        )}
        
        {user.bio && (
          <p id="profile-modal-description" className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed mb-3 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>

      {/* Compact Stats Grid */}
      <div className="mb-4" role="region" aria-label="User statistics">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Gamepad2 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white leading-none">{stats.gamesPlayed}</p>
            <p className="text-xs text-gray-400 leading-none">Games</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Trophy className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white leading-none">{stats.gamesCompleted}</p>
            <p className="text-xs text-gray-400 leading-none">Completed</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white leading-none">{stats.totalHours}h</p>
            <p className="text-xs text-gray-400 leading-none">Hours</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white leading-none">{stats.achievementsUnlocked}</p>
            <p className="text-xs text-gray-400 leading-none">Achievements</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Users className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white leading-none">{stats.friendsCount}</p>
            <p className="text-xs text-gray-400 leading-none">Friends</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Heart className="w-4 h-4 text-pink-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white leading-none">{stats.reviewsWritten}</p>
            <p className="text-xs text-gray-400 leading-none">Reviews</p>
          </div>
        </div>
      </div>

      {/* Completion Rate Progress */}
      <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Completion Rate</span>
          <span className="text-sm font-bold text-green-400">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {!isCurrentUser && (
        <div className="flex gap-2 mb-3">
          {isFollowing ? (
            <Button
              onClick={() => onUnfollow && onUnfollow()}
              variant="outline"
              className="flex-1 h-9 text-sm border-gray-600 text-gray-300 hover:bg-gray-800/50 bg-transparent"
              aria-label={`Unfollow ${user.username}`}
            >
              <UserMinus className="w-4 h-4 mr-1" aria-hidden="true" />
              Unfollow
            </Button>
          ) : (
            <Button
              onClick={() => onFollow && onFollow()}
              className="flex-1 h-9 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
              aria-label={`Follow ${user.username}`}
            >
              <UserPlus className="w-4 h-4 mr-1" aria-hidden="true" />
              Follow
            </Button>
          )}
          
          <Button
            onClick={() => onMessage && onMessage()}
            variant="outline"
            className="flex-1 h-9 text-sm border-gray-600 text-gray-300 hover:bg-gray-800/50 bg-gray-800/30"
            aria-label={`Send message to ${user.username}`}
          >
            <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
            Message
          </Button>
        </div>
      )}

      {/* View Profile & Share */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 h-9 text-sm border-gray-600 text-gray-300 hover:bg-gray-800/50 bg-gray-800/30"
          disabled
          aria-label="View profile (coming soon)"
        >
          <Eye className="w-4 h-4 mr-1" aria-hidden="true" />
          View Profile
        </Button>
        
        <div className="relative share-dropdown-container">
          <Button
            onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 border-gray-600 text-gray-300 hover:bg-gray-800/50 bg-gray-800/30"
            aria-label={`Share ${user.username}'s profile`}
            aria-expanded={isShareDropdownOpen}
            aria-haspopup="menu"
            aria-controls="share-dropdown"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <ShareDropdown
            isOpen={isShareDropdownOpen}
            userId={user.id}
            username={user.username}
            onShare={(shareType) => {
              if (onShare) onShare(shareType);
              setIsShareDropdownOpen(false);
            }}
            onClose={() => setIsShareDropdownOpen(false)}
          />
        </div>
      </div>
    </motion.div>
  );
});

export default ProfileCardModal;