"use client";

import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { ActivityType, FriendActivity } from "@/types/friend";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/Activity/ActivityCard";
import { motion } from "framer-motion";

const groupActivitiesByDate = (activities: FriendActivity[]) => {
  return activities.reduce(
    (groups: Record<string, FriendActivity[]>, activity) => {
      let dateToUse: Date;
      try {
        dateToUse = new Date(activity.created_at);
        if (isNaN(dateToUse.getTime())) {
          console.warn("Invalid created_at date for activity:", activity);
          dateToUse = new Date();
        }
      } catch (error) {
        console.warn("Error parsing date for activity:", activity);
        dateToUse = new Date();
      }

      const date = format(dateToUse, "MMMM d, yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    },
    {}
  );
};

export function FriendActivityFeed() {
  const {
    activities,
    isLoadingActivities,
    loadMoreActivities,
    fetchActivities,
    error,
  } = useFriendsStore();
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  useEffect(() => {
    console.log("Fetching activities...");
    fetchActivities().catch((err) => {
      console.error("Error fetching activities:", err);
    });
  }, [fetchActivities]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchActivities().catch((err) => {
            console.error("Error refetching activities:", err);
          });
        }
      }, 30000); // Poll every 30 seconds
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchActivities().catch((err) => {
          console.error("Error refetching activities:", err);
        });
        startPolling();
      } else {
        clearInterval(interval);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchActivities]);

  useEffect(() => {
    console.log("Activities:", activities);
    console.log("Loading:", isLoadingActivities);
    console.log("Error:", error);
  }, [activities, isLoadingActivities, error]);

  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    const filtered = activities.filter((activity) => activity.type === filter);
    console.log("Filtered activities:", filtered);
    return filtered;
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    const grouped = Object.entries(
      groupActivitiesByDate(filteredActivities)
    ).map(([date, activities]) => ({
      date,
      activities,
    }));
    console.log("Grouped activities:", grouped);
    return grouped;
  }, [filteredActivities]);

  // Show loading state when initially loading activities
  if (isLoadingActivities && !activities.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Error loading activities: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "started_playing" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("started_playing")}
        >
          Started Playing
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "achievement" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("achievement")}
        >
          Achievements
        </Button>
        <Button
          variant={filter === "review" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("review")}
        >
          Reviews
        </Button>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {isLoadingActivities ? (
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <p>
              No activities to show{filter !== "all" ? " for this filter" : ""}.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedActivities.map(({ date, activities }) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-gray-400">{date}</h3>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ActivityCard activity={activity} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredActivities.length > 0 && !isLoadingActivities && (
        <div className="text-center">
          <Button
            onClick={() => loadMoreActivities()}
            variant="outline"
            disabled={isLoadingActivities}
          >
            {isLoadingActivities ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
