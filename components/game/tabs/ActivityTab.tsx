"use client";

import React from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { GameActivityCard } from "@/components/Activity/GameActivityCard";
import type { GameActivity } from "@/types/activity";

interface ActivityTabProps {
  gameId: string;
  activities: {
    data: GameActivity[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };
}

export function ActivityTab({ gameId, activities }: ActivityTabProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  if (activities.loading && !activities.data.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (!activities.data.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
          <p className="text-gray-400 text-center max-w-md">
            Activities will appear here when you or others interact with this game.
            This includes reviews, completions, progress updates, and social activities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.data.map((activity) => (
        <GameActivityCard
          key={activity.id}
          activity={activity}
          gameId={gameId}
        />
      ))}

      {activities.hasMore && (
        <div className="text-center">
          <Button
            onClick={activities.loadMore}
            variant="outline"
            disabled={activities.loading}
            className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
          >
            {activities.loading ? <LoadingSpinner size="sm" /> : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
