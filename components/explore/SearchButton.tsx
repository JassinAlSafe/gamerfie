"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface SearchButtonProps {
  onSearch: () => void;
}

export function SearchButton({ onSearch }: SearchButtonProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="search-button"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
      >
        <Button
          onClick={onSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500/80 hover:bg-purple-500 text-white 
                   transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium
                   shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
