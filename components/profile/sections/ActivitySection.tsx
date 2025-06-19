import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { FriendActivity } from "@/types/activity";
import { isValidActivity } from "@/utils/profile-validation";

interface ActivitySectionProps {
  activities: FriendActivity[];
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({ activities }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-purple-400" />
          Recent Activity
        </CardTitle>
        <Link
          href="/activity"
          className="text-sm text-purple-400 hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
                isValidActivity(activity) && (
                  <div
                    key={activity.id}
                    className="border-b border-gray-800 pb-3 last:border-0 group hover:bg-gray-800/20 rounded-lg p-2 -m-2 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-purple-500/30 transition-all">
                        {activity.game && activity.game.cover_url ? (
                          <Image
                            src={activity.game.cover_url}
                            alt={activity.game.name || "Game"}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
                            {activity.game && activity.game.name
                              ? activity.game.name.charAt(0).toUpperCase()
                              : "G"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white group-hover:text-purple-200 transition-colors">
                          <span className="font-medium group-hover:text-purple-300">
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
                        <p className="text-xs text-gray-400">
                          {activity.created_at
                            ? new Date(activity.created_at).toLocaleDateString()
                            : activity.timestamp
                            ? new Date(activity.timestamp).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  </div>
                )
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <Gamepad2 className="h-16 w-16 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No recent activity</p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Start playing games, writing reviews, or completing challenges to see your activity here!
              </p>
            </div>
            <Link href="/games">
              <Button
                variant="outline"
                size="sm"
                className="bg-purple-900/30 text-purple-400 border-purple-800 hover:bg-purple-900/50 transition-all hover:scale-105"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Browse Games
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};