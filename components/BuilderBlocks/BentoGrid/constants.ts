import type { CSSProperties } from "react";

export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const GRID_COLS = { lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 };

// Grid layout configuration
export const GRID_CONFIG = {
  className: "layout",
  rowHeight: 180,
  margin: [16, 16] as [number, number],
  containerPadding: [16, 16] as [number, number],
  // Enable CSS transforms for better performance
  useCSSTransforms: true,
  // Allow collisions for more flexible layouts
  preventCollision: false,
  // Use vertical compacting to fill empty spaces
  compactType: "vertical" as const,
  // Faster transitions for smoother feel
  transitionDuration: 200,
  // Responsive configuration
  breakpoints: GRID_BREAKPOINTS,
  cols: GRID_COLS,
  // Resize configuration
  resizeHandles: ["se"] as ["se"],
  transformScale: 1,
  // Bounds configuration
  isBounded: true,
  // Better performance - set to true for smoother initial render
  measureBeforeMount: false,
  // Placeholder while dragging - more visible
  placeholder: {
    backgroundColor: "rgba(147, 51, 234, 0.15)",
    border: "2px dashed rgba(147, 51, 234, 0.3)",
    borderRadius: "0.75rem",
  },
  // Ensure proper sizing
  autoSize: true,
  // Maintain aspect ratio during resize
  preserveAspectRatio: false,
  // Enable vertical compacting for better space usage
  verticalCompact: true,
  // Ensure proper collision detection
  allowOverlap: false,
  // Ensure proper margin handling
  containerPaddingX: 16,
  containerPaddingY: 16,
  // Ensure proper item positioning
  isResizable: true,
  isDraggable: true,
  // Ensure proper item sizing
  maxRows: 12,
  // Improve drag performance
  isDroppable: false,
} as const;

// Animation configuration for the item wrapper (not the grid)
export const TRANSITION_STYLES: Record<"moving" | "static", CSSProperties> = {
  moving: {
    zIndex: 10,
    transition: "transform 100ms ease, opacity 100ms ease, box-shadow 100ms ease",
    transform: "scale(1.02)",
    opacity: 0.9,
    cursor: "grabbing",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    position: "relative",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  static: {
    zIndex: 0,
    transition: "transform 200ms ease, opacity 200ms ease, box-shadow 200ms ease",
    transform: "scale(1)",
    opacity: 1,
    cursor: "grab",
    boxShadow: "none",
    position: "relative",
    width: "100%",
    height: "100%",
    pointerEvents: "auto",
  },
};

export type GridItemType = "welcome" | "friends" | "activity" | "library" | "journal";

export interface GridItem {
  id: string;
  type: GridItemType;
  title: string;
  icon: React.ReactNode;
  w: number;
  h: number;
  component: React.ReactNode;
} 