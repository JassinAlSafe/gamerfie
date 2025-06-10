"use client";

import { User } from "@supabase/supabase-js";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Friend } from "@/types/friend";
import { Activity } from "@/types/activity";
import { Block } from "../Block";
import { RecentFriendsBlock } from "../Friends/RecentFriendsBlock/RecentFriendsBlock";
import { RecentActivityBlock } from "../Activity/RecentActivityBlock/RecentActivityBlock";
import { GameLibraryBlock } from "../Games/GameLibraryBlock/GameLibraryBlock";
import { JournalBlock } from "../Activity/Journal/JournalBlock";
import { GridItem } from "./constants";

interface UseGridItemsProps {
  user: User;
  friends: Friend[];
  activities: Activity[];
}

export function useGridItems({ user, friends, activities }: UseGridItemsProps) {
  return useMemo(() => {
    const items: GridItem[] = [
      {
        id: "welcome",
        type: "welcome",
        title: "Welcome",
        icon: <Sparkles className="h-4 w-4" />,
        w: 1,
        h: 1,
        component: (
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
              <div className="flex-1 relative flex items-center justify-center">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    {user.email?.split("@")[0] || "Gamer"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ready to game?
                  </p>
                </div>
              </div>
            </div>
          </Block>
        ),
      },
      {
        id: "friends",
        type: "friends",
        title: "Recent Friends",
        icon: <Sparkles className="h-4 w-4" />,
        w: 1,
        h: 1,
        component: <RecentFriendsBlock friends={friends} className="h-full" />,
      },
      {
        id: "activity",
        type: "activity",
        title: "Recent Activity",
        icon: <Sparkles className="h-4 w-4" />,
        w: 1,
        h: 1,
        component: (
          <RecentActivityBlock activities={activities} className="h-full" />
        ),
      },
      {
        id: "library",
        type: "library",
        title: "Game Library",
        icon: <Sparkles className="h-4 w-4" />,
        w: 2,
        h: 2,
        component: <GameLibraryBlock className="h-full" />,
      },
      {
        id: "journal",
        type: "journal",
        title: "Journal",
        icon: <Sparkles className="h-4 w-4" />,
        w: 2,
        h: 2,
        component: <JournalBlock className="h-full" />,
      },
    ];
    return items;
  }, [user.email, friends, activities]);
}
