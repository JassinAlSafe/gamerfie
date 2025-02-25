"use client";

import { Save, Pencil, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";

export function EditingControls() {
  const { isEditing, setIsEditing, resetLayout } = useLayoutStore();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip briefly when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Layout saved successfully", {
      icon: "💾",
      style: {
        background: "#1a1b1e",
        color: "#fff",
        border: "1px solid rgba(147, 51, 234, 0.1)",
      },
    });
  };

  if (!isEditing) {
    return (
      <div className="absolute bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="rounded-full h-10 w-10 p-0 bg-background/80 backdrop-blur-sm border-purple-500/20 hover:bg-purple-500/10 shadow-md"
        >
          <Pencil className="h-4 w-4 text-purple-500" />
          <span className="sr-only">Edit Layout</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Floating tooltip for instructions */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 max-w-xs p-3 rounded-lg bg-background/90 backdrop-blur-md border border-purple-500/20 shadow-lg transition-opacity duration-300",
          showTooltip ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-full bg-purple-500/10">
            <Pencil className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Edit Mode Active</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Drag blocks using the grip handle to rearrange your layout. Click
              Save when done.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full -mt-1 -mr-1"
            onClick={() => setShowTooltip(false)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Floating controls */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetLayout()}
          className="rounded-full h-10 px-4 bg-background/80 backdrop-blur-sm border-yellow-500/20 hover:bg-yellow-500/10 shadow-md"
        >
          <RotateCcw className="h-4 w-4 mr-2 text-yellow-500" />
          <span className="text-sm">Reset</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="rounded-full h-10 px-4 bg-background/80 backdrop-blur-sm border-green-500/20 hover:bg-green-500/10 shadow-md"
        >
          <Save className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-sm">Save</span>
        </Button>
      </div>
    </>
  );
}
