"use client";

import Link from "next/link";
import { ArrowLeft, Search, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGamesStore } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { GamesFilterDropdown } from "../filters/games-filter-dropdown";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const gameCategories = {
  all: "All Games",
  recent: "Recent Games",
  popular: "Popular Games",
  upcoming: "Upcoming Games",
  classic: "Classic Games",
  indie: "Indie Games",
  anticipated: "Most Anticipated",
};

export function GamesHeader() {
  const router = useRouter();
  const {
    sortBy,
    setSortBy,
    hasActiveFilters,
    handleResetFilters,
    totalGames,
    currentPage,
    totalPages,
    selectedPlatform,
    setSelectedPlatform,
    selectedGenre,
    setSelectedGenre,
    selectedCategory,
    setSelectedCategory,
    selectedYear,
    setSelectedYear,
    timeRange,
    platforms,
    genres,
    isLoading,
  } = useGamesStore();

  const { query: searchQuery, setQuery } = useSearchStore();

  const handleApplyFilters = () => {
    const filterParams = new URLSearchParams();

    // Only add parameters that are not default values
    if (selectedPlatform !== "all")
      filterParams.set("platform", selectedPlatform);
    if (selectedGenre !== "all") filterParams.set("genre", selectedGenre);
    if (selectedCategory !== "all")
      filterParams.set("category", selectedCategory);
    if (selectedYear !== "all") filterParams.set("year", selectedYear);
    if (timeRange !== "all") filterParams.set("timeRange", timeRange);
    if (sortBy !== "popularity") filterParams.set("sort", sortBy);
    if (searchQuery) filterParams.set("search", searchQuery);

    const queryString = filterParams.toString();
    router.push(`/all-games${queryString ? `?${queryString}` : ""}`);
  };

  const handleRemoveFilter = (filterType: string) => {
    switch (filterType) {
      case "search":
        setQuery("");
        break;
      case "platform":
        setSelectedPlatform("all");
        break;
      case "genre":
        setSelectedGenre("all");
        break;
      case "category":
        setSelectedCategory("all");
        break;
      case "year":
        setSelectedYear("all");
        break;
    }
  };

  const handleResetAllFilters = () => {
    setQuery("");
    setSelectedPlatform("all");
    setSelectedGenre("all");
    setSelectedCategory("all");
    setSelectedYear("all");
    setSortBy("popularity");
    router.push("/all-games");
  };

  // Get the platform and genre names
  const platformName = platforms?.find(
    (p) => p.id.toString() === selectedPlatform
  )?.name;
  const genreName = genres?.find(
    (g) => g.id.toString() === selectedGenre
  )?.name;

  const [searchQueryState, setSearchQueryState] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchQueryState);
  };

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/explore">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">All Games</h1>
        </div>
        {(selectedPlatform !== "all" ||
          selectedGenre !== "all" ||
          selectedCategory !== "all" ||
          searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAllFilters}
            className="text-gray-400 hover:text-white"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              type="search"
              placeholder="Search games..."
              value={searchQueryState}
              onChange={(e) => setSearchQueryState(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] bg-gray-900 border-gray-800 justify-between"
            >
              {sortBy === "popularity"
                ? "Most Popular"
                : sortBy === "rating"
                ? "Highest Rated"
                : sortBy === "name"
                ? "Game Name"
                : sortBy === "release"
                ? "Release Date"
                : "Most Popular"}
              <Filter className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] bg-gray-900 border-gray-800">
            <DropdownMenuItem
              onClick={() => setSortBy("popularity")}
              className={cn(sortBy === "popularity" && "bg-purple-500/20")}
            >
              Most Popular
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("rating")}
              className={cn(sortBy === "rating" && "bg-purple-500/20")}
            >
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("name")}
              className={cn(sortBy === "name" && "bg-purple-500/20")}
            >
              Game Name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("release")}
              className={cn(sortBy === "release" && "bg-purple-500/20")}
            >
              Release Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <GamesFilterDropdown
          platforms={platforms}
          genres={genres}
          selectedPlatform={selectedPlatform}
          selectedGenre={selectedGenre}
          selectedYear={selectedYear}
          onPlatformChange={setSelectedPlatform}
          onGenreChange={setSelectedGenre}
          onYearChange={setSelectedYear}
        />
      </div>

      {/* Active Filters */}
      {(selectedPlatform !== "all" ||
        selectedGenre !== "all" ||
        selectedCategory !== "all" ||
        searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 cursor-pointer"
              onClick={() => handleRemoveFilter("search")}
            >
              Search: {searchQuery} ×
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300 hover:bg-green-500/30 cursor-pointer"
              onClick={() => handleRemoveFilter("category")}
            >
              {gameCategories[selectedCategory as keyof typeof gameCategories]}{" "}
              ×
            </Badge>
          )}
          {selectedPlatform !== "all" && platformName && (
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer"
              onClick={() => handleRemoveFilter("platform")}
            >
              {platformName} ×
            </Badge>
          )}
          {selectedGenre !== "all" && genreName && (
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
              onClick={() => handleRemoveFilter("genre")}
            >
              {genreName} ×
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-gray-400">
        {isLoading ? (
          <span>Searching...</span>
        ) : (
          totalGames > 0 &&
          `${totalGames?.toLocaleString()} Games • Page ${currentPage} of ${totalPages}`
        )}
      </div>

      {/* Apply Filters Button */}
      <Button
        onClick={handleApplyFilters}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6"
      >
        Apply Filters
      </Button>
    </div>
  );
}
