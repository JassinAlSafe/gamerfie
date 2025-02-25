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
import { useState, useCallback, useEffect, useRef } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Add custom CSS to fix layout issues
const customGridStyles = `
.react-grid-layout {
  position: relative;
  width: 100%;
  display: block;
}
.react-grid-item {
  transition: all 200ms ease;
  transition-property: left, top, width, height;
}
.react-grid-item.react-grid-placeholder {
  background: rgba(147, 51, 234, 0.15);
  border: 2px dashed rgba(147, 51, 234, 0.3);
  border-radius: 0.75rem;
  opacity: 0.5;
  z-index: 2;
  transition-duration: 100ms;
  user-select: none;
}
.react-grid-item.react-draggable-dragging {
  transition: none;
  z-index: 3;
  box-shadow: 0 10px 25px -5px rgba(147, 51, 234, 0.3);
  opacity: 0.8;
  cursor: grabbing !important;
}
.react-grid-item.react-grid-item.resizing {
  z-index: 3;
  transition: none;
}
.react-grid-item.cssTransforms {
  transition-property: transform;
}
.react-grid-item.dropping {
  visibility: hidden;
}
.react-grid-item.dropping-over {
  background-color: rgba(147, 51, 234, 0.2);
  border-radius: 0.75rem;
}
.react-draggable-handle {
  cursor: grab !important;
}
.react-draggable-handle:active {
  cursor: grabbing !important;
}
`;

// Use the WidthProvider to automatically set width
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
    resetLayout,
  } = useLayoutStore();

  const gridItems = useGridItems({ user, friends, activities });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Force a re-render when editing mode changes
  useEffect(() => {
    // Add a small delay to ensure the DOM is updated
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const event = new Event("resize");
        window.dispatchEvent(event);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isEditing]);

  // Ensure the layout is properly initialized
  useEffect(() => {
    setMounted(true);

    // Force a resize event to ensure the grid layout is calculated correctly
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);

    return () => {
      setMounted(false);
      clearTimeout(timer);
    };
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.classList.remove("select-none");

    // Force a resize event after dragging to ensure layout is correct
    window.dispatchEvent(new Event("resize"));

    // Add a small delay to ensure the layout is properly updated
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
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
    (currentLayout: Layout[], allLayouts: any) => {
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

    // Force a resize event after resizing to ensure layout is correct
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: customGridStyles }} />
      <EditingControls />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className={cn(
            "relative w-full rounded-xl border border-border/40",
            "bg-background/80 backdrop-blur-sm shadow-lg",
            isDragging && "cursor-grabbing",
            isResizing && "cursor-se-resize",
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
          <div className="relative z-10 w-full p-3 sm:p-4">
            {mounted && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
