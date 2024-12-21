"use client";

import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FriendActivity } from "@/types/friend";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ActivityReactionsProps {
  activity: FriendActivity;
}

const reactionEmojis = {
  "👍": "thumbs up",
  "❤️": "heart",
  "🎮": "gaming",
  "🏆": "trophy",
  "🎯": "bullseye",
  "🌟": "star",
};

export function ActivityReactions({ activity }: ActivityReactionsProps) {
  const { data: session } = useSession();
  const { addReaction, removeReaction } = useFriendsStore();

  const handleReaction = async (emoji: string) => {
    if (!session) {
      toast.error("Please sign in to react to activities");
      return;
    }

    try {
      const hasReacted = activity.reactions?.some(
        (r) => r.user_id === session.user.id && r.emoji === emoji
      );

      if (hasReacted) {
        await removeReaction(activity.id, emoji);
        toast.success("Reaction removed");
      } else {
        await addReaction(activity.id, emoji);
        toast.success("Reaction added");
      }
    } catch (error) {
      console.error("Reaction error:", error);
      toast.error("Failed to update reaction");
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-purple-400 gap-2"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">React</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="flex flex-wrap gap-2">
            {Object.entries(reactionEmojis).map(([emoji, label]) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xl hover:bg-gray-800/30 h-8 px-2",
                  activity.reactions?.some(
                    (r) => r.user_id === session?.user?.id && r.emoji === emoji
                  ) && "bg-purple-500/20"
                )}
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {activity.reactions && activity.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(
            activity.reactions.reduce(
              (acc, r) => ({
                ...acc,
                [r.emoji]: (acc[r.emoji] || 0) + 1,
              }),
              {} as Record<string, number>
            )
          ).map(([emoji, count]) => (
            <Badge
              key={emoji}
              variant="secondary"
              className="text-sm bg-gray-800/50 gap-1"
            >
              <span>{emoji}</span>
              <span className="text-xs text-gray-400">{count}</span>
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
