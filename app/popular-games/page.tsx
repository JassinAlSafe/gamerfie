"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import { cn, ensureAbsoluteUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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

export default function PopularGamesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["popularGames", currentPage, sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/games/popular`);
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Extract unique platforms and genres
  const { platforms, genres } = useMemo(() => {
    if (!data?.all) return { platforms: [], genres: [] };

    const platformsSet = new Set<string>();
    const genresSet = new Set<string>();

    data.all.forEach((game: Game) => {
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

  const gameCategories = {
    all: "All Games",
    topRated: "Top Rated",
    highlyRated: "Highly Rated",
    popularGames: "Most Popular",
    classicGames: "Classic Games",
    newReleases: "New Releases",
    upcoming: "Upcoming",
    trending: "Trending Now",
    mostAnticipated: "Most Anticipated",
  };

  const getGamesForCategory = useCallback(
    (category: string) => {
      if (!data) return [];
      return category === "all"
        ? data.all
        : data[category as keyof typeof data] || [];
    },
    [data]
  );

  const filteredGames = useMemo(() => {
    if (!data) return [];

    const categoryGames = getGamesForCategory(selectedCategory);

    return categoryGames
      .filter((game: Game) => {
        const matchesSearch = game.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesPlatform =
          selectedPlatform === "all" ||
          game.platforms?.some(
            (platform) => platform.name === selectedPlatform
          );
        const matchesGenre =
          selectedGenre === "all" ||
          game.genres?.some((genre) => genre.name === selectedGenre);

        return matchesSearch && matchesPlatform && matchesGenre;
      })
      .sort((a: Game, b: Game) => {
        switch (sortBy) {
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "popularity":
            return (b.total_rating_count || 0) - (a.total_rating_count || 0);
          case "name":
            return a.name.localeCompare(b.name);
          case "release":
            return (b.first_release_date || 0) - (a.first_release_date || 0);
          default:
            return 0;
        }
      });
  }, [
    data,
    searchQuery,
    selectedPlatform,
    selectedGenre,
    selectedCategory,
    sortBy,
    getGamesForCategory,
  ]);

  const totalPages = Math.ceil((filteredGames?.length || 0) / ITEMS_PER_PAGE);
  const currentGames = filteredGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">
            <p>Error loading games: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            <h1 className="text-3xl font-bold text-white">Popular Games</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900/50 border-gray-800"
          />

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900/50 border-gray-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(gameCategories).map(([value, label]) => (
                <SelectItem key={value} value={value}>
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
                    key={platform}
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
                    key={genre}
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
        </div>

        {/* Active Filters */}
        {(selectedPlatform !== "all" ||
          selectedGenre !== "all" ||
          selectedCategory !== "all") && (
          <div className="flex flex-wrap gap-2 mb-4">
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
        <div className="text-gray-400 mb-6">
          Showing {currentGames.length} of {filteredGames.length} games
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
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
                        src={ensureAbsoluteUrl(game.cover.url)}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        loading={index < 12 ? "eager" : "lazy"}
                        priority={index < 6}
                        quality={75}
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
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
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
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-white"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
