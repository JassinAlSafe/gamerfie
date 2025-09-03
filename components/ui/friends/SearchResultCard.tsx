"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchResultCardProps {
  user: {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  };
  onSendRequest?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onMessage?: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
  variant?: "default" | "compact";
}

export const SearchResultCard = memo<SearchResultCardProps>(function SearchResultCard({
  user,
  onSendRequest,
  onViewProfile,
  onMessage,
  className,
  size = "md",
  variant = "default"
}) {
  const sizeConfig = {
    sm: {
      avatar: "w-8 h-8",
      padding: "p-2",
      buttonSize: "h-6 w-6 p-0",
      textSize: "text-xs",
      nameSize: "text-sm"
    },
    md: {
      avatar: "w-10 h-10", 
      padding: "p-3",
      buttonSize: "h-8 w-8 p-0",
      textSize: "text-xs",
      nameSize: "font-medium"
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn(
      "flex items-center justify-between bg-gray-900/30 rounded-lg border border-gray-700/30 hover:border-gray-600/40 transition-all duration-200",
      config.padding,
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar 
          className={cn("cursor-pointer", config.avatar)}
          onClick={() => onViewProfile?.(user.id)}
        >
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
            {user.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p 
            className={cn("text-white truncate cursor-pointer hover:text-purple-300 transition-colors", config.nameSize)}
            onClick={() => onViewProfile?.(user.id)}
          >
            {user.display_name || user.username}
          </p>
          {user.bio && variant !== "compact" && (
            <p className={cn("text-gray-400 truncate", config.textSize)}>
              {user.bio}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 flex-shrink-0">
        {variant === "default" && onMessage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMessage(user.id)}
            className={cn(
              "text-gray-400 hover:text-white hover:bg-white/10",
              config.buttonSize
            )}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}
        
        {variant === "default" && onViewProfile && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewProfile(user.id)}
            className={cn(
              "text-gray-400 hover:text-white hover:bg-white/10",
              config.buttonSize
            )}
          >
            <Users className="w-4 h-4" />
          </Button>
        )}
        
        {onSendRequest && (
          <Button
            size="sm"
            onClick={() => onSendRequest(user.id)}
            className={cn(
              "bg-purple-600 hover:bg-purple-700",
              config.buttonSize
            )}
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
});