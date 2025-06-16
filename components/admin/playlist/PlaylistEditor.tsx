"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Search,
  Plus,
  X,
  GripVertical,
  Settings,
  Gamepad2,
  CheckSquare,
  Square,
  Trash2,
  Palette,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedGameService } from "@/services/unifiedGameService";
import { PlaylistService } from "@/services/playlistService";
import { Playlist, PlaylistType, CreatePlaylistInput } from "@/types/playlist";
import { Game } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/Settings/useDebounce";
import { cn } from "@/lib/utils";
import { generateSlug, PLAYLIST_TYPE_CONFIG } from "@/lib/playlist-utils";
import { GameImage } from "./shared/GameImage";
import Image from "next/image";

interface PlaylistEditorProps {
  initialPlaylist?: Playlist | null;
  onClose?: () => void;
  onSave?: () => Promise<void>;
}

interface ExtendedGame extends Omit<Game, "videos"> {
  selected?: boolean;
  background_image?: string;
  released?: string;
  source_id?: string; // For tracking original RAWG ID when converted to IGDB
  videos?: Array<{
    id: string;
    name: string;
    video_id?: string;
  }>;
}

const PlaylistEditor: React.FC<PlaylistEditorProps> = ({
  initialPlaylist,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreatePlaylistInput>({
    title: initialPlaylist?.title || "",
    description: initialPlaylist?.description || "",
    type: initialPlaylist?.type || "custom",
    coverImage: initialPlaylist?.coverImage || "",
    isPublished: initialPlaylist?.isPublished || false,
    startDate: initialPlaylist?.start_date?.toISOString().split("T")[0] || "",
    endDate: initialPlaylist?.end_date?.toISOString().split("T")[0] || "",
    // Ensure gameIds are stored as pure numeric (strip any prefixes)
    gameIds: initialPlaylist?.gameIds?.map(id => 
      id.startsWith('igdb_') ? id.replace('igdb_', '') : 
      id.startsWith('rawg_') ? id.replace('rawg_', '') : 
      id
    ) || [],
    metadata: initialPlaylist?.metadata || {},
  });

  const [selectedGames, setSelectedGames] = useState<ExtendedGame[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExtendedGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [activeGame, setActiveGame] = useState<ExtendedGame | null>(null);
  const [bulkMode, setBulkMode] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialPlaylist?.games) {
      setSelectedGames(
        initialPlaylist.games.map((game) => ({
          ...(game as ExtendedGame),
          selected: false,
        }))
      );
    }
  }, [initialPlaylist]);

  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Use UnifiedGameService with IGDB-first strategy for cleaner architecture
        const result = await UnifiedGameService.searchGames(debouncedSearch, 1, 20, {
          strategy: 'igdb_first', // Prefer IGDB for consistent game IDs
          useCache: true
        });
        
        const gamesWithSelection = result.games.map((game) => ({
          ...(game as ExtendedGame),
          selected: selectedGames.some((g) => g.id === game.id),
        }));
        setSearchResults(gamesWithSelection);
        
        console.log(`🔍 Found ${result.games.length} games using ${result.sources.join(', ')} sources`);
      } catch (error) {
        console.error("Failed to search games:", error);
        toast({
          title: "Error",
          description: "Failed to search games",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    };

    searchGames();
  }, [debouncedSearch, selectedGames, toast]);

  const handleDragStart = (event: DragStartEvent) => {
    const game = selectedGames.find((g) => g.id === event.active.id);
    setActiveGame(game || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveGame(null);

    if (active.id !== over?.id) {
      setSelectedGames((games) => {
        const oldIndex = games.findIndex((g) => g.id === active.id);
        const newIndex = games.findIndex((g) => g.id === over?.id);
        return arrayMove(games, oldIndex, newIndex);
      });
    }
  };

  const handleAddGame = async (game: ExtendedGame) => {
    if (!selectedGames.find((g) => g.id === game.id)) {
      // Extract pure numeric ID for clean database storage
      // Convert "igdb_1020" -> "1020" or keep "1020" as is
      const numericId = game.id.startsWith('igdb_') ? game.id.replace('igdb_', '') : 
                       game.id.startsWith('rawg_') ? game.id.replace('rawg_', '') : 
                       game.id;

      const gameForPlaylist = { 
        ...game, 
        selected: false,
      };

      setSelectedGames((prev) => [...prev, gameForPlaylist]);
      setFormData((prev) => ({
        ...prev,
        gameIds: [...(prev.gameIds || []), numericId], // Store pure numeric ID
      }));

      console.log(`✅ Added game to playlist: ${game.name} (display: ${game.id}, stored: ${numericId})`);
      
      toast({
        title: "Game Added",
        description: `${game.name} added to playlist`,
      });
    }
  };

  const handleRemoveGame = (gameId: string) => {
    setSelectedGames((prev) => prev.filter((g) => g.id !== gameId));
    setFormData((prev) => ({
      ...prev,
      gameIds: (prev.gameIds || []).filter((id) => id !== gameId),
    }));
  };

  const handleBulkSelect = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.map((game) =>
        game.id === gameId ? { ...game, selected: !game.selected } : game
      )
    );
  };

  const handleBulkRemove = () => {
    const selectedIds = selectedGames
      .filter((g) => g.selected)
      .map((g) => g.id);
    setSelectedGames((prev) => prev.filter((g) => !g.selected));
    setFormData((prev) => ({
      ...prev,
      gameIds: (prev.gameIds || []).filter((id) => !selectedIds.includes(id)),
    }));
    setBulkMode(false);
  };

  const handleSelectAll = () => {
    setSelectedGames((prev) =>
      prev.map((game) => ({ ...game, selected: true }))
    );
  };

  const handleDeselectAll = () => {
    setSelectedGames((prev) =>
      prev.map((game) => ({ ...game, selected: false }))
    );
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a playlist title",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const playlistData = {
        ...formData,
        gameIds: selectedGames.map((g) => g.id),
      };

      if (initialPlaylist?.id) {
        await PlaylistService.updatePlaylist({
          ...playlistData,
          id: initialPlaylist.id,
        });
      } else {
        await PlaylistService.createPlaylist(playlistData);
      }

      toast({
        title: "Success",
        description: `Playlist ${
          initialPlaylist?.id ? "updated" : "created"
        } successfully`,
      });

      if (onSave) {
        await onSave();
      }
    } catch (error) {
      console.error("Failed to save playlist:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          initialPlaylist?.id ? "update" : "create"
        } playlist`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose || (() => {})}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {initialPlaylist?.id ? "Edit Playlist" : "Create New Playlist"}
            </h1>
            <p className="text-muted-foreground">
              {initialPlaylist?.id
                ? "Modify your playlist settings and games"
                : "Build a new game collection"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                isPublished: !prev.isPublished,
              }))
            }
          >
            {formData.isPublished ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <EyeOff className="w-4 h-4 mr-2" />
            )}
            {formData.isPublished ? "Published" : "Draft"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Playlist"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="gap-2">
            <Settings className="w-4 h-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="games" className="gap-2">
            <Gamepad2 className="w-4 h-4" />
            Games ({selectedGames.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter playlist title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe your playlist"
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: PlaylistType) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select playlist type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PLAYLIST_TYPE_CONFIG).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPublished: checked,
                        }))
                      }
                    />
                    <Label htmlFor="published">Publish playlist</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                      id="coverImage"
                      value={formData.coverImage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coverImage: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                    {formData.coverImage && (
                      <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border">
                        <Image
                          src={formData.coverImage}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                          onError={() =>
                            setFormData((prev) => ({ ...prev, coverImage: "" }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  {formData.type === "event" && (
                    <>
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Slug Preview
                    </h4>
                    <code className="text-sm text-blue-700 dark:text-blue-300">
                      /playlists/{generateSlug(formData.title || "untitled")}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Add Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search for games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Searching...
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((game) => (
                      <GameSearchItem
                        key={game.id}
                        game={game}
                        onAdd={() => handleAddGame(game)}
                        isAdded={selectedGames.some((g) => g.id === game.id)}
                      />
                    ))
                  ) : searchQuery ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No games found
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Search for games to add
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Games */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Selected Games ({selectedGames.length})
                  </CardTitle>
                  {selectedGames.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkMode(!bulkMode)}
                        className="gap-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        {bulkMode ? "Cancel" : "Select"}
                      </Button>
                      {bulkMode && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                          >
                            All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAll}
                          >
                            None
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkRemove}
                            disabled={!selectedGames.some((g) => g.selected)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedGames.length === 0 ? (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No games selected yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Search and add games to your playlist
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={selectedGames.map((g) => g.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {selectedGames.map((game) => (
                          <SortableGameItem
                            key={game.id}
                            game={game}
                            onRemove={() => handleRemoveGame(game.id)}
                            onSelect={() => handleBulkSelect(game.id)}
                            bulkMode={bulkMode}
                          />
                        ))}
                      </SortableContext>
                      <DragOverlay>
                        {activeGame ? (
                          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-lg">
                            <div className="flex items-center gap-3">
                              <GameImage
                                src={activeGame.background_image}
                                alt={activeGame.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="font-medium">
                                {activeGame.name}
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Visual Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.metadata?.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            backgroundColor: e.target.value,
                          },
                        }))
                      }
                      className="mt-1 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.metadata?.textColor || "#000000"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            textColor: e.target.value,
                          },
                        }))
                      }
                      className="mt-1 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.metadata?.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            tags: e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      placeholder="indie, action, multiplayer"
                      className="mt-1"
                    />
                  </div>

                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor:
                        formData.metadata?.backgroundColor || "#ffffff",
                      color: formData.metadata?.textColor || "#000000",
                    }}
                  >
                    <h4 className="font-semibold mb-2">Preview</h4>
                    <p className="text-sm">
                      This is how your playlist will look with these colors.
                    </p>
                    {formData.metadata?.tags &&
                      formData.metadata.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {formData.metadata.tags.map(
                            (tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Sortable Game Item Component
interface SortableGameItemProps {
  game: ExtendedGame;
  onRemove: () => void;
  onSelect: () => void;
  bulkMode: boolean;
}

const SortableGameItem: React.FC<SortableGameItemProps> = ({
  game,
  onRemove,
  onSelect,
  bulkMode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-background border rounded-lg group hover:shadow-sm transition-all",
        isDragging && "shadow-lg z-50"
      )}
    >
      {bulkMode ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelect}
          className="p-1 h-auto"
        >
          {game.selected ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </Button>
      ) : (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <GameImage
        src={game.background_image}
        alt={game.name}
        width={40}
        height={40}
        className="w-10 h-10 object-cover rounded"
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{game.name}</p>
        <p className="text-xs text-muted-foreground">
          {game.released && new Date(game.released).getFullYear()}
        </p>
      </div>

      {!bulkMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

// Game Search Item Component
interface GameSearchItemProps {
  game: ExtendedGame;
  onAdd: () => Promise<void>;
  isAdded: boolean;
}

const GameSearchItem: React.FC<GameSearchItemProps> = ({
  game,
  onAdd,
  isAdded,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAdd();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <GameImage
        src={game.background_image}
        alt={game.name}
        width={40}
        height={40}
        className="w-10 h-10 object-cover rounded"
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{game.name}</p>
        <p className="text-xs text-muted-foreground">
          {game.released && new Date(game.released).getFullYear()}
        </p>
      </div>

      <Button
        variant={isAdded ? "secondary" : "default"}
        size="sm"
        onClick={handleAdd}
        disabled={isAdded || isAdding}
        className="gap-1"
      >
        {isAdding ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
        ) : isAdded ? (
          "Added"
        ) : (
          <Plus className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};

export default PlaylistEditor;
