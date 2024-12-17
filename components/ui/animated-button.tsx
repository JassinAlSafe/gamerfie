"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  glowColor?: string;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "default", size = "default", glowColor = "purple", ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";
    
    const sizeStyles = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1.5 text-xs",
      lg: "px-6 py-3 text-base"
    };

    const variantStyles = {
      default: `bg-${glowColor}-600 hover:bg-${glowColor}-700 text-white`,
      outline: `border-2 border-${glowColor}-500 text-${glowColor}-500 hover:bg-${glowColor}-500/10`,
      ghost: `text-${glowColor}-500 hover:bg-${glowColor}-500/10`
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          "group",
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div
          className={cn(
            "absolute inset-0 rounded-lg transition-all duration-300",
            variant === "default" && `bg-${glowColor}-600 opacity-0 blur group-hover:opacity-30`
          )}
        />
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton"; 