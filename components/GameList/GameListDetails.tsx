"use client";

import { useEffect, useState, useCallback } from "react";
import { useGameListStore } from "@/stores/useGameListStore";
import { AvatarImage, AvatarFallback, Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { useProfile } from "@/hooks/Profile/use-profile";
import { MessageCircle, Share2, Heart, Gamepad2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import type { GameList, GameListItem } from "@/types/gamelist/game-list";

interface ListComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Recently";
  }
}

export function GameListDetails({ listId }: { listId: string }) {
  const { toast } = useToast();
  const { openDialog, Dialog } = useAuthDialog();
  const { currentList, isLoading, error, fetchListDetails } =
    useGameListStore();
  const { profile } = useProfile();
  const [comments, setComments] = useState<ListComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("list_comments")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      if (commentsData) {
        const userIds = [
          ...new Set(commentsData.map((comment) => comment.user_id)),
        ];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);

        const profilesMap = new Map(
          profilesData?.map((profile) => [profile.id, profile]) || []
        );

        setComments(
          commentsData.map((comment) => {
            const profile = profilesMap.get(comment.user_id);
            return {
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              user_id: comment.user_id,
              user: {
                username: profile?.username || "Unknown User",
                avatar_url: profile?.avatar_url || null,
              },
            };
          })
        );
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    }
  }, [listId]);

  useEffect(() => {
    const loadData = async () => {
      await fetchListDetails(listId);
      await fetchComments();
    };
    loadData();
  }, [listId, fetchListDetails, fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !profile) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("list_comments").insert({
        list_id: listId,
        content: newComment,
        user_id: profile.id,
      });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    // TODO: Implement like functionality with Supabase
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: currentList?.title,
        text: currentList?.content || "",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "Share this list with your friends!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <ListDetailsSkeleton />
      </div>
    );
  }

  if (error || !currentList) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error || "List not found"}</p>
      </div>
    );
  }

  const list = currentList as GameList;

  return (
    <div className="space-y-8">
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {list.title}
            </h1>
            <div className="flex items-center gap-4">
              <Link href={`/profile/${list.user_id}`} className="group">
                <div className="flex items-center gap-2">
                  <Avatar className="group-hover:ring-2 ring-purple-500 transition-all">
                    <AvatarImage src={list.user?.avatar_url || ""} />
                    <AvatarFallback>
                      {list.user?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    Created by {list.user?.username}
                  </span>
                </div>
              </Link>
              <span className="text-sm text-gray-400">
                Updated {formatDate(list.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={cn(
                "transition-all",
                isLiked && "bg-purple-500 text-white hover:bg-purple-600"
              )}
            >
              <Heart
                className={cn("w-4 h-4 mr-2", isLiked && "fill-current")}
              />
              {likeCount > 0 && <span>{likeCount}</span>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {list.content && !list.content.startsWith("[") && (
          <p className="text-gray-300 mt-4 text-lg">{list.content}</p>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-bold mb-4">Games in this list</h2>
        {list.games.length === 0 ? (
          <EmptyGamesState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.games.map((game: GameListItem) => (
              <div
                key={game.id}
                className="bg-white/5 rounded-lg overflow-hidden group"
              >
                <div className="relative aspect-[3/4]">
                  {game.cover_url ? (
                    <Image
                      src={getCoverImageUrl(game.cover_url)}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                      <span className="text-xs text-white/40">No Cover</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white line-clamp-2">
                    {game.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Added {formatDate(game.added_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5" />
          Comments
          {comments.length > 0 && (
            <span className="text-sm text-gray-400">({comments.length})</span>
          )}
        </h2>

        {profile ? (
          <div className="flex gap-4 mb-8">
            <Avatar>
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback>{profile.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-white/5"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-white/5 rounded-lg mb-8">
            <p className="text-gray-400">
              Please{" "}
              <button 
                onClick={() => openDialog({
                  defaultTab: "signin",
                  actionContext: "to leave a comment"
                })}
                className="text-purple-400 hover:underline"
              >
                sign in
              </button>{" "}
              to leave a comment
            </p>
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {comments.length === 0 ? (
            <EmptyCommentsState />
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar_url || ""} />
                    <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.user.username}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function ListDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function EmptyGamesState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-3 rounded-full bg-white/5 mb-4">
        <Gamepad2 className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No games yet</h3>
      <p className="text-gray-400 text-sm">
        This list is empty. Games added to this list will appear here.
      </p>
    </div>
  );
}

function EmptyCommentsState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-3 rounded-full bg-white/5 mb-4">
        <MessageCircle className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
      <p className="text-gray-400 text-sm">
        Be the first to share your thoughts about this list!
      </p>
    
      {/* Authentication Dialog */}
      <Dialog />
    </div>
  );
}
