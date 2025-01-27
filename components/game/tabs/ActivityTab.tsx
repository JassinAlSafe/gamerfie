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
          <Activity className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 text-center mb-2">No activity yet</p>
          <p className="text-sm text-gray-500 text-center">
            Activities will appear here when you or others interact with this
            game
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
