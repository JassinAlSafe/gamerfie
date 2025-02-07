"use client";

import { useEffect, useState, useCallback } from "react";
import { useGameListStore } from "@/stores/useGameListStore";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { useProfile } from "@/hooks/use-profile";
import { MessageCircle, Share2, Heart } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database, ListComment } from "@/types/supabase";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    username: string;
    avatar_url: string;
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
  // Correct hook usages
  const { currentList, isLoading, error, fetchListDetails } =
    useGameListStore();
  const { profile } = useProfile();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remove duplicate or stray useCallback definitions
  const fetchComments = useCallback(async () => {
    const supabase = createClientComponentClient<Database>();
    try {
      // First, get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("list_comments")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      // Then, fetch user profiles for those comments
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
    } catch (error) {
      console.error("Error fetching comments:", error);
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
    const supabase = createClientComponentClient();

    try {
      const { error } = await supabase.from("list_comments").insert({
        list_id: listId,
        content: newComment,
        user_id: profile.id,
      });

      if (error) throw error;

      setNewComment("");
      await fetchComments(); // Refresh comments after posting
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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

  return (
    <div className="space-y-8">
      {/* List Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentList.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Avatar
                src={currentList.user?.avatar_url}
                fallback={currentList.user?.username?.[0] || "U"}
              />
              <span className="text-sm text-gray-400">
                Created by {currentList.user?.username}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              Updated{" "}
              {formatDistanceToNow(new Date(currentList.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* List Description */}
      {currentList.description && !currentList.description.startsWith("[") && (
        <p className="text-gray-300">{currentList.description}</p>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentList.games.map((game) => (
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

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments
        </h2>

        {/* Comment Input */}
        {profile && (
          <div className="flex gap-4">
            <Avatar
              src={profile.avatar_url}
              fallback={profile.username?.[0] || "U"}
            />
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
        )}

        {/* Comments List */}
        <div className="space-y-4 mt-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar
                src={comment.user.avatar_url}
                fallback={comment.user.username[0]}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.username}</span>
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
      </div>
    </div>
  );
}
