export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const GRID_COLS = { lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 };

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