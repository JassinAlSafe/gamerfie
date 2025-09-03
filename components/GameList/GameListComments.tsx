"use client";

import { memo } from "react";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GameListEmptyState } from "./GameListEmptyState";
import { formatListDate, getUserInitials } from "@/utils/game-list-details-utils";

import type { ListComment } from "@/types/game-list-details.types";

interface GameListCommentsProps {
  comments: ListComment[];
  newComment: string;
  isSubmitting: boolean;
  profile: any;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  onAuthPrompt: () => void;
}

const CommentInput = memo<{
  newComment: string;
  isSubmitting: boolean;
  profile: any;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
}>(function CommentInput({ newComment, isSubmitting, profile, onCommentChange, onCommentSubmit }) {
  return (
    <div className="flex gap-4 mb-8">
      <Avatar>
        <AvatarImage src={profile.avatar_url || ""} />
        <AvatarFallback>{getUserInitials(profile.username)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Input
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add a comment..."
          className="bg-white/5"
        />
        <Button
          onClick={onCommentSubmit}
          disabled={isSubmitting || !newComment.trim()}
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
});

const AuthPrompt = memo<{
  onAuthPrompt: () => void;
}>(function AuthPrompt({ onAuthPrompt }) {
  return (
    <div className="text-center p-4 bg-white/5 rounded-lg mb-8">
      <p className="text-gray-400">
        Please{" "}
        <button 
          onClick={onAuthPrompt}
          className="text-purple-400 hover:underline"
        >
          sign in
        </button>{" "}
        to leave a comment
      </p>
    </div>
  );
});

const CommentItem = memo<{ comment: ListComment }>(function CommentItem({ comment }) {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.user.avatar_url || ""} />
        <AvatarFallback>{getUserInitials(comment.user.username)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {comment.user.username}
          </span>
          <span className="text-sm text-gray-400">
            {formatListDate(comment.created_at)}
          </span>
        </div>
        <p className="mt-1 text-gray-300">{comment.content}</p>
      </div>
    </div>
  );
});

const CommentsList = memo<{
  comments: ListComment[];
}>(function CommentsList({ comments }) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
});

export const GameListComments = memo<GameListCommentsProps>(function GameListComments({
  comments,
  newComment,
  isSubmitting,
  profile,
  onCommentChange,
  onCommentSubmit,
  onAuthPrompt
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6" />
        Comments
        {comments.length > 0 && (
          <span className="text-lg text-gray-400">({comments.length})</span>
        )}
      </h2>

      {profile ? (
        <CommentInput
          newComment={newComment}
          isSubmitting={isSubmitting}
          profile={profile}
          onCommentChange={onCommentChange}
          onCommentSubmit={onCommentSubmit}
        />
      ) : (
        <AuthPrompt onAuthPrompt={onAuthPrompt} />
      )}

      <ScrollArea className="h-[400px] pr-4">
        {comments.length === 0 ? (
          <GameListEmptyState variant="comments" />
        ) : (
          <CommentsList comments={comments} />
        )}
      </ScrollArea>
    </div>
  );
});