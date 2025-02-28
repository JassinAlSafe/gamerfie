"use client";

import { useEffect, useMemo, useState } from "react";
import { useJournalStore, type JournalEntry } from "@/stores/useJournalStore";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  EditIcon,
  Trash2Icon,
  StarIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BarChart2Icon,
  SlidersHorizontal,
} from "lucide-react";
import { JournalEntryDialog } from "@/components/journal/JournalEntryDialog";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { DeleteEntryDialog } from "@/components/journal/DeleteEntryDialog";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

type SortOption =
  | "newest"
  | "oldest"
  | "rating-high"
  | "rating-low"
  | "game-name";
type ViewMode = "grid" | "list";

export default function ReviewsClient() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);
  const { entries, fetchEntries, deleteEntry } = useJournalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeRatingFilter, setActiveRatingFilter] = useState<number | null>(
    null
  );
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 9 : 5;

  useEffect(() => {
    const loadEntries = async () => {
      setIsLoading(true);
      await fetchEntries();
      setIsLoading(false);
    };
    loadEntries();
  }, [fetchEntries]);

  const reviews = useMemo(() => {
    return entries
      .filter((entry) => entry.type === "review")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  // Calculate review statistics
  const reviewStats = useMemo(() => {
    if (reviews.length === 0) return { averageRating: 0, totalReviews: 0 };

    const totalRating = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    const averageRating = totalRating / reviews.length;

    return {
      averageRating,
      totalReviews: reviews.length,
    };
  }, [reviews]);

  // Filter reviews based on search query and rating filter
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.game?.name.toLowerCase().includes(query) ||
          review.content.toLowerCase().includes(query) ||
          review.title?.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (activeRatingFilter !== null) {
      filtered = filtered.filter(
        (review) => (review.rating || 0) >= activeRatingFilter
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "rating-high":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-low":
          return (a.rating || 0) - (b.rating || 0);
        case "game-name":
          return (a.game?.name || "").localeCompare(b.game?.name || "");
        default:
          return 0;
      }
    });
  }, [reviews, searchQuery, activeRatingFilter, sortBy]);

  // Pagination
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / itemsPerPage)
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeRatingFilter, sortBy, viewMode]);

  const handleDelete = async () => {
    if (deletingEntry) {
      await deleteEntry(deletingEntry.id);
      setDeletingEntry(null);
    }
  };

  const toggleRatingFilter = (rating: number) => {
    setActiveRatingFilter(activeRatingFilter === rating ? null : rating);
  };

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Extract unique genres from all reviews - removed due to type issues
  // const popularGenres = useMemo(() => {
  //   return []; // Return empty array to avoid type errors
  // }, [reviews]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white">My Game Reviews</h1>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 focus:border-purple-500 text-white"
            />
          </div>

          {/* Sort dropdown */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[140px] bg-gray-800/50 border-gray-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="rating-high">Highest Rating</SelectItem>
              <SelectItem value="rating-low">Lowest Rating</SelectItem>
              <SelectItem value="game-name">Game Name</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-md border border-gray-700 p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      viewMode === "grid"
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-gray-400"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grid View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      viewMode === "list"
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-gray-400"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>List View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            onClick={() => setIsNewEntryModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/20"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>

      {/* Review Statistics */}
      {reviews.length > 0 && (
        <Card className="bg-gray-800/30 rounded-lg border border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart2Icon className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">
                  Review Statistics
                </h3>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {reviewStats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400">Average Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {reviewStats.totalReviews}
                  </p>
                  <p className="text-xs text-gray-400">Total Reviews</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="space-y-4">
        {/* Rating filter chips */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-400 mr-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter by rating:</span>
          </div>
          {[10, 9, 8, 7, 6, 5].map((rating) => (
            <Button
              key={rating}
              variant="outline"
              size="sm"
              className={`px-3 py-1 h-auto text-xs ${
                activeRatingFilter === rating
                  ? "bg-purple-500/20 border-purple-500 text-purple-300"
                  : "bg-gray-800/50 border-gray-700 text-gray-300"
              }`}
              onClick={() => toggleRatingFilter(rating)}
            >
              {rating}+ <StarIcon className="h-3 w-3 ml-1 text-yellow-400" />
            </Button>
          ))}
          {activeRatingFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-1 h-auto text-xs text-gray-400"
              onClick={() => setActiveRatingFilter(null)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Reviews Content */}
      {filteredReviews.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-gray-800/50 hover:bg-gray-800/80 rounded-lg overflow-hidden transition-all duration-200 border border-gray-700 hover:border-purple-500/50 shadow-md hover:shadow-lg"
                >
                  {/* Game Info */}
                  {review.game && (
                    <div className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0 shadow-md">
                          <Image
                            src={
                              review.game.cover_url
                                ? getCoverImageUrl(review.game.cover_url)
                                : "/images/placeholders/game-cover.jpg"
                            }
                            alt={`Cover for ${review.game.name}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="64px"
                            quality={90}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                            {review.game.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 h-4 rounded-sm transition-all duration-200 ${
                                    i < (review.rating || 0)
                                      ? "bg-purple-400 group-hover:bg-purple-300"
                                      : "bg-gray-700"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-white flex items-center gap-1">
                              <StarIcon className="h-3 w-3 text-yellow-400" />
                              {review.rating}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="px-4 pb-2">
                    <p
                      className={`text-sm text-gray-300 ${
                        expandedReviews.includes(review.id)
                          ? ""
                          : "line-clamp-3"
                      }`}
                    >
                      {review.content}
                    </p>
                    {review.content.length > 150 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-purple-400 p-0 h-auto mt-1"
                        onClick={() => toggleExpandReview(review.id)}
                      >
                        {expandedReviews.includes(review.id)
                          ? "Show less"
                          : "Read more"}
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between p-4 border-t border-gray-700/50 bg-gray-800/30">
                    <time className="text-sm text-gray-400">
                      {new Date(review.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEntry(review)}
                        className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingEntry(review)}
                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-gray-800/50 hover:bg-gray-800/80 rounded-lg overflow-hidden transition-all duration-200 border border-gray-700 hover:border-purple-500/50 shadow-md hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Game Info */}
                    {review.game && (
                      <div className="p-4 md:w-1/3 flex gap-4">
                        <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0 shadow-md">
                          <Image
                            src={
                              review.game.cover_url
                                ? getCoverImageUrl(review.game.cover_url)
                                : "/images/placeholders/game-cover.jpg"
                            }
                            alt={`Cover for ${review.game.name}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="64px"
                            quality={90}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                            {review.game.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 h-4 rounded-sm transition-all duration-200 ${
                                    i < (review.rating || 0)
                                      ? "bg-purple-400 group-hover:bg-purple-300"
                                      : "bg-gray-700"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-white flex items-center gap-1">
                              <StarIcon className="h-3 w-3 text-yellow-400" />
                              {review.rating}/10
                            </span>
                          </div>
                          <time className="text-sm text-gray-400 block mt-2">
                            {new Date(review.date).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </time>
                        </div>
                      </div>
                    )}

                    {/* Review Content */}
                    <div className="p-4 md:w-2/3 border-t md:border-t-0 md:border-l border-gray-700/50">
                      <p
                        className={`text-sm text-gray-300 ${
                          expandedReviews.includes(review.id)
                            ? ""
                            : "line-clamp-3"
                        }`}
                      >
                        {review.content}
                      </p>
                      {review.content.length > 150 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-purple-400 p-0 h-auto mt-1"
                          onClick={() => toggleExpandReview(review.id)}
                        >
                          {expandedReviews.includes(review.id)
                            ? "Show less"
                            : "Read more"}
                        </Button>
                      )}

                      <div className="flex justify-end mt-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingEntry(review)}
                            className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingEntry(review)}
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredReviews.length > itemsPerPage && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-800/50 border-gray-700 text-gray-300"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-300"
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-gray-800/50 border-gray-700 text-gray-300"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
          {searchQuery || activeRatingFilter ? (
            <div className="space-y-3">
              <p className="text-gray-300">
                No reviews found matching your filters
                {searchQuery ? ` "${searchQuery}"` : ""}
                {activeRatingFilter
                  ? ` with rating ${activeRatingFilter}+`
                  : ""}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveRatingFilter(null);
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6 p-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <StarIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Share your thoughts on games you've played by adding your
                  first review.
                </p>
                <Button
                  onClick={() => setIsNewEntryModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Write Your First Review
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <JournalEntryDialog
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        initialType="review"
      />

      {editingEntry && (
        <JournalEntryDialog
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
        />
      )}

      <DeleteEntryDialog
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
