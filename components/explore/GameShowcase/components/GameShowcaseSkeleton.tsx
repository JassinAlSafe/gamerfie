import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const GameShowcaseSkeleton = memo(() => (
  <div className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 p-8 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full bg-white/5" />
          <Skeleton className="w-24 h-4 rounded-full bg-white/5" />
        </div>
        <Skeleton className="w-64 h-8 rounded-lg bg-white/5" />
        <Skeleton className="w-96 h-4 rounded-full bg-white/5" />
      </div>
      <Skeleton className="w-24 h-10 rounded-lg bg-white/5" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5"
        >
          <Skeleton className="absolute inset-0 bg-white/5" />
        </div>
      ))}
    </div>
  </div>
));

GameShowcaseSkeleton.displayName = "GameShowcaseSkeleton";
