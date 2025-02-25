import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGamesStore } from "@/stores/useGamesStore";

// Only include storeKeys that are used in URL parameters
const paramToStoreKeyMap = {
  category: "selectedCategory",
  platform: "selectedPlatform",
  genre: "selectedGenre",
  year: "selectedYear",
  sort: "sortBy",
  timeRange: "timeRange",
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

  // Memoize store values
  const storeValues = useMemo(() => ({
    selectedCategory: store.selectedCategory,
    selectedPlatform: store.selectedPlatform,
    selectedGenre: store.selectedGenre,
    selectedYear: store.selectedYear,
    sortBy: store.sortBy,
    timeRange: store.timeRange,
    currentPage: store.currentPage,
  }), [store]);

  // Update URL based on store values
  const updateUrl = useCallback((values: typeof storeValues) => {
    if (isUpdatingFromUrl.current) return;

    const params = new URLSearchParams(searchParams?.toString());
    let hasChanges = false;

    Object.entries(paramToStoreKeyMap).forEach(([paramKey, storeKey]) => {
      const value = values[storeKey as keyof typeof values];
      const defaultValue = storeKey === "sortBy" ? "popularity" : "all";

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
  const updateStoreFromParams = useCallback((params: URLSearchParams) => {
    if (isUpdatingFromStore.current) return;

    const updates: Partial<Record<StoreKeys | 'currentPage', string>> = {};
    let hasUpdates = false;

    Object.entries(paramToStoreKeyMap).forEach(([paramKey, storeKey]) => {
      const value = params.get(paramKey);
      const defaultValue = storeKey === "sortBy" ? "popularity" : "all";

      if (value && value !== defaultValue && value !== storeValues[storeKey as keyof typeof storeValues]) {
        updates[storeKey as keyof typeof storeValues] = value as any;
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

  // Sync URL with store changes
  useEffect(() => {
    if (!searchParams) return;

    const currentUrl = searchParams.toString();
    if (currentUrl === previousUrl.current) return;

    updateStoreFromParams(searchParams);
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

  return {
    searchParams,
    updateUrl,
    updateStoreFromParams,
  };
}
