import React from "react";
import {
  MoreHorizontal,
  Flag,
  ExternalLink,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <div>
          <Link
            href={`/profile/${user.id}`}
            className="font-medium text-white hover:text-slate-300 transition-colors text-sm"
          >
            {user.username}
          </Link>
          <div className="text-xs text-slate-400 mt-0.5">
            {format(new Date(createdAt), "MMM d, yyyy")}
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