import { cn } from "@/lib/utils";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

interface ProgressIndicatorProps {
  value: number;
  variant?: "default" | "success" | "warning" | "achievement";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressIndicator({
  value,
  variant = "default",
  size = "md",
  className,
}: ProgressIndicatorProps) {
  const getProgressColor = () => {
    if (variant === "achievement") return "bg-yellow-500";
    if (value === 100) return "bg-green-500";
    if (value >= 75) return "bg-blue-500";
    if (value >= 50) return "bg-purple-500";
    if (value >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return "h-1.5";
      case "lg":
        return "h-3";
      default:
        return "h-2";
    }
  };

  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-gray-800/50",
        getHeight(),
        className
      )}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          getProgressColor()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
