"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FriendAvatarProps {
  friend: {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    online_status?: "online" | "offline" | "gaming";
    currentGame?: string;
  };
  onViewProfile: (id: string) => void;
  index?: number;
  showGameStatus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FriendAvatar = memo<FriendAvatarProps>(function FriendAvatar({
  friend,
  onViewProfile,
  index = 0,
  showGameStatus = false,
  size = "md",
  className
}) {
  const sizeConfig = {
    sm: {
      avatar: "w-12 h-12",
      badge: "w-4 h-4 -bottom-0.5 -right-0.5",
      gamepadSize: "w-2 h-2",
      pulseSize: "w-1.5 h-1.5",
      textSize: "text-xs max-w-[60px]"
    },
    md: {
      avatar: "w-16 h-16", 
      badge: "w-6 h-6 -bottom-1 -right-1",
      gamepadSize: "w-3 h-3",
      pulseSize: "w-2 h-2",
      textSize: "text-xs max-w-[80px]"
    },
    lg: {
      avatar: "w-20 h-20",
      badge: "w-7 h-7 -bottom-1 -right-1", 
      gamepadSize: "w-4 h-4",
      pulseSize: "w-2.5 h-2.5",
      textSize: "text-sm max-w-[100px]"
    }
  };

  const config = sizeConfig[size];

  const getStatusColor = () => {
    if (friend.currentGame || friend.online_status === "gaming") return "ring-blue-500";
    if (friend.online_status === "online") return "ring-green-500";
    return "ring-gray-600";
  };

  const getStatusBadge = () => {
    if (friend.currentGame || friend.online_status === "gaming") {
      return (
        <div className={cn(
          "absolute bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center",
          config.badge
        )}>
          <Gamepad2 className={cn("text-white", config.gamepadSize)} />
        </div>
      );
    }
    
    if (friend.online_status === "online") {
      return (
        <div className={cn(
          "absolute bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center",
          config.badge
        )}>
          <div className={cn("bg-white rounded-full animate-pulse", config.pulseSize)} />
        </div>
      );
    }
    
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn("group cursor-pointer", className)}
      onClick={() => onViewProfile(friend.id)}
    >
      <div className={cn(
        "relative p-1 rounded-full transition-all duration-300 ring-2 group-hover:ring-purple-400",
        getStatusColor()
      )}>
        <Avatar className={cn("transition-transform duration-300 group-hover:scale-105", config.avatar)}>
          <AvatarImage src={friend.avatar_url || undefined} alt={friend.username} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-semibold">
            {friend.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {getStatusBadge()}
      </div>
      
      <div className="mt-2 text-center">
        <p className={cn(
          "text-gray-400 group-hover:text-white transition-colors truncate",
          config.textSize
        )}>
          {friend.display_name?.split(' ')[0] || friend.username}
        </p>
        {showGameStatus && friend.currentGame && (
          <p className={cn("text-blue-400 truncate", config.textSize)}>
            Playing
          </p>
        )}
      </div>
    </motion.div>
  );
});