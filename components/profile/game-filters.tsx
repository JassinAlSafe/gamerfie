import { useState, useCallback, useMemo } from "react";
import { Filter, SortAsc, SortDesc, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GameStatus } from "@/types";
import { cn } from "@/lib/utils";

interface GameFiltersProps {
  onFilterChange: (filters: GameFilters) => void;
}

export interface GameFilters {
  status: GameStatus | "all";
  sortBy: "recent" | "name" | "rating" | "playtime";
  sortOrder: "asc" | "desc";
  search?: string;
  platform?: string;
  genre?: string;
}

export function GameFilters({ onFilterChange }: GameFiltersProps) {
  const [filters, setFilters] = useState<GameFilters>({
    status: "all",
    sortBy: "recent",
    sortOrder: "desc",
    search: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Memoize status options
  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All Games" },
      { value: "playing", label: "Currently Playing" },
      { value: "completed", label: "Completed" },
      { value: "want_to_play", label: "Want to Play" },
      { value: "dropped", label: "Dropped" },
    ],
    []
  );

  // Memoize sort options
  const sortOptions = useMemo(
    () => [
      { value: "recent", label: "Recently Added" },
      { value: "name", label: "Game Name" },
      { value: "rating", label: "Rating" },
      { value: "playtime", label: "Play Time" },
    ],
    []
  );

  // Memoize platform options
  const platformOptions = useMemo(
    () => [
      { value: "all", label: "All Platforms" },
      { value: "PC", label: "PC" },
      { value: "PlayStation", label: "PlayStation" },
      { value: "Xbox", label: "Xbox" },
      { value: "Nintendo", label: "Nintendo" },
      { value: "Mobile", label: "Mobile" },
    ],
    []
  );

  // Memoize genre options
  const genreOptions = useMemo(
    () => [
      { value: "all", label: "All Genres" },
      { value: "action", label: "Action" },
      { value: "adventure", label: "Adventure" },
      { value: "rpg", label: "RPG" },
      { value: "strategy", label: "Strategy" },
      { value: "shooter", label: "Shooter" },
      { value: "puzzle", label: "Puzzle" },
      { value: "racing", label: "Racing" },
      { value: "sports", label: "Sports" },
    ],
    []
  );

  const handleFilterChange = useCallback(
    (key: keyof GameFilters, value: string) => {
      setFilters(prevFilters => {
        const newFilters = { ...prevFilters, [key]: value };
        onFilterChange(newFilters);
        return newFilters;
      });
    },
    [onFilterChange]
  );

  const handleSearchSubmit = useCallback(() => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, search: searchQuery };
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [searchQuery, onFilterChange]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, search: "" };
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const handleReset = useCallback(() => {
    const resetFilters: GameFilters = {
      status: "all",
      sortBy: "recent",
      sortOrder: "desc",
      search: "",
      platform: "all",
      genre: "all",
    };
    setFilters(resetFilters);
    setSearchQuery("");
    onFilterChange(resetFilters);
  }, [onFilterChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.platform && filters.platform !== "all") count++;
    if (filters.genre && filters.genre !== "all") count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Input
            type="text"
            placeholder="Search your games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-gray-900/50 border-gray-700/50 text-white pr-16"
          />
          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClear}
                className="h-8 w-8 text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchSubmit}
              className="h-8 w-8 text-gray-400 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700/50 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-gray-700/50 text-white">
            {statusOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-white hover:bg-white/10 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort & Filter Button */}
        <Button
          variant="outline"
          className={cn(
            "bg-gray-900/50 border-gray-700/50 text-white",
            activeFilterCount > 0 && "border-purple-500/50"
          )}
          onClick={toggleFilters}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-purple-500 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          className="bg-gray-900/50 border-gray-700/50 text-white"
          onClick={() =>
            handleFilterChange(
              "sortOrder",
              filters.sortOrder === "asc" ? "desc" : "asc"
            )
          }
        >
          {filters.sortOrder === "asc" ? (
            <SortAsc className="mr-2 h-4 w-4" />
          ) : (
            <SortDesc className="mr-2 h-4 w-4" />
          )}
          {filters.sortBy === "recent"
            ? "Date"
            : filters.sortBy === "name"
            ? "Name"
            : filters.sortBy === "rating"
            ? "Rating"
            : "Playtime"}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-900/70 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="w-full bg-gray-800/70 border-gray-700/50 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-700/50 text-white">
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Platform
              </label>
              <Select
                value={filters.platform || "all"}
                onValueChange={(value) => handleFilterChange("platform", value)}
              >
                <SelectTrigger className="w-full bg-gray-800/70 border-gray-700/50 text-white">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-700/50 text-white">
                  {platformOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Genre Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Genre</label>
              <Select
                value={filters.genre || "all"}
                onValueChange={(value) => handleFilterChange("genre", value)}
              >
                <SelectTrigger className="w-full bg-gray-800/70 border-gray-700/50 text-white">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-700/50 text-white">
                  {genreOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.status !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                >
                  Status:{" "}
                  {statusOptions.find((o) => o.value === filters.status)?.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleFilterChange("status", "all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.platform && filters.platform !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
                >
                  Platform:{" "}
                  {
                    platformOptions.find((o) => o.value === filters.platform)
                      ?.label
                  }
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleFilterChange("platform", "all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.genre && filters.genre !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-300 border-green-500/30 hover:bg-green-500/20"
                >
                  Genre:{" "}
                  {genreOptions.find((o) => o.value === filters.genre)?.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleFilterChange("genre", "all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.search && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                >
                  Search: {filters.search}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={handleSearchClear}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              <Button
                variant="link"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={handleReset}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
