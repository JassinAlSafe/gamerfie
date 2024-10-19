export interface TimelineEntry {
  title: string;
  content: TextAndImagesContent | TextAndListContent;
}

interface TextAndImagesContent {
  type: "text-and-images";
  text: string | string[];
  images: string[];
}

interface TextAndListContent {
  type: "text-and-list";
  text: string;
  list: string[];
  images: string[];
}
