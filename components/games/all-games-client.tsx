"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGamesStore } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useDebounce } from "@/hooks/useDebounce";
import { GamesHeader } from "./sections/games-header";
import { GamesGrid } from "./sections/games-grid";
import { GamesPagination } from "./GamesPagination";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 48;

export default function AllGamesClient() {
  const searchParams = useSearchParams();
  const [appliedFilters, setAppliedFilters] = useState({
    platform: searchParams.get("platform") || "all",
    genre: searchParams.get("genre") || "all",
    category: searchParams.get("category") || "all",
    year: searchParams.get("year") || "all",
    timeRange: searchParams.get("timeRange") || "all",
    sort: searchParams.get("sort") || "popularity",
  });

  const {
    currentPage,
    sortBy,
    selectedPlatform,
    selectedGenre,
    selectedCategory,
    selectedYear,
    timeRange,
    setGames,
    setTotalPages,
    setTotalGames,
    setLoading,
    setError,
    resetFilters,
    setCurrentPage,
    setPlatforms,
    setGenres,
    setSelectedCategory,
    setTimeRange,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setSortBy,
  } = useGamesStore();

  // Read URL parameters on mount and when URL changes
  useEffect(() => {
    const category = searchParams.get("category");
    const timeRange = searchParams.get("timeRange");
    const platform = searchParams.get("platform");
    const genre = searchParams.get("genre");
    const year = searchParams.get("year");
    const sort = searchParams.get("sort");

    if (category) setSelectedCategory(category);
    if (timeRange) setTimeRange(timeRange);
    if (platform) setSelectedPlatform(platform);
    if (genre) setSelectedGenre(genre);
    if (year) setSelectedYear(year);
    if (sort) setSortBy(sort);
  }, [
    searchParams,
    setSelectedCategory,
    setTimeRange,
    setSelectedPlatform,
    setSelectedGenre,
    setSelectedYear,
    setSortBy,
  ]);

  const { query: searchQuery } = useSearchStore();
  const debouncedSearch = useDebounce(searchQuery, 500); // 500ms debounce

  // Combine all active filters for the query key
  const queryKey = useMemo(
    () => [
      "allGames",
      currentPage,
      appliedFilters.sort,
      appliedFilters.platform,
      appliedFilters.genre,
      appliedFilters.category,
      appliedFilters.year,
      appliedFilters.timeRange,
      debouncedSearch,
    ],
    [currentPage, appliedFilters, debouncedSearch]
  );

  // Update appliedFilters when URL changes
  useEffect(() => {
    setAppliedFilters({
      platform: searchParams.get("platform") || "all",
      genre: searchParams.get("genre") || "all",
      category: searchParams.get("category") || "all",
      year: searchParams.get("year") || "all",
      timeRange: searchParams.get("timeRange") || "all",
      sort: searchParams.get("sort") || "popularity",
    });
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      setLoading(true);
      try {
        // Try to get from localStorage first
        const cacheKey = `games-${queryKey.join("-")}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const { data: parsedData, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;

          // Use cache if it's less than 5 minutes old
          if (cacheAge < 1000 * 60 * 5) {
            setGames(parsedData.games);
            setTotalPages(parsedData.totalPages);
            setTotalGames(parsedData.totalGames);
            setPlatforms(parsedData.platforms || []);
            setGenres(parsedData.genres || []);
            return parsedData;
          }
        }

        // Fetch fresh data if no cache or cache is stale
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          platform: appliedFilters.platform,
          genre: appliedFilters.genre,
          category: appliedFilters.category,
          year: appliedFilters.year,
          sort: appliedFilters.sort,
          search: debouncedSearch,
          timeRange: appliedFilters.timeRange,
        });

        const response = await fetch(`/api/games?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch games");
        }
        const freshData = await response.json();

        // Save to localStorage with timestamp
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: freshData,
            timestamp: Date.now(),
          })
        );

        setGames(freshData.games);
        setTotalPages(freshData.totalPages);
        setTotalGames(freshData.totalGames);
        setPlatforms(freshData.platforms || []);
        setGenres(freshData.genres || []);
        return freshData;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch games";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  });

  // Fetch initial platforms and genres if not available
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch("/api/games/metadata");
        if (!response.ok) throw new Error("Failed to fetch metadata");
        const data = await response.json();
        setPlatforms(data.platforms || []);
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Failed to fetch platforms and genres:", error);
      }
    };

    fetchMetadata();
  }, [setPlatforms, setGenres]);

  // Clear old cache entries periodically
  useEffect(() => {
    const cleanupCache = () => {
      if (typeof window === "undefined") return;

      const maxAge = 1000 * 60 * 60 * 24; // 24 hours
      const now = Date.now();

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("games-")) {
          try {
            const { timestamp } = JSON.parse(localStorage.getItem(key)!);
            if (now - timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    cleanupCache();
    const interval = setInterval(cleanupCache, 1000 * 60 * 60); // Clean up every hour
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">
          <p>
            Error loading games:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-10">
      <GamesHeader />
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GamesGrid isLoading={isLoading} games={data?.games || []} />
        <div className=" mt-10">
          <GamesPagination
            currentPage={currentPage}
            totalPages={data?.totalPages || 1}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
