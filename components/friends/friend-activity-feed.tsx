"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  PlayCircle,
  CheckCircle,
  MessageCircle,
  BookmarkPlus,
  Heart,
  MessageSquare,
  Share2,
  BarChart2,
  Filter,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { ActivityType, FriendActivity } from "@/types/friend";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";

const activityIcons: Record<ActivityType, React.ReactNode> = {
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
  want_to_play: <BookmarkPlus className="w-5 h-5 text-purple-400" />,
  progress: <BarChart2 className="w-5 h-5 text-blue-400" />,
};

const activityText: Record<ActivityType, string> = {
  started_playing: "started playing",
  completed: "completed",
  achievement: "unlocked an achievement in",
  review: "reviewed",
  want_to_play: "wants to play",
  progress: "made progress in",
};

interface GroupedActivities {
  date: string;
  activities: FriendActivity[];
}

type ActivityFilter = "all" | ActivityType;

const reactionEmojis = {
  "👍": "thumbs up",
  "❤️": "heart",
  "🎮": "gaming",
  "🏆": "trophy",
  "🎯": "bullseye",
  "🌟": "star",
};

export function FriendActivityFeed() {
  const session = useSession();
  const {
    activities,
    isLoadingActivities,
    fetchActivities,
    loadMoreActivities,
    addReaction,
    removeReaction,
    addComment,
    deleteComment,
  } = useFriendsStore();

  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [selectedActivity, setSelectedActivity] =
    useState<FriendActivity | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const groupActivitiesByDate = useCallback(
    (activities: FriendActivity[]): GroupedActivities[] => {
      const groups: { [key: string]: FriendActivity[] } = {};

      activities.forEach((activity) => {
        const date = new Date(activity.timestamp);
        let dateString = "";

        if (isToday(date)) {
          dateString = "Today";
        } else if (isYesterday(date)) {
          dateString = "Yesterday";
        } else {
          dateString = format(date, "MMMM d, yyyy");
        }

        if (!groups[dateString]) {
          groups[dateString] = [];
        }
        groups[dateString].push(activity);
      });

      return Object.entries(groups).map(([date, activities]) => ({
        date,
        activities,
      }));
    },
    []
  );

  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    return groupActivitiesByDate(filteredActivities);
  }, [filteredActivities, groupActivitiesByDate]);

  const handleReaction = async (activityId: string, emoji: string) => {
    if (!session) {
      toast.error("Please sign in to react to activities");
      return;
    }

    try {
      const activity = activities.find((a) => a.id === activityId);
      const hasReacted = activity?.reactions?.some(
        (r) => r.user_id === session.user.id && r.emoji === emoji
      );

      if (hasReacted) {
        await removeReaction(activityId, emoji);
        toast.success("Reaction removed");
      } else {
        await addReaction(activityId, emoji);
        toast.success("Reaction added");
      }
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  const handleComment = async () => {
    if (!session) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!selectedActivity || !commentContent.trim()) {
      return;
    }

    try {
      await addComment(selectedActivity.id, commentContent.trim());
      setCommentContent("");
      setIsCommentDialogOpen(false);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (isLoadingActivities && !activities.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Activity</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              {filter === "all"
                ? "All Activities"
                : activityText[filter as ActivityType]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All Activities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("started_playing")}>
              Started Playing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>
              Completed Games
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("achievement")}>
              Achievements
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("review")}>
              Reviews
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("want_to_play")}>
              Want to Play
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("progress")}>
              Progress Updates
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                    className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage
                        src={activity.user.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {activity.user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${activity.user.id}`}
                          className="font-medium hover:underline"
                        >
                          {activity.user.username}
                        </Link>
                        {activityIcons[activity.type]}
                        <span className="text-gray-400">
                          {activityText[activity.type]}
                        </span>
                        <Link
                          href={`/game/${activity.game.id}`}
                          className="font-medium text-purple-400 hover:underline truncate"
                        >
                          {activity.game.name}
                        </Link>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {format(new Date(activity.timestamp), "h:mm a")}
                        </Badge>
                      </div>

                      <div className="mt-2">
                        {activity.details &&
                          activity.type === "achievement" && (
                            <p className="text-sm">
                              🏆 Unlocked: {activity.details.name}
                            </p>
                          )}

                        {activity.details?.comment && (
                          <p className="text-sm text-gray-300">
                            &ldquo;{activity.details.comment}&rdquo;
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-700">
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
                            <PopoverContent
                              className="w-full p-2"
                              align="start"
                            >
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(reactionEmojis).map(
                                  ([emoji, label]) => (
                                    <Button
                                      key={emoji}
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "text-xl hover:bg-gray-800/30 h-8 px-2",
                                        activity.reactions?.some(
                                          (r) =>
                                            r.user_id === session?.user?.id &&
                                            r.emoji === emoji
                                        ) && "bg-purple-500/20"
                                      )}
                                      onClick={() =>
                                        handleReaction(activity.id, emoji)
                                      }
                                    >
                                      {emoji}
                                    </Button>
                                  )
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>

                          {activity.reactions &&
                            activity.reactions.length > 0 && (
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
                                    <span className="text-xs text-gray-400">
                                      {count}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-blue-400 gap-2"
                            onClick={() => {
                              setSelectedActivity(activity);
                              setIsCommentDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">Comment</span>
                          </Button>

                          {activity.comments &&
                            activity.comments.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {activity.comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="flex items-start gap-2 bg-gray-800/30 rounded p-2"
                                  >
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage
                                        src={
                                          comment.user.avatar_url || undefined
                                        }
                                      />
                                      <AvatarFallback>
                                        {comment.user.username[0].toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                          {comment.user.username}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-400">
                                            {format(
                                              new Date(comment.created_at),
                                              "MMM d, h:mm a"
                                            )}
                                          </span>
                                          {session?.user?.id ===
                                            comment.user_id && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() =>
                                                handleDeleteComment(comment.id)
                                              }
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-300">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-purple-400 gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            <span className="text-sm">Share</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {activity.game.cover_url && (
                      <Link
                        href={`/game/${activity.game.id}`}
                        className="block group relative flex-shrink-0 ml-4"
                      >
                        <div className="relative aspect-[3/4] w-[100px] rounded-lg overflow-hidden ring-1 ring-white/10">
                          <Image
                            src={activity.game.cover_url.replace(
                              "t_thumb",
                              "t_cover_big"
                            )}
                            alt={activity.game.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                            {activity.game.name}
                          </p>
                        </div>
                      </Link>
                    )}
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

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment..."
              className="bg-gray-800 border-gray-700 text-white"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentDialogOpen(false);
                setCommentContent("");
              }}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComment}
              disabled={!commentContent.trim()}
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
