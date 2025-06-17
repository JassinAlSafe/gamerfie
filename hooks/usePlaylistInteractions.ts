import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/components/ui/use-toast';

interface PlaylistInteractionState {
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  bookmarksCount: number;
  isLoading: boolean;
}

export const usePlaylistInteractions = (playlistId: string) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [state, setState] = useState<PlaylistInteractionState>({
    isLiked: false,
    isBookmarked: false,
    likesCount: 0,
    bookmarksCount: 0,
    isLoading: true,
  });

  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch initial state only once
  const fetchInteractionState = useCallback(async () => {
    if (!playlistId) return;

    try {
      const [likeResponse, bookmarkResponse] = await Promise.all([
        fetch(`/api/playlists/${playlistId}/like`),
        fetch(`/api/playlists/${playlistId}/bookmark`),
      ]);

      const [likeData, bookmarkData] = await Promise.all([
        likeResponse.json(),
        bookmarkResponse.json(),
      ]);

      setState({
        isLiked: likeData.liked || false,
        isBookmarked: bookmarkData.bookmarked || false,
        likesCount: likeData.count || 0,
        bookmarksCount: bookmarkData.count || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch interaction state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [playlistId]);

  useEffect(() => {
    fetchInteractionState();
  }, [fetchInteractionState]);

  // Handle like toggle with pure optimistic updates
  const handleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like playlists",
        variant: "destructive",
      });
      return;
    }

    if (isActionLoading) return; // Prevent spam clicking

    try {
      setIsActionLoading(true);
      
      // Calculate optimistic update
      const wasLiked = state.isLiked;
      const newLikedState = !wasLiked;
      const newCount = newLikedState ? state.likesCount + 1 : Math.max(0, state.likesCount - 1);
      
      // Apply optimistic update immediately
      setState(prev => ({
        ...prev,
        isLiked: newLikedState,
        likesCount: newCount,
      }));

      // Show immediate feedback
      toast({
        title: newLikedState ? "Added to likes" : "Removed from likes",
        description: `Playlist ${newLikedState ? 'added to' : 'removed from'} your liked playlists`,
      });

      // Send to server in background
      const response = await fetch(`/api/playlists/${playlistId}/like`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update like status');
      }

      // Only update if server response differs from our optimistic update
      if (data.liked !== newLikedState) {
        setState(prev => ({
          ...prev,
          isLiked: data.liked,
        }));
      }
      
    } catch (error) {
      console.error('Like error:', error);
      
      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        isLiked: state.isLiked,
        likesCount: state.likesCount,
      }));

      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  }, [user, state.isLiked, state.likesCount, playlistId, toast, isActionLoading]);

  // Handle bookmark toggle with pure optimistic updates
  const handleBookmark = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark playlists",
        variant: "destructive",
      });
      return;
    }

    if (isActionLoading) return; // Prevent spam clicking

    try {
      setIsActionLoading(true);
      
      // Calculate optimistic update
      const wasBookmarked = state.isBookmarked;
      const newBookmarkedState = !wasBookmarked;
      const newCount = newBookmarkedState ? state.bookmarksCount + 1 : Math.max(0, state.bookmarksCount - 1);
      
      // Apply optimistic update immediately
      setState(prev => ({
        ...prev,
        isBookmarked: newBookmarkedState,
        bookmarksCount: newCount,
      }));

      // Show immediate feedback
      toast({
        title: newBookmarkedState ? "Added to bookmarks" : "Removed from bookmarks",
        description: `Playlist ${newBookmarkedState ? 'saved to' : 'removed from'} your bookmarks`,
      });

      // Send to server in background
      const response = await fetch(`/api/playlists/${playlistId}/bookmark`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bookmark status');
      }

      // Only update if server response differs from our optimistic update
      if (data.bookmarked !== newBookmarkedState) {
        setState(prev => ({
          ...prev,
          isBookmarked: data.bookmarked,
        }));
      }
      
    } catch (error) {
      console.error('Bookmark error:', error);
      
      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        isBookmarked: state.isBookmarked,
        bookmarksCount: state.bookmarksCount,
      }));

      toast({
        title: "Error",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  }, [user, state.isBookmarked, state.bookmarksCount, playlistId, toast, isActionLoading]);

  return {
    ...state,
    handleLike,
    handleBookmark,
    isLoading: state.isLoading || isActionLoading,
    refresh: fetchInteractionState,
  };
};