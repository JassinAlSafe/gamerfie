"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/loadingSpinner";
import { Gamepad2, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FetchGamesResponse, FetchedGame } from "@/lib/igdb";
import { Platform } from "@/types/game";

const GAMES_PER_PAGE = 48;

const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
};

export default function AllGamesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [platformSearch, setPlatformSearch] = useState("");

  const fetchGamesData = useCallback(async () => {
    const response = await fetch(`/api/games?page=${currentPage}&limit=${GAMES_PER_PAGE}${selectedPlatform !== "all" ? `&platformId=${selectedPlatform}` : ""}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  }, [currentPage, selectedPlatform]);

  const fetchPlatforms = useCallback(async () => {
    const response = await fetch('/api/platforms');
    if (!response.ok) {
      throw new Error("Failed to fetch platforms");
    }
    return response.json();
  }, []);

  const { data: gamesData, error: gamesError, isLoading: gamesLoading, isFetching: gamesFetching } = useQuery<FetchGamesResponse, Error>({
    queryKey: ["allGames", currentPage, selectedPlatform],
    queryFn: fetchGamesData,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: platformsData, error: platformsError, isLoading: platformsLoading } = useQuery<Platform[], Error>({
    queryKey: ["platforms"],
    queryFn: fetchPlatforms,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 1 week
  });

  const games = useMemo(() => gamesData?.games || [], [gamesData]);
  const totalGames = useMemo(() => gamesData?.total || 0, [gamesData]);
  const totalPages = useMemo(() => Math.ceil(totalGames / GAMES_PER_PAGE), [totalGames]);

  const platforms = useMemo(() => {
    if (!platformsData) return [];
    return platformsData.filter(platform => 
      platform.name.toLowerCase().includes(platformSearch.toLowerCase())
    );
  }, [platformsData, platformSearch]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [games, searchTerm]);

  const sortedGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "releaseDate") {
        return (b.first_release_date || 0) - (a.first_release_date || 0);
      } else {
        return (b.total_rating || 0) - (a.total_rating || 0);
      }
    });
  }, [filteredGames, sortBy]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    setSelectedPlatform(value);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  if (gamesLoading || platformsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (gamesError || platformsError) {
    console.error("Error in AllGamesPage:", gamesError || platformsError);
    return <ErrorDisplay error={gamesError || platformsError} />;
  }

  if (!gamesData || games.length === 0) {
    console.warn("No game data available");
    return <NoDataDisplay />;
  }

  return (
    <div className="w-full min-h-screen py-8 mt-20 px-4 md:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <ErrorBoundary
        fallback={
          <div className="text-white p-4 bg-red-500/10 rounded-lg">
            Error loading games. Please try again later.
          </div>
        }
      >
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white">All Games</h1>
        </div>
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 text-white"
              aria-label="Search games"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border border-gray-700 max-h-60 overflow-y-auto">
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search platforms..."
                  value={platformSearch}
                  onChange={(e) => setPlatformSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                All Platforms
              </SelectItem>
              {platforms.map((platform) => (
                <SelectItem
                  key={platform.id}
                  value={platform.id.toString()}
                  className="text-white hover:bg-gray-700"
                >
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border border-gray-700">
              <SelectItem
                value="popularity"
                className="text-white hover:bg-gray-700"
              >
                Top Rated
              </SelectItem>
              <SelectItem
                value="releaseDate"
                className="text-white hover:bg-gray-700"
              >
                New
              </SelectItem>
              <SelectItem value="name" className="text-white hover:bg-gray-700">
                Name
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {sortedGames.map((game: FetchedGame, index: number) => (
            <Link href={`/game/${game.id}`} key={game.id}>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                {game.cover ? (
                  <Image
                    src={ensureAbsoluteUrl(game.cover.url)}
                    alt={game.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12.5vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    priority={index === 0}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <Gamepad2
                      className="w-12 h-12 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
                  <h2 className="text-white text-sm font-semibold p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    {game.name}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <nav
          className="mt-8 flex justify-center items-center space-x-2"
          aria-label="Pagination"
        >
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || gamesFetching}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-gray-900"
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || gamesFetching}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-gray-900"
            aria-label="Next page"
          >
            Next
          </Button>
        </nav>
      </ErrorBoundary>
    </div>
  );
}

const ErrorDisplay: React.FC<{ error: Error }> = ({ error }) => (
  <div
    className="flex flex-col items-center justify-center min-h-screen text-white"
    role="alert"
  >
    <Gamepad2 className="w-16 h-16 mb-4 text-red-500" aria-hidden="true" />
    <h2 className="text-2xl font-bold mb-2">Error loading game data</h2>
    <p className="text-gray-400 text-center max-width-md">{error.message}</p>
    <p className="mt-4 text-blue-400 hover:text-blue-300 cursor-pointer">
      Please try refreshing the page or contact support if the problem persists.
    </p>
  </div>
);

const NoDataDisplay: React.FC = () => (
  <div
    className="flex flex-col items-center justify-center min-h-screen text-white"
    role="alert"
  >
    <Gamepad2 className="w-16 h-16 mb-4 text-gray-600" aria-hidden="true" />
    <h2 className="text-2xl font-bold mb-2">No game data available</h2>
    <p className="text-gray-400">Check back later for exciting new games!</p>
  </div>
);