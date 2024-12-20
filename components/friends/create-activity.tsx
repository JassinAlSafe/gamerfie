"use client";

import { useState } from "react";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { ActivityType } from "@/types/friend";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import Image from "next/image";

interface Game {
  id: string;
  name: string;
  cover_url?: string;
}

export function CreateActivity() {
  const { createActivity } = useFriendsStore();
  const [activityType, setActivityType] =
    useState<ActivityType>("started_playing");
  const [gameSearch, setGameSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [details, setDetails] = useState({
    name: "",
    comment: "",
  });

  const debouncedSearch = useDebounce(searchGames, 300);

  async function searchGames(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/games/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to search games");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching games:", error);
      toast.error("Failed to search games");
    } finally {
      setIsSearching(false);
    }
  }

  const handleGameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGameSearch(value);
    debouncedSearch(value);
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setGameSearch("");
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) {
      toast.error("Please select a game");
      return;
    }

    try {
      await createActivity(activityType, selectedGame.id, details);
      toast.success("Activity created successfully!");
      // Reset form
      setSelectedGame(null);
      setDetails({ name: "", comment: "" });
    } catch (error) {
      toast.error("Failed to create activity");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Create Activity</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Activity Type</label>
        <Select
          value={activityType}
          onValueChange={(value) => setActivityType(value as ActivityType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="started_playing">Started Playing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Game</label>
        <div className="relative">
          <Input
            type="text"
            value={gameSearch}
            onChange={handleGameSearch}
            placeholder="Search for a game..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-900 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchResults.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelectGame(game)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 transition-colors"
              >
                {game.cover_url && (
                  <div className="relative w-8 h-10 flex-shrink-0">
                    <Image
                      src={game.cover_url}
                      alt={game.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <span className="flex-1 text-left">{game.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Game */}
        {selectedGame && (
          <div className="flex items-center gap-3 p-2 bg-gray-800 rounded-md">
            {selectedGame.cover_url && (
              <div className="relative w-8 h-10">
                <Image
                  src={selectedGame.cover_url}
                  alt={selectedGame.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <span className="flex-1">{selectedGame.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGame(null)}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      {activityType === "achievement" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Achievement Name</label>
          <Input
            type="text"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            placeholder="Enter achievement name"
          />
        </div>
      )}

      {activityType === "review" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Review Comment</label>
          <Textarea
            value={details.comment}
            onChange={(e) =>
              setDetails({ ...details, comment: e.target.value })
            }
            placeholder="Write your review..."
            rows={4}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!selectedGame}>
        Create Activity
      </Button>
    </form>
  );
}
