
import { Card, CardContent } from "@/components/ui/card";

const GAMES_PER_PAGE = 12;

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-[180px] h-10 bg-muted animate-pulse rounded-md" />
          <div className="w-[120px] h-10 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(GAMES_PER_PAGE)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}