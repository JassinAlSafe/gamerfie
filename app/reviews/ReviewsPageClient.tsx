"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Gamepad2,
  ArrowUpDown,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { useAllReviews } from "@/hooks/Reviews/use-all-reviews";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewPrefetcher } from "@/components/reviews/ReviewPrefetcher";
import { ReviewSkeletons } from "@/components/reviews/ReviewCard/ReviewCardSkeleton";
import { EmptyReviewsState } from "@/components/reviews/EmptyReviewsState";
import { SearchWithSuggestions } from "@/components/reviews/SearchWithSuggestions";
import { GameReview } from "@/hooks/Reviews/use-all-reviews";

interface ReviewsPageClientProps {
  initialReviews?: GameReview[] | null;
}

export function ReviewsPageClient({ initialReviews }: ReviewsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'recommended' | 'not-recommended'>('all');

  // Use the custom hook to fetch reviews
  const {
    reviews: reviewsData,
    stats,
    isLoading,
    error,
    hasNextPage,
    totalCount,
    loadMoreReviews,
  } = useAllReviews(initialReviews);

  // Loading state is now managed by React Query

  // Simplified load more with React Query
  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isLoading) return;
    loadMoreReviews();
  }, [hasNextPage, isLoading, loadMoreReviews]);


  // Sort reviews based on sortBy state
  const sortedReviews = useMemo(() => {
    if (!reviewsData) return [];

    const sorted = [...reviewsData].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return sorted;
  }, [reviewsData, sortBy]);

  // Filter and search reviews
  const filteredReviews = useMemo(() => {
    if (!sortedReviews) return [];

    return sortedReviews.filter((review) => {
      const matchesSearch =
        review.game_details?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        review.review_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        filterRating === "all" || review.rating.toString() === filterRating;

      const matchesGenre =
        selectedGenre === "all" ||
        review.game_details?.genres?.includes(selectedGenre);

      const matchesRecommendation = 
        recommendationFilter === 'all' ||
        (recommendationFilter === 'recommended' && review.is_recommended === true) ||
        (recommendationFilter === 'not-recommended' && review.is_recommended === false);

      return matchesSearch && matchesRating && matchesGenre && matchesRecommendation;
    });
  }, [sortedReviews, searchQuery, filterRating, selectedGenre, recommendationFilter]);

  // Generate structured data for reviews
  const generateStructuredData = () => {
    if (!reviewsData || reviewsData.length === 0) return null;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Game Reviews - Gamerfie",
      description: "Community game reviews and ratings from Gamerfie players",
      url: "/reviews",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: filteredReviews.length,
        itemListElement: filteredReviews.slice(0, 10).map((review, index) => ({
          "@type": "Review",
          position: index + 1,
          author: {
            "@type": "Person",
            name: review.user.username,
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
          itemReviewed: {
            "@type": "VideoGame",
            name: review.game_details?.name || `Game ${review.game_id}`,
            url: `/game/${review.game_id}`,
          },
          reviewBody: review.review_text,
          datePublished: review.created_at,
          publisher: {
            "@type": "Organization",
            name: "Gamerfie",
          },
        })),
      },
    };

    return structuredData;
  };

  const structuredData = generateStructuredData();

  // Enhanced Stats Component
  const StatsCard = ({
    icon: Icon,
    label,
    value,
    color,
    description,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    color: string;
    description?: string;
  }) => (
    <AnimatedCard variant="stat" className="h-full">
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} w-fit`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Enhanced Header skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16 relative"
            >
              <div className="relative inline-block mb-8">
                <div className="bg-gray-800/50 rounded-full p-6 w-24 h-24 mx-auto animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-800/50 rounded w-96 mx-auto animate-pulse"></div>
                <div className="h-6 bg-gray-800/30 rounded w-2/3 mx-auto animate-pulse"></div>
              </div>
            </motion.div>

            {/* Enhanced Stats skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <AnimatedCard
                    key={i}
                    variant="stat"
                    className="h-full"
                  >
                    <div className="p-6 space-y-4">
                      <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-8 bg-gray-700/40 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
            </motion.div>

            {/* Filters skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <AnimatedCard
                variant="feature"
                className="p-6 border border-gray-800/50"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="h-12 bg-gray-700/30 rounded animate-pulse"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-700/30 rounded w-40 animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>

            {/* Enhanced Reviews skeleton */}
            <ReviewSkeletons count={5} showGameInfo={true} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative inline-block mb-8"
            >
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-8 border border-red-500/20">
                <BookOpen className="w-20 h-20 text-red-400" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Unable to Load Reviews
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We're having trouble loading the reviews right now. Please check
              your connection and try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
              size="lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRating("all");
    setSelectedGenre("all");
    setRecommendationFilter('all');
  };

  const activeFiltersCount = [
    searchQuery,
    filterRating !== "all" ? filterRating : null,
    selectedGenre !== "all" ? selectedGenre : null,
    recommendationFilter !== 'all' ? recommendationFilter : null,
  ].filter(Boolean).length;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 relative"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative inline-block mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-full blur-xl"
              ></motion.div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-6 border border-purple-500/20">
                <BookOpen className="w-16 h-16 text-purple-400" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Game Reviews
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover honest reviews and ratings from our passionate gaming
              community.
              <br />
              <span className="text-purple-300">
                Find your next favorite game through player experiences.
              </span>
            </p>
          </motion.div>

          {/* Enhanced Statistics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <StatsCard
              icon={Users}
              label="Total Reviews"
              value={stats.totalReviews.toLocaleString()}
              color="from-blue-500/20 to-cyan-500/20"
              description="Community contributions"
            />
            <StatsCard
              icon={Star}
              label="Average Rating"
              value={stats.averageRating.toFixed(1)}
              color="from-yellow-500/20 to-orange-500/20"
              description="Out of 5.0 stars"
            />
            <StatsCard
              icon={TrendingUp}
              label="5-Star Reviews"
              value={(stats.ratingsDistribution[5] || 0).toLocaleString()}
              color="from-green-500/20 to-emerald-500/20"
              description="Exceptional games"
            />
            <StatsCard
              icon={Gamepad2}
              label="Top Genre"
              value={stats.topGenres[0]?.genre || "N/A"}
              color="from-purple-500/20 to-pink-500/20"
              description={`${stats.topGenres[0]?.count || 0} reviews`}
            />
          </motion.div>

          {/* Enhanced Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <AnimatedCard
              variant="feature"
              className="p-6 border border-gray-800/50"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Enhanced Search with Suggestions */}
                <SearchWithSuggestions
                  value={searchQuery}
                  onChange={setSearchQuery}
                  reviews={reviewsData || []}
                  className="flex-1"
                  placeholder="Search reviews, games, or users..."
                />

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-gray-700/50 h-12">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-gray-800/50 border-gray-700/50 h-12">
                      <Star className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedGenre}
                    onValueChange={setSelectedGenre}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] bg-gray-800/50 border-gray-700/50 h-12">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {stats.topGenres.map(({ genre }) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="h-12 border-gray-700/50 hover:bg-gray-800/50"
                    >
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-gray-800/50">
                {/* Star Rating Chips */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300 font-medium">Quick Rating Filter:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(filterRating === rating.toString() ? "all" : rating.toString())}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          filterRating === rating.toString()
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-yellow-300 border border-gray-700/30"
                        }`}
                      >
                        <div className="flex">
                          {Array.from({ length: rating }, (_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                          {Array.from({ length: 5 - rating }, (_, i) => (
                            <Star key={i + rating} className="w-3 h-3 text-gray-600" />
                          ))}
                        </div>
                        <span>{rating}+ Stars</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendation Filter */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">Recommendation:</span>
                    <span className="text-xs text-gray-500">Showing {filteredReviews.length} of {reviewsData?.length || 0} reviews</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRecommendationFilter(recommendationFilter === 'all' ? 'all' : 'all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        recommendationFilter === 'all'
                          ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/30"
                      }`}
                    >
                      All Reviews
                    </button>
                    <button
                      onClick={() => setRecommendationFilter(recommendationFilter === 'recommended' ? 'all' : 'recommended')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        recommendationFilter === 'recommended'
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-green-700/50 hover:text-green-300 border border-gray-700/30"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Recommended
                    </button>
                    <button
                      onClick={() => setRecommendationFilter(recommendationFilter === 'not-recommended' ? 'all' : 'not-recommended')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        recommendationFilter === 'not-recommended'
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-red-700/50 hover:text-red-300 border border-gray-700/30"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Not Recommended
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-800/50">
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
                  {selectedGenre !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      {selectedGenre}
                      <button
                        onClick={() => setSelectedGenre("all")}
                        className="ml-2 hover:text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {recommendationFilter !== 'all' && (
                    <Badge
                      variant="secondary"
                      className={`${
                        recommendationFilter === 'recommended' 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {recommendationFilter === 'recommended' ? 'Recommended' : 'Not Recommended'}
                      <button
                        onClick={() => setRecommendationFilter('all')}
                        className="ml-2 hover:text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </AnimatedCard>
          </motion.div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-gray-400">
              Showing{" "}
              <span className="text-white font-semibold">
                {filteredReviews.length}
              </span>{" "}
              {filteredReviews.length !== reviewsData.length ? (
                <>
                  of{" "}
                  <span className="text-white font-semibold">
                    {reviewsData.length}
                  </span>{" "}
                  loaded reviews
                </>
              ) : (
                reviewsData.length === totalCount ? "reviews" : "loaded reviews"
              )}
              {totalCount > reviewsData.length && (
                <span className="text-purple-400 ml-1">
                  ({totalCount} total available)
                </span>
              )}
            </div>
            {filteredReviews.length !== reviewsData.length && (
              <div className="text-sm text-purple-400">
                {reviewsData.length - filteredReviews.length} filtered out
              </div>
            )}
          </div>

          {/* Enhanced Reviews List */}
          <AnimatePresence mode="wait">
            {filteredReviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-24"
              >
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-8 border border-purple-500/20">
                    <BookOpen className="w-20 h-20 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No reviews found
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {activeFiltersCount > 0
                    ? "Try adjusting your filters to see more results."
                    : "Be the first to write a review and help other gamers discover great games!"}
                </p>
                {activeFiltersCount > 0 ? (
                  <Button
                    onClick={clearAllFilters}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear All Filters
                  </Button>
                ) : (
                  <div className="space-y-4 text-sm text-gray-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        Share your gaming experiences
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        Help others discover games
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Build your gaming reputation
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
              >
                {filteredReviews.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyReviewsState />
                  </div>
                ) : (
                  filteredReviews.map((review, index) => (
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
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More Section */}
          {hasNextPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12 py-8"
            >
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-3 text-gray-400"
                >
                  <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-purple-500 rounded-full" />
                  <span className="text-lg">Loading more reviews...</span>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    className="border-gray-700/50 hover:bg-gray-800/50 hover:border-purple-500/50 transition-all duration-300 px-8 py-3 text-lg font-medium"
                  >
                    Load More Reviews
                    <span className="ml-2 text-purple-400">
                      ({totalCount - reviewsData.length} remaining)
                    </span>
                  </Button>
                  <p className="text-sm text-gray-500">
                    Showing {reviewsData.length} of {totalCount} reviews
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Smart prefetching for performance */}
          <ReviewPrefetcher
            gameIds={filteredReviews.map((review) => review.game_id)}
          />
        </div>
      </div>
    </>
  );
}
