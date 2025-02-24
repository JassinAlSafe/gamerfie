"use client";

import { Lock, Unlock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { toast } from "react-hot-toast";

export function EditingControls() {
  const { isEditing, setIsEditing, resetLayout } = useLayoutStore();

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
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 p-2 rounded-full",
        "bg-background/80 backdrop-blur-sm border border-border/40 shadow-lg",
        "transition-all duration-200",
        isEditing
          ? "translate-y-0 opacity-100 scale-100"
          : "hover:scale-105 hover:shadow-purple-500/10"
      )}
    >
      {isEditing ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetLayout()}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
          <div className="w-px h-4 bg-border/40" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="rounded-full text-green-500 hover:text-green-600 hover:bg-green-500/10"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
          <div className="w-px h-4 bg-border/40" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="rounded-full text-purple-500 hover:text-purple-600 hover:bg-purple-500/10"
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="rounded-full text-purple-500 hover:text-purple-600 hover:bg-purple-500/10"
        >
          <Unlock className="h-4 w-4 mr-2" />
          Customize Layout
        </Button>
      )}
    </div>
  );
}
