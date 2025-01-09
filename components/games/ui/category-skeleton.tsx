"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";

export const CategorySkeleton = memo(() => (
  <div className="mb-12">
    <div className="h-8 w-48 bg-gray-800/50 rounded mb-4" />
    <div className="flex gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] aspect-[3/4]">
          <Card className="w-full h-full animate-pulse bg-gray-800/50" />
        </div>
      ))}
    </div>
  </div>
));

CategorySkeleton.displayName = "CategorySkeleton";
