"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const blockVariants = cva(
  "relative overflow-hidden transition-all bg-gradient-to-b from-gray-900/50 to-gray-950/30 backdrop-blur-xl min-h-0 w-full h-full",
  {
    variants: {
      size: {
        sm: "col-span-1",
        md: "col-span-1 sm:col-span-2",
        lg: "col-span-1 sm:col-span-2 lg:col-span-3",
        full: "col-span-full",
      },
      variant: {
        default: [
          "rounded-xl border shadow-sm",
          "bg-gradient-to-b from-gray-900/10 via-gray-900/50 to-gray-950/80",
          "backdrop-blur-xl backdrop-saturate-200",
          "hover:shadow-md hover:from-gray-900/20 hover:via-gray-900/60 hover:to-gray-950/90",
          "dark:from-gray-900/20 dark:via-gray-900/25 dark:to-gray-950/30",
          "dark:hover:from-gray-900/25 dark:hover:via-gray-900/30 dark:hover:to-gray-950/40",
          "transition-all duration-200",
          "flex flex-col",
        ],
        ghost: "bg-transparent flex flex-col",
        premium: [
          "rounded-xl border shadow-sm border-purple-200/20",
          "bg-gradient-to-b from-purple-500/10 via-purple-500/5 to-gray-950",
          "dark:from-purple-500/20 dark:via-purple-500/10 dark:to-gray-950",
          "hover:shadow-purple-500/5 hover:border-purple-200/30",
          "dark:hover:border-purple-200/30 dark:hover:shadow-purple-500/10",
          "flex flex-col",
        ],
        success: [
          "rounded-xl border shadow-sm border-green-200/20",
          "bg-gradient-to-b from-green-500/10 via-green-500/5 to-gray-950",
          "dark:from-green-500/20 dark:via-green-500/10 dark:to-gray-950",
          "hover:shadow-green-500/5 hover:border-green-200/30",
          "dark:hover:border-green-200/30 dark:hover:shadow-green-500/10",
          "flex flex-col",
        ],
      },
      hover: {
        true: [
          "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200",
          "hover:shadow-lg hover:shadow-purple-500/5",
        ],
        false: "",
      },
      glassmorphism: {
        true: [
          "before:absolute before:inset-0 before:rounded-xl",
          "before:bg-gradient-to-b before:from-white/5 before:to-white/10",
          "before:pointer-events-none before:transition-opacity",
          "hover:before:opacity-100 before:opacity-0",
        ],
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
      hover: false,
      glassmorphism: true,
    },
  }
);

interface BlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof blockVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Block({
  children,
  className,
  size,
  variant,
  hover,
  glassmorphism,
  ...props
}: BlockProps) {
  return (
    <div
      className={cn(
        blockVariants({ size, variant, hover, glassmorphism }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
