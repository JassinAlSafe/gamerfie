import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Users, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import type { FriendActivity } from "@/types/activity";
import { isValidActivity } from "@/utils/profile-validation";
import { formatDisplayDate } from "@/utils/date-formatting";
import { cn } from "@/lib/utils";

interface ActivitySectionProps {
  activities: FriendActivity[];
  isLoading?: boolean;
  error?: Error | null;
}

export const ActivitySection = memo<ActivitySectionProps>(({ activities, isLoading = false, error = null }) => {
  const hasActivities = activities && activities.length > 0;
  const displayActivities = activities.slice(0, 3);

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Recent Activity</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasActivities ? `${activities.length} recent updates` : 'Your social feed'}
              </p>
            </div>
          </div>
          
          {/* Action button */}
          <Link href="/activity">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "profile-nav-item touch-feedback",
                "text-gray-400 hover:text-white hover:bg-white/10",
                "transition-all duration-200 rounded-lg group/btn"
              )}
            >
              {hasActivities ? (
                <>
                  View All
                  <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  Explore
                  <Users className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </Link>
        </div>
        {/* Content */}
        {isLoading ? (
          /* Loading state */
          <div className="space-y-3">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Failed to Load Activities
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Unable to fetch recent activities. Please try refreshing the page.
              </p>
            </div>
          </div>
        ) : hasActivities ? (
          <div className="space-y-3">
            {displayActivities.map((activity, index) => (
              isValidActivity(activity) && (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-xl",
                    "hover:bg-white/5 transition-all duration-200 group/activity"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Game Cover */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-gray-700/50 group-hover/activity:ring-green-400/50 transition-all duration-200">
                      {activity.game && activity.game.cover_url ? (
                        <Image
                          src={activity.game.cover_url}
                          alt={activity.game.name || "Game"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover group-hover/activity:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white font-medium">
                          {activity.game && activity.game.name
                            ? activity.game.name.charAt(0).toUpperCase()
                            : "G"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-relaxed group-hover/activity:text-green-100 transition-colors">
                      <span className="font-medium text-green-300 group-hover/activity:text-green-200 transition-colors">
                        {activity.user ? activity.user.username : "User"}
                      </span>{" "}
                      {activity.type === "started_playing" && "started playing"}
                      {activity.type === "completed" && "completed"}
                      {activity.type === "review" && "reviewed"}
                      {activity.type === "progress" && "made progress in"}
                      {activity.type === "achievement" && "unlocked an achievement in"}{" "}
                      <span className="font-medium">
                        {activity.game ? activity.game.name : "a game"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.created_at
                        ? formatDisplayDate(activity.created_at)
                        : activity.timestamp
                        ? formatDisplayDate(activity.timestamp)
                        : "Recently"}
                    </p>
                  </div>
                </div>
              )
            ))}

            {/* Show remaining activities count */}
            {activities.length > 3 && (
              <div className="pt-2 border-t border-gray-700/30">
                <Link href="/activity">
                  <div className="text-center py-2 text-xs text-gray-400 hover:text-gray-300 cursor-pointer transition-colors">
                    +{activities.length - 3} more activit{activities.length - 3 !== 1 ? 'ies' : 'y'}
                  </div>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Connect with Friends
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Follow friends to see their gaming activity and achievements here.
              </p>
            </div>
            
            {/* Call-to-action */}
            <div className="pt-2">
              <Link href="/friends">
                <div className="inline-flex items-center text-xs text-green-400 hover:text-green-300 cursor-pointer transition-colors">
                  <Users className="h-3 w-3 mr-1" />
                  Find friends
                </div>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ActivitySection.displayName = 'ActivitySection';