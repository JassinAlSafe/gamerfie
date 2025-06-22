import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasNextPage,
  isLoading,
  onLoadMore,
  rootMargin = "100px"
}: UseInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      
      if (
        target.isIntersecting &&
        hasNextPage &&
        !isLoading &&
        !loadingRef.current
      ) {
        loadingRef.current = true;
        
        // Use requestIdleCallback for non-blocking load
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          window.requestIdleCallback(() => {
            onLoadMore();
            loadingRef.current = false;
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            onLoadMore();
            loadingRef.current = false;
          }, 0);
        }
      }
    },
    [hasNextPage, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: 0.1
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      loadingRef.current = false;
    };
  }, [handleIntersection, rootMargin]);

  // Reset loading ref when loading state changes
  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  return {
    sentinelRef,
    isLoadingMore: loadingRef.current
  };
}

// Alternative scroll-based infinite scroll for fallback
export function useScrollInfiniteScroll({
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 0.8
}: {
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}) {
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (loadingRef.current || !hasNextPage || isLoading) return;

    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const triggerPoint = documentHeight * threshold;

    if (scrollPosition >= triggerPoint) {
      loadingRef.current = true;
      
      // Use requestIdleCallback for non-blocking load
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          onLoadMore();
          setTimeout(() => {
            loadingRef.current = false;
          }, 1000);
        });
      } else {
        setTimeout(() => {
          onLoadMore();
          setTimeout(() => {
            loadingRef.current = false;
          }, 1000);
        }, 0);
      }
    }
  }, [hasNextPage, isLoading, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset loading ref when loading state changes
  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  return {
    isLoadingMore: loadingRef.current
  };
}