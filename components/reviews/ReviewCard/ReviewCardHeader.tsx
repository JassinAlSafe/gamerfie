import React, { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Flag,
  ExternalLink,
  Share2,
  Clock,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReviewCardHeaderProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  createdAt: string;
}

export function ReviewCardHeader({ user, createdAt }: ReviewCardHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [daysSinceReview, setDaysSinceReview] = useState(0);
  const [isRecent, setIsRecent] = useState(false);
  
  const reviewDate = new Date(createdAt);
  
  useEffect(() => {
    setMounted(true);
    const days = differenceInDays(new Date(), reviewDate);
    setDaysSinceReview(days);
    setIsRecent(days <= 7);
  }, [reviewDate]);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 ring-1 ring-white/10">
          <AvatarImage
            src={user.avatar_url}
            className="object-cover"
          />
          <AvatarFallback className="bg-slate-800 text-white font-medium text-sm">
            {user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${user.id}`}
              className="font-medium text-white hover:text-slate-300 transition-colors text-sm"
            >
              {user.username}
            </Link>
            {mounted && isRecent && (
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2 py-0.5 h-5">
                <Clock className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {format(reviewDate, "MMM d, yyyy")}
            {mounted && isRecent && (
              <span className="text-emerald-400 ml-2">
                ({daysSinceReview === 0 ? 'Today' : `${daysSinceReview} day${daysSinceReview === 1 ? '' : 's'} ago`})
              </span>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Share2 className="w-4 h-4 mr-2" />
            Share Review
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Review
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-400">
            <Flag className="w-4 h-4 mr-2" />
            Report Review
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}