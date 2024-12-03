
export interface AboutSection {
  title: string;
  content: string | string[];
  type: 'text' | 'list';
}

export interface AboutContent {
  sections: AboutSection[];
}