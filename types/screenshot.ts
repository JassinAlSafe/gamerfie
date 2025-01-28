export interface Screenshot {
  id: number;
  url: string;
  width?: number;
  height?: number;
}

export interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: Screenshot[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
} 