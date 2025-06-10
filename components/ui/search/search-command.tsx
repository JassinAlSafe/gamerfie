"use client";

import * as React from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils"; // Add this import
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface SearchCommandProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => Promise<void>;
  isLoading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  children?: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  inputClassName?: string;
  searching?: boolean;
  asChild?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  debounceMs?: number; // Add this prop
}

export function SearchCommand({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  children,
  className,
  inputClassName,
  debounceMs = 500, // Add default value
}: SearchCommandProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && onSearch) {
        onSearch(value);
      }
    }, debounceMs); // Use the prop instead of hardcoded value

    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  return (
    <Command
      className={cn("w-full border border-input bg-background", className)}
      shouldFilter={false}
      onKeyDown={(e) => {
        // Prevent form submission on Enter
        if (e.key === "Enter") {
          e.preventDefault();
        }
        return;
      }}
    >
      <CommandInput
        className={cn(
          "border-none focus:ring-0 focus:outline-none",
          inputClassName
        )}
        placeholder={placeholder}
        value={value}
        onValueChange={onChange}
      />
      {children}
    </Command>
  );
}

export function SearchGroup({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <CommandGroup heading={heading} className="text-muted-foreground">
      {children}
    </CommandGroup>
  );
}

export function SearchItem({
  children,
  value,
  onSelect,
  className,
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  return (
    <CommandItem
      value={value}
      onSelect={() => {
        console.log("SearchItem selected:", value);
        if (value !== undefined) {
          onSelect?.(value);
        }
      }}
      className={cn(
        "flex items-center gap-2 w-full p-2 text-sm cursor-pointer hover:bg-accent transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}
