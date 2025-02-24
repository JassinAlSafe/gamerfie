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
import {
  useLayoutStore,
  LayoutItem,
  BreakpointConfig,
} from "@/stores/useLayoutStore";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Grid, Move, Settings2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define breakpoints for react-grid-layout
const GRID_BREAKPOINTS = {
  xxl: 1400,
  xl: 1200,
  lg: 996,
  md: 768,
  sm: 576,
  xs: 0,
} as const;

type Breakpoint = keyof typeof GRID_BREAKPOINTS;

const GRID_COLS = {
  xxl: 6,
  xl: 6,
  lg: 4,
  md: 3,
  sm: 2,
  xs: 1,
} as const;

// Define grid item types
type GridItemType = "welcome" | "friends" | "activity" | "library" | "journal";

interface GridItemData {
  id: string;
  type: GridItemType;
  title: string;
  icon: React.ReactNode;
  layout: {
    [K in Breakpoint]: { x: number; y: number; w: number; h: number };
  };
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
  const {
    layouts,
    setLayout,
    currentBreakpoint,
    setCurrentBreakpoint,
    isEditMode,
    toggleEditMode,
    isDragging,
    setDragging,
    isResizing,
    setResizing,
    showGridLines,
    toggleGridLines,
    swapItems,
  } = useLayoutStore();

  // Define grid items with their properties and layouts
  const gridItems = useMemo(() => {
    const items: GridItemData[] = [
      {
        id: "welcome",
        type: "welcome",
        title: "Welcome",
        icon: <Sparkles className="h-4 w-4" />,
        layout: {
          xxl: { x: 0, y: 0, w: 2, h: 1 },
          xl: { x: 0, y: 0, w: 2, h: 1 },
          lg: { x: 0, y: 0, w: 2, h: 1 },
          md: { x: 0, y: 0, w: 3, h: 1 },
          sm: { x: 0, y: 0, w: 2, h: 1 },
          xs: { x: 0, y: 0, w: 1, h: 1 },
        },
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
        layout: {
          xxl: { x: 2, y: 0, w: 2, h: 1 },
          xl: { x: 2, y: 0, w: 2, h: 1 },
          lg: { x: 2, y: 0, w: 2, h: 1 },
          md: { x: 0, y: 1, w: 3, h: 1 },
          sm: { x: 0, y: 1, w: 2, h: 1 },
          xs: { x: 0, y: 1, w: 1, h: 1 },
        },
        component: <RecentFriendsBlock friends={friends} className="h-full" />,
      },
      {
        id: "activity",
        type: "activity",
        title: "Recent Activity",
        icon: <Sparkles className="h-4 w-4" />,
        layout: {
          xxl: { x: 4, y: 0, w: 2, h: 1 },
          xl: { x: 4, y: 0, w: 2, h: 1 },
          lg: { x: 0, y: 1, w: 2, h: 1 },
          md: { x: 0, y: 2, w: 3, h: 1 },
          sm: { x: 0, y: 2, w: 2, h: 1 },
          xs: { x: 0, y: 2, w: 1, h: 1 },
        },
        component: (
          <RecentActivityBlock activities={activities} className="h-full" />
        ),
      },
      {
        id: "library",
        type: "library",
        title: "Game Library",
        icon: <Sparkles className="h-4 w-4" />,
        layout: {
          xxl: { x: 0, y: 1, w: 3, h: 2 },
          xl: { x: 0, y: 1, w: 3, h: 2 },
          lg: { x: 2, y: 1, w: 2, h: 2 },
          md: { x: 0, y: 3, w: 3, h: 2 },
          sm: { x: 0, y: 3, w: 2, h: 2 },
          xs: { x: 0, y: 3, w: 1, h: 2 },
        },
        component: <GameLibraryBlock className="h-full" />,
      },
      {
        id: "journal",
        type: "journal",
        title: "Journal",
        icon: <Sparkles className="h-4 w-4" />,
        layout: {
          xxl: { x: 3, y: 1, w: 3, h: 2 },
          xl: { x: 3, y: 1, w: 3, h: 2 },
          lg: { x: 0, y: 2, w: 2, h: 2 },
          md: { x: 0, y: 5, w: 3, h: 2 },
          sm: { x: 0, y: 5, w: 2, h: 2 },
          xs: { x: 0, y: 5, w: 1, h: 2 },
        },
        component: <JournalBlock className="h-full" />,
      },
    ];
    return items;
  }, [user.email, friends, activities]);

