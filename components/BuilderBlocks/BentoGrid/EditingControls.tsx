"use client";

import { Lock, Unlock, Save, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { toast } from "react-hot-toast";

export function EditingControls() {
  const { isEditing, setIsEditing, resetLayout, currentBreakpoint } =
    useLayoutStore();

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

  return (
    <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Current breakpoint:{" "}
          <span className="font-medium">{currentBreakpoint}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetLayout()}
            className="text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Layout
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className={
            isEditing
              ? "text-green-500 border-green-500/20 hover:bg-green-500/10"
              : "text-purple-500 border-purple-500/20 hover:bg-purple-500/10"
          }
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Layout
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Layout
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
