"use client";

import { useState, useEffect } from "react";
import { Filter, Search, SortAsc, SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameStatus, Platform, Genre } from "@/types/game";
import { useGamesStore } from "@/stores/useGamesStore";

export interface GameFiltersState {
  status: GameStatus | "all";
  sortBy: "recent" | "name" | "rating" | "release" | "popularity";
  sortOrder: "asc" | "desc";
  searchQuery: string;
  platform: string;
  genre: string;
  category: string;
}

interface GameFiltersProps {
  onFilterChange: (filters: GameFiltersState) => void;
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
};

export function GameFilters({
  onFilterChange,
  platforms = [],
  genres = [],
  categories = defaultCategories,
  showSearch = true,
  showCategories = true,
  className = "",
}: GameFiltersProps) {
  const fetchMetadata = useGamesStore((state) => state.fetchMetadata);
  const [filters, setFilters] = useState<GameFiltersState>({
    status: "all",
    sortBy: "popularity",
    sortOrder: "desc",
    searchQuery: "",
    platform: "all",
    genre: "all",
    category: "all",
  });

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const handleFilterChange = (key: keyof GameFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const statusOptions = [
    { value: "all", label: "All Games" },
    { value: "playing", label: "Currently Playing" },
    { value: "completed", label: "Completed" },
    { value: "want_to_play", label: "Want to Play" },
    { value: "dropped", label: "Dropped" },
  ];

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "name", label: "Game Name" },
    { value: "rating", label: "Rating" },
    { value: "release", label: "Release Date" },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {showSearch && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search games..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-800"
          />
        </div>
      )}

      {showCategories && (
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            {Object.entries(categories).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.sortBy}
        onValueChange={(value) => handleFilterChange("sortBy", value)}
      >
        <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-800">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-gray-900/50 border-gray-800">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-gray-900 border-gray-800"
          align="end"
        >
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterChange("status", option.value)}
                className={`cursor-pointer hover:bg-gray-800 ${
                  filters.status === option.value ? "bg-purple-500/20" : ""
                }`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}

            {platforms.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Platforms</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleFilterChange("platform", "all")}
                  className={`cursor-pointer hover:bg-gray-800 ${
                    filters.platform === "all" ? "bg-purple-500/20" : ""
                  }`}
                >
                  All Platforms
                </DropdownMenuItem>
                {platforms.map((platform) => (
                  <DropdownMenuItem
                    key={platform.id}
                    onClick={() =>
                      handleFilterChange("platform", platform.id.toString())
                    }
                    className={`cursor-pointer hover:bg-gray-800 ${
                      filters.platform === platform.id.toString()
                        ? "bg-purple-500/20"
                        : ""
                    }`}
                  >
                    {platform.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {genres.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Genres</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleFilterChange("genre", "all")}
                  className={`cursor-pointer hover:bg-gray-800 ${
                    filters.genre === "all" ? "bg-purple-500/20" : ""
                  }`}
                >
                  All Genres
                </DropdownMenuItem>
                {genres.map((genre: Genre) => (
                  <DropdownMenuItem
                    key={genre.id}
                    onClick={() =>
                      handleFilterChange("genre", genre.id.toString())
                    }
                    className={`cursor-pointer hover:bg-gray-800 ${
                      filters.genre === genre.id.toString()
                        ? "bg-purple-500/20"
                        : ""
                    }`}
                  >
                    {genre.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                handleFilterChange(
                  "sortOrder",
                  filters.sortOrder === "asc" ? "desc" : "asc"
                )
              }
              className="cursor-pointer hover:bg-gray-800"
            >
              {filters.sortOrder === "asc" ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
