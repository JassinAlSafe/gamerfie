"use client";

import React, { useState, useCallback } from "react";
import {
  Heart,
  Bookmark,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PlaylistActionsProps {
  playlistId: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likesCount?: number;
  bookmarksCount?: number;
  className?: string;
  onLike?: () => Promise<void>;
  onBookmark?: () => Promise<void>;
}

export const PlaylistActions: React.FC<PlaylistActionsProps> = ({
  playlistId,
  isLiked = false,
  isBookmarked = false,
  likesCount = 0,
  bookmarksCount = 0,
  className,
  onLike,
  onBookmark,
}) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = currentUrl.includes('/playlists/') 
    ? currentUrl 
    : `${currentUrl}/playlists/${playlistId}`;

  const handleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like playlists",
        variant: "destructive",
      });
      return;
    }

    if (onLike) {
      await onLike();
    } else {
      toast({
        title: isLiked ? "Removed from likes" : "Added to likes",
        description: `Playlist ${isLiked ? 'removed from' : 'added to'} your liked playlists`,
      });
    }
  }, [user, isLiked, onLike, toast]);

  const handleBookmark = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark playlists",
        variant: "destructive",
      });
      return;
    }

    if (onBookmark) {
      await onBookmark();
    } else {
      toast({
        title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: `Playlist ${isBookmarked ? 'removed from' : 'added to'} your bookmarks`,
      });
    }
  }, [user, isBookmarked, onBookmark, toast]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast({
        title: "Link copied",
        description: "Playlist link copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  }, [shareUrl, toast]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(
          "gap-2 transition-all duration-200",
          isLiked 
            ? "text-red-400 bg-red-500/10 hover:bg-red-500/20" 
            : "text-white/60 hover:text-red-400 hover:bg-red-500/10"
        )}
      >
        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        {likesCount > 0 && (
          <span className="text-xs">{likesCount.toLocaleString()}</span>
        )}
      </Button>

      {/* Bookmark Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        className={cn(
          "gap-2 transition-all duration-200",
          isBookmarked 
            ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20" 
            : "text-white/60 hover:text-yellow-400 hover:bg-yellow-500/10"
        )}
      >
        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
        {bookmarksCount > 0 && (
          <span className="text-xs">{bookmarksCount.toLocaleString()}</span>
        )}
      </Button>

      {/* Share Button */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Playlist</DialogTitle>
            <DialogDescription>
              Share this playlist with friends and the gaming community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full gap-2"
            >
              {copySuccess ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copySuccess ? "Copied!" : "Copy Link"}
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Share URL</label>
              <Input
                value={shareUrl}
                readOnly
                className="w-full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};