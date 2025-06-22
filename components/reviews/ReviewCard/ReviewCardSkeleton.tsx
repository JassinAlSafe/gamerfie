import React from "react";
import { AnimatedCard } from "@/components/ui/animated-card";

interface ReviewCardSkeletonProps {
  showGameInfo?: boolean;
  className?: string;
}

export function ReviewCardSkeleton({ 
  showGameInfo = true, 
  className 
}: ReviewCardSkeletonProps) {
  return (
    <AnimatedCard
      className={`group relative overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/90 via-gray-900/50 to-gray-800/30 ${className}`}
    >
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Game Cover Skeleton */}
          {showGameInfo && (
            <div className="lg:w-64 flex-shrink-0 relative">
              <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
                <div className="w-full h-full bg-gray-700/50"></div>
                
                {/* Rating badge skeleton */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gray-700/50 rounded-full w-16 h-8 animate-pulse"></div>
                </div>

                {/* Title overlay skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="h-6 bg-gray-600/50 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-600/30 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Content Skeleton */}
          <div className="flex-1 p-6 lg:p-8 space-y-6">
            {/* Header skeleton */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700/50 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-600/50 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-600/30 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              
              {/* Rating skeleton (when no game cover) */}
              {!showGameInfo && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div 
                      key={star}
                      className="w-5 h-5 bg-gray-600/30 rounded animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Game title skeleton (when showing game info) */}
            {showGameInfo && (
              <div className="space-y-2">
                <div className="h-8 bg-gray-600/50 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-600/30 rounded w-1/2 animate-pulse"></div>
              </div>
            )}

            {/* Review content skeleton */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-700/20 rounded-2xl p-6 border border-gray-700/30 relative overflow-hidden">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-600/40 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-600/40 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-600/40 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-600/40 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Bottom section skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-3">
                {/* Genre badges skeleton */}
                {[1, 2, 3].map((badge) => (
                  <div 
                    key={badge}
                    className="h-6 bg-gray-600/30 rounded w-16 animate-pulse"
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {/* Action buttons skeleton */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((button) => (
                    <div 
                      key={button}
                      className="w-8 h-8 bg-gray-600/30 rounded animate-pulse"
                    />
                  ))}
                </div>
                <div className="w-1 h-6 bg-gray-800/50"></div>
                <div className="h-5 bg-gray-600/30 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

// Multiple skeleton cards for loading states
interface ReviewSkeletonsProps {
  count?: number;
  showGameInfo?: boolean;
  className?: string;
}

export function ReviewSkeletons({ 
  count = 3, 
  showGameInfo = true, 
  className 
}: ReviewSkeletonsProps) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }, (_, index) => (
        <ReviewCardSkeleton 
          key={index} 
          showGameInfo={showGameInfo} 
          className={className}
        />
      ))}
    </div>
  );
}