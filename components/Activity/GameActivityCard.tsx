"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Activity } from "lucide-react";
import type { GameActivity } from "@/types/activity";
import type {
  FriendActivity,
  ActivityType as FriendActivityType,
} from "@/types/friend";
import { ActivityReactions } from "./ActivityReactions";
import { ActivityComments } from "./ActivityComments";
import { ActivityShare } from "./ActivityShare";
import {
  formatPlaytime,
  formatStatus,
  formatTimestamp,
} from "@/lib/formatters";

interface GameActivityCardProps {
  activity: GameActivity;
  gameId: string;
}

export function GameActivityCard({ activity, gameId }: GameActivityCardProps) {
  const username = activity.user.username;
  const avatarUrl = activity.user.avatar_url;
  const userInitial = username[0].toUpperCase();

  // Map game activity type to friend activity type
  const mapActivityType = (type: GameActivity["type"]): FriendActivityType => {
    switch (type) {
      case "achievement_unlocked":
        return "achievement";
      case "game_completed":
        return "completed";
      case "review_added":
        return "review";
      case "game_status_updated":
        return activity.metadata.status === "want_to_play"
          ? "want_to_play"
          : "started_playing";
      default:
        return "started_playing";
    }
  };

  // Map game activity metadata to friend activity details
  const mapActivityDetails = (
    type: GameActivity["type"],
    metadata: GameActivity["metadata"]
  ) => {
    switch (type) {
      case "achievement_unlocked":
        return {
          name: metadata.achievement?.name,
        };
      case "review_added":
        return {
          comment: metadata.review,
        };
      case "game_status_updated":
        return {
          name: metadata.status,
        };
      default:
        return {};
    }
  };

  // Convert GameActivity to FriendActivity format for reactions/comments/share
  const friendActivityFormat: FriendActivity = {
    id: activity.id,
    user_id: activity.user.id,
    game_id: gameId,
    type: mapActivityType(activity.type),
    details: mapActivityDetails(activity.type, activity.metadata),
    created_at: activity.created_at,
    timestamp: activity.created_at,
    user: {
      id: activity.user.id,
      username: activity.user.username,
      avatar_url: activity.user.avatar_url || null,
    },
    game: {
      id: gameId,
      name: "", // We don't have the game name in the activity
      cover_url: null,
    },
  };

  const renderActivityContent = () => {
    switch (activity.type) {
      case "achievement_unlocked":
        return (
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">
              Unlocked achievement:{" "}
              <span className="text-white font-medium">
                {activity.metadata.achievement?.name}
              </span>
            </span>
          </div>
        );

      case "game_completed":
        return (
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">
              Completed the game in{" "}
              <span className="text-white font-medium">
                {formatPlaytime(activity.metadata.playtime || 0)}
              </span>
            </span>
          </div>
        );

      case "review_added":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">
                Rated {activity.metadata.rating}/10
              </span>
            </div>
            {activity.metadata.review && (
              <p className="text-gray-300 mt-2">{activity.metadata.review}</p>
            )}
          </div>
        );

      case "game_status_updated":
        return (
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">
              Status updated to{" "}
              <span className="text-white font-medium">
                {formatStatus(activity.metadata.status || "")}
              </span>
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <Link href={`/profile/${activity.user.id}`}>
          <Avatar>
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Link>

        {/* Activity Content */}
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/profile/${activity.user.id}`}
              className="hover:underline"
            >
              <span className="font-medium text-white">{username}</span>
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-400">
              {formatTimestamp(activity.created_at)}
            </span>
          </div>

          {renderActivityContent()}
        </div>
      </div>

      {/* Activity Actions */}
      <div className="mt-4 flex items-center gap-4">
        <ActivityReactions activity={friendActivityFormat} />
        <ActivityComments activity={friendActivityFormat} />
        <ActivityShare activity={friendActivityFormat} />
      </div>
    </div>
  );
}
