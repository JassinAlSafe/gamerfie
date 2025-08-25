"use client";

import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FriendActivity } from "@/types/friend";
import { ActivityReaction } from "@/types/activity";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { createClient } from "@/utils/supabase/client";
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
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addReaction } = useFriendsStore();
  const [localReactions, setLocalReactions] = useState<ActivityReaction[]>(
    activity.reactions || []
  );

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  // Update local reactions when activity reactions change
  useEffect(() => {
    setLocalReactions(activity.reactions || []);
  }, [activity.reactions, activity.id]);

  const handleReaction = async (emoji: string) => {
    if (!userId) {
      toast.error("Please sign in to react to activities");
      return;
    }

    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      
      // The store now handles all reaction logic including duplicates and toggles
      await addReaction(activity.id, emoji);
      toast.success("Reaction updated");
    } catch {
      toast.error("Failed to update reaction");
      // Refresh local state to match server state
      setLocalReactions(activity.reactions || []);
    } finally {
      setIsLoading(false);
    }
  };

  // Group and count valid reactions
  const reactionCounts = localReactions.reduce((acc, reaction) => {
    // Handle both legacy emoji field and new reaction_type field
    const reactionKey = (reaction as any)?.emoji || reaction?.reaction_type;
    if (reaction && reactionKey) {
      acc[reactionKey] = (acc[reactionKey] || 0) + 1;
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
              const isSelected = (userReaction as any)?.emoji === emoji || userReaction?.reaction_type === emoji;

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
          {Object.entries(reactionCounts).map(([emoji, count]) => {
            const userHasReaction = localReactions.some(
              (r) => r.user_id === userId && ((r as any).emoji === emoji || r.reaction_type === emoji)
            );
            
            return (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(emoji)}
                disabled={isLoading}
                className={cn(
                  "h-6 px-2 gap-1 text-xs transition-all",
                  userHasReaction 
                    ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30" 
                    : "bg-gray-700/50 border border-gray-600/30 text-gray-300 hover:bg-gray-600/50"
                )}
              >
                {emoji} {String(count)}
              </Button>
            );
          })}
        </div>
      )}
    </>
  );
}
