"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGamesStore } from "@/stores/useGamesStore";
import type { CategoryOption, SortOption } from "@/stores/useGamesStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useDebounce } from "@/hooks/useDebounce";
import { GamesHeader } from "./sections/games-header";
import { GamesGrid } from "./sections/games-grid";
import { GamesPagination } from "./GamesPagination";
import { useSearchParams, useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 48;

type StoreKey =
  | "selectedCategory"
  | "selectedPlatform"
  | "selectedGenre"
  | "selectedYear"
  | "sortBy"
  | "timeRange"
  | "currentPage"
  | "searchQuery";
type ParamMapping = {
  [key: string]: StoreKey;
};

const paramToStoreKeyMap: ParamMapping = {
  category: "selectedCategory",
  platform: "selectedPlatform",
  genre: "selectedGenre",
  year: "selectedYear",
  sort: "sortBy",
  timeRange: "timeRange",
};

export default function AllGamesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useGamesStore();
  const debouncedSearch = useDebounce(store.searchQuery, 500);
  const isInitialMount = useRef(true);
  const isUpdatingFromUrl = useRef(false);
  const previousUrl = useRef("");
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isUpdatingFromStore = useRef(false);

  // Memoize store values to prevent unnecessary re-renders
  const storeValues = useMemo(
    () => ({
      selectedCategory: store.selectedCategory,
      selectedPlatform: store.selectedPlatform,
      selectedGenre: store.selectedGenre,
      selectedYear: store.selectedYear,
      sortBy: store.sortBy,
      timeRange: store.timeRange,
      currentPage: store.currentPage,
      searchQuery: store.searchQuery,
    }),
    [
      store.selectedCategory,
      store.selectedPlatform,
      store.selectedGenre,
      store.selectedYear,
      store.sortBy,
      store.timeRange,
      store.currentPage,
      store.searchQuery,
    ]
  );

  // Memoize store methods to prevent unnecessary re-renders
  const storeMethods = useMemo(
    () => ({
      setGames: store.setGames,
      setTotalPages: store.setTotalPages,
      setTotalGames: store.setTotalGames,
      setLoading: store.setLoading,
      setError: store.setError,
      batchUpdate: (
        updates: Partial<{
          selectedCategory: CategoryOption;
          selectedPlatform: string;
          selectedGenre: string;
          selectedYear: string;
          sortBy: SortOption;
          timeRange: string;
          currentPage: number;
          searchQuery: string;
        }>
      ) => {
        store.batchUpdate(updates);
        // Force a refetch after batch update
        setTimeout(() => {
          store.fetchGames();
        }, 0);
      },
      setCurrentPage: store.setCurrentPage,
      handleResetFilters: store.handleResetFilters,
      setPlatforms: store.setPlatforms,
      setGenres: store.setGenres,
    }),
    [store]
  );

  // Memoize the query parameters
  const queryParams = useMemo(() => {
    if (!searchParams) return null;
    const params = {
      category: searchParams.get("category"),
      platform: searchParams.get("platform"),
      genre: searchParams.get("genre"),
      year: searchParams.get("year"),
      sort: searchParams.get("sort"),
      timeRange: searchParams.get("timeRange"),
    };

    // Filter out null values
    return Object.fromEntries(
      Object.entries(params).filter(([_key, value]) => value !== null)
    );
  }, [searchParams]);

  // Memoize the update function
  const updateStoreFromParams = useCallback(
    (params: Record<string, string | null>) => {
      const updates: Partial<{
        selectedCategory: CategoryOption;
        selectedPlatform: string;
        selectedGenre: string;
        selectedYear: string;
        sortBy: SortOption;
        timeRange: string;
      }> = {};
      let hasUpdates = false;

      // Helper function to check and update a parameter
      const checkAndUpdate = (
        paramKey: string,
        storeKey: StoreKey,
        defaultValue: string = "all"
      ) => {
        if (
          params[paramKey] &&
          params[paramKey] !== defaultValue &&
          params[paramKey] !== storeValues[storeKey]
        ) {
          updates[storeKey] = params[paramKey];
          hasUpdates = true;
        }
      };

      Object.entries(paramToStoreKeyMap).forEach(([paramKey, storeKey]) => {
        const defaultValue = storeKey === "sortBy" ? "popularity" : "all";
        checkAndUpdate(paramKey, storeKey, defaultValue);
      });

      if (hasUpdates) {
        isUpdatingFromUrl.current = true;
        storeMethods.batchUpdate(updates);
        setTimeout(() => {
          isUpdatingFromUrl.current = false;
        }, 100);
      }
    },
    [storeValues, storeMethods]
  );

  // Sync URL params with store on mount and URL changes
  useEffect(() => {
    if (!queryParams || isUpdatingFromStore.current) return;

    const currentUrl = searchParams?.toString() || "";
    if (currentUrl === previousUrl.current) return;

    const needsUpdate = Object.entries(queryParams).some(([key, value]) => {
      if (!value) return false;
      const storeKey = paramToStoreKeyMap[key];
      return storeKey && value !== storeValues[storeKey];
    });

    if (needsUpdate) {
      updateStoreFromParams(queryParams);
    }

    previousUrl.current = currentUrl;
  }, [queryParams, updateStoreFromParams, searchParams, storeValues]);

  // Update URL when store state changes - with debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isUpdatingFromUrl.current) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      let hasChanges = false;

      const updateParam = (
        key: string,
        value: string,
        defaultValue: string
      ) => {
        if (value && value !== defaultValue) {
          if (params.get(key) !== value) {
            params.set(key, value);
            hasChanges = true;
          }
        } else if (params.has(key)) {
          params.delete(key);
          hasChanges = true;
        }
      };

      // Update all parameters
      updateParam("category", storeValues.selectedCategory, "all");
      updateParam("platform", storeValues.selectedPlatform, "all");
      updateParam("genre", storeValues.selectedGenre, "all");
      updateParam("year", storeValues.selectedYear, "all");
      updateParam("sort", storeValues.sortBy, "popularity");
      updateParam("timeRange", storeValues.timeRange, "all");

      if (storeValues.searchQuery) {
        if (params.get("search") !== storeValues.searchQuery) {
          params.set("search", storeValues.searchQuery);
          hasChanges = true;
        }
      } else if (params.has("search")) {
        params.delete("search");
        hasChanges = true;
      }

      if (hasChanges) {
        isUpdatingFromStore.current = true;
        const queryString = params.toString();
        const newUrl = queryString
          ? `?${queryString}`
          : window.location.pathname;
        router.push(newUrl, { scroll: false });
        setTimeout(() => {
          isUpdatingFromStore.current = false;
        }, 100);
      }
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [storeValues, router, searchParams]);

  // Query for games data with memoized queryFn
  const queryFn = useCallback(async () => {
    storeMethods.setLoading(true);
    try {
      const params = new URLSearchParams({
        page: storeValues.currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        platform: storeValues.selectedPlatform,
        genre: storeValues.selectedGenre,
        category: storeValues.selectedCategory,
        year: storeValues.selectedYear,
        sort: storeValues.sortBy,
        search: debouncedSearch,
        timeRange: storeValues.timeRange,
      });

      const response = await fetch(`/api/games?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();
      storeMethods.setGames(data.games);
      storeMethods.setTotalPages(data.totalPages);
      storeMethods.setTotalGames(data.totalGames);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch games";
      storeMethods.setError(message);
      throw error;
    } finally {
      storeMethods.setLoading(false);
    }
  }, [storeValues, debouncedSearch, storeMethods]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "allGames",
      storeValues.currentPage,
      storeValues.sortBy,
      storeValues.selectedPlatform,
      storeValues.selectedGenre,
      storeValues.selectedCategory,
      storeValues.selectedYear,
      storeValues.timeRange,
      debouncedSearch,
    ],
    queryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });

  // Fetch metadata only once on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch("/api/games/metadata");
        if (!response.ok) {
          throw new Error("Failed to fetch metadata");
        }
        const data = await response.json();
        store.setPlatforms(data.platforms || []);
        store.setGenres(data.genres || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch metadata";
        store.setError(message);
      }
    };

    fetchMetadata();
  }, []); // Empty dependency array since we only want to fetch once on mount

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
            onClick={storeMethods.handleResetFilters}
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
        <div className="mt-10">
          <GamesPagination
            currentPage={storeValues.currentPage}
            totalPages={data?.totalPages || 1}
            setCurrentPage={storeMethods.setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
