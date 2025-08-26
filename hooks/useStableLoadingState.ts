import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing stable loading states to prevent UI flickering
 * during component initialization and data fetching.
 */
export const useStableLoadingState = (loadingStates: boolean[]) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setDelayedInitialLoad = useCallback((value: boolean, delay: number = 100) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsInitialLoad(value), delay);
  }, []);

  useEffect(() => {
    const hasAnyData = loadingStates.some(loading => !loading);

    if (hasAnyData && isInitialLoad) {
      // Once any data starts loading, mark as having data
      setHasDataLoaded(true);
    }

    // Get critical loading states (first state is considered most critical)
    const criticalDataLoaded = !loadingStates[0];

    // Only hide loading after critical data is loaded
    if (criticalDataLoaded && !isInitialLoad) {
      setIsInitialLoad(false);
    } else if (criticalDataLoaded && hasDataLoaded) {
      // Set a small delay to prevent flickering
      setDelayedInitialLoad(false);
    }
  }, [...loadingStates, isInitialLoad, hasDataLoaded]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { 
    isInitialLoad, 
    hasDataLoaded,
    setDelayedInitialLoad 
  };
};

/**
 * Custom hook for managing delayed state changes with proper cleanup
 */
export const useDelayedState = <T>(
  initialValue: T, 
  delay: number = 100
): [T, (value: T, customDelay?: number) => void] => {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setDelayedValue = useCallback((newValue: T, customDelay?: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setValue(newValue), customDelay ?? delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setDelayedValue];
};