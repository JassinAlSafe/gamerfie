"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { GameCard } from "./game-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus, Gamepad2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";

interface Game {
  id: string;
  name: string;
  cover?: {
    url: string;
  } | null;
  platforms?: {
    id: number;
    name: string;
  }[];
}

interface UserGame {
  id: string;
  game_id: string;
  status: "playing" | "completed" | "want_to_play" | "dropped";
  rating: number | null;
}

export function GamesTab() {
  const [games, setGames] = useState<(Game & { userStatus?: UserGame })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserGames();
  }, []);

  const fetchUserGames = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userGames, error: userGamesError } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", user.id);
      if (userGamesError) throw userGamesError;

      // Fetch game details from the server-side API route
      const gameDetailsPromises = userGames.map(async (ug) => {
        try {
          const response = await fetch("/api/games/details", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameId: ug.game_id }),
          });

          if (!response.ok) throw new Error("Failed to fetch game details");

          const gameData = await response.json();
          return {
            ...gameData[0], // Assuming the response is an array with a single game object
            userStatus: ug,
          };
        } catch (error) {
          console.error(
            `Error fetching details for game ${ug.game_id}:`,
            error
          );
          return {
            id: ug.game_id,
            name: `Game ${ug.game_id}`,
            userStatus: ug,
          };
        }
      });

      const gamesWithDetails = await Promise.all(gameDetailsPromises);
      setGames(gamesWithDetails);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameStatus = async (gameId: string, status: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_games")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("game_id", gameId);
      if (error) throw error;

      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === gameId
            ? {
                ...game,
                userStatus: {
                  ...game.userStatus!,
                  status: status as UserGame["status"],
                },
              }
            : game
        )
      );
      toast.success("Game status updated");
    } catch (error) {
      console.error("Error updating game status:", error);
      toast.error("Failed to update game status");
    }
  };

  const removeFromLibrary = async (gameId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", gameId);
      if (error) throw error;

      setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
      toast.success("Game removed from library");
    } catch (error) {
      console.error("Error removing game from library:", error);
      toast.error("Failed to remove game from library");
    }
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || game.userStatus?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="playing">Playing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="want_to_play">Want to Play</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "No games match your filters"
                : "Start building your game collection by adding games"}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Game
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              cover={game.cover ?? undefined}
              platforms={game.platforms}
              status={game.userStatus?.status || "want_to_play"}
              rating={game.userStatus?.rating ?? undefined}
              onStatusChange={(status) => updateGameStatus(game.id, status)}
              onRemove={() => removeFromLibrary(game.id)}
              isPriority={index < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
