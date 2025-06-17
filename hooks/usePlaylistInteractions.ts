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

  // Fetch initial state
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

  // Handle like toggle
  const handleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like playlists",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistic update
      const newLikedState = !state.isLiked;
      const newCount = newLikedState ? state.likesCount + 1 : state.likesCount - 1;
      
      setState(prev => ({
        ...prev,
        isLiked: newLikedState,
        likesCount: Math.max(0, newCount),
      }));

      const response = await fetch(`/api/playlists/${playlistId}/like`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update like status');
      }

      // Update with server response
      setState(prev => ({
        ...prev,
        isLiked: data.liked,
      }));

      toast({
        title: data.liked ? "Added to likes" : "Removed from likes",
        description: `Playlist ${data.liked ? 'added to' : 'removed from'} your liked playlists`,
      });

      // Refresh count from server
      setTimeout(fetchInteractionState, 500);
      
    } catch (error) {
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        isLiked: !state.isLiked,
        likesCount: state.likesCount,
      }));

      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, state.isLiked, state.likesCount, playlistId, toast, fetchInteractionState]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark playlists",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistic update
      const newBookmarkedState = !state.isBookmarked;
      const newCount = newBookmarkedState ? state.bookmarksCount + 1 : state.bookmarksCount - 1;
      
      setState(prev => ({
        ...prev,
        isBookmarked: newBookmarkedState,
        bookmarksCount: Math.max(0, newCount),
      }));

      const response = await fetch(`/api/playlists/${playlistId}/bookmark`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bookmark status');
      }

      // Update with server response
      setState(prev => ({
        ...prev,
        isBookmarked: data.bookmarked,
      }));

      toast({
        title: data.bookmarked ? "Added to bookmarks" : "Removed from bookmarks",
        description: `Playlist ${data.bookmarked ? 'saved to' : 'removed from'} your bookmarks`,
      });

      // Refresh count from server
      setTimeout(fetchInteractionState, 500);
      
    } catch (error) {
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        isBookmarked: !state.isBookmarked,
        bookmarksCount: state.bookmarksCount,
      }));

      toast({
        title: "Error",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, state.isBookmarked, state.bookmarksCount, playlistId, toast, fetchInteractionState]);

  return {
    ...state,
    handleLike,
    handleBookmark,
    refresh: fetchInteractionState,
  };
};