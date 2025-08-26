"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Header skeleton component shown during initialization
 * Matches the actual header layout for seamless loading experience
 */
export function HeaderSkeleton() {
  return (
    <header className="fixed left-0 right-0 top-0 header-fixed transition-all duration-300">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 header-backdrop">
        <div className="container mx-auto max-w-[1920px] header-container px-4 sm:px-6 md:px-6 lg:px-8">
          <div className="relative flex header-height h-16 items-center justify-between">
            {/* Logo Skeleton */}
            <Skeleton className="h-6 w-24 sm:w-28 md:w-32" />

            {/* Desktop Layout Skeleton */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-6">
              {/* Search Bar Skeleton */}
              <div className="flex-1 max-w-[300px]">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              
              {/* Navigation Skeleton */}
              <nav className="hidden lg:flex items-center gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16" />
                ))}
              </nav>
              
              {/* Auth Buttons Skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            {/* Mobile Layout Skeleton */}
            <div className="flex md:hidden items-center gap-3">
              {/* Search Button Skeleton */}
              <Skeleton className="h-8 w-8 rounded-md" />
              {/* Menu Button Skeleton */}
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Compact header skeleton for reduced motion preferences
 */
export function CompactHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </header>
  );
}