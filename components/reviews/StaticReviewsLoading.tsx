import { ReviewSkeletons } from "@/components/reviews/ReviewCard/ReviewCardSkeleton";
import { BookOpen } from "lucide-react";

export function StaticReviewsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header skeleton - no animations for SSR compatibility */}
          <div className="text-center mb-16 relative">
            <div className="relative inline-block mb-8">
              <div className="bg-gray-800/50 rounded-full p-6 w-24 h-24 mx-auto animate-pulse flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-purple-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Game Reviews
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Loading community reviews...
              </p>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 border border-gray-800/50 rounded-2xl p-6 space-y-4"
                >
                  <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-700/40 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-700/30 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
          </div>

          {/* Filters skeleton */}
          <div className="mb-8">
            <div className="bg-gray-800/30 border border-gray-800/50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="h-12 bg-gray-700/30 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700/30 rounded w-40 animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews skeleton */}
          <ReviewSkeletons count={5} showGameInfo={true} />
        </div>
      </div>
    </div>
  );
}