"use client";

import { cn } from "@/lib/utils";
import { Move } from "lucide-react";
import { memo, useState } from "react";

interface GridItemProps {
  children: React.ReactNode;
  isEditing: boolean;
  className?: string;
}

export const GridItem = memo(function GridItem({ children, isEditing, className }: GridItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group w-full h-full",
        "flex flex-col",
        "overflow-hidden rounded-xl",
        "transition-all duration-300 ease-out",
        // Base interactions
        "hover:shadow-lg hover:shadow-black/10",
        // Editing mode styles
        isEditing && [
          "ring-1 ring-purple-500/20",
          "hover:ring-2 hover:ring-purple-500/40",
          "focus-within:ring-2 focus-within:ring-purple-500/60",
          "cursor-move",
        ],
        // Dragging state
        isDragging && [
          "scale-105 rotate-1 shadow-2xl shadow-purple-500/20",
          "ring-2 ring-purple-500/60",
          "z-50",
        ],
        // Hover state
        isHovered && !isEditing && [
          "transform hover:scale-[1.02]",
          "hover:shadow-xl",
        ],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => isEditing && setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
    >
      {/* Editing overlay */}
      {isEditing && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </>
      )}
      
      {/* Drag handle */}
      {isEditing && (
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
      )}
      
      {isEditing && (
        <div 
          className={cn(
            "react-draggable-handle absolute top-2 right-2 z-50",
            "flex items-center justify-center w-8 h-8 rounded-full",
            "bg-background/95 backdrop-blur-sm border shadow-lg",
            "transition-all duration-300 cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover:opacity-100",
            "hover:scale-110 hover:shadow-xl hover:bg-purple-500/10 hover:border-purple-400/50",
            "active:scale-95",
            isDragging && "opacity-100 scale-110 bg-purple-500/20 border-purple-400"
          )}
          title="Drag to move this block"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
          <Move className="w-4 h-4 text-purple-500 transition-transform duration-200" />
        </div>
      )}
      
      {/* Content container */}
      <div className={cn(
        "flex-1 min-h-0 w-full h-full relative",
        "transition-all duration-300",
        isDragging && "pointer-events-none"
      )}>
        {children}
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl pointer-events-none",
        "bg-gradient-to-br from-white/5 via-transparent to-white/5",
        "opacity-0 transition-opacity duration-300",
        isHovered && !isEditing && "opacity-100"
      )} />
    </div>
  );
});
