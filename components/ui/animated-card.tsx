"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "stat" | "feature" | "minimal";
  isHoverable?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, variant = "default", isHoverable = true, ...props }, ref) => {
    const variants = {
      default: {
        base: "relative group rounded-xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-sm",
        hover: "hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
      },
      stat: {
        base: "relative group rounded-2xl border border-gray-800/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-md",
        hover: "hover:border-purple-400/40 hover:from-gray-900/70 hover:to-gray-800/50"
      },
      feature: {
        base: "relative group rounded-xl border border-gray-800/50 bg-gray-900/60 backdrop-blur-sm",
        hover: "hover:border-purple-500/50 hover:bg-gray-900/80 hover:shadow-xl hover:shadow-purple-500/20"
      },
      minimal: {
        base: "relative group rounded-xl bg-gray-900/30 backdrop-blur-sm",
        hover: "hover:bg-gray-900/50"
      }
    };

    const selectedVariant = variants[variant];

    return (
      <motion.div
        ref={ref}
        className={cn(
          selectedVariant.base,
          isHoverable && selectedVariant.hover,
          "transition-all duration-300 ease-out",
          className
        )}
        whileHover={isHoverable ? { y: -2, scale: 1.01 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...(props as any)}
      >
        {children}
        
        {/* Subtle gradient overlay for extra depth */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard"; 