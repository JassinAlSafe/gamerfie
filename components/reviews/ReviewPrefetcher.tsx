"use client";

import { useEffect, useRef } from "react";

interface ReviewPrefetcherProps {
  gameIds: string[];
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export function ReviewPrefetcher({
  gameIds,
  hasNextPage,
  onLoadMore,
}: ReviewPrefetcherProps) {
  const nextPagePrefetched = useRef(false);

  // Game details prefetching is now handled by bulk loading - no need for individual prefetching

  // Prefetch next page when user scrolls near bottom
  useEffect(() => {
    if (!hasNextPage || nextPagePrefetched.current) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = documentHeight * 0.8; // Prefetch when 80% scrolled

      if (scrollPosition >= threshold && !nextPagePrefetched.current) {
        nextPagePrefetched.current = true;

        // Use requestIdleCallback for non-blocking prefetch
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          window.requestIdleCallback(() => {
            onLoadMore();
          });
        } else {
          setTimeout(() => {
            onLoadMore();
          }, 100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, onLoadMore]);

  // Reset prefetch state when hasNextPage changes
  useEffect(() => {
    if (!hasNextPage) {
      nextPagePrefetched.current = false;
    }
  }, [hasNextPage]);

  return null; // This component doesn't render anything
}
