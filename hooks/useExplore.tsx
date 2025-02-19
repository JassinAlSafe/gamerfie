import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGamesStore, CategoryOption as CategoryOptionFromStore } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useDebounce } from "./useDebounce";
import { GAME_CATEGORIES, CATEGORY_TIME_RANGES } from "@/config/categories";
import type { CategoryOption } from "@/types/game";
import { SearchButton } from "@/components/explore/SearchButton";

interface ExploreHookReturn {
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCategoryClick: (category: CategoryOption) => void;
  searchButton: JSX.Element | null;
  categoryButtons: JSX.Element;
}

export function useExplore(): ExploreHookReturn {
  const router = useRouter();
  const setSelectedCategory = useGamesStore((state) => state.setSelectedCategory);
  const { query: searchQuery, setQuery: setSearchQuery } = useSearchStore();
  const debouncedSearch = useDebounce<string>(searchQuery);

  const handleSearch = useCallback(() => {
    if (debouncedSearch.trim()) {
      setSelectedCategory("all" as unknown as CategoryOptionFromStore);
      router.push(`/all-games?search=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch, router, setSelectedCategory]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleCategoryClick = useCallback(
    (category: CategoryOption) => {
      setSelectedCategory(category as unknown as CategoryOptionFromStore);
      const timeRange = CATEGORY_TIME_RANGES[category];
      router.push(`/all-games?category=${category}&timeRange=${timeRange}`);
    },
    [router, setSelectedCategory]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const searchButton = useMemo(() => {
    if (!searchQuery) return null;
    return <SearchButton onSearch={handleSearch} />;
  }, [searchQuery, handleSearch]);

  const categoryButtons = useMemo(
    () => (
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {GAME_CATEGORIES.map(({ id, label, icon: Icon, color }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className="bg-white/5 hover:bg-white/10 text-gray-300 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
            onClick={() => handleCategoryClick(id)}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span>{label}</span>
          </Button>
        ))}
      </div>
    ),
    [handleCategoryClick]
  );

  return {
    searchQuery,
    handleSearchChange,
    handleKeyPress,
    handleCategoryClick,
    searchButton,
    categoryButtons,
  };
}
