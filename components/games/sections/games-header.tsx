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
    platforms,
    genres,
    isLoading,
  } = useGamesStore();

  const { query: searchQuery, setQuery: setSearchQuery } = useSearchStore();

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 space-x-6">
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
            onClick={handleResetFilters}
            className="text-gray-400 hover:text-white"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900/50 border-gray-800 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchQuery && isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-purple-500" />
          )}
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
              className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
              onClick={() => setSearchQuery("")}
            >
              Search: {searchQuery} ×
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300 hover:bg-green-500/30"
              onClick={() => setSelectedCategory("all")}
            >
              {gameCategories[selectedCategory as keyof typeof gameCategories]}{" "}
              ×
            </Badge>
          )}
          {selectedPlatform !== "all" && (
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              onClick={() => setSelectedPlatform("all")}
            >
              {platforms?.find((p) => p.id === selectedPlatform)?.name ||
                selectedPlatform}{" "}
              ×
            </Badge>
          )}
          {selectedGenre !== "all" && (
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
              onClick={() => setSelectedGenre("all")}
            >
              {genres?.find((g) => g.id === selectedGenre)?.name ||
                selectedGenre}{" "}
              ×
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
    </div>
  );
}
