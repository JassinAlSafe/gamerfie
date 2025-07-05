import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/stores/useGlobalSearchStore";
import { useGamesStore } from "@/stores/useGamesStore";
import { useDebounce } from "./useDebounce";
import { GAME_CATEGORIES, CATEGORY_TIME_RANGES } from "@/config/categories";
import { SearchButton } from "@/components/explore/SearchButton";
import type { CategoryOption } from "@/types";

interface UseExploreOptimizedReturn {
  searchQuery: string;
  debouncedSearchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  searchButton: JSX.Element | null;
  handleCategoryClick: (category: CategoryOption) => void;
  categoryButtons: JSX.Element;
  clearSearch: () => void;
  isSearching: boolean;
}

export function useExploreOptimized(): UseExploreOptimizedReturn {
  const router = useRouter();
  const { query: searchQuery, setQuery: setSearchQuery } = useSearchStore();
  const setSelectedCategory = useGamesStore((state) => state.setSelectedCategory);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearching = useMemo(() => Boolean(debouncedSearchQuery?.trim()), [debouncedSearchQuery]);

  const handleSearch = useCallback(() => {
    const trimmedSearch = debouncedSearchQuery.trim();
    if (trimmedSearch) {
      try {
        setSelectedCategory("all");
        const encodedSearch = encodeURIComponent(trimmedSearch);
        router.push(`/all-games?search=${encodedSearch}`);
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const handleCategoryClick = useCallback(
    (category: CategoryOption) => {
      try {
        setSelectedCategory(category);
        const timeRange = CATEGORY_TIME_RANGES[category as keyof typeof CATEGORY_TIME_RANGES] || category;
        const url = `/all-games?category=${encodeURIComponent(category)}&timeRange=${encodeURIComponent(timeRange)}`;
        router.push(url);
      } catch (error) {
        console.error("Error handling category click:", error);
      }
    },
    [router, setSelectedCategory]
  );

  const searchButton = useMemo(() => {
    return isSearching ? <SearchButton onSearch={handleSearch} /> : null;
  }, [isSearching, handleSearch]);

  const categoryButtons = useMemo(
    () => (
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {GAME_CATEGORIES.map(({ id, label, icon: Icon, color }) => {
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
    searchQuery,
    debouncedSearchQuery,
    handleSearchChange,
    handleKeyPress,
    handleSearch,
    searchButton,
    handleCategoryClick,
    categoryButtons,
    clearSearch,
    isSearching,
  };
}