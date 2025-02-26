"use client";

import { useEffect, useCallback } from "react";
import type { ScreenshotModalProps } from "@/types/screenshot";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < screenshots.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  }, [currentIndex, screenshots.length, onIndexChange]);

  // Add keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

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
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-gray-800 shadow-2xl">
        <DialogTitle className="sr-only">
          Screenshot {currentIndex + 1} of {screenshotCount}
        </DialogTitle>

        <DialogDescription className="sr-only">
          Use arrow keys or on-screen buttons to navigate between screenshots.
          Press Escape to close the viewer.
        </DialogDescription>

        <div className="relative w-full h-[85vh] flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => onClose()}
            className="absolute right-4 top-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Close screenshot viewer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Navigation buttons */}
          {!isFirstScreenshot && (
            <motion.button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Previous screenshot"
              initial={{ opacity: 0.5, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
          )}
          {!isLastScreenshot && (
            <motion.button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Next screenshot"
              initial={{ opacity: 0.5, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          )}

          {/* Screenshot */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                <Image
                  src={ensureAbsoluteUrl(highQualityUrl)}
                  alt={`Screenshot ${currentIndex + 1} of ${screenshotCount}`}
                  width={1920}
                  height={1080}
                  sizes="95vw"
                  className="object-contain w-full h-full"
                  quality={100}
                  priority={true}
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm backdrop-blur-sm">
            {currentIndex + 1} / {screenshotCount}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
