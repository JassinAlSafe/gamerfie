"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaylistService } from "@/services/playlistService";

import { useToast } from "@/components/ui/use-toast";
import { usePlaylistInteractions } from "@/hooks/usePlaylistInteractions";
import { PlaylistHeroModern } from "@/components/playlist/detail/PlaylistHeroModern";
import { PlaylistGamesSection } from "@/components/playlist/detail/PlaylistGamesSection";
import { PlaylistDetailsTab } from "@/components/playlist/detail/PlaylistDetailsTab";
import { PlaylistKeyboardShortcuts } from "@/components/playlist/detail/PlaylistKeyboardShortcuts";
import type { Playlist } from "@/types/playlist";

type ViewMode = "grid" | "list";
type SortOption = "default" | "name" | "rating" | "release" | "popularity";

interface PlaylistStatsData {
  totalGames: number;
  avgRating: number;
  totalPlaytime: number;
  completionRate: number;
  likes: number;
  bookmarks: number;
  views: number;
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { toast } = useToast();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("games");

  // Use the playlist interactions hook
  const {
    isLiked,
    isBookmarked,
    likesCount,
    bookmarksCount,
    handleLike,
    handleBookmark,
    isLoading: interactionsLoading,
  } = usePlaylistInteractions(params.id as string);

  // Mock stats - in real app, these would come from API
  const [stats, setStats] = useState<PlaylistStatsData>({
    totalGames: 0,
    avgRating: 8.5,
    totalPlaytime: 240,
    completionRate: 75,
    likes: 1247,
    bookmarks: 892,
    views: 15420,
  });

  const fetchPlaylist = useCallback(async () => {
    if (!params.id || typeof params.id !== "string") return;

    try {
      setIsLoading(true);
      const fetchedPlaylist = await PlaylistService.getPlaylistById(params.id);
      setPlaylist(fetchedPlaylist);

      // Update stats with actual data
      setStats((prev) => ({
        ...prev,
        totalGames: fetchedPlaylist.games?.length || 0,
        likes: likesCount,
        bookmarks: bookmarksCount,
      }));
    } catch (error) {
      console.error("Failed to fetch playlist:", error);
      toast({
        title: "Error",
        description: "Failed to load playlist details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id, toast, likesCount, bookmarksCount]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist?.title,
          text: playlist?.description,
          url,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Playlist link copied to clipboard",
      });
    }
  }, [playlist, toast]);

  const filteredAndSortedGames = React.useMemo(() => {
    if (!playlist?.games) return [];

    let filtered = playlist.games;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered = [...filtered].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        break;
      case "release":
        filtered = [...filtered].sort((a, b) => {
          const dateA = new Date(a.first_release_date || 0);
          const dateB = new Date(b.first_release_date || 0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "popularity":
        filtered = [...filtered].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [playlist?.games, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/10 rounded w-48"></div>
            <div className="h-80 bg-white/10 rounded"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Playlist not found</h1>
          <p className="text-white/60">
            The playlist you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <PlaylistKeyboardShortcuts
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onToggleView={() =>
          setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
        }
      />
      <div className="space-y-0">
        {/* Header */}
        <div className="container mx-auto px-6 py-6">
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
              <span>{playlist.title}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <PlaylistHeroModern
          playlist={playlist}
          stats={stats}
          isBookmarked={isBookmarked}
          isLiked={isLiked}
          onShare={handleShare}
          onBookmark={handleBookmark}
          onLike={handleLike}
          interactionsLoading={interactionsLoading}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <div className="container mx-auto px-6">
              <TabsList className="grid w-full grid-cols-3 bg-transparent border-0 h-14 p-0">
                <TabsTrigger
                  value="games"
                  className="text-white text-sm font-medium border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white rounded-none"
                >
                  Games ({playlist.games?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-white text-sm font-medium border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white rounded-none"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="similar"
                  className="text-white text-sm font-medium border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white rounded-none"
                >
                  Similar
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="container mx-auto px-6 py-8">
            <TabsContent value="games" className="space-y-6 mt-0">
              <PlaylistGamesSection
                games={filteredAndSortedGames}
                viewMode={viewMode}
                sortBy={sortBy}
                searchQuery={searchQuery}
                onViewModeChange={setViewMode}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-0">
              <PlaylistDetailsTab playlist={playlist} stats={stats} />
            </TabsContent>

            <TabsContent value="similar" className="space-y-6 mt-0">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Similar playlists coming soon
                </h3>
                <p className="text-white/60">
                  We're working on recommendations based on your preferences
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
