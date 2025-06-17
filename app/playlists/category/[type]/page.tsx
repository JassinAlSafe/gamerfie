"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Search,
  Calendar,
  Eye,
  Gamepad2,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaylistService } from "@/services/playlistService";
import { Playlist, PlaylistType } from "@/types/playlist";
import { useToast } from "@/components/ui/use-toast";
import { GameThumbnailStack } from "@/components/admin/playlist/shared/GameThumbnail";
import { PlaylistTypeIcon } from "@/components/admin/playlist/shared/PlaylistTypeIcon";
import { PlaylistStatusBadge } from "@/components/admin/playlist/shared/PlaylistStatusBadge";
import { cn } from "@/lib/utils";
import { getTypeColor, formatPlaylistDate, PLAYLIST_TYPE_CONFIG } from "@/lib/playlist-utils";
import Link from "next/link";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "popular" | "name" | "games_count";
type FilterOption = "all" | "published" | "draft";


const categoryIcons = {
  featured: Star,
  collection: Grid3X3,
  event: Calendar,
  genre: Gamepad2,
  custom: Users,
} as const;

const categoryColors = {
  featured: "from-yellow-500 to-orange-500",
  collection: "from-blue-500 to-cyan-500", 
  event: "from-purple-500 to-pink-500",
  genre: "from-green-500 to-emerald-500",
  custom: "from-gray-500 to-slate-500",
} as const;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const category = params.type as PlaylistType;
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Category configuration
  const categoryConfig = useMemo(() => {
    const config = PLAYLIST_TYPE_CONFIG[category];
    const Icon = categoryIcons[category] || Grid3X3;
    const colorClass = categoryColors[category] || categoryColors.custom;
    
    return {
      ...config,
      icon: Icon,
      colorClass,
      description: getCategoryDescription(category),
    };
  }, [category]);

  function getCategoryDescription(cat: PlaylistType): string {
    switch (cat) {
      case "featured":
        return "Hand-picked collections showcasing the best gaming experiences";
      case "collection":
        return "Curated game collections organized by themes and interests";
      case "event":
        return "Time-limited playlists for special gaming events and occasions";
      case "genre":
        return "Discover games organized by their genres and gameplay styles";
      case "custom":
        return "Community-created playlists with unique themes and perspectives";
      default:
        return "Explore our diverse collection of gaming playlists";
    }
  }

  const fetchPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedPlaylists = await PlaylistService.getPlaylistsByType(category);
      setPlaylists(fetchedPlaylists);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [category, toast]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const filteredAndSortedPlaylists = useMemo(() => {
    let filtered = playlists;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(playlist =>
        playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(playlist => {
        if (filterBy === "published") return playlist.isPublished;
        if (filterBy === "draft") return !playlist.isPublished;
        return true;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered = [...filtered].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "games_count":
        filtered = [...filtered].sort((a, b) => 
          (b.gameIds?.length || 0) - (a.gameIds?.length || 0)
        );
        break;
      case "popular":
        // For now, sort by games count as proxy for popularity
        filtered = [...filtered].sort((a, b) => 
          (b.gameIds?.length || 0) - (a.gameIds?.length || 0)
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [playlists, searchQuery, filterBy, sortBy]);

  if (!category || !PLAYLIST_TYPE_CONFIG[category]) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Category not found</h1>
          <p className="text-white/60">The playlist category you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/playlists")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse all playlists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-white/60">
            <span>Playlists</span>
            <span>/</span>
            <PlaylistTypeIcon type={category} />
            <span className="capitalize">{category}</span>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                categoryConfig.colorClass
              )}>
                <categoryConfig.icon className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2 flex-1">
                <h1 className="text-4xl font-bold text-white capitalize">
                  {categoryConfig.label} Playlists
                </h1>
                <p className="text-xl text-white/80 leading-relaxed">
                  {categoryConfig.description}
                </p>
                <div className="flex items-center gap-6 text-white/60">
                  <span className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    {filteredAndSortedPlaylists.length} playlist{filteredAndSortedPlaylists.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    {filteredAndSortedPlaylists.reduce((acc, p) => acc + (p.gameIds?.length || 0), 0)} total games
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="games_count">Most Games</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {filterBy !== "all" && (
                    <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setFilterBy("all")}
                  className={cn(filterBy === "all" && "bg-accent")}
                >
                  All Playlists
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterBy("published")}
                  className={cn(filterBy === "published" && "bg-accent")}
                >
                  Published Only
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterBy("draft")}
                  className={cn(filterBy === "draft" && "bg-accent")}
                >
                  Drafts Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="text-white"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="text-white"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-white/5 rounded-lg"></div>
                </div>
              ))}
            </motion.div>
          ) : filteredAndSortedPlaylists.length > 0 ? (
            <motion.div
              key={`${viewMode}-${sortBy}-${filterBy}-${searchQuery}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              )}
            >
              {filteredAndSortedPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {viewMode === "grid" ? (
                    <PlaylistGridCard playlist={playlist} />
                  ) : (
                    <PlaylistListCard playlist={playlist} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No playlists found
              </h3>
              <p className="text-white/60 mb-4">
                {searchQuery 
                  ? `No playlists match your search for "${searchQuery}"`
                  : `No ${category} playlists available yet`
                }
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="text-white/80"
                >
                  Clear search
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Grid Card Component
interface PlaylistCardProps {
  playlist: Playlist;
}

const PlaylistGridCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const [isHovered, setIsHovered] = useState(false);
  const previewGames = playlist.games?.slice(0, 4) || [];

  return (
    <Link href={`/playlists/${playlist.id}`}>
      <Card 
        className="group cursor-pointer overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn("h-2", getTypeColor(playlist.type))} />
        
        {/* Game Preview Section */}
        {previewGames.length > 0 && (
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="absolute inset-0 grid grid-cols-2 gap-1 p-2">
              {previewGames.map((game) => (
                <div key={game.id} className="relative rounded overflow-hidden">
                  <Image
                    src={game.background_image || game.cover_url || '/api/placeholder/400/600'}
                    alt={game.name}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-300",
                      isHovered && "scale-110"
                    )}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <PlaylistTypeIcon type={playlist.type} />
                <PlaylistStatusBadge type={playlist.type} isPublished={playlist.isPublished} />
              </div>
              <h3 className="font-semibold text-white line-clamp-2 mb-1">
                {playlist.title}
              </h3>
              <p className="text-sm text-white/60 line-clamp-2">
                {playlist.description}
              </p>
            </div>
          </div>

          {/* Game thumbnails */}
          {previewGames.length > 0 && (
            <div className="flex items-center gap-3">
              <GameThumbnailStack
                games={previewGames}
                maxVisible={3}
                size="xs"
                showCount={true}
              />
              <span className="text-xs text-white/60">
                {playlist.gameIds?.length || 0} games
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatPlaylistDate(playlist.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {Math.floor(Math.random() * 1000) + 100} views
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// List Card Component
const PlaylistListCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const previewGames = playlist.games?.slice(0, 3) || [];

  return (
    <Link href={`/playlists/${playlist.id}`}>
      <Card className="group cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={cn("w-1 h-16 rounded-full", getTypeColor(playlist.type))} />
            
            {previewGames.length > 0 && (
              <GameThumbnailStack
                games={previewGames}
                maxVisible={3}
                size="sm"
                showCount={false}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <PlaylistTypeIcon type={playlist.type} />
                <h3 className="font-semibold text-white truncate">{playlist.title}</h3>
                <PlaylistStatusBadge type={playlist.type} isPublished={playlist.isPublished} />
              </div>
              <p className="text-sm text-white/60 line-clamp-1 mb-2">
                {playlist.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span>{formatPlaylistDate(playlist.createdAt)}</span>
                <span>{playlist.gameIds?.length || 0} games</span>
                <span>{Math.floor(Math.random() * 1000) + 100} views</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};