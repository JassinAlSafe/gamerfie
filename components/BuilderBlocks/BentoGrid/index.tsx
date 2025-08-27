"use client";

import { User } from "@supabase/supabase-js";
import { Friend } from "@/types/friend";
import { Activity } from "@/types/activity";
import { cn } from "@/lib/utils";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { EditingControls } from "./EditingControls";
import { useGridItems } from "./useGridItems";
import { GRID_CONFIG, WIDGET_CONSTRAINTS } from "./constants";
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

  // Generate layout for missing items
  const generateLayoutForItems = useCallback((items: any[]) => {
    const existingLayout = layouts[currentBreakpoint] || [];
    const missingItems = items.filter(item => 
      !existingLayout.find(layout => layout.i === item.id)
    );
    
    if (missingItems.length === 0) return existingLayout;

    // Calculate next position
    const maxY = existingLayout.length > 0 
      ? Math.max(...existingLayout.map(item => item.y + item.h))
      : 0;
    
    const newLayouts = missingItems.map((item, index) => {
      const constraints = WIDGET_CONSTRAINTS[item.type as keyof typeof WIDGET_CONSTRAINTS] || { w: 1, h: 1, minW: 1, minH: 1 };
      return {
        i: item.id,
        x: (index % GRID_CONFIG.cols[currentBreakpoint as keyof typeof GRID_CONFIG.cols]) || 0,
        y: maxY + Math.floor(index / (GRID_CONFIG.cols[currentBreakpoint as keyof typeof GRID_CONFIG.cols] || 1)),
        w: constraints.w,
        h: constraints.h,
        minW: constraints.minW,
        minH: constraints.minH,
      };
    });

    return [...existingLayout, ...newLayouts];
  }, [layouts, currentBreakpoint]);

  // Simple mount effect without complex resize handling
  useEffect(() => {
    setMounted(true);
    
    // Generate layout for any missing items
    const updatedLayout = generateLayoutForItems(gridItems);
    if (updatedLayout.length !== (layouts[currentBreakpoint] || []).length) {
      setLayout(currentBreakpoint, updatedLayout);
    }
  }, [gridItems, generateLayoutForItems, setLayout, currentBreakpoint, layouts]);

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
          "w-full rounded-xl border border-border/20",
          "bg-card/30 p-6",
          className
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 w-full rounded-lg bg-muted/30 animate-pulse"
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
            "relative w-full rounded-xl border border-border/20",
            "bg-card/30",
            isDragging && "cursor-grabbing",
            isResizing && "cursor-se-resize",
            isEditing && "ring-1 ring-border/40",
            className
          )}
        >

          {/* Content container */}
          <div className="relative w-full p-6">
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={GRID_CONFIG.breakpoints}
              cols={GRID_CONFIG.cols}
              rowHeight={GRID_CONFIG.rowHeight}
              margin={[16, 16]}
              containerPadding={[0, 0]}
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