  // Initialize layouts if they don't exist
  useEffect(() => {
    if (!layouts || Object.keys(layouts).length === 0) {
      const initialLayouts = (
        Object.keys(GRID_BREAKPOINTS) as Breakpoint[]
      ).reduce<Record<Breakpoint, LayoutItem[]>>(
        (acc, breakpoint) => ({
          ...acc,
          [breakpoint]: gridItems.map((item) => ({
            i: item.id,
            ...item.layout[breakpoint],
            minW: item.layout[breakpoint].w,
            minH: item.layout[breakpoint].h,
          })),
        }),
        {} as Record<Breakpoint, LayoutItem[]>
      );
      setLayout(
        currentBreakpoint,
        initialLayouts[currentBreakpoint as Breakpoint]
      );
    }
  }, [layouts, currentBreakpoint, setLayout, gridItems]);

  const handleLayoutChange = (layout: LayoutItem[], allLayouts: any) => {
    // Find if any items have swapped positions
    const currentLayout = layouts[currentBreakpoint];
    const movedItem = layout.find((item, i) => {
      const oldPos = currentLayout?.[i];
      return oldPos && (oldPos.x !== item.x || oldPos.y !== item.y);
    });

    if (movedItem && currentLayout) {
      // Find which item was swapped with
      const overlappingItem = layout.find(
        (item) =>
          item.i !== movedItem.i &&
          item.x === movedItem.x &&
          item.y === movedItem.y
      );

      if (overlappingItem) {
        // Swap the items
        swapItems(movedItem.i, overlappingItem.i);
        return;
      }
    }

    setLayout(currentBreakpoint, layout);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Edit Mode Controls */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isEditMode ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleEditMode}
                  className={cn(
                    "transition-all duration-200",
                    isEditMode && "bg-purple-500 hover:bg-purple-600"
                  )}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  {isEditMode ? "Exit Edit Mode" : "Edit Layout"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle edit mode to customize your layout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isEditMode && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleGridLines}
                    className={cn(
                      "transition-colors",
                      showGridLines && "text-purple-500"
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle grid lines</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative rounded-xl border overflow-hidden transition-all duration-200",
          isEditMode
            ? "border-purple-500/20 shadow-lg shadow-purple-500/10"
            : "border-border/40",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:via-indigo-500/5 before:to-pink-500/5 before:blur-3xl before:pointer-events-none",
          "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.03)_0%,transparent_65%)] after:pointer-events-none",
          "bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.02)_25%,rgba(147,51,234,0.02)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.02)_75%)] bg-[length:8px_8px]" />

        {/* Grid Lines */}
        {isEditMode && showGridLines && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(147,51,234,0.05) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(147,51,234,0.05) 1px, transparent 1px)`,
              backgroundSize: `${
                100 / GRID_COLS[currentBreakpoint as keyof typeof GRID_COLS]
              }% 60px`,
            }}
          />
        )}

        {/* Glow Effects */}
        <div className="absolute -left-32 -top-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Drag Indicator */}
        {isEditMode && (isDragging || isResizing) && (
          <div className="fixed bottom-4 right-4 px-3 py-2 rounded-lg bg-purple-500 text-white shadow-lg z-50 flex items-center gap-2">
            <Move className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isDragging ? "Swap blocks by dragging" : "Resizing..."}
            </span>
          </div>
        )}

        {/* Content container */}
        <div className="relative z-10 p-3 sm:p-4">
          <ResponsiveGridLayout
            className={cn("layout", isEditMode && "layout-edit-mode")}
            layouts={layouts}
            breakpoints={GRID_BREAKPOINTS}
            cols={GRID_COLS}
            rowHeight={180}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={setCurrentBreakpoint}
            onDragStart={() => setDragging(true)}
            onDragStop={() => setDragging(false)}
            onResizeStart={() => setResizing(true)}
            onResizeStop={() => setResizing(false)}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            compactType={null}
            preventCollision={true}
            useCSSTransforms
            isBounded
          >
            {gridItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "transition-all duration-200",
                  isEditMode &&
                    "ring-2 ring-purple-500/20 hover:ring-purple-500/40 cursor-move"
                )}
                data-grid={item.layout[currentBreakpoint as Breakpoint]}
              >
                {item.component}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    </div>
  );
}
