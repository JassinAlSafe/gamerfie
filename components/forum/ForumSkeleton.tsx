import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ForumSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Skeleton className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Skeleton className="h-12 w-80" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Skeleton className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-xl rounded-lg" />
        </div>

        {/* Section Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Categories Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  {/* Category Icon Skeleton */}
                  <div className="flex-shrink-0 relative">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>

                  {/* Category Info Skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Skeleton className="h-6 w-48" />
                          {i === 1 && <Skeleton className="h-5 w-12 rounded-full" />}
                        </div>
                        <Skeleton className="h-4 w-80" />
                      </div>
                    </div>

                    {/* Stats Row Skeleton */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                        <Skeleton className="w-3 h-3" />
                        <Skeleton className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                        <Skeleton className="w-3 h-3" />
                        <Skeleton className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="w-3 h-3" />
                        <Skeleton className="w-8 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Last Activity Skeleton */}
              {i <= 3 && (
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3 h-3" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}