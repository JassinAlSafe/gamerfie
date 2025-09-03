"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: "default" | "purple" | "green" | "blue" | "amber" | "red";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const StatCard = memo<StatCardProps>(function StatCard({
  value,
  label,
  icon,
  color = "default",
  size = "md",
  className,
  onClick
}) {
  const colorConfig = {
    default: "text-white",
    purple: "text-purple-400",
    green: "text-green-400", 
    blue: "text-blue-400",
    amber: "text-amber-400",
    red: "text-red-400"
  };

  const sizeConfig = {
    sm: {
      container: "text-center",
      value: "text-lg font-bold",
      label: "text-xs",
      icon: "w-4 h-4"
    },
    md: {
      container: "text-center",
      value: "text-2xl font-bold",
      label: "text-sm",
      icon: "w-5 h-5"
    },
    lg: {
      container: "text-center",
      value: "text-3xl font-bold",
      label: "text-base",
      icon: "w-6 h-6"
    }
  };

  const colorClass = colorConfig[color];
  const config = sizeConfig[size];

  return (
    <div 
      className={cn(
        config.container,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {icon && (
        <div className={cn("flex justify-center mb-1", colorClass)}>
          <div className={config.icon}>
            {icon}
          </div>
        </div>
      )}
      <div className={cn("text-white", config.value)}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className={cn("text-gray-400", config.label)}>
        {label}
      </div>
    </div>
  );
});