import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface ReviewActionsState {
  isLiked: boolean;
  isBookmarked: boolean;
  isLikeLoading: boolean;
  isBookmarkLoading: boolean;
  isShareLoading: boolean;
}

export function useReviewCardActions(
  reviewId: string,
  onLike?: (reviewId: string) => void,
  onShare?: (reviewId: string) => void,
  onBookmark?: (reviewId: string) => void
) {
  const [state, setState] = useState<ReviewActionsState>({
    isLiked: false,
    isBookmarked: false,
    isLikeLoading: false,
    isBookmarkLoading: false,
    isShareLoading: false,
  });
  const [showFullReview, setShowFullReview] = useState(false);

  // Load initial like/bookmark status
  useEffect(() => {
    const loadInitialStatus = async () => {
      try {
        const [likeResponse, bookmarkResponse] = await Promise.all([
          fetch(`/api/reviews/${reviewId}/like`),
          fetch(`/api/reviews/${reviewId}/bookmark`),
        ]);

        if (likeResponse.ok) {
          const likeData = await likeResponse.json();
          setState(prev => ({ ...prev, isLiked: likeData.liked }));
        }

        if (bookmarkResponse.ok) {
          const bookmarkData = await bookmarkResponse.json();
          setState(prev => ({ ...prev, isBookmarked: bookmarkData.bookmarked }));
        }
      } catch (error) {
        console.error("Error loading review status:", error);
      }
    };

    loadInitialStatus();
  }, [reviewId]);

  const handleLike = async () => {
    setState(prev => ({ ...prev, isLikeLoading: true }));
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          toast.error("Please log in to like reviews");
          return;
        }
        
        throw new Error(errorData.error || "Failed to like review");
      }

      const data = await response.json();
      setState(prev => ({ ...prev, isLiked: data.liked }));
      
      toast.success(data.liked ? "Review Liked!" : "Like Removed");

      onLike?.(reviewId);
    } catch (error) {
      console.error("Error liking review:", error);
      toast.error("Failed to update like status. Please try again.");
    } finally {
      setState(prev => ({ ...prev, isLikeLoading: false }));
    }
  };

  const handleBookmark = async () => {
    setState(prev => ({ ...prev, isBookmarkLoading: true }));
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          toast.error("Please log in to bookmark reviews");
          return;
        }
        
        throw new Error(errorData.error || "Failed to bookmark review");
      }

      const data = await response.json();
      setState(prev => ({ ...prev, isBookmarked: data.bookmarked }));
      
      toast.success(data.bookmarked ? "Review Saved!" : "Bookmark Removed");

      onBookmark?.(reviewId);
    } catch (error) {
      console.error("Error bookmarking review:", error);
      toast.error("Failed to update bookmark status. Please try again.");
    } finally {
      setState(prev => ({ ...prev, isBookmarkLoading: false }));
    }
  };

  const handleShare = async () => {
    setState(prev => ({ ...prev, isShareLoading: true }));
    
    try {
      const shareUrl = `${window.location.origin}/reviews/${reviewId}`;
      const shareData = {
        title: "Check out this game review on Gamerfie",
        text: "I found this interesting game review you might like",
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success("Review Shared!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link Copied to Clipboard!");
      }

      onShare?.(reviewId);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing review:", error);
        toast.error("Failed to share review. Please try again.");
      }
    } finally {
      setState(prev => ({ ...prev, isShareLoading: false }));
    }
  };

  const toggleFullReview = () => {
    setShowFullReview(!showFullReview);
  };

  return {
    ...state,
    showFullReview,
    handleLike,
    handleBookmark,
    handleShare,
    toggleFullReview,
  };
}