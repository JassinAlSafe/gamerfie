"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ScreenshotModalProps {
  screenshots: { id: number; url: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ScreenshotModal({
  screenshots,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: ScreenshotModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-gray-800"
        aria-describedby="screenshot-description"
      >
        <DialogTitle className="sr-only">
          Screenshot {currentIndex + 1} of {screenshots.length}
        </DialogTitle>
        
        <div id="screenshot-description" className="sr-only">
          Use left and right arrow keys to navigate between screenshots
        </div>

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
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < screenshots.length - 1 && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Next screenshot"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Screenshot */}
          <div className="relative w-full h-full">
            <Image
              src={screenshots[currentIndex].url}
              alt={`Screenshot ${currentIndex + 1} of ${screenshots.length}`}
              fill
              sizes="90vw"
              className="object-contain"
              quality={100}
              priority
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
}
