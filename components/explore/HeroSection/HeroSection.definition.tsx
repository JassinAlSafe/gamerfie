import type { CategoryOption } from "@/types";

export interface HeroSectionProps {
  searchQuery: string;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCategorySelect: (category: CategoryOption) => void;
}
