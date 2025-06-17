"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Eye,
  Calendar,
  Gamepad2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaylistService } from "@/services/playlistService";
import { Playlist, PlaylistType } from "@/types/playlist";
import { cn } from "@/lib/utils";
import {
  getTypeColor,
  formatPlaylistDate,
  getPlaylistStats,
} from "@/lib/playlist-utils";
import { PlaylistTypeIcon } from "./shared/PlaylistTypeIcon";
import { PlaylistDropdownMenu } from "./shared/PlaylistDropdownMenu";
import { PlaylistStatusBadge } from "./shared/PlaylistStatusBadge";
import { StatCard } from "./shared/StatCard";
import { GameThumbnailStack } from "./shared/GameThumbnail";
import PlaylistEditor from "./PlaylistEditor";
import PlaylistTemplates from "./PlaylistTemplates";

const PlaylistDashboard: React.FC = () => {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<PlaylistType | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalGames: 0,
    mostPopular: undefined as Playlist | undefined,
  });

  const calculateStats = (playlistData: Playlist[]) => {
    setStats(getPlaylistStats(playlistData));
  };

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await PlaylistService.getAllPlaylistsForAdmin();
      setPlaylists(response);
      calculateStats(response);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPlaylists = useCallback(() => {
    let filtered = playlists;

    if (searchQuery) {
      filtered = filtered.filter(
        (playlist) =>
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((playlist) => playlist.type === selectedType);
    }

    setFilteredPlaylists(filtered);
  }, [playlists, searchQuery, selectedType]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    filterPlaylists();
  }, [filterPlaylists]);

  const handleCreatePlaylist = () => {
    setEditingPlaylist(null);
    setShowEditor(true);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    // Navigate to the proper edit route instead of showing inline editor
    router.push(`/admin/playlists/${playlist.id}/edit`);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      // Optimistic update - remove from local state immediately
      const optimisticPlaylists = playlists.filter((p) => p.id !== playlistId);
      setPlaylists(optimisticPlaylists);
      calculateStats(optimisticPlaylists);

      await PlaylistService.deletePlaylist(playlistId);

      // Trigger cache invalidation for explore page
      try {
        await fetch("/api/cache/invalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "playlists" }),
        });
      } catch (cacheError) {
        console.warn("Cache invalidation failed:", cacheError);
      }

      // Final refresh to ensure consistency
      await fetchPlaylists();
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      // Revert optimistic update on error
      await fetchPlaylists();
    }
  };

  const handleDuplicatePlaylist = async (playlist: Playlist) => {
    try {
      const duplicatedPlaylist = {
        ...playlist,
        title: `${playlist.title} (Copy)`,
        isPublished: false,
      };
      delete (duplicatedPlaylist as any).id;

      await PlaylistService.createPlaylist(duplicatedPlaylist);
      await fetchPlaylists();
    } catch (error) {
      console.error("Failed to duplicate playlist:", error);
    }
  };

  if (showEditor) {
    return (
      <PlaylistEditor
        initialPlaylist={editingPlaylist}
        onClose={() => {
          setShowEditor(false);
          setEditingPlaylist(null);
        }}
        onSave={async () => {
          await fetchPlaylists();
          setShowEditor(false);
          setEditingPlaylist(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Playlist Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Create, organize, and manage your game collections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="gap-2 px-4 py-2"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid3X3 className="w-4 h-4" />
            )}
            {viewMode === "grid" ? "List View" : "Grid View"}
          </Button>
          <Button
            onClick={handleCreatePlaylist}
            className="gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create Playlist
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Playlists"
          value={stats.total}
          icon={List}
          iconColor="text-blue-600"
          iconBg="bg-blue-100 dark:bg-blue-900/20"
          delay={0.1}
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={Eye}
          iconColor="text-green-600"
          iconBg="bg-green-100 dark:bg-green-900/20"
          delay={0.2}
        />
        <StatCard
          title="Drafts"
          value={stats.drafts}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-100 dark:bg-amber-900/20"
          delay={0.3}
        />
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon={Gamepad2}
          iconColor="text-purple-600"
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          delay={0.4}
        />
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search playlists by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background/50 border-border/50"
              />
            </div>
            <Tabs
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as PlaylistType | "all")
              }
            >
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all" className="px-4">
                  All
                </TabsTrigger>
                <TabsTrigger value="featured" className="px-4">
                  Featured
                </TabsTrigger>
                <TabsTrigger value="collection" className="px-4">
                  Collection
                </TabsTrigger>
                <TabsTrigger value="event" className="px-4">
                  Event
                </TabsTrigger>
                <TabsTrigger value="genre" className="px-4">
                  Genre
                </TabsTrigger>
                <TabsTrigger value="custom" className="px-4">
                  Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Playlists Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaylists.map((playlist, index) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  index={index}
                  onEdit={() => handleEditPlaylist(playlist)}
                  onDelete={() => handleDeletePlaylist(playlist.id)}
                  onDuplicate={() => handleDuplicatePlaylist(playlist)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlaylists.map((playlist, index) => (
                <PlaylistListItem
                  key={playlist.id}
                  playlist={playlist}
                  index={index}
                  onEdit={() => handleEditPlaylist(playlist)}
                  onDelete={() => handleDeletePlaylist(playlist.id)}
                  onDuplicate={() => handleDuplicatePlaylist(playlist)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && filteredPlaylists.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No playlists found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first playlist."}
            </p>
            <Button onClick={handleCreatePlaylist} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Templates */}
      <PlaylistTemplates onCreateFromTemplate={handleCreatePlaylist} />
    </div>
  );
};

// Playlist Card Component
interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  index,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get first few games for preview
  const previewGames = playlist.games?.slice(0, 4) || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      exit={{ opacity: 0, y: -20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden border-border/50">
        <div className={cn("h-2", getTypeColor(playlist.type))} />
        
        {/* Game Preview Section */}
        {previewGames.length > 0 && (
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="absolute inset-0 flex">
              {previewGames.map((game, gameIndex) => (
                <div
                  key={game.id}
                  className={cn(
                    "relative transition-all duration-300",
                    previewGames.length === 1 ? "w-full" :
                    previewGames.length === 2 ? "w-1/2" :
                    previewGames.length === 3 ? (gameIndex === 0 ? "w-1/2" : "w-1/4") :
                    "w-1/4"
                  )}
                  style={{
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    zIndex: gameIndex
                  }}
                >
                  <Image
                    src={game.background_image || game.cover_url || '/api/placeholder/400/600'}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ))}
            </div>
            
            {/* Game count overlay */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {playlist.gameIds?.length || 0} games
            </div>
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}
        
        <CardHeader className={cn("pb-3", previewGames.length === 0 && "pt-6")}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <PlaylistTypeIcon type={playlist.type} />
                <PlaylistStatusBadge
                  type={playlist.type}
                  isPublished={playlist.isPublished}
                />
              </div>
              <CardTitle className="line-clamp-2 text-base">
                {playlist.title}
              </CardTitle>
            </div>
            <PlaylistDropdownMenu
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {playlist.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Top games preview */}
          {previewGames.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Featured Games
                </h4>
              </div>
              <GameThumbnailStack
                games={previewGames}
                maxVisible={3}
                size="sm"
                showCount={true}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              {playlist.gameIds?.length || 0} games
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatPlaylistDate(playlist.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Playlist List Item Component
const PlaylistListItem: React.FC<PlaylistCardProps> = ({
  playlist,
  index,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const previewGames = playlist.games?.slice(0, 3) || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="group hover:shadow-md hover:shadow-primary/5 transition-all duration-300 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={cn(
                  "w-3 h-12 rounded-full",
                  getTypeColor(playlist.type)
                )}
              />
              
              {/* Game thumbnails for list view */}
              {previewGames.length > 0 && (
                <GameThumbnailStack
                  games={previewGames}
                  maxVisible={3}
                  size="xs"
                  showCount={false}
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PlaylistTypeIcon type={playlist.type} />
                  <h3 className="font-semibold truncate">{playlist.title}</h3>
                  <PlaylistStatusBadge
                    type={playlist.type}
                    isPublished={playlist.isPublished}
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {playlist.description}
                </p>
                
                {/* Additional metadata in list view */}
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Updated {formatPlaylistDate(playlist.updatedAt || playlist.createdAt)}</span>
                  {playlist.games && playlist.games.length > 0 && (
                    <span>Last game: {playlist.games[playlist.games.length - 1]?.name}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" />
                {playlist.gameIds?.length || 0} games
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatPlaylistDate(playlist.createdAt)}
              </span>
              <PlaylistDropdownMenu
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaylistDashboard;
