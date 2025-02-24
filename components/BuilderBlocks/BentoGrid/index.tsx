"use client";

import { User } from "@supabase/supabase-js";
import { Friend } from "@/types/friend";
import { Activity } from "@/types/activity";
import { cn } from "@/lib/utils";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useLayoutStore, LayoutItem } from "@/stores/useLayoutStore";
import { EditingControls } from "./EditingControls";
import { useGridItems } from "./useGridItems";
import { GRID_BREAKPOINTS, GRID_COLS } from "./constants";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

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
    isEditing,
  } = useLayoutStore();

  const gridItems = useGridItems({ user, friends, activities });

  const handleLayoutChange = (layout: LayoutItem[], layouts: any) => {
    setLayout(currentBreakpoint, layout);
  };

  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  return (
    <>
      <EditingControls />
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative rounded-xl border border-border/40 overflow-hidden",
            "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:via-indigo-500/5 before:to-pink-500/5 before:blur-3xl before:pointer-events-none",
            "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.03)_0%,transparent_65%)] after:pointer-events-none",
            "bg-background/80 backdrop-blur-sm shadow-lg",
            isEditing && "ring-2 ring-purple-500/20",
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
              breakpoints={GRID_BREAKPOINTS}
              cols={GRID_COLS}
              rowHeight={180}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              onLayoutChange={handleLayoutChange}
              onBreakpointChange={handleBreakpointChange}
              isDraggable={isEditing}
              isResizable={isEditing}
              useCSSTransforms
            >
              {gridItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "transition-all duration-200",
                    isEditing &&
                      "ring-1 ring-purple-500/20 hover:ring-purple-500/40"
                  )}
                >
                  {item.component}
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </div>
      </div>
    </>
  );
}
