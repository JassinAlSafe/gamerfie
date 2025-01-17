"use client";

import { useState } from "react";
import { useJournalStore } from "@/stores/useJournalStore";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { X, Search, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { useGameSearch } from "@/hooks/use-game-search";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectedGame {
  id: string;
  name: string;
  cover_url: string;
}

export default function CreateListModal() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGames, setSelectedGames] = useState<SelectedGame[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { createEntry } = useJournalStore();
  const { closeModal } = useModal();
  const { toast } = useToast();
  const { games: searchResults, isLoading: isSearching } =
    useGameSearch(searchQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createEntry("list", {
        title: title.trim(),
        content: JSON.stringify(selectedGames),
        date: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Game list created successfully",
      });
      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create game list",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGameSearch = (value: string) => {
    setSearchQuery(value);
  };

  const addGame = (game: SelectedGame) => {
    if (!selectedGames.some((g) => g.id === game.id)) {
      setSelectedGames([...selectedGames, game]);
    }
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const removeGame = (gameId: string) => {
    setSelectedGames(selectedGames.filter((g) => g.id !== gameId));
  };

  return (
    <div className="relative">
      <button
        onClick={closeModal}
        className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="space-y-6 pt-2">
        <div>
          <h2 className="text-2xl font-bold">Create New List</h2>
          <p className="text-base text-white/60 mt-1">
            Create a new list to organize your favorite games
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              List Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Favorite RPGs"
              className="bg-white/5 border-white/10 focus:border-white/20 h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this list..."
              className="bg-white/5 border-white/10 focus:border-white/20 min-h-[120px] text-base resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Games</Label>
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search for games to add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search games..."
                    value={searchQuery}
                    onValueChange={handleGameSearch}
                  />
                  {isSearching ? (
                    <div className="py-6 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>No games found</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {searchResults?.map((game) => (
                          <CommandItem
                            key={game.id}
                            value={game.id}
                            onSelect={() =>
                              addGame({
                                id: game.id,
                                name: game.name,
                                cover_url: game.cover_url,
                              })
                            }
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {game.cover_url && (
                              <div className="relative w-8 h-12 rounded overflow-hidden">
                                <Image
                                  src={getCoverImageUrl(game.cover_url)}
                                  alt={game.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span>{game.name}</span>
                            <Plus className="ml-auto w-4 h-4" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            {selectedGames.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {selectedGames.map((game) => (
                  <div
                    key={game.id}
                    className="group relative aspect-[3/4] rounded-md overflow-hidden"
                  >
                    <Image
                      src={getCoverImageUrl(game.cover_url)}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGame(game.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-medium line-clamp-2">
                          {game.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={isSubmitting}
              className="bg-white/5 hover:bg-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-white/10 hover:bg-white/20 text-white min-w-[100px]"
            >
              {isSubmitting ? "Creating..." : "Create List"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
