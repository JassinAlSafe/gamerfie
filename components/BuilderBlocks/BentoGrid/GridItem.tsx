"use client";

import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface GridItemProps {
  children: React.ReactNode;
  isEditing: boolean;
  className?: string;
}

export function GridItem({ children, isEditing, className }: GridItemProps) {
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
    >
      {isEditing && (
        <div className="absolute inset-0 bg-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
      
      {isEditing && (
        <div 
          className="react-draggable-handle absolute top-2 right-2 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border/40 shadow-md opacity-70 group-hover:opacity-100 transition-all duration-200 cursor-grab hover:scale-110 hover:shadow-lg hover:border-purple-300/50"
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4 text-purple-500" />
        </div>
      )}
      
      <div className="flex-1 min-h-0 w-full h-full relative">
        {children}
      </div>
    </div>
  );
}
