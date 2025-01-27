// About Section Types
export type AboutSectionType = 'text' | 'list' | 'image' | 'link' | 'video';

// About interfaces
export interface AboutSection {
  id?: string;
  title: string;
  content: string | string[];
  type: AboutSectionType;
  order?: number;
  metadata?: {
    url?: string;
    alt?: string;
    thumbnail?: string;
  };
}

export interface AboutContent {
  sections: AboutSection[];
  lastUpdated?: string;
}

// Request/Response types
export interface UpdateAboutRequest {
  sections: Omit<AboutSection, 'id'>[];
}

export interface AboutResponse {
  content: AboutContent;
  status: 'published' | 'draft';
  version?: number;
}