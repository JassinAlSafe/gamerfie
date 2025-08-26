"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Search, Filter, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ReviewService } from "@/services/reviewService";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewSkeletons } from "@/components/reviews/ReviewCard/ReviewCardSkeleton";
import { useValidatedGameDetails } from "@/hooks/useUnifiedGameDetails";
import { createClient } from "@/utils/supabase/client";

export function ProfileReviewsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  const supabase = createClient();

  // Fetch user's reviews from reviews table
  const { 
    data: reviewsResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["profile-reviews"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return ReviewService.getReviews({ 
        userId: user.id,
        limit: 100,
        orderBy: "created_at",
        orderDirection: "desc"
      });
    }
  });

  const reviews = useMemo(() => reviewsResponse?.reviews || [], [reviewsResponse?.reviews]);

  // Get unique game IDs for fetching game details
  const gameIds = useMemo(() => 
    [...new Set(reviews.map(review => review.game_id))],
    [reviews]
  );
  
  const validatedGameDetailsResult = useValidatedGameDetails(gameIds);
  const gameDetails = useMemo(() => validatedGameDetailsResult?.gameDetails || new Map(), [validatedGameDetailsResult?.gameDetails]);
  
  // Add game details to reviews
  const reviewsWithGameDetails = useMemo(() => 
    reviews.map(review => ({
      ...review,
      game_details: gameDetails.get(review.game_id) || {
        name: `Loading game ${review.game_id}...`,
        cover_url: undefined,
        developer: undefined,
        publisher: undefined,
        genres: [],
        release_date: undefined
      }
    })),
    [reviews, gameDetails]
  );

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviewsWithGameDetails;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.game_details?.name.toLowerCase().includes(query) ||
          review.review_text?.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (filterRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating.toString() === filterRating
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "game-name":
          return (a.game_details?.name || "").localeCompare(b.game_details?.name || "");
        default:
          return 0;
      }
    });
  }, [reviewsWithGameDetails, searchQuery, filterRating, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    return {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      highRatedCount: reviews.filter(r => r.rating >= 8).length
    };
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="h-8 w-48 bg-gray-800/50 rounded animate-pulse"></div>
          <div className="h-12 w-64 bg-gray-800/50 rounded animate-pulse"></div>
        </div>
        <ReviewSkeletons count={3} showGameInfo={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Failed to load reviews</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRating("all");
  };

  const activeFiltersCount = [
    searchQuery,
    filterRating !== "all" ? filterRating : null,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Reviews</h1>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{stats.totalReviews} reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>{stats.averageRating} avg rating</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.highRatedCount} highly rated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Sort and Filter */}
          <div className="flex gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="game-name">Game Name</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-[140px] bg-gray-800/50 border-gray-700/50">
                <Star className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} Stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-gray-700/50 hover:bg-gray-800/50"
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700/50">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Active filters:
            </span>
            {searchQuery && (
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-300 border-blue-500/30"
              >
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            )}
            {filterRating !== "all" && (
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
              >
                {filterRating} Stars
                <button
                  onClick={() => setFilterRating("all")}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="text-gray-400 text-sm">
        Showing {filteredReviews.length} of {reviews.length} reviews
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-24">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-8 border border-purple-500/20">
              <BookOpen className="w-16 h-16 text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {activeFiltersCount > 0 ? "No reviews found" : "No reviews yet"}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? "Try adjusting your filters to see more results."
              : "Start writing reviews for games you've played to build your collection."}
          </p>
          {activeFiltersCount > 0 && (
            <Button
              onClick={clearAllFilters}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="w-full"
            >
              <ReviewCard
                review={review}
                variant="default"
                showGameInfo={true}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}