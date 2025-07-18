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
  static?: boolean;
}

interface LayoutState {
  layouts: { [key: string]: LayoutItem[] };
  currentBreakpoint: string;
  isEditing: boolean;
}

interface LayoutActions {
  setLayout: (breakpoint: string, layout: LayoutItem[]) => void;
  setCurrentBreakpoint: (breakpoint: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  resetLayout: () => void;
  clearCachedLayouts: () => void;
}

type LayoutStore = LayoutState & LayoutActions;

// Define default layouts for different breakpoints
const defaultLayouts = {
  lg: [
    { i: "welcome", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "friends", x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "activity", x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "progress", x: 3, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "streaks", x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "weeklyStats", x: 1, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "library", x: 2, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "achievements", x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "journal", x: 2, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
  ],
  md: [
    { i: "welcome", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "friends", x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "activity", x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "progress", x: 0, y: 1, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "streaks", x: 1, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "weeklyStats", x: 2, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "library", x: 0, y: 2, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "achievements", x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "journal", x: 0, y: 6, w: 3, h: 2, minW: 2, minH: 2 },
  ],
  sm: [
    { i: "welcome", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "friends", x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "activity", x: 0, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "progress", x: 1, y: 1, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "streaks", x: 0, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "weeklyStats", x: 1, y: 3, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "library", x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "achievements", x: 0, y: 6, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "journal", x: 0, y: 8, w: 2, h: 2, minW: 2, minH: 2 },
  ],
  xs: [
    { i: "welcome", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "friends", x: 0, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "activity", x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "progress", x: 0, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "streaks", x: 0, y: 5, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "weeklyStats", x: 0, y: 7, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "library", x: 0, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "achievements", x: 0, y: 10, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "journal", x: 0, y: 12, w: 1, h: 2, minW: 1, minH: 2 },
  ],
  xxs: [
    { i: "welcome", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "friends", x: 0, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "activity", x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "progress", x: 0, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "streaks", x: 0, y: 5, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "weeklyStats", x: 0, y: 7, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "library", x: 0, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "achievements", x: 0, y: 10, w: 1, h: 2, minW: 1, minH: 2 },
    { i: "journal", x: 0, y: 12, w: 1, h: 2, minW: 1, minH: 2 },
  ],
};

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      // State
      layouts: defaultLayouts,
      currentBreakpoint: "lg",
      isEditing: false,

      // Actions
      setLayout: (breakpoint, layout) =>
        set((state) => ({
          layouts: {
            ...state.layouts,
            [breakpoint]: layout,
          },
        })),
      setCurrentBreakpoint: (breakpoint) =>
        set({ currentBreakpoint: breakpoint }),
      setIsEditing: (isEditing) => set({ isEditing }),
      resetLayout: () => set({ layouts: defaultLayouts }),
      clearCachedLayouts: () => {
        // Force reset all persisted layouts to use new widgets
        localStorage.removeItem('bento-grid-layout');
        set({ layouts: defaultLayouts });
      },
    }),
    {
      name: "bento-grid-layout",
    }
  )
); 