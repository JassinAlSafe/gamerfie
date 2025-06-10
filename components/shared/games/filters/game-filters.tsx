"use client";

import { useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Platform, Genre } from "@/types";
import { useGamesStore } from "@/stores/useGamesStore";
import { useDebounce } from "@/hooks/Settings/useDebounce";

interface GameFiltersProps {
  platforms?: Platform[];
  genres?: Genre[];
  categories?: Record<string, string>;
  showSearch?: boolean;
  showCategories?: boolean;
  className?: string;
}

const defaultCategories = {
  all: "All Games",
  recent: "Recent Games",
  popular: "Popular Games",
  upcoming: "Upcoming Games",
  classic: "Classic Games",
} as const;

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "name", label: "Game Name" },
  { value: "rating", label: "Rating" },
  { value: "release", label: "Release Date" },
] as const;

export function GameFilters({
  platforms = [],
  genres = [],
  categories = defaultCategories,
  showSearch = true,
  showCategories = true,
  className = "",
}: GameFiltersProps) {
  const store = useGamesStore();

  // Memoize the categories
  const categoriesMemo = useMemo(
    () => categories || defaultCategories,
    [categories]
  );

  // Stable filter change handler
  const handleFilterChange = useCallback(
    (type: string, value: string) => {
      switch (type) {
        case "platform":
          store.setSelectedPlatform(value);
          break;
        case "genre":
          store.setSelectedGenre(value);
          break;
        case "category":
          store.setSelectedCategory(value as keyof typeof defaultCategories);
          break;
        case "sort":
          store.setSortBy(value as (typeof sortOptions)[number]["value"]);
          break;
      }
    },
    [store]
  );

  // Stable search handler with debounce
  const debouncedSearch = useDebounce((value: string) => {
    store.setSearchQuery(value);
  }, 500);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-4 ${className}`}>
        {showSearch && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search games..."
              value={store.searchQuery}
              onChange={handleSearchChange}
              className="pl-10 bg-gray-900/50 border-gray-800"
            />
          </div>
        )}

        {showCategories && (
          <Select
            value={store.selectedCategory}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Category">
                {categoriesMemo[store.selectedCategory] || "Category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              {Object.entries(categoriesMemo).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={store.sortBy}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800">
            <SelectValue placeholder="Sort by">
              {sortOptions.find((o) => o.value === store.sortBy)?.label ||
                "Sort by"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {platforms.length > 0 && (
          <Select
            value={store.selectedPlatform}
            onValueChange={(value) => handleFilterChange("platform", value)}
          >
            <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Platform">
                {store.selectedPlatform === "all"
                  ? "All Platforms"
                  : platforms.find(
                      (p) => p.id.toString() === store.selectedPlatform
                    )?.name || "Platform"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id.toString()}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {genres.length > 0 && (
          <Select
            value={store.selectedGenre}
            onValueChange={(value) => handleFilterChange("genre", value)}
          >
            <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Genre">
                {store.selectedGenre === "all"
                  ? "All Genres"
                  : genres.find((g) => g.id.toString() === store.selectedGenre)
                      ?.name || "Genre"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.id.toString()}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
