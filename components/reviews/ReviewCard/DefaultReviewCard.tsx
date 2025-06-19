import React from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  Bookmark,
  Calendar,
  Eye,
  MoreHorizontal,
  Flag,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AnimatedCard } from "@/components/ui/animated-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReviewCardProps } from "./types";
import { useReviewCardActions } from "./useReviewCardActions";
import { GameCoverSection } from "./GameCoverSection";

export function DefaultReviewCard({
  review,
  showGameInfo = true,
  onLike,
  onShare,
  onBookmark,
  className,
}: ReviewCardProps) {
  const {
    isLiked,
    isBookmarked,
    showFullReview,
    handleLike,
    handleBookmark,
    handleShare,
    toggleFullReview,
  } = useReviewCardActions(review.id, onLike, onShare, onBookmark);

  const isLongReview = review.review_text && review.review_text.length > 200;
  const displayText = showFullReview
    ? review.review_text
    : review.review_text?.slice(0, 200);

  return (
    <AnimatedCard
      className={`group relative overflow-hidden border border-gray-800/50 hover:border-purple-500/30 bg-gradient-to-br from-gray-900/90 via-gray-900/50 to-gray-800/30 ${className}`}
    >
      {/* Hover Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Game Cover Section */}
          {showGameInfo && (
            <GameCoverSection
              game_details={review.game_details}
              rating={review.rating}
            />
          )}

          {/* Enhanced Content Section */}
          <div className="flex-1 p-6 lg:p-8 space-y-6">
            {/* Enhanced header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-purple-500/20">
                  <AvatarImage src={review.user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                    {review.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${review.user.id}`}
                      className="font-semibold text-white hover:text-purple-400 transition-colors"
                    >
                      {review.user.username}
                    </Link>
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-600/50 text-gray-400"
                    >
                      Reviewer
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <time>
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </time>
                  </div>
                </div>
              </div>

              {/* Enhanced star rating - show when no game cover */}
              <div className="flex items-center gap-2">
                {!showGameInfo && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 transition-all duration-200 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-current drop-shadow-sm"
                            : "text-gray-600"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Review
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Review
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-400">
                      <Flag className="w-4 h-4 mr-2" />
                      Report Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Enhanced game title */}
            {showGameInfo && review.game_details && (
              <div>
                <Link
                  href={`/game/${review.game_id}`}
                  className="text-2xl font-bold text-white hover:text-purple-400 transition-colors group-hover:text-purple-300 line-clamp-2 block"
                >
                  {review.game_details.name}
                </Link>
                {review.game_details.developer && (
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-3">
                    <span>by {review.game_details.developer}</span>
                    {review.game_details.release_date && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <span>
                          {new Date(
                            review.game_details.release_date
                          ).getFullYear()}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Enhanced review content */}
            {review.review_text && (
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-700/20 rounded-2xl p-6 border border-gray-700/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"></div>
                  <div className="relative">
                    <p className="text-gray-200 leading-relaxed line-clamp-4">
                      {displayText}
                      {isLongReview && !showFullReview && "..."}
                    </p>
                    {isLongReview && (
                      <button
                        onClick={toggleFullReview}
                        className="text-sm text-purple-400 hover:text-purple-300 mt-3 transition-colors flex items-center gap-1"
                      >
                        {showFullReview ? "Show less" : "Read full review"}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced bottom section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-3 flex-wrap">
                {review.game_details?.genres?.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="text-xs border-gray-600/50 text-gray-400 hover:border-purple-500/50 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    {genre}
                  </Badge>
                ))}
                {review.game_details?.genres &&
                  review.game_details.genres.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-600/50 text-gray-500"
                    >
                      +{review.game_details.genres.length - 3} more
                    </Badge>
                  )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`transition-colors ${
                      isLiked
                        ? "text-red-400 hover:text-red-300"
                        : "text-gray-400 hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-400 hover:text-blue-400"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={`transition-colors ${
                      isBookmarked
                        ? "text-purple-400 hover:text-purple-300"
                        : "text-gray-400 hover:text-purple-400"
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Link
                  href={`/game/${review.game_id}`}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium group/link flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Game
                  <motion.span
                    className="inline-block"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    →
                  </motion.span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
