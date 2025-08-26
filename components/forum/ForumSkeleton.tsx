import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ForumSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Categories Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-3 mt-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}