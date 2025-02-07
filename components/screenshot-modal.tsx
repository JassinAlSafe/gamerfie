"use client";

import type { ScreenshotModalProps } from "@/types/screenshot";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ensureAbsoluteUrl = (url: string) => {
  return url.startsWith("//") ? `https:${url}` : url;
};

export function ScreenshotModal({
  isOpen,
  onClose,
  screenshots,
  currentIndex,
  onIndexChange,
}: ScreenshotModalProps) {
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

  const currentScreenshot = screenshots[currentIndex];
  const isFirstScreenshot = currentIndex === 0;
  const isLastScreenshot = currentIndex === screenshots.length - 1;
  const screenshotCount = screenshots.length;

  if (!currentScreenshot) {
    return null;
  }

  // Replace 't_thumb' with 't_1080p' or 't_720p' for higher quality
  const highQualityUrl = currentScreenshot.url.replace("t_thumb", "t_1080p");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-gray-800">
        <DialogTitle className="sr-only">
          Screenshot {currentIndex + 1} of {screenshotCount}
        </DialogTitle>

        <DialogDescription className="sr-only">
          Use arrow keys or on-screen buttons to navigate between screenshots.
          Press Escape to close the viewer.
        </DialogDescription>

        <div className="relative w-full h-[80vh]">
          {/* Navigation buttons */}
          {!isFirstScreenshot && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {!isLastScreenshot && (
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
              src={ensureAbsoluteUrl(highQualityUrl)}
              alt={`Screenshot ${currentIndex + 1} of ${screenshotCount}`}
              width={1920}
              height={1080}
              sizes="90vw"
              className="object-contain w-full h-full"
              quality={100}
              priority={true}
              loading="eager"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            {currentIndex + 1} / {screenshotCount}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
