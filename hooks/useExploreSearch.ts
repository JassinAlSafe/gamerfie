import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/stores/useGlobalSearchStore";
import { useGamesStore } from "@/stores/useGamesStore";
import { useDebounce } from "./useDebounce";
import { CATEGORY_TIME_RANGES } from "@/config/categories";
import type { CategoryOption } from "@/types";

interface UseExploreSearchReturn {
  searchQuery: string;
  debouncedSearchQuery: string;
  isSearching: boolean;
  handleSearchChange: (value: string) => void;
  handleSearch: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCategoryClick: (category: CategoryOption) => void;
  clearSearch: () => void;
}

export function useExploreSearch(): UseExploreSearchReturn {
  const router = useRouter();
  const { query: searchQuery, setQuery } = useSearchStore();
  const setSelectedCategory = useGamesStore((state) => state.setSelectedCategory);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearching = Boolean(debouncedSearchQuery?.trim());

  const handleSearch = useCallback(() => {
    const trimmed = debouncedSearchQuery.trim();
    if (trimmed) {
      try {
        setSelectedCategory("all");
        router.push(`/all-games?search=${encodeURIComponent(trimmed)}`);
      } catch (error) {
        console.error("Error navigating to search results:", error);
      }
    }
  }, [debouncedSearchQuery, router, setSelectedCategory]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
  }, [setQuery]);

  const handleCategoryClick = useCallback(
    (category: CategoryOption) => {
      try {
        setSelectedCategory(category);
        const timeRange = CATEGORY_TIME_RANGES[category as keyof typeof CATEGORY_TIME_RANGES] || category;
        router.push(`/all-games?category=${encodeURIComponent(category)}&timeRange=${encodeURIComponent(timeRange)}`);
      } catch (error) {
        console.error("Error handling category click:", error);
      }
    },
    [router, setSelectedCategory]
  );

  return {
    searchQuery,
    debouncedSearchQuery,
    isSearching,
    handleSearchChange,
    handleSearch,
    handleKeyPress,
    handleCategoryClick,
    clearSearch,
  };
}