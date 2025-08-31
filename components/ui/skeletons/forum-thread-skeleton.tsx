import { Skeleton } from "@/components/ui/skeleton";

export function ForumThreadSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Thread Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Skeleton className="h-4 w-16" />
            <span className="text-gray-600">›</span>
            <Skeleton className="h-4 w-24" />
            <span className="text-gray-600">›</span>
            <Skeleton className="h-4 w-32" />
          </div>
          
          <Skeleton className="h-10 w-3/4 mb-4" />
          
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Original Post */}
            <div className="bg-gray-900/30 rounded-lg border border-gray-800">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" style={{width: `${90 - i * 10}%`}} />
                  ))}
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-900/30 rounded-lg border border-gray-800/50">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-14" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <div className="bg-gray-900/30 rounded-lg border border-gray-800 p-6">
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thread Stats */}
            <div className="bg-gray-900/30 rounded-lg p-4">
              <Skeleton className="h-5 w-1/2 mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between mb-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>

            {/* Related Threads */}
            <div className="bg-gray-900/30 rounded-lg p-4">
              <Skeleton className="h-5 w-1/2 mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}