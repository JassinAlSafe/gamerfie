import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
}

export interface BreakpointConfig {
  breakpoint: number;
  cols: number;
  gap: number;
}

interface LayoutStore {
  layouts: { [key: string]: LayoutItem[] };
  currentBreakpoint: string;
  isEditMode: boolean;
  isDragging: boolean;
  isResizing: boolean;
  compactType: "vertical" | "horizontal" | null;
  preventCollision: boolean;
  showGridLines: boolean;
  breakpoints: { [key: string]: BreakpointConfig };
  
  // Actions
  setLayout: (breakpoint: string, layout: LayoutItem[]) => void;
  setCurrentBreakpoint: (breakpoint: string) => void;
  resetLayout: () => void;
  toggleEditMode: () => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  toggleCompactType: () => void;
  togglePreventCollision: () => void;
  toggleGridLines: () => void;
  lockItem: (itemId: string, locked: boolean) => void;
  updateItemSize: (itemId: string, size: { w?: number; h?: number }) => void;
  swapItems: (itemId1: string, itemId2: string) => void;
}

// Enhanced breakpoint configuration
const breakpointConfigs = {
  xxl: { breakpoint: 1400, cols: 6, gap: 16 },
  xl: { breakpoint: 1200, cols: 6, gap: 16 },
  lg: { breakpoint: 996, cols: 4, gap: 16 },
  md: { breakpoint: 768, cols: 3, gap: 12 },
  sm: { breakpoint: 576, cols: 2, gap: 12 },
  xs: { breakpoint: 0, cols: 1, gap: 8 },
};

// Define default layouts for different breakpoints with full space utilization
const defaultLayouts = {
  xxl: [
    { i: "welcome", x: 0, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "friends", x: 2, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "activity", x: 4, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "library", x: 0, y: 1, w: 3, h: 2, minW: 3, minH: 2 },
    { i: "journal", x: 3, y: 1, w: 3, h: 2, minW: 3, minH: 2 },
  ],
  xl: [
    { i: "welcome", x: 0, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "friends", x: 2, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "activity", x: 4, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "library", x: 0, y: 1, w: 3, h: 2, minW: 3, minH: 2 },
    { i: "journal", x: 3, y: 1, w: 3, h: 2, minW: 3, minH: 2 },
  ],
  lg: [
    { i: "welcome", x: 0, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "friends", x: 2, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "activity", x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "library", x: 2, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "journal", x: 0, y: 2, w: 2, h: 2, minW: 2, minH: 2 },
  ],
  md: [
    { i: "welcome", x: 0, y: 0, w: 3, h: 1, minW: 3, minH: 1 },
    { i: "friends", x: 0, y: 1, w: 3, h: 1, minW: 3, minH: 1 },
    { i: "activity", x: 0, y: 2, w: 3, h: 1, minW: 3, minH: 1 },
    { i: "library", x: 0, y: 3, w: 3, h: 2, minW: 3, minH: 2 },
    { i: "journal", x: 0, y: 5, w: 3, h: 2, minW: 3, minH: 2 },
  ],
  sm: [
    { i: "welcome", x: 0, y: 0, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "friends", x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "activity", x: 0, y: 2, w: 2, h: 1, minW: 2, minH: 1 },
    { i: "library", x: 0, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "journal", x: 0, y: 5, w: 2, h: 2, minW: 2, minH: 2 },
  ],
  xs: [
    { i: "welcome", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "friends", x: 0, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "activity", x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "library", x: 0, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "journal", x: 0, y: 5, w: 1, h: 2, minW: 1, minH: 2 },
  ],
};

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      layouts: defaultLayouts,
      currentBreakpoint: "lg",
      isEditMode: false,
      isDragging: false,
      isResizing: false,
      compactType: null, // Disable automatic compaction
      preventCollision: true, // Enable collision prevention for swapping
      showGridLines: true,
      breakpoints: breakpointConfigs,

      setLayout: (breakpoint, layout) =>
        set((state) => ({
          layouts: {
            ...state.layouts,
            [breakpoint]: layout,
          },
        })),

      setCurrentBreakpoint: (breakpoint) =>
        set({ currentBreakpoint: breakpoint }),

      resetLayout: () => set({ layouts: defaultLayouts }),

      toggleEditMode: () =>
        set((state) => ({ isEditMode: !state.isEditMode })),

      setDragging: (isDragging) => set({ isDragging }),

      setResizing: (isResizing) => set({ isResizing }),

      toggleCompactType: () =>
        set((state) => ({
          compactType:
            state.compactType === "vertical"
              ? "horizontal"
              : state.compactType === "horizontal"
              ? null
              : "vertical",
        })),

      togglePreventCollision: () =>
        set((state) => ({
          preventCollision: !state.preventCollision,
        })),

      toggleGridLines: () =>
        set((state) => ({ showGridLines: !state.showGridLines })),

      lockItem: (itemId, locked) =>
        set((state) => ({
          layouts: Object.entries(state.layouts).reduce(
            (acc, [breakpoint, layout]) => ({
              ...acc,
              [breakpoint]: layout.map((item) =>
                item.i === itemId
                  ? {
                      ...item,
                      isDraggable: !locked,
                      isResizable: !locked,
                      static: locked,
                    }
                  : item
              ),
            }),
            {}
          ),
        })),

      updateItemSize: (itemId, size) =>
        set((state) => ({
          layouts: Object.entries(state.layouts).reduce(
            (acc, [breakpoint, layout]) => ({
              ...acc,
              [breakpoint]: layout.map((item) =>
                item.i === itemId
                  ? { ...item, w: size.w ?? item.w, h: size.h ?? item.h }
                  : item
              ),
            }),
            {}
          ),
        })),

      swapItems: (itemId1, itemId2) =>
        set((state) => {
          const currentLayout = state.layouts[state.currentBreakpoint];
          const item1 = currentLayout.find((item) => item.i === itemId1);
          const item2 = currentLayout.find((item) => item.i === itemId2);

          if (!item1 || !item2) return state;

          const newLayout = currentLayout.map((item) => {
            if (item.i === itemId1) {
              return { ...item, x: item2.x, y: item2.y };
            }
            if (item.i === itemId2) {
              return { ...item, x: item1.x, y: item1.y };
            }
            return item;
          });

          return {
            layouts: {
              ...state.layouts,
              [state.currentBreakpoint]: newLayout,
            },
          };
        }),
    }),
    {
      name: "bento-grid-layout",
      version: 2, // Increment version to force reset of persisted layouts
    }
  )
); 