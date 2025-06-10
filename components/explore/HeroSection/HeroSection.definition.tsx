export interface HeroSectionProps {
  searchQuery: string;
  handleSearchChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (_e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchButton: React.ReactNode;
  categoryButtons: React.ReactNode;
}
