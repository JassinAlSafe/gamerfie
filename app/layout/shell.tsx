
import { memo } from "react";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "sm" | "md" | "lg" | "none";
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[1400px]",
  full: "max-w-full",
};

const paddingClasses = {
  none: "",
  sm: "py-4 md:py-6",
  md: "py-6 md:py-8",
  lg: "py-8 md:py-12",
};

export const Shell = memo(function Shell({ 
  children, 
  className,
  maxWidth = "2xl",
  padding = "md"
}: ShellProps) {
  return (
    <div className="flex-1 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <main className={cn(
        "relative mx-auto px-4 sm:px-6 lg:px-8",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}>
        {children}
      </main>
    </div>
  );
});
