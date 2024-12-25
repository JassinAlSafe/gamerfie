"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Gamepad2,
  ArrowLeft,
  Loader2,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGamesStore } from "@/stores/useGamesStore";
import { useDebounce } from "@/hooks/useDebounce";
import { formatRating } from "@/utils/game-utils";
import { useSearchParams } from "next/navigation";

interface Platform {
  id: number;
  name: string;
  category?: number;
}

interface Game {
  id: string;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
  total_rating_count?: number;
  genres?: Array<{ id: number; name: string }>;
  platforms?: Platform[];
  first_release_date?: number;
}

const ITEMS_PER_PAGE = 24;

const gameCategories = {
  all: "All Games",
  recent: "Recent Games",
  popular: "Popular Games",
  upcoming: "Upcoming Games",
  classic: "Classic Games",
  indie: "Indie Games",
  anticipated: "Most Anticipated",
};

export default function AllGamesPage() {
  const {
    currentPage,
    sortBy,
    searchQuery,
    selectedPlatform,
    selectedGenre,
    selectedCategory,
    selectedYear,
    setCurrentPage,
    setSortBy,
    setSearchQuery,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedCategory,
    setSelectedYear,
    setGames,
    setTotalPages,
    setTotalGames,
    resetFilters,
    setLoading,
    setError: setStoreError,
  } = useGamesStore();

  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";

  // Debounce the search query
  const debouncedSearch = useDebounce(searchQuery);

  // Combine all active filters for the query key
  const queryKey = useMemo(
    () => [
      "allGames",
      currentPage,
      sortBy,
      selectedPlatform,
      selectedGenre,
      selectedCategory,
      selectedYear,
      debouncedSearch,
    ],
    [
      currentPage,
      sortBy,
      selectedPlatform,
      selectedGenre,
      selectedCategory,
      selectedYear,
      debouncedSearch,
    ]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          platform: selectedPlatform,
          genre: selectedGenre,
          category: selectedCategory,
          year: selectedYear,
          sort: sortBy,
          search: debouncedSearch,
        });

        const response = await fetch(`/api/games?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch games");
        }
        const data = await response.json();
        setGames(data.games);
        setTotalPages(data.totalPages);
        setTotalGames(data.totalGames);
        return data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch games";
        setStoreError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Extract unique platforms and genres from the current games
  const { platforms, genres } = useMemo(() => {
    if (!data?.games) return { platforms: [], genres: [] };

    const platformsSet = new Set<string>();
    const genresSet = new Set<string>();

    data.games.forEach((game: Game) => {
      game.platforms?.forEach((platform) => {
        platformsSet.add(platform.name);
      });
      game.genres?.forEach((genre) => {
        genresSet.add(genre.name);
      });
    });

    return {
      platforms: Array.from(platformsSet).sort(),
      genres: Array.from(genresSet).sort(),
    };
  }, [data]);

  // Process games for display
  const currentGames = useMemo(() => {
    if (!data?.games) return [];
    return data.games.map((game: Game) => ({
      ...game,
      cover: game.cover
        ? {
            ...game.cover,
            url: game.cover.url.includes("t_cover_big_2x")
              ? game.cover.url
              : game.cover.url.replace(/t_[a-zA-Z_]+/, "t_cover_big_2x"),
          }
        : undefined,
    }));
  }, [data]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    resetFilters();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => currentYear - i);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">
            <p>Error loading games: {error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-white">All Games</h1>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-900/50 border-gray-800 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-purple-500" />
            )}
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(gameCategories).map(([value, label]) => (
                <SelectItem key={`category-${value}`} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="release">Release Date</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-900/50 border-gray-800"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800">
              <DropdownMenuLabel>Platforms</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[200px] overflow-y-auto">
                <DropdownMenuItem
                  key="platform-all"
                  onClick={() => setSelectedPlatform("all")}
                  className={cn(
                    "cursor-pointer",
                    selectedPlatform === "all" && "bg-purple-500/20"
                  )}
                >
                  All Platforms
                </DropdownMenuItem>
                {platforms.map((platform) => (
                  <DropdownMenuItem
                    key={`platform-${platform}`}
                    onClick={() => setSelectedPlatform(platform)}
                    className={cn(
                      "cursor-pointer",
                      selectedPlatform === platform && "bg-purple-500/20"
                    )}
                  >
                    {platform}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Genres</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[200px] overflow-y-auto">
                <DropdownMenuItem
                  key="genre-all"
                  onClick={() => setSelectedGenre("all")}
                  className={cn(
                    "cursor-pointer",
                    selectedGenre === "all" && "bg-purple-500/20"
                  )}
                >
                  All Genres
                </DropdownMenuItem>
                {genres.map((genre) => (
                  <DropdownMenuItem
                    key={`genre-${genre}`}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn(
                      "cursor-pointer",
                      selectedGenre === genre && "bg-purple-500/20"
                    )}
                  >
                    {genre}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Release Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {
                  gameCategories[
                    selectedCategory as keyof typeof gameCategories
                  ]
                }{" "}
                ×
              </Badge>
            )}
            {selectedPlatform !== "all" && (
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                onClick={() => setSelectedPlatform("all")}
              >
                {selectedPlatform} ×
              </Badge>
            )}
            {selectedGenre !== "all" && (
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                onClick={() => setSelectedGenre("all")}
              >
                {selectedGenre} ×
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-gray-400">
          {isLoading ? (
            <span>Searching...</span>
          ) : (
            `${data?.totalGames.toLocaleString()} Games • Page ${currentPage} of ${
              data?.totalPages
            }`
          )}
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentGames.map((game: Game, index: number) => (
                <Link key={game.id} href={`/game/${game.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-900/50"
                  >
                    {game.cover?.url ? (
                      <Image
                        src={game.cover.url}
                        alt={game.name}
                        fill
                        priority={index < 6}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        quality={90}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <Gamepad2 className="h-10 w-10 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="text-white text-sm font-semibold line-clamp-2 mb-2">
                          {game.name}
                        </h2>
                        <div className="flex items-center gap-3">
                          {game.rating && (
                            <div className="flex items-center text-yellow-400">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              <span className="text-xs">
                                {Math.round(game.rating)}
                              </span>
                            </div>
                          )}
                          {game.total_rating_count && (
                            <div className="flex items-center text-gray-400">
                              <Users className="h-3 w-3 mr-1" />
                              <span className="text-xs">
                                {game.total_rating_count > 1000
                                  ? `${(game.total_rating_count / 1000).toFixed(
                                      1
                                    )}k`
                                  : game.total_rating_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="text-white"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-white"
                >
                  Previous
                </Button>
                <span className="text-gray-400">
                  Page {currentPage.toLocaleString()} of{" "}
                  {data.totalPages.toLocaleString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  className="text-white"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.totalPages)}
                  disabled={currentPage === data.totalPages}
                  className="text-white"
                >
                  Last
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
