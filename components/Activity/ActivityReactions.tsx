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
import { ActivityReaction } from "@/types/activity";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ActivityReactionsProps {
  activity: FriendActivity;
}

const reactionEmojis = {
  "👍": "thumbs up",
  "❤️": "heart",
  "🎮": "gaming",
  "🏆": "trophy",
  "🎯": "bullseye",
};

export function ActivityReactions({ activity }: ActivityReactionsProps) {
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addReaction, removeReaction } = useFriendsStore();
  const [localReactions, setLocalReactions] = useState<ActivityReaction[]>(
    activity.reactions || []
  );

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Supabase session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
      });
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  // Update local reactions when activity reactions change
  useEffect(() => {
    console.log("Activity reactions updated:", {
      activityId: activity.id,
      reactionCount: activity.reactions?.length || 0,
      reactions: activity.reactions,
    });
    setLocalReactions(activity.reactions || []);
  }, [activity.reactions, activity.id]);

  const handleReaction = async (emoji: string) => {
    console.log("Handling reaction:", {
      emoji,
      userId,
      activityId: activity.id,
      currentReactions: localReactions.length,
    });

    if (!userId) {
      console.log("No user ID found, showing sign-in message");
      toast.error("Please sign in to react to activities");
      return;
    }

    if (isLoading) {
      console.log("Already processing a reaction, skipping");
      return;
    }

    try {
      setIsLoading(true);
      const userReaction = localReactions.find((r) => r.user_id === userId);
      const isChangingReaction = userReaction && userReaction.emoji !== emoji;

      console.log("Reaction state:", {
        userReaction,
        isChangingReaction,
      });

      if (userReaction) {
        // Remove existing reaction
        console.log("Removing existing reaction...");
        await removeReaction(activity.id, userReaction.emoji);
        setLocalReactions((prev) =>
          prev.filter((r) => !(r.user_id === userId))
        );

        // If changing to a different emoji, add the new reaction
        if (isChangingReaction) {
          console.log("Adding new reaction...");
          await addReaction(activity.id, emoji);
          toast.success("Reaction changed");
        } else {
          toast.success("Reaction removed");
        }
      } else {
        // Add new reaction
        console.log("Adding reaction...");
        await addReaction(activity.id, emoji);
        toast.success("Reaction added");
      }
    } catch (error: any) {
      console.error("Reaction error:", error);
      console.error("Error stack:", error.stack);
      toast.error("Failed to update reaction");
      // Refresh local state to match server state
      setLocalReactions(activity.reactions || []);
    } finally {
      setIsLoading(false);
    }
  };

  // Group and count valid reactions
  const reactionCounts = localReactions.reduce((acc, reaction) => {
    if (reaction && reaction.emoji) {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-purple-400 gap-2"
            disabled={isLoading}
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">React</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="flex flex-wrap gap-2">
            {Object.entries(reactionEmojis).map(([emoji, _label]) => {
              const userReaction = localReactions.find(
                (r) => r.user_id === userId
              );
              const isSelected = userReaction?.emoji === emoji;

              return (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className={cn(isSelected && "bg-purple-500/20")}
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {Object.keys(reactionCounts).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <Badge key={emoji} variant="secondary" className="gap-1">
              {emoji} {String(count)}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
