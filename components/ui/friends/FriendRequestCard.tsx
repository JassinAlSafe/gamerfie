"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FriendRequestCardProps {
  request: {
    id: string;
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  };
  type: 'received' | 'sent';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export const FriendRequestCard = memo<FriendRequestCardProps>(function FriendRequestCard({
  request,
  type,
  onAccept,
  onDecline,
  onCancel,
  className,
  size = "md"
}) {
  const sizeConfig = {
    sm: {
      avatar: "w-8 h-8",
      padding: "p-2",
      buttonSize: "h-6 w-6",
      textSize: "text-xs",
      nameSize: "text-sm"
    },
    md: {
      avatar: "w-10 h-10", 
      padding: "p-3",
      buttonSize: "h-8 w-8",
      textSize: "text-xs",
      nameSize: "font-medium"
    }
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center justify-between bg-gray-900/30 rounded-lg border border-gray-700/30 hover:border-gray-600/40 transition-all duration-200",
        config.padding,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className={config.avatar}>
          <AvatarImage src={request.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
            {request.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className={cn("text-white truncate", config.nameSize)}>
            {request.display_name || request.username}
          </p>
          <p className={cn("text-gray-400", config.textSize)}>
            {type === 'received' ? 'Wants to be friends' : 'Request pending'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 flex-shrink-0">
        {type === 'received' ? (
          <>
            <Button
              size="sm"
              onClick={() => onAccept?.(request.id)}
              className={cn(
                "p-0 bg-green-600 hover:bg-green-700",
                config.buttonSize
              )}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline?.(request.id)}
              className={cn(
                "p-0 border-gray-600 hover:bg-red-500/20",
                config.buttonSize
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel?.(request.id)}
            className="h-8 px-3 border-gray-600 hover:bg-red-500/20 text-xs"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
});