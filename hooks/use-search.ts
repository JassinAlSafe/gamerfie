import { useCallback } from "react";
import { useGlobalSearchStore } from "@/stores/useGlobalSearchStore";

interface UseSearchOptions {
  debounceMs?: number;
  minChars?: number;
}

export function useSearch({ minChars = 2 }: UseSearchOptions = {}) {
  const { 
    query, 
    results, 
    isLoading, 
    isOpen,
    setQuery,
    setIsOpen,
    search,
    reset 
  } = useGlobalSearchStore();

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);
      if (value.length >= minChars) {
        await search(value);
      }
    },
    [setQuery, search, minChars]
  );

  return {
    query,
    results,
    isLoading,
    isOpen,
    setQuery,
    setIsOpen,
    search: handleSearch,
    reset
  };
}