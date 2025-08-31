import { Skeleton } from "@/components/ui/skeleton";

export function NewsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <Skeleton className="h-3 w-20 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>

          {/* Article Content */}
          <article className="prose prose-invert max-w-none">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  {i % 3 === 0 && <div className="my-4"><Skeleton className="h-px w-full" /></div>}
                </div>
              ))}
            </div>
          </article>

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Skeleton className="h-6 w-32 mb-6" />
            
            {/* Comment Form */}
            <div className="bg-gray-900/30 rounded-lg p-4 mb-6">
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-9 w-20" />
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}