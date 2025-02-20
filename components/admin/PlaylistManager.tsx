"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, X, GripVertical } from "lucide-react";
import type { DropResult } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useDebounce } from "@/hooks/useDebounce";
import { RAWGService } from "@/services/rawgService";
import { PlaylistService } from "@/services/playlistService";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Game } from "@/types/game";
import { CreatePlaylistInput, Playlist, PlaylistType } from "@/types/playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const playlistTypes: { value: PlaylistType; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "collection", label: "Collection" },
  { value: "event", label: "Event" },
  { value: "genre", label: "Genre" },
  { value: "custom", label: "Custom" },
];

export function PlaylistManager() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlaylistInput>();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await RAWGService.searchGames(debouncedSearch);
        setSearchResults(result.games);
      } catch (error) {
        toast.error("Failed to search games");
      } finally {
        setIsSearching(false);
      }
    };

    searchGames();
  }, [debouncedSearch]);

  const handleAddGame = (game: Game) => {
    if (!selectedGames.find((g) => g.id === game.id)) {
      setSelectedGames((prev) => [...prev, game]);
    }
  };

  const handleRemoveGame = (gameId: string) => {
    setSelectedGames((prev) => prev.filter((g) => g.id !== gameId));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedGames);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedGames(items);
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-white/60">Unauthorized: Admin access required</div>
      </div>
    );
  }

  const onSubmit = async (data: CreatePlaylistInput) => {
    try {
      await PlaylistService.createPlaylist({
        ...data,
        gameIds: selectedGames.map((game) => game.id),
      });

      toast.success("Playlist created successfully");
      reset();
      setSelectedGames([]);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create playlist"
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Playlist Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            placeholder="Playlist Title"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            {...register("title", { required: true })}
          />
          {errors.title && (
            <span className="text-red-400">Title is required</span>
          )}

          <Textarea
            placeholder="Description"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            {...register("description", { required: true })}
          />
          {errors.description && (
            <span className="text-red-400">Description is required</span>
          )}

          <Select
            onValueChange={(value) =>
              register("type").onChange({ target: { value } })
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20 text-white">
              {playlistTypes.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="focus:bg-white/10 focus:text-white"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="bg-white/10 border-white/20 text-white"
              {...register("startDate")}
              placeholder="Start Date"
            />
            <Input
              type="date"
              className="bg-white/10 border-white/20 text-white"
              {...register("endDate")}
              placeholder="End Date"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Create Playlist
          </Button>
        </form>

        {/* Game Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <Input
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="h-[300px] overflow-y-auto space-y-2 bg-gray-900/50 p-4 rounded-lg border border-white/10">
            {isSearching ? (
              <div className="text-center py-4 text-white/60">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    {game.coverImage && (
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span className="text-white">{game.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddGame(game)}
                    className="text-white hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-white/60">
                {debouncedSearch.trim()
                  ? "No results found"
                  : "Start typing to search games"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Games */}
      <div className="bg-gray-900/50 p-4 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Selected Games
        </h3>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="games">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {selectedGames.map((game, index) => (
                  <Draggable key={game.id} draggableId={game.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-white/60" />
                          </div>
                          {game.coverImage && (
                            <img
                              src={game.coverImage}
                              alt={game.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span className="text-white">{game.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveGame(game.id)}
                          className="text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
