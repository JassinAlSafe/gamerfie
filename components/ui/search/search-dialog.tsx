"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CommandDialog } from "@/components/ui/search/command-dialog";
import { SearchCommand, SearchGroup, SearchItem } from "./search-command";
import { useSearch } from "@/hooks/use-search";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const { query, results, isLoading, setQuery, search, reset } = useSearch({
    minChars: 2,
  });

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      console.log("SearchDialog: handleSelect called with", selectedValue);
      const selectedGame = results.find(
        (game) => (game.name || game.title) === selectedValue
      );

      if (selectedGame) {
        console.log("SearchDialog: navigating to game", selectedGame.id);
        onOpenChange(false);
        reset();
        router.push(`/games/${selectedGame.id}`);
      } else {
        console.log(
          "SearchDialog: No game found with name/title:",
          selectedValue
        );
        results.forEach((game) =>
          console.log("Available game:", game.name || game.title)
        );
      }
    },
    [results, router, onOpenChange, reset]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <SearchCommand
        value={query}
        onChange={setQuery}
        onSearch={search}
        isOpen={open}
        onOpenChange={onOpenChange}
        searching={isLoading}
        placeholder="Search games..."
        className="border-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        {results.length > 0 && (
          <SearchGroup heading="Games">
            {results.map((game) => (
              <SearchItem
                key={game.id}
                value={game.name || game.title || ""}
                onSelect={handleSelect}
                className="flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{game.name || game.title}</span>
                  {game.category && (
                    <span className="text-sm text-muted-foreground">
                      {game.category}
                    </span>
                  )}
                </div>
                {game.rating && (
                  <span className="text-sm text-green-500">
                    {Math.round(game.rating)}%
                  </span>
                )}
              </SearchItem>
            ))}
          </SearchGroup>
        )}
        {query.length > 0 && results.length === 0 && !isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No games found.
          </div>
        )}
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
      </SearchCommand>
    </CommandDialog>
  );
}
