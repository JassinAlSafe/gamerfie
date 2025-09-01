import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSkeleton } from "./profile-skeleton";

export function GamesPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900/50 via-gray-900/50 to-gray-950" />

        {/* Profile Header Skeleton */}
        <div className="relative">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar */}
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
              
              {/* Profile Info */}
              <div className="flex-grow space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                
                {/* Stats */}
                <div className="flex gap-6">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="text-center space-y-1">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Skeleton */}
      <div className="bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center overflow-x-auto scrollbar-hide">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center flex-1 max-w-[120px] px-3 py-4">
                <Skeleton className="h-5 w-5 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Games Content Skeleton */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Page Title and Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Games Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(18).fill(0).map((_, i) => (
              <div key={i} className="group">
                <Skeleton className="aspect-[3/4] bg-gray-800/50 rounded-lg mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}