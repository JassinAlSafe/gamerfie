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
import { useMemo, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useLayoutStore, LayoutItem } from "@/stores/useLayoutStore";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define breakpoints
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 };

// Define grid item types
type GridItemType = "welcome" | "friends" | "activity" | "library" | "journal";

interface GridItem {
  id: string;
  type: GridItemType;
  title: string;
  icon: React.ReactNode;
  w: number;
  h: number;
  component: React.ReactNode;
}

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
  const { layouts, setLayout, currentBreakpoint, setCurrentBreakpoint } =
    useLayoutStore();

  // Define grid items with their properties
  const gridItems = useMemo(() => {
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

  const handleLayoutChange = (layout: LayoutItem[], layouts: any) => {
    setLayout(currentBreakpoint, layout);
  };

  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          "relative rounded-xl border border-border/40 overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:via-indigo-500/5 before:to-pink-500/5 before:blur-3xl before:pointer-events-none",
          "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.03)_0%,transparent_65%)] after:pointer-events-none",
          "bg-background/80 backdrop-blur-sm shadow-lg",
          className
        )}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.02)_25%,rgba(147,51,234,0.02)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.02)_75%)] bg-[length:8px_8px]" />

        {/* Glow Effects */}
        <div className="absolute -left-32 -top-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content container */}
        <div className="relative z-10 p-3 sm:p-4">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={180}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={handleBreakpointChange}
            isDraggable
            isResizable
            useCSSTransforms
          >
            {gridItems.map((item) => (
              <div key={item.id}>{item.component}</div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    </div>
  );
}
