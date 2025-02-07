import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "default",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-solid border-purple-400 border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}

export default LoadingSpinner;
