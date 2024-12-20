"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
};

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: Screenshot[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  isOpen,
  onClose,
  screenshots,
  currentIndex,
  onIndexChange,
}) => {
  console.log("Screenshots:", screenshots);
  console.log("Current screenshot:", screenshots[currentIndex]);
  console.log("Current URL:", ensureAbsoluteUrl(screenshots[currentIndex].url));

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < screenshots.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-gray-800">
        <DialogTitle className="sr-only">
          Screenshot {currentIndex + 1} of {screenshots.length}
        </DialogTitle>

        <DialogDescription className="sr-only">
          Use arrow keys or on-screen buttons to navigate between screenshots.
          Press Escape to close the viewer.
        </DialogDescription>

        <div className="relative w-full h-[80vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Close screenshot viewer"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < screenshots.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Next screenshot"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Screenshot */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Image
              src={ensureAbsoluteUrl(screenshots[currentIndex].url)}
              alt={`Screenshot ${currentIndex + 1} of ${screenshots.length}`}
              fill
              sizes="90vw"
              className="object-contain"
              quality={100}
              priority
              unoptimized
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            {currentIndex + 1} / {screenshots.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
