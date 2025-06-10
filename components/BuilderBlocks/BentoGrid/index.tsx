"use client";

import { User } from "@supabase/supabase-js";
import { Friend } from "@/types/friend";
import { Activity } from "@/types/activity";
import { cn } from "@/lib/utils";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { EditingControls } from "./EditingControls";
import { useGridItems } from "./useGridItems";
import { GRID_CONFIG } from "./constants";
import { GridItem } from "./GridItem";
import { useState, useCallback, useEffect, useRef, memo } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@/styles/bento-grid.css";

// Use the WidthProvider to automatically set width
const ResponsiveGridLayout = WidthProvider(Responsive);

interface BentoGridProps {
  user: User;
  friends: Friend[];
  activities: Activity[];
  className?: string;
}

const BentoGridComponent = memo(function BentoGrid({
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple mount effect without complex resize handling
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.classList.remove("select-none");
  }, []);

  // Helper function to ensure the layout is compact and has no gaps
  const ensureCompactLayout = useCallback((layout: Layout[]) => {
    // Sort by y position first, then x position
    return [...layout].sort((a, b) => {
      if (a.y === b.y) return a.x - b.x;
      return a.y - b.y;
    });
  }, []);

  const handleLayoutChange = useCallback(
    (currentLayout: Layout[]) => {
      if (isEditing) {
        // Ensure the layout is compact before saving
        const compactLayout = ensureCompactLayout(currentLayout);
        setLayout(currentBreakpoint, compactLayout);
      }
    },
    [isEditing, currentBreakpoint, setLayout, ensureCompactLayout]
  );

  const handleBreakpointChange = useCallback(
    (newBreakpoint: string) => {
      setCurrentBreakpoint(newBreakpoint);
    },
    [setCurrentBreakpoint]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    document.body.style.cursor = "grabbing";
    document.body.classList.add("select-none");
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    document.body.style.cursor = "se-resize";
    document.body.classList.add("select-none");
  }, []);

  const handleResizeStop = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.classList.remove("select-none");
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div
        className={cn(
          "w-full rounded-2xl border border-border/30",
          "bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm",
          "shadow-sm p-4",
          className
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 w-full rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="w-full">
        <div
          ref={containerRef}
          className={cn(
            "relative w-full rounded-2xl border border-border/30",
            "bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm",
            "shadow-sm hover:shadow-md transition-all duration-300",
            isDragging && "cursor-grabbing",
            isResizing && "cursor-se-resize",
            isEditing && "ring-2 ring-purple-500/20",
            className
          )}
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-[0.02]" />

          {/* Minimal glow effects */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Content container */}
          <div className="relative z-10 w-full p-4">
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={GRID_CONFIG.breakpoints}
              cols={GRID_CONFIG.cols}
              rowHeight={GRID_CONFIG.rowHeight}
              margin={GRID_CONFIG.margin}
              containerPadding={GRID_CONFIG.containerPadding}
              onLayoutChange={handleLayoutChange}
              onBreakpointChange={handleBreakpointChange}
              isDraggable={isEditing}
              isResizable={isEditing}
              onDragStart={handleDragStart}
              onDragStop={handleDragStop}
              onResizeStart={handleResizeStart}
              onResizeStop={handleResizeStop}
              compactType="vertical"
              preventCollision={false}
              useCSSTransforms={true}
              draggableHandle=".react-draggable-handle"
              style={{ width: "100%" }}
            >
              {gridItems.map((item) => (
                <div key={item.id} className="w-full h-full">
                  <GridItem isEditing={isEditing}>{item.component}</GridItem>
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </div>
      </div>
      <EditingControls />
    </div>
  );
});

export function BentoGrid(props: BentoGridProps) {
  return <BentoGridComponent {...props} />;
}
