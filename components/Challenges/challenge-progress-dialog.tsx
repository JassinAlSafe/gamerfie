"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gamepad2, Plus } from "lucide-react";
import { Challenge } from "@/types/challenge";
import { Game } from "@/types/game";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameSearch } from "@/hooks/use-game-search";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ChallengeProgressDialogProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onGameAdd: (
    game: Game,
    status: "playing" | "completed" | "want_to_play"
  ) => Promise<void>;
}

export function ChallengeProgressDialog({
  challenge,
  isOpen,
  onClose,
  onGameAdd,
}: ChallengeProgressDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { games, isLoading, error } = useGameSearch(searchQuery);

  // Filter games based on challenge requirements
  const filteredGames = games.filter((game) => {
    switch (challenge.goal_type) {
      case "complete_games":
        // Add genre/category filtering based on challenge requirements
        return true;
      case "achieve_trophies":
        return game.achievements?.length > 0;
      case "play_time":
        return true;
      case "review_games":
        return true;
      case "score_points":
        return true;
      default:
        return true;
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Games to Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-purple-400">{challenge.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Gamepad2 className="w-4 h-4" />
              <span>
                Goal: {challenge.goal_target}{" "}
                {challenge.goal_type.replace(/_/g, " ")}
              </span>
            </div>
            <Progress
              value={
                challenge.participants.find(
                  (p) => p.user.id === challenge.creator.id
                )?.progress || 0
              }
              className="h-2"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800/50 border-gray-700/50"
            />
          </div>

          {/* Games List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-400">Loading...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-400">
                  Error loading games
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No games found matching your search
                </div>
              ) : (
                filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-start gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors group"
                  >
                    {/* Game Cover */}
                    <div className="relative w-16 h-20 rounded-md overflow-hidden bg-gray-800">
                      {game.cover_url && (
                        <Image
                          src={game.cover_url}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {game.name}
                      </h4>
                      {game.genres && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {game.genres.slice(0, 2).map((genre) => (
                            <Badge
                              key={genre.id}
                              variant="secondary"
                              className="text-xs bg-gray-700/50"
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800/30 border-gray-700/30"
                        onClick={() => onGameAdd(game, "want_to_play")}
                      >
                        Want to Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                        onClick={() => onGameAdd(game, "playing")}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add as Playing
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
