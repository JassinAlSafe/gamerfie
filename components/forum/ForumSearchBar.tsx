"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  resultsCount?: number;
  showFilters?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

export function ForumSearchBar({
  placeholder = "Search discussions...",
  value,
  onChange,
  resultsCount,
  showFilters = false,
  onFilterClick,
  className
}: ForumSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative group">
        <div className={cn(
          "absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors",
          isFocused ? "text-purple-500" : "text-slate-400"
        )}>
          <Search className="w-5 h-5" />
        </div>
        
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-12 pr-16 py-3 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-base transition-all duration-300",
            "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600",
            "hover:bg-white dark:hover:bg-slate-800",
            isFocused && "bg-white dark:bg-slate-800 shadow-lg shadow-purple-500/10"
          )}
        />

        {/* Clear Button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Filter Button */}
        {showFilters && onFilterClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600"
          >
            <Filter className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Info */}
      {value && resultsCount !== undefined && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50"
          >
            {resultsCount} result{resultsCount !== 1 ? 's' : ''} for "{value}"
          </Badge>
          {resultsCount === 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search terms
            </span>
          )}
        </div>
      )}
    </div>
  );
}