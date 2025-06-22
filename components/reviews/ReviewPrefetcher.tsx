"use client";

interface ReviewPrefetcherProps {
  gameIds: string[];
}

export function ReviewPrefetcher({
  gameIds: _gameIds,
}: ReviewPrefetcherProps) {
  // Game details prefetching is now handled by the unified game details hook
  // This component is kept for future prefetching optimizations
  
  return null; // This component doesn't render anything
}
