"use client";

import { Block } from "../../Block";
import { TextBlock } from "../../Text/TextBlock";
import { Friend } from "@/types/friend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface RecentFriendsBlockProps {
  friends?: Friend[];
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
}

export function RecentFriendsBlock({
  friends = [],
  className,
  size = "sm",
}: RecentFriendsBlockProps) {
  if (friends.length === 0) {
    return (
      <Block
        size={size}
        className={cn("h-[180px]", className)}
        variant="premium"
        hover={true}
      >
        <div className="flex h-full items-center justify-center p-4">
          <TextBlock
            text="Add Friends!"
            variant="ghost"
            asciiFontSize={6}
            textFontSize={48}
            enableWaves={true}
          />
        </div>
      </Block>
    );
  }

  return (
    <Block
      size={size}
      className={cn("h-[180px]", className)}
      variant="premium"
      hover={true}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-purple-200/10">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Recent Friends
            </h3>
          </div>
          <span className="text-sm px-2 py-1 rounded-md bg-purple-500/10 text-purple-500 font-medium">
            {friends.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/10 scrollbar-track-transparent">
          <div className="grid gap-1 p-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/5 transition-colors"
              >
                <Avatar className="h-8 w-8 ring-2 ring-purple-500/20 ring-offset-2 ring-offset-background">
                  <AvatarImage src={friend.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-sm">
                    {friend.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium truncate">{friend.username}</h4>
                  {friend.display_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      {friend.display_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Block>
  );
}
