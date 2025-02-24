"use client";

import { User } from "@supabase/supabase-js";
import { Block } from "./Block";
import { TextBlock } from "./Text/TextBlock";
import { RecentFriendsBlock } from "./Friends/RecentFriendsBlock/RecentFriendsBlock";
import { RecentActivityBlock } from "./Activity/RecentActivityBlock/RecentActivityBlock";
import { GameLibraryBlock } from "./Games/GameLibraryBlock/GameLibraryBlock";
import { JournalBlock } from "./Activity/Journal/JournalBlock";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Friend } from "@/types/friend";
import { Activity } from "@/types/activity";

interface BentoGridProps {
  user: User;
  friends: Friend[];
  activities: Activity[];
  className?: string;
}

export function BentoGrid({
  user,
  friends,
  activities,
  className,
}: BentoGridProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          "relative rounded-xl border border-border/40 overflow-hidden",
          // Background Effects - reduced opacity and pointer-events-none
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:via-indigo-500/5 before:to-pink-500/5 before:blur-3xl before:pointer-events-none",
          "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.03)_0%,transparent_65%)] after:pointer-events-none",
          // Base background
          "bg-background/80 backdrop-blur-sm shadow-lg",
          className
        )}
      >
        {/* Pattern overlay - with pointer-events-none */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.02)_25%,rgba(147,51,234,0.02)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.02)_75%)] bg-[length:8px_8px]" />

        {/* Glow Effects - with pointer-events-none */}
        <div className="absolute -left-32 -top-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content container - ensure it's above overlays */}
        <div className="relative z-10 p-3 sm:p-4">
          <div className="grid auto-rows-[180px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 auto-flow-dense">
            {/* Welcome Block */}
            <Block
              variant="premium"
              hover={true}
              className="h-full overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-3 border-b border-purple-200/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      Welcome
                    </h3>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <TextBlock
                    text={user.email?.split("@")[0] || "Gamer"}
                    textFontSize={80}
                    asciiFontSize={1}
                    enableWaves={true}
                    textColor="#9333ea"
                    planeBaseHeight={4}
                    variant="ghost"
                  />
                </div>
              </div>
            </Block>

            {/* Recent Friends Block */}
            <RecentFriendsBlock friends={friends} className="h-full" />

            {/* Activity Block */}
            <RecentActivityBlock activities={activities} className="h-full" />

            {/* Game Library Block - Double Height */}
            <div className="row-span-2 sm:col-span-2 lg:col-span-1">
              <GameLibraryBlock className="h-full" />
            </div>

            {/* Journal Block - Double Height */}
            <div className="row-span-2 sm:col-span-2 lg:col-span-1">
              <JournalBlock className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
