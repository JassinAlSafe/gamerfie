"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface HoverEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function HoverEffect({
  children,
  className,
  ...props
}: HoverEffectProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl transition-all duration-300 hover:scale-105",
        className
      )}
      {...props}
    >
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 blur transition duration-300 group-hover:opacity-75" />
      <div className="relative rounded-xl bg-background">{children}</div>
    </div>
  );
}
