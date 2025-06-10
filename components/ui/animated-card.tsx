"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, isHoverable = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative group rounded-xl overflow-hidden",
          isHoverable && "hover:shadow-xl hover:shadow-purple-500/20",
          className
        )}
        whileHover={isHoverable ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.2 }}
        {...(props as any)}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-gray-900 ring-1 ring-gray-800/50 rounded-xl">
          {children}
        </div>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard"; 