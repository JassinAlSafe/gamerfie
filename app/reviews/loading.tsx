import { BookOpen } from "lucide-react";

export default function ReviewsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header skeleton */}
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
                  className="h-full relative group rounded-2xl border border-gray-800/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-md"
                >
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-700/40 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-700/30 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Filters skeleton */}
          <div className="mb-8">
            <div className="p-6 border border-gray-800/50 relative group rounded-xl bg-gray-900/60 backdrop-blur-sm">
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

          {/* Reviews skeleton - inline version for server component */}
          <div className="space-y-8">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="group relative overflow-hidden border border-gray-800/50 bg-gradient-to-br from-gray-900/90 via-gray-900/50 to-gray-800/30 rounded-xl"
              >
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row">
                    {/* Game Cover Skeleton */}
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
                      </div>

                      {/* Game title skeleton */}
                      <div className="space-y-2">
                        <div className="h-8 bg-gray-600/50 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-600/30 rounded w-1/2 animate-pulse"></div>
                      </div>

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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}