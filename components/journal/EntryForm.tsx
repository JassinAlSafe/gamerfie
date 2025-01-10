"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGamesStore } from "@/stores/useGamesStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import type { JournalEntryType } from "@/stores/useJournalStore";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Trash2Icon } from "lucide-react";

interface EntryFormProps {
  type: JournalEntryType;
  onSave: (formData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

function ensureImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  // If the URL starts with '//', add https:
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  // If the URL doesn't start with http(s), add https://
  if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
}

export function EntryForm({
  type,
  onSave,
  onCancel,
  initialData = {},
}: EntryFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<any[]>(
    initialData.content ? JSON.parse(initialData.content) : []
  );
  const {
    games: libraryGames,
    loading: libraryLoading,
    fetchUserLibrary,
  } = useLibraryStore();
  const { results, isLoading: searchLoading, search, reset } = useSearchStore();

  useEffect(() => {
    const initializeLibrary = async () => {
      const supabase = createClientComponentClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await fetchUserLibrary(user.id);
      }
    };

    initializeLibrary();
  }, [fetchUserLibrary]);

  const handleProgressChange = (value: number[]) => {
    setFormData({ ...formData, progress: `${value[0]}%` });
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getCharacterCount = (text: string) => {
    return text ? text.length : 0;
  };

  const handleGameSelect = (game: any) => {
    if (type === "list") {
      const gameData = {
        id: game.id,
        name: game.name,
        cover_url: game.cover?.url ? ensureImageUrl(game.cover.url) : null,
      };
      setSelectedGames((prev) => [...prev, gameData]);
      setFormData({
        ...formData,
        content: JSON.stringify([...selectedGames, gameData]),
      });
    } else {
      const coverUrl = game.cover?.url ? ensureImageUrl(game.cover.url) : null;
      setFormData({
        ...formData,
        game: game.name,
        game_id: game.id,
        cover_url: coverUrl,
      });
    }
    setIsSearchOpen(false);
    setSearchQuery("");
    reset();
  };

  const removeGame = (gameId: string) => {
    const newGames = selectedGames.filter((g) => g.id !== gameId);
    setSelectedGames(newGames);
    setFormData({
      ...formData,
      content: JSON.stringify(newGames),
    });
  };

  const handleGameSearch = (value: string) => {
    setSearchQuery(value);
    search(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClasses =
    "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-gray-700";
  const labelClasses = "text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(type === "progress" || type === "review") && (
        <div className="relative">
          <Label htmlFor="game" className={labelClasses}>
            Game
          </Label>
          <div className="relative">
            <Button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              variant="outline"
              className={cn(
                "w-full justify-between bg-gray-800/50 border-gray-700 text-white hover:bg-gray-800 hover:text-white",
                !formData.game && "text-gray-500"
              )}
            >
              {formData.game ? (
                <div className="flex items-center gap-2">
                  {formData.cover_url && (
                    <div className="relative w-6 h-6 rounded overflow-hidden">
                      <Image
                        src={formData.cover_url}
                        alt={formData.game}
                        fill
                        className="object-cover"
                        sizes="24px"
                        unoptimized
                      />
                    </div>
                  )}
                  {formData.game}
                </div>
              ) : (
                "Select a game"
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {isSearchOpen && (
              <div className="absolute z-50 w-full mt-1 bg-gray-900 rounded-md border border-gray-800 shadow-lg">
                <div className="p-2">
                  <Input
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => handleGameSearch(e.target.value)}
                    className="h-9 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {searchLoading ? (
                    <div className="py-6 text-center text-sm text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </div>
                    </div>
                  ) : results.length === 0 && searchQuery ? (
                    <div className="py-6 text-center text-sm text-gray-400">
                      No games found.
                    </div>
                  ) : (
                    <>
                      {libraryGames.length > 0 && !searchQuery && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-400">
                            Your Library
                          </div>
                          {libraryGames.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => handleGameSelect(game)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-white hover:bg-gray-800 rounded"
                            >
                              {game.cover && (
                                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={ensureImageUrl(game.cover.url)}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="truncate">{game.name}</span>
                            </button>
                          ))}
                          <Separator className="my-1" />
                        </>
                      )}
                      {results.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-400">
                            {searchQuery ? "Search Results" : "Popular Games"}
                          </div>
                          {results.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => handleGameSelect(game)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-white hover:bg-gray-800 rounded"
                            >
                              {game.cover && (
                                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={ensureImageUrl(game.cover.url)}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="truncate">{game.name}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {type === "progress" && (
        <>
          <div>
            <Label htmlFor="progress" className={labelClasses}>
              Progress
            </Label>
            <div className="space-y-2">
              <Slider
                value={[parseInt(formData.progress || "0")]}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0%</span>
                <span>{formData.progress || "0%"}</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="hoursPlayed" className={labelClasses}>
              Hours Played
            </Label>
            <Input
              id="hoursPlayed"
              name="hoursPlayed"
              type="number"
              value={formData.hoursPlayed || ""}
              onChange={handleTextChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="content" className={labelClasses}>
                Description
              </Label>
              <span className="text-sm text-gray-500">
                {getCharacterCount(formData.content || "")}/500
              </span>
            </div>
            <Textarea
              id="content"
              name="content"
              value={formData.content || ""}
              onChange={handleTextChange}
              placeholder="Share your thoughts on your progress, what you've accomplished, or what's next..."
              className={inputClasses}
              maxLength={500}
            />
          </div>
        </>
      )}

      {type === "daily" && (
        <div>
          <div className="flex justify-between mb-1">
            <Label htmlFor="content" className={labelClasses}>
              What did you play today?
            </Label>
            <span className="text-sm text-gray-500">
              {getCharacterCount(formData.content || "")}/500
            </span>
          </div>
          <Textarea
            id="content"
            name="content"
            value={formData.content || ""}
            onChange={handleTextChange}
            className={inputClasses}
            required
            maxLength={500}
          />
        </div>
      )}

      {type === "review" && (
        <>
          <div>
            <Label htmlFor="rating" className={labelClasses}>
              Rating
            </Label>
            <div className="space-y-2">
              <Slider
                value={[parseInt(formData.rating || "0")]}
                onValueChange={(value) =>
                  setFormData({ ...formData, rating: value[0] })
                }
                max={10}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span>{formData.rating || 1}/10</span>
                <span>10</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label htmlFor="content" className={labelClasses}>
                Review
              </Label>
              <span className="text-sm text-gray-500">
                {getCharacterCount(formData.content || "")}/1000
              </span>
            </div>
            <Textarea
              id="content"
              name="content"
              value={formData.content || ""}
              onChange={handleTextChange}
              className={inputClasses}
              required
              maxLength={1000}
            />
          </div>
        </>
      )}

      {type === "list" && (
        <>
          <div>
            <Label htmlFor="title" className={labelClasses}>
              List Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleTextChange}
              className={inputClasses}
              required
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className={labelClasses}>Games in List</Label>
              <Button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Add Game
              </Button>
            </div>

            {selectedGames.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-800 rounded-md">
                No games added yet. Click "Add Game" to start building your
                list.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between gap-4 p-2 bg-gray-800/50 rounded-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {game.cover_url && (
                          <div className="relative w-8 h-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={game.cover_url}
                              alt={game.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="truncate text-sm text-white">
                          {index + 1}. {game.name}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGame(game.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-400"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isSearchOpen && (
              <div className="absolute z-50 w-full mt-1 bg-gray-900 rounded-md border border-gray-800 shadow-lg">
                <div className="p-2">
                  <Input
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => handleGameSearch(e.target.value)}
                    className="h-9 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {searchLoading ? (
                    <div className="py-6 text-center text-sm text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </div>
                    </div>
                  ) : results.length === 0 && searchQuery ? (
                    <div className="py-6 text-center text-sm text-gray-400">
                      No games found.
                    </div>
                  ) : (
                    <>
                      {libraryGames.length > 0 && !searchQuery && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-400">
                            Your Library
                          </div>
                          {libraryGames.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => handleGameSelect(game)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-white hover:bg-gray-800 rounded"
                            >
                              {game.cover && (
                                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={ensureImageUrl(game.cover.url)}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="truncate">{game.name}</span>
                            </button>
                          ))}
                          <Separator className="my-1" />
                        </>
                      )}
                      {results.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-gray-400">
                            {searchQuery ? "Search Results" : "Popular Games"}
                          </div>
                          {results.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => handleGameSelect(game)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-white hover:bg-gray-800 rounded"
                            >
                              {game.cover && (
                                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={ensureImageUrl(game.cover.url)}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="truncate">{game.name}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-white text-gray-900 hover:bg-gray-100"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
