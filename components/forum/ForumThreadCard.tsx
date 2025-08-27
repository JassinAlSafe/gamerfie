"use client";

import { ForumThread } from "@/types/forum";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, ThumbsUp, Pin, Lock, Clock, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ForumThreadCardProps {
  thread: ForumThread;
  showTimeline?: boolean;
  isLast?: boolean;
  className?: string;
}

export function ForumThreadCard({ 
  thread, 
  showTimeline = false, 
  isLast = false,
  className 
}: ForumThreadCardProps) {
  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Link href={`/forum/thread/${thread.id}`} className="block group">
      <Card className={cn(
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 cursor-pointer",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Author Avatar with Timeline */}
            <div className="flex flex-col items-center">
              <Avatar className="w-12 h-12 ring-2 ring-slate-200/50 dark:ring-slate-700/50 transition-all duration-200 group-hover:ring-purple-200 dark:group-hover:ring-purple-800">
                <AvatarImage src={thread.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                  {getAvatarFallback(thread.author?.username)}
                </AvatarFallback>
              </Avatar>
              {showTimeline && !isLast && (
                <div className="w-0.5 h-4 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600 mt-2" />
              )}
            </div>

            {/* Thread Content */}
            <div className="flex-1 min-w-0">
              {/* Thread Status & Title */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {thread.is_pinned && (
                      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    {thread.is_locked && (
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight mb-2 line-clamp-2">
                    {thread.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {thread.content}
                  </p>
                </div>
              </div>

              {/* Thread Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.replies_count}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.views_count}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                    <ThumbsUp className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.likes_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">{thread.author?.username}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(thread.created_at)}
                  </span>
                  {thread.last_post_at && thread.last_post_at !== thread.created_at && (
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>Reply {formatTimeAgo(thread.last_post_at)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}