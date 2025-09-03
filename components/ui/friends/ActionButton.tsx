"use client";

import { memo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  color?: "default" | "purple" | "green" | "blue" | "amber" | "red";
}

export const ActionButton = memo<ActionButtonProps>(function ActionButton({
  children,
  onClick,
  variant = "outline",
  size = "sm",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className,
  color = "default"
}) {
  const colorConfig = {
    default: "border-gray-500/30 text-gray-400 hover:bg-gray-500/10",
    purple: "border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/50",
    green: "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50",
    blue: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400/50",
    amber: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400/50",
    red: "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50"
  };

  const iconSizeConfig = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-5 h-5" // Increased from w-6 h-6 for better proportion
  };

  const spacingConfig = {
    sm: children ? (iconPosition === "left" ? "mr-2" : "ml-2") : "",
    md: children ? (iconPosition === "left" ? "mr-2.5" : "ml-2.5") : "",
    lg: children ? (iconPosition === "left" ? "mr-3" : "ml-3") : ""
  };

  return (
    <Button
      variant={variant}
      size={size === "md" ? "default" : size} // Map md to default for Button component
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        variant === "outline" && colorConfig[color],
        "transition-all duration-200 font-medium",
        // Better button padding and min height for consistency
        size === "sm" && "min-h-[36px] px-3 py-2",
        size === "md" && "min-h-[40px] px-4 py-2.5",
        size === "lg" && "min-h-[44px] px-5 py-3",
        className
      )}
    >
      {icon && iconPosition === "left" && !loading && (
        <span className={cn(
          "inline-flex items-center justify-center flex-shrink-0",
          iconSizeConfig[size],
          spacingConfig[size]
        )}>
          {icon}
        </span>
      )}
      
      {loading && (
        <span className={cn(
          "inline-flex items-center justify-center flex-shrink-0 animate-spin",
          iconSizeConfig[size],
          children && (iconPosition === "left" ? "mr-2.5" : "ml-2.5")
        )}>
          <svg className="w-full h-full border-2 border-current border-t-transparent rounded-full" viewBox="0 0 24 24" />
        </span>
      )}
      
      {children && (
        <span className="inline-flex items-center">{children}</span>
      )}
      
      {icon && iconPosition === "right" && !loading && (
        <span className={cn(
          "inline-flex items-center justify-center flex-shrink-0",
          iconSizeConfig[size],
          spacingConfig[size]
        )}>
          {icon}
        </span>
      )}
    </Button>
  );
});