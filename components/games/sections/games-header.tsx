"use client";

import Link from "next/link";
import { ArrowLeft, Search, Filter, X } from "lucide-react"; // Remove Loader2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function GamesHeader() {
  const {
    sortBy,
    setSortBy,
    selectedPlatform,
    selectedGenre,
    selectedCategory,
    selectedYear,
    timeRange,
    platforms,
    genres,
    // Remove isLoading from here
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setSelectedCategory,
    totalGames,
  } = useGamesStore();

  const { query: searchQuery, setQuery: setSearchQuery } = useSearchStore();

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedPlatform !== "all" ||
    selectedGenre !== "all" ||
    selectedCategory !== "all" ||
    selectedYear !== "all" ||
    timeRange !== "all" ||
    sortBy !== "popularity" ||
    searchQuery !== "";

  return (
    <div className="relative space-y-4 px-4 sm:px-6 lg:px-8 py-6">
      <div className="container mx-auto max-w-[2000px]">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-800/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-semibold text-white">
                Browse Games
              </h1>
              {totalGames > 0 && (
                <span className="text-sm text-gray-400">
                  {totalGames.toLocaleString()} titles
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border-gray-700/50 focus:border-purple-500/50 transition-colors pl-10 pr-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-700/50"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[140px] justify-between bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
              >
                <span className="truncate">
                  {sortBy === "popularity"
                    ? "Popular"
                    : sortBy === "rating"
                    ? "Top Rated"
                    : sortBy === "release"
                    ? "Release Date"
                    : "Sort By"}
                </span>
                <Filter className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
              {[
                { value: "popularity", label: "Popular" },
                { value: "rating", label: "Top Rated" },
                { value: "release", label: "Release Date" },
                { value: "name", label: "Name" },
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={cn(
                    "cursor-pointer",
                    sortBy === option.value &&
                      "bg-purple-500/20 text-purple-200"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filters Dropdown */}
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
        {hasActiveFilters && (
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* ...existing filter badges... */}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedPlatform("all");
                setSelectedGenre("all");
                setSelectedCategory("all");
                setSelectedYear("all");
                setSortBy("popularity");
              }}
              className="text-gray-400 hover:text-white"
            >
              Reset all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
