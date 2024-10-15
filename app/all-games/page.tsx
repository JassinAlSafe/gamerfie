"use client";

import React, { useState, useEffect, useMemo } from "react";
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

const GAMES_PER_PAGE = 48;

// Helper function to ensure absolute URLs
const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
};

export default function AllGamesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading, isFetching } = useQuery<
    FetchGamesResponse,
    Error
  >({
    queryKey: ["allGames", currentPage, selectedPlatform],
    queryFn: async () => {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: currentPage,
          limit: GAMES_PER_PAGE,
          platformId: selectedPlatform !== "all" ? selectedPlatform : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const games = useMemo(() => data?.games || [], [data]);
  const totalGames = useMemo(() => data?.total || 0, [data]);
  const totalPages = useMemo(
    () => Math.ceil(totalGames / GAMES_PER_PAGE),
    [totalGames]
  );

  const platforms = useMemo(() => {
    const platformSet = new Set<string>();
    games.forEach((game) =>
      game.platforms.forEach((platform) => platformSet.add(platform))
    );
    return Array.from(platformSet).sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPlatform =
        selectedPlatform === "all" || game.platforms.includes(selectedPlatform);
      return matchesSearch && matchesPlatform;
    });
  }, [games, searchTerm, selectedPlatform]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlatform, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error("Error in AllGamesPage:", error);
    return <ErrorDisplay error={error} />;
  }

  if (!data || games.length === 0) {
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
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-700 text-white">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Top Rated</SelectItem>
              <SelectItem value="releaseDate">New</SelectItem>
              <SelectItem value="name">Name</SelectItem>
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
                    <Gamepad2 className="w-12 h-12 text-gray-500" />
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
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-gray-900"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isFetching}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-gray-900"
          >
            Next
          </Button>
        </div>
      </ErrorBoundary>
    </div>
  );
}

const ErrorDisplay: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-white">
    <Gamepad2 className="w-16 h-16 mb-4 text-red-500" />
    <h2 className="text-2xl font-bold mb-2">Error loading game data</h2>
    <p className="text-gray-400 text-center max-w-md">{error.message}</p>
    <p className="mt-4 text-blue-400 hover:text-blue-300 cursor-pointer">
      Please try refreshing the page or contact support if the problem persists.
    </p>
  </div>
);

const NoDataDisplay: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-white">
    <Gamepad2 className="w-16 h-16 mb-4 text-gray-600" />
    <h2 className="text-2xl font-bold mb-2">No game data available</h2>
    <p className="text-gray-400">Check back later for exciting new games!</p>
  </div>
);
