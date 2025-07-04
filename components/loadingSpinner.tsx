import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "default",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={cn(
          "animate-spin rounded-full border-4 border-solid border-purple-400/30 border-t-purple-400",
          sizeClasses[size],
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-sm text-gray-400 font-medium"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

export default LoadingSpinner;
