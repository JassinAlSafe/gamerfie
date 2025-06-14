// About Section Types - Simplified and clean
export type AboutSectionType = 'text' | 'list' | 'feature' | 'stats';

// Core About interfaces
export interface AboutSection {
  title: string;
  content: string | string[];
  type: AboutSectionType;
  icon?: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

export interface AboutContent {
  sections: AboutSection[];
}