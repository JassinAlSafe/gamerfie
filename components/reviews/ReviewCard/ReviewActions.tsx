import React from "react";
import {
  Heart,
  Share2,
  Bookmark,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  isLiked: boolean;
  isBookmarked: boolean;
  isLikeLoading: boolean;
  isBookmarkLoading: boolean;
  isShareLoading: boolean;
  gameId: string;
  likesCount?: number;
  bookmarksCount?: number;
  helpfulnessScore?: number;
  onLike: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

export function ReviewActions({
  isLiked,
  isBookmarked,
  isLikeLoading,
  isBookmarkLoading,
  isShareLoading,
  gameId,
  likesCount = 0,
  bookmarksCount = 0,
  helpfulnessScore,
  onLike,
  onShare,
  onBookmark,
}: ReviewActionsProps) {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-slate-700/30 mt-auto">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={isLikeLoading}
          className={`transition-all h-8 px-3 text-xs ${
            isLiked
              ? "text-red-400 hover:text-red-300 bg-red-500/10"
              : "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 mr-1.5 ${isLiked ? "fill-current" : ""} ${isLikeLoading ? "animate-pulse" : ""}`} />
          {isLikeLoading ? "..." : `Like${likesCount > 0 ? ` (${likesCount})` : ""}`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          disabled={isShareLoading}
          className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all h-8 px-3 text-xs"
        >
          <Share2 className={`w-3.5 h-3.5 mr-1.5 ${isShareLoading ? "animate-pulse" : ""}`} />
          {isShareLoading ? "..." : "Share"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBookmark}
          disabled={isBookmarkLoading}
          className={`transition-all h-8 px-3 text-xs ${
            isBookmarked
              ? "text-amber-400 hover:text-amber-300 bg-amber-500/10"
              : "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
          }`}
        >
          <Bookmark
            className={`w-3.5 h-3.5 mr-1.5 ${isBookmarked ? "fill-current" : ""} ${isBookmarkLoading ? "animate-pulse" : ""}`}
          />
          {isBookmarkLoading ? "..." : `Save${bookmarksCount > 0 ? ` (${bookmarksCount})` : ""}`}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Helpfulness Score */}
        {helpfulnessScore !== undefined && helpfulnessScore > 0 && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-medium">
            {helpfulnessScore.toFixed(1)} helpful
          </div>
        )}

        <Link
          href={`/game/${gameId}`}
          className="text-xs text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-md"
        >
          <Eye className="w-3.5 h-3.5" />
          View Game
        </Link>
      </div>
    </div>
  );
}