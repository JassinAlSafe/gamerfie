"use client";

import { motion } from "framer-motion";
import { Search, Gamepad2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSearch } from "@/hooks/Activity/use-search";
import { SearchCommand, SearchGroup, SearchItem } from "./search-command";
import { Button } from "../button";
import { ensureAbsoluteUrl } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const {
    query,
    results,
    isLoading,
    isOpen,
    setQuery,
    search,
    setIsOpen,
    reset,
  } = useSearch({ minChars: 2 });

  return (
    <div className="relative w-full md:w-[300px]">
      <SearchCommand
        value={query}
        onChange={setQuery}
        onSearch={search}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searching={isLoading}
        placeholder="Search games..."
        className="bg-background/95 backdrop-blur-sm w-full rounded-full"
        inputClassName="bg-white/10 border-0 focus:ring-2 ring-offset-0 ring-purple-500/40 text-white placeholder:text-gray-400 rounded-full"
      >
        {results?.length > 0 && (
          <>
            <SearchGroup heading="Games">
              {results.map((game) => (
                <SearchItem
                  key={game.id}
                  value={game.name || game.title || ""}
                  onSelect={() => {
                    router.push(`/games/${game.id}`);
                    setIsOpen(false);
                    reset();
                  }}
                  className="py-3 px-4 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    {game.cover ? (
                      <div className="relative w-10 h-14 rounded overflow-hidden">
                        <Image
                          src={ensureAbsoluteUrl(game.cover.url)}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-14 rounded bg-gray-800 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-200">
                        {game.name}
                      </span>
                      {game.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-400">
                            {Math.round(game.rating)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </SearchItem>
              ))}
            </SearchGroup>
            <div className="p-2 border-t border-gray-800">
              <Button
                variant="ghost"
                className="w-full bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white"
                onClick={() => {
                  router.push(`/all-games?search=${encodeURIComponent(query)}`);
                  reset();
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Show all results
              </Button>
            </div>
          </>
        )}
      </SearchCommand>
    </div>
  );
}
