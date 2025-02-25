"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TRANSITION_STYLES } from "./constants";

interface GridItemProps {
  children: React.ReactNode;
  isEditing: boolean;
  className?: string;
}

export function GridItem({ children, isEditing, className }: GridItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Reset dragging state when editing mode changes
  useEffect(() => {
    if (!isEditing) {
      setIsDragging(false);
    }
  }, [isEditing]);

  // Handle global mouse up to ensure drag state is reset
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isEditing) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchend", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isEditing, isDragging]);

  return (
    <div
      className={cn(
        "relative group w-full h-full",
        "flex flex-col",
        "overflow-hidden rounded-xl",
        isEditing && [
          "ring-1 ring-purple-500/20",
          "hover:ring-purple-500/40",
          "focus-within:ring-purple-500/60",
          "transition-all duration-200",
        ],
        className
      )}
      style={isDragging ? TRANSITION_STYLES.moving : TRANSITION_STYLES.static}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        if (!isDragging) {
          setIsDragging(false);
        }
      }}
    >
      {isEditing && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                role="button"
                tabIndex={0}
                aria-label="Drag to move"
                className={cn(
                  "block-drag-handle",
                  "absolute top-2 left-1/2 -translate-x-1/2 z-[60]",
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  "bg-background/90 backdrop-blur-sm border border-border/40 shadow-sm",
                  isHovering ? "opacity-100" : "opacity-0",
                  "transition-all duration-200",
                  "cursor-grab active:cursor-grabbing",
                  "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-purple-500",
                  isDragging &&
                    "opacity-100 cursor-grabbing scale-110 bg-purple-500/10"
                )}
                onMouseDown={(e) => {
                  // Prevent default to avoid text selection
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsDragging(true);
                  }
                }}
              >
                <GripVertical
                  className={cn(
                    "w-4 h-4",
                    isDragging ? "text-purple-500" : "text-muted-foreground"
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Drag to move</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <div className="block-content flex-1 min-h-0 w-full h-full relative">
        {children}
      </div>
    </div>
  );
}
