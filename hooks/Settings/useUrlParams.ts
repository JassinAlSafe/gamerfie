import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGamesStore } from "@/stores/useGamesStore";
import { useDebounce } from "@/hooks/Settings/useDebounce";

// Only include storeKeys that are used in URL parameters
const paramToStoreKeyMap = {
  category: "selectedCategory",
  platform: "selectedPlatform",
  genre: "selectedGenre",
  year: "selectedYear",
  sort: "sortBy",
  timeRange: "timeRange",
  search: "searchQuery",
} as const;

// Create type from the values of paramToStoreKeyMap
type StoreKeys = typeof paramToStoreKeyMap[keyof typeof paramToStoreKeyMap];

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useGamesStore();
  const isUpdatingFromUrl = useRef(false);
  const isUpdatingFromStore = useRef(false);
  const previousUrl = useRef("");
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const hasInitialized = useRef(false);

  // Debounce search query for URL updates to avoid too many changes
  const debouncedSearchQuery = useDebounce(store.searchQuery, 300);

  // Memoize store values
  const storeValues = useMemo(() => ({
    selectedCategory: store.selectedCategory,
    selectedPlatform: store.selectedPlatform,
    selectedGenre: store.selectedGenre,
    selectedYear: store.selectedYear,
    sortBy: store.sortBy,
    timeRange: store.timeRange,
    searchQuery: debouncedSearchQuery,
    currentPage: store.currentPage,
  }), [store.selectedCategory, store.selectedPlatform, store.selectedGenre, store.selectedYear, store.sortBy, store.timeRange, debouncedSearchQuery, store.currentPage]);

  // Update URL based on store values
  const updateUrl = useCallback((values: typeof storeValues) => {
    if (isUpdatingFromUrl.current) return;

    const params = new URLSearchParams(searchParams?.toString());
    let hasChanges = false;

    Object.entries(paramToStoreKeyMap).forEach(([paramKey, storeKey]) => {
      const value = values[storeKey as keyof typeof values];
      const defaultValue = storeKey === "sortBy" ? "popularity" : storeKey === "searchQuery" ? "" : "all";

      if (value && value !== defaultValue) {
        if (params.get(paramKey) !== value) {
          params.set(paramKey, value as string);
          hasChanges = true;
        }
      } else if (params.has(paramKey)) {
        params.delete(paramKey);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      isUpdatingFromStore.current = true;
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname, { 
        scroll: false 
      });
      setTimeout(() => {
        isUpdatingFromStore.current = false;
      }, 100);
    }
  }, [router, searchParams]);

  // Update store based on URL parameters
  const updateStoreFromParams = useCallback((params: URLSearchParams, isInitial = false) => {
    if (isUpdatingFromStore.current && !isInitial) return;

    const updates: Partial<Record<StoreKeys | 'currentPage', string>> = {};
    let hasUpdates = false;

    Object.entries(paramToStoreKeyMap).forEach(([paramKey, storeKey]) => {
      const value = params.get(paramKey);
      const defaultValue = storeKey === "sortBy" ? "popularity" : storeKey === "searchQuery" ? "" : "all";
      const currentValue = storeValues[storeKey as keyof typeof storeValues];

      if (value && value !== defaultValue) {
        if (isInitial || value !== currentValue) {
          updates[storeKey as keyof typeof storeValues] = value as any;
          hasUpdates = true;
        }
      } else if (isInitial && currentValue !== defaultValue) {
        // Reset to default if no URL param and we're initializing
        updates[storeKey as keyof typeof storeValues] = defaultValue as any;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      isUpdatingFromUrl.current = true;
      store.batchUpdate(updates as Partial<typeof storeValues>);
      setTimeout(() => {
        isUpdatingFromUrl.current = false;
      }, 100);
    }
  }, [store, storeValues]);

  // Initial load: sync URL params to store
  useEffect(() => {
    if (!searchParams || hasInitialized.current) return;
    
    hasInitialized.current = true;
    updateStoreFromParams(searchParams, true);
    previousUrl.current = searchParams.toString();
  }, [searchParams, updateStoreFromParams]);

  // Subsequent changes: sync URL with store changes
  useEffect(() => {
    if (!searchParams || !hasInitialized.current) return;

    const currentUrl = searchParams.toString();
    if (currentUrl === previousUrl.current) return;

    updateStoreFromParams(searchParams, false);
    previousUrl.current = currentUrl;
  }, [searchParams, updateStoreFromParams]);

  // Sync store with URL changes
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateUrl(storeValues);
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [storeValues, updateUrl]);

  // Enhanced reset function that also clears URL
  const resetFiltersAndUrl = useCallback(() => {
    isUpdatingFromUrl.current = true;
    store.resetFilters();
    router.push(window.location.pathname, { scroll: false });
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
    }, 100);
  }, [store, router]);

  return {
    searchParams,
    updateUrl,
    updateStoreFromParams,
    resetFiltersAndUrl,
  };
}
