"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Gamepad2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGlobalSearchStore } from "@/stores/useGlobalSearchStore";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
};

export function SearchBar() {
  const router = useRouter();
  const {
    query,
    results: searchResults,
    isLoading: isSearching,
    isOpen: searchOpen,
    setQuery,
    search,
    setIsOpen,
    reset,
  } = useGlobalSearchStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) search(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <motion.div
      className="relative w-full md:w-auto"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Popover
        open={searchOpen}
        onOpenChange={(open) => setIsOpen(open || !!query)}
      >
        {/* ...existing PopoverTrigger and search input... */}
        <PopoverContent
          className="w-[300px] p-0 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-xl"
          align="start"
          sideOffset={5}
        >
          <Command className="bg-transparent">
            <CommandList>
              {/* ...existing CommandEmpty and search results... */}
              {searchResults && searchResults.length > 0 && (
                <>
                  <CommandGroup heading="Games" className="text-gray-400">
                    {/* ...existing search results mapping... */}
                  </CommandGroup>
                  <div className="p-2 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      className="w-full bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white"
                      onClick={() => {
                        router.push(
                          `/all-games?search=${encodeURIComponent(query)}`
                        );
                        reset();
                      }}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Show all results
                    </Button>
                  </div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
