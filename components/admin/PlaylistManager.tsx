"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDebounce } from "@/hooks/Settings/useDebounce";

// Sortable Item Component
function SortableGame({ game, onRemove }: { game: GameType; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white/60 hover:text-white"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        {game.cover_url && (
          <Image
            src={game.cover_url}
            alt={game.title || "Game cover"}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded"
          />
        )}
        <span className="text-white">{game.title}</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(game.id)}
        className="text-white hover:bg-white/10"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
import { RAWGService } from "@/services/rawgService";
import { PlaylistService } from "@/services/playlistService";
import { Game as GameType } from "@/types";
import { CreatePlaylistInput, Playlist, PlaylistType } from "@/types/playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const playlistTypes: { value: PlaylistType; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "collection", label: "Collection" },
  { value: "event", label: "Event" },
  { value: "genre", label: "Genre" },
  { value: "custom", label: "Custom" },
];

// Define a custom Game type for the PlaylistManager
interface Game extends GameType {
  coverImage?: string;
}

export interface PlaylistManagerProps {
  initialPlaylist?: Playlist;
}

export function PlaylistManager({ initialPlaylist }: PlaylistManagerProps) {
  const { user, isLoading: authLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>(
    (initialPlaylist?.games as Game[]) || []
  );
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePlaylistInput>({
    defaultValues: initialPlaylist
      ? {
          title: initialPlaylist.title,
          description: initialPlaylist.description,
          type: initialPlaylist.type,
          coverImage: initialPlaylist.coverImage,
          isPublished: initialPlaylist.isPublished,
          startDate: initialPlaylist.start_date?.toISOString().split("T")[0],
          endDate: initialPlaylist.end_date?.toISOString().split("T")[0],
          metadata: initialPlaylist.metadata,
        }
      : {
          isPublished: false,
          type: "custom",
        },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (initialPlaylist?.type) {
      setValue("type", initialPlaylist.type);
    }
  }, [initialPlaylist, setValue]);

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
        console.error("Failed to search games:", error);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSelectedGames((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user?.profile?.role || user.profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-white/60">Unauthorized: Admin access required</div>
      </div>
    );
  }

  const onSubmit = async (data: CreatePlaylistInput) => {
    try {
      if (initialPlaylist) {
        await PlaylistService.updatePlaylist({
          id: initialPlaylist.id,
          ...data,
          isPublished: data.isPublished ?? initialPlaylist.isPublished,
          gameIds: selectedGames.map((game) => game.id),
        });
        toast.success("Playlist updated successfully");
        router.push("/playlists");
      } else {
        await PlaylistService.createPlaylist({
          ...data,
          isPublished: data.isPublished ?? false,
          gameIds: selectedGames.map((game) => game.id),
        });
        toast.success("Playlist created successfully");
        router.push("/playlists");
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save playlist"
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
            value={selectedType}
            onValueChange={(value) => setValue("type", value as PlaylistType)}
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

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-white">
              <input
                id="isPublished"
                type="checkbox"
                {...register("isPublished")}
                className="rounded border-white/20 bg-white/10"
              />
              Published
            </label>
          </div>

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
            {initialPlaylist ? "Update Playlist" : "Create Playlist"}
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
                    {game.coverImage ? (
                      <Image
                        src={game.coverImage}
                        alt={game.title || "Game cover"}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : null}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedGames.map(game => game.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {selectedGames.map((game) => (
                <SortableGame
                  key={game.id}
                  game={game}
                  onRemove={handleRemoveGame}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
