import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGamesStore } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useDebounce } from "../Settings/useDebounce";
import { useTrendingGames } from "./use-trending-games";
import { GAME_CATEGORIES, CATEGORY_TIME_RANGES } from "@/config/categories";
import { SearchButton } from "@/components/explore/SearchButton";
import type { Game, CategoryOption } from "@/types";

interface ExploreHookReturn {
  // Search functionality
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCategoryClick: (category: CategoryOption) => void;
  searchButton: JSX.Element | null;
  categoryButtons: JSX.Element;

  // Trending games functionality
  trendingGames: Game[];
  isTrendingLoading: boolean;
  trendingError: string | null;
  connectivity: { igdb: boolean; rawg: boolean } | null;
  retryTrending: () => void;
  hasData: boolean;
  isOffline: boolean;
}

/**
 * Type guard to validate category option
 */
const isValidCategoryOption = (
  category: string
): category is CategoryOption => {
  const validCategories: readonly CategoryOption[] = [
    "all",
    "popular",
    "trending",
    "upcoming",
    "recent",
    "classic",
  ] as const;
  return (validCategories as readonly string[]).includes(category);
};

/**
 * Custom hook for managing explore page functionality
 * Provides search functionality and trending games data with proper error handling
 */
export function useExplore(): ExploreHookReturn {
  const router = useRouter();
  const setSelectedCategory = useGamesStore(
    (state) => state.setSelectedCategory
  );
  const { query: searchQuery, setQuery: setSearchQuery } = useSearchStore();
  const debouncedSearch = useDebounce<string>(searchQuery);

  // Use the comprehensive trending games hook
  const {
    games: trendingGames,
    isLoading: isTrendingLoading,
    error: trendingError,
    connectivity,
    retry: retryTrending,
    hasData,
    isOffline,
  } = useTrendingGames({
    limit: 12,
    source: "auto", // Let it choose the best source
    enablePolling: false, // Don't poll on explore page
  });

  /**
   * Handle search navigation with proper validation
   */
  const handleSearch = useCallback(() => {
    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) {
      try {
        setSelectedCategory("all");
        const encodedSearch = encodeURIComponent(trimmedSearch);
        router.push(`/all-games?search=${encodedSearch}`);
      } catch (error) {
        console.error("Error navigating to search results:", error);
      }
    }
  }, [debouncedSearch, router, setSelectedCategory]);

  /**
   * Handle keyboard events for search input
   */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission if within a form
        handleSearch();
      }
    },
    [handleSearch]
  );

  /**
   * Handle category selection with validation and error handling
   */
  const handleCategoryClick = useCallback(
    (category: CategoryOption) => {
      try {
        // Validate category before processing
        if (!isValidCategoryOption(category)) {
          console.warn(`Invalid category selected: ${category}`);
          return;
        }

        setSelectedCategory(category);

        // Get time range with proper type checking
        const timeRange =
          CATEGORY_TIME_RANGES[category as keyof typeof CATEGORY_TIME_RANGES] ||
          category;
        const url = `/all-games?category=${encodeURIComponent(
          category
        )}&timeRange=${encodeURIComponent(timeRange)}`;

        router.push(url);
      } catch (error) {
        console.error("Error handling category click:", error);
      }
    },
    [router, setSelectedCategory]
  );

  /**
   * Handle search input changes with proper event typing
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
    },
    [setSearchQuery]
  );

  /**
   * Memoized search button component with proper null checking
   */
  const searchButton = useMemo(() => {
    const hasQuery = Boolean(searchQuery?.trim());
    if (!hasQuery) return null;
    return <SearchButton onSearch={handleSearch} />;
  }, [searchQuery, handleSearch]);

  /**
   * Memoized category buttons with proper type safety
   */
  const categoryButtons = useMemo(
    () => (
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {GAME_CATEGORIES.map(({ id, label, icon: Icon, color }) => {
          // Type assertion with validation
          const categoryId = id as CategoryOption;

          return (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-gray-300 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              onClick={() => handleCategoryClick(categoryId)}
              aria-label={`View ${label}`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span>{label}</span>
            </Button>
          );
        })}
      </div>
    ),
    [handleCategoryClick]
  );

  return {
    // Search functionality
    searchQuery,
    handleSearchChange,
    handleKeyPress,
    handleCategoryClick,
    searchButton,
    categoryButtons,

    // Trending games functionality
    trendingGames,
    isTrendingLoading,
    trendingError,
    connectivity,
    retryTrending,
    hasData,
    isOffline: isOffline ?? false,
  };
}
