"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Label } from "@/components/ui/label";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { createClient } from "@/utils/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import type { JournalEntryType } from "@/stores/useJournalStore";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Trash2Icon } from "lucide-react";
import { getCoverImageUrl } from "@/utils/image-utils";
import { toast } from "react-hot-toast";
import { JournalGameData, SearchGameResult } from "@/types";

interface JournalFormData {
  type: JournalEntryType;
  title?: string;
  content?: string;
  game?: JournalGameData;
  progress?: number;
  hoursPlayed?: number;
  rating?: number;
  date?: string;
}

interface EntryFormProps {
  type: JournalEntryType;
  onSave: (formData: JournalFormData) => void;
  onCancel: () => void;
  initialData?: Partial<JournalFormData>;
  disabled?: boolean;
}

export function EntryForm({
  type,
  onSave,
  onCancel,
  initialData = {},
  disabled = false,
}: EntryFormProps) {
  const [formData, setFormData] = useState<JournalFormData>({
    type,
    ...initialData,
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<JournalGameData[]>(
    type === "list" && initialData.content
      ? JSON.parse(initialData.content)
      : []
  );

  const { games: libraryGames, fetchUserLibrary } = useLibraryStore();
  const { results, isLoading: searchLoading, search, reset } = useSearchStore();

  useEffect(() => {
    const initializeLibrary = async () => {
      const supabase = createClient();
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
    setFormData((prev) => ({ ...prev, progress: value[0] }));
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCharacterCount = (text: string = "") => {
    return text.length;
  };

  const handleGameSelect = async (game: SearchGameResult) => {
    if (!game?.id) {
      console.error("Invalid game object:", game);
      return;
    }

    const gameData: JournalGameData = {
      id: game.id,
      name: game.name,
      cover_url: game.cover?.url ? getCoverImageUrl(game.cover.url) : undefined,
    };

    if (type === "list") {
      setSelectedGames((prev) => [...prev, gameData]);
      setFormData((prev) => ({
        ...prev,
        content: JSON.stringify([...selectedGames, gameData]),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        game: gameData,
      }));
    }

    setIsSearchOpen(false);
    setSearchQuery("");
    reset();
  };

  const handleGameSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      try {
        await search(value);
      } catch (error) {
        console.error("Error searching for games:", error);
        toast.error("Failed to search for games. Please try again.");
      }
    } else {
      reset();
    }
  };

  const removeGame = (gameId: string) => {
    const newGames = selectedGames.filter((g) => g.id !== gameId);
    setSelectedGames(newGames);
    setFormData((prev) => ({
      ...prev,
      content: JSON.stringify(newGames),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onSave(formData);
    }
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
                  {formData.game.name}
                </div>
              ) : (
                "Select a game"
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {isSearchOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setIsSearchOpen(false)}
                />
                <div className="absolute z-50 w-full mt-1 bg-gray-900 rounded-md border border-gray-800 shadow-xl">
                  <div className="p-3 sticky top-0 bg-gray-900 border-b border-gray-800">
                    <div className="relative">
                      <Input
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => handleGameSearch(e.target.value)}
                        className="h-9 bg-gray-800 border-gray-700 text-white pr-8"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            reset();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          aria-label="Clear search"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
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
                                      src={getCoverImageUrl(game.cover.url)}
                                      alt={`Cover for ${game.name}`}
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
                                      src={getCoverImageUrl(game.cover.url)}
                                      alt={`Cover for ${game.name}`}
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
              </>
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
                value={[
                  formData.progress !== undefined ? formData.progress : 0,
                ]}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0%</span>
                <span>{formData.progress || 0}%</span>
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
                value={[formData.rating !== undefined ? formData.rating : 1]}
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
                              src={getCoverImageUrl(game.cover_url)}
                              alt={`Cover for ${game.name}`}
                              fill
                              className="object-cover"
                              sizes="32px"
                              quality={90}
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

            {/* Game search dropdown with improved positioning */}
            <div className="relative">
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-gray-900 rounded-md border border-gray-800 shadow-xl">
                    <div className="p-3 sticky top-0 bg-gray-900 border-b border-gray-800">
                      <div className="relative">
                        <Input
                          placeholder="Search games..."
                          value={searchQuery}
                          onChange={(e) => handleGameSearch(e.target.value)}
                          className="h-9 bg-gray-800 border-gray-700 text-white pr-8"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              reset();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            aria-label="Clear search"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2">
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
                                        src={getCoverImageUrl(game.cover.url)}
                                        alt={`Cover for ${game.name}`}
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
                                {searchQuery
                                  ? "Search Results"
                                  : "Popular Games"}
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
                                        src={getCoverImageUrl(game.cover.url)}
                                        alt={`Cover for ${game.name}`}
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
                </>
              )}
            </div>
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
