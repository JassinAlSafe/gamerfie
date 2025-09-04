"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Clock, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ForumCategory } from "@/types/forum";
import { formatDisplayDate } from "@/utils/date-formatting";
import Link from "next/link";

interface ForumCategoryCardProps {
  category: ForumCategory;
  showActivity?: boolean;
  className?: string;
}

export function ForumCategoryCard({ 
  category, 
  showActivity = true,
  className 
}: ForumCategoryCardProps) {
  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      yellow: "from-yellow-500 to-yellow-600", 
      red: "from-red-500 to-red-600",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
    };
    return colors[color as keyof typeof colors] || "from-slate-500 to-slate-600";
  };

  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <Link href={`/forum/category/${category.id}`} className="block group">
      <Card className={cn(
        "bg-gray-900/30 border-gray-700/30 hover:bg-gray-900/50 hover:border-gray-600/50 transition-all duration-200 cursor-pointer",
        className
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Category Icon */}
            <div className="flex-shrink-0 relative">
              <div className={cn(
                "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/50 dark:ring-slate-800/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                getCategoryColor(category.color || 'blue')
              )}>
                <span className="text-white">{category.icon}</span>
              </div>
              {/* Activity Indicator */}
              {showActivity && category.posts_count > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {category.name}
                  </CardTitle>
                  {category.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                
                {/* New Badge */}
                {category.threads_count === 0 && (
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 ml-2">
                    New
                  </Badge>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300 font-medium">
                    {category.threads_count}
                  </span>
                  <span className="text-gray-500 text-xs">threads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300 font-medium">
                    {category.posts_count}
                  </span>
                  <span className="text-gray-500 text-xs">posts</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Last Activity */}
        {showActivity && category.last_post_user && category.last_post_at && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm border-t border-gray-700/30 pt-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={category.last_post_user.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-purple-600 text-white">
                    {getAvatarFallback(category.last_post_user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-400 text-xs">
                  by{" "}
                  <span className="text-purple-400 font-medium">
                    {category.last_post_user.username}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {formatDisplayDate(category.last_post_at)}
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}