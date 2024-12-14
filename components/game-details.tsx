"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import { Star, ExternalLink, Calendar, Gamepad2, Users, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { ScreenshotModal } from "@/components/screenshot-modal";
import BackButton from "@/app/game/[id]/BackButton";
import { Game } from "@/types/game";
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from "@/components/loadingSpinner";
import { cn } from "@/lib/utils";
import { CompletionDialog } from '@/components/game/completion-dialog';

const getHighQualityImageUrl = (url: string) => {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_1080p/")}`
    : url.replace("/t_thumb/", "/t_1080p/");
};

const getCoverImageUrl = (url: string) => {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_cover_big/")}`
    : url.replace("/t_thumb/", "/t_cover_big/");
};

const getWebsiteUrl = (game: Game) => {
  if (game.websites && game.websites.length > 0) {
    const officialSite = game.websites.find((site) => site.category === 1);
    return officialSite ? officialSite.url : game.websites[0].url;
  }
  return null;
};

const getBackgroundImage = (game: Game) => {
  if (game.artworks && game.artworks.length > 0) {
    return getHighQualityImageUrl(game.artworks[0].url);
  }
  if (game.screenshots && game.screenshots.length > 0) {
    return getHighQualityImageUrl(game.screenshots[0].url);
  }
  return null;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
};

export const GameDetails = memo(function GameDetails({ game }: { game: Game }) {
  const { user } = useAuthStore();
  const { games, addGame, removeGame } = useLibraryStore();
  const { toast } = useToast();
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const websiteUrl = getWebsiteUrl(game);
  const backgroundImage = getBackgroundImage(game);

  const isInLibrary = games.some(g => g.id === game.id);

  const handleLibraryAction = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your library",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToLibrary(true);
    try {
      if (isInLibrary) {
        await removeGame(game.id);
        toast({
          title: "Game Removed",
          description: `${game.name} has been removed from your library`,
        });
      } else {
        await addGame(game);
        toast({
          title: "Game Added",
          description: `${game.name} has been added to your library`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update library",
        variant: "destructive",
      });
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  const handleScreenshotClick = (index: number) => {
    setCurrentScreenshotIndex(index);
    setIsScreenshotModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header Spacer */}
      <div className="h-16" />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />

        {/* Hero Content */}
        <div className="relative z-30 h-full container mx-auto px-4">
          {/* Back Button */}
          <div className="pt-8">
            <BackButton />
          </div>

          {/* Game Info Container */}
          <div className="absolute bottom-0 left-4 right-4 pb-32">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Cover Image */}
              <div className="md:w-1/4 flex-shrink-0">
                {game.cover && (
                  <div className="relative w-48 h-64 md:w-56 md:h-72 rounded-lg overflow-hidden shadow-2xl">
                    <Image
                      src={getCoverImageUrl(game.cover.url)}
                      alt={game.name}
                      fill
                      priority
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* Game Details */}
              <div className="md:w-3/4 pb-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                  {game.name}
                </h1>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {game.total_rating && (
                    <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                      <Star className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-2xl font-bold">{game.total_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-lg">
                      {game.first_release_date
                        ? formatDate(game.first_release_date)
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-lg text-gray-300 leading-relaxed mb-8 line-clamp-3">
                  {game.summary}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleLibraryAction}
                    disabled={isAddingToLibrary}
                    className={cn(
                      "flex items-center space-x-2",
                      isInLibrary ? "bg-red-500/20 hover:bg-red-500/30" : "bg-green-500/20 hover:bg-green-500/30"
                    )}
                  >
                    {isAddingToLibrary ? (
                      <LoadingSpinner className="w-4 h-4" />
                    ) : (
                      <Heart className={cn("w-4 h-4", isInLibrary && "fill-current")} />
                    )}
                    <span>{isInLibrary ? "Remove from Library" : "Add to Library"}</span>
                  </Button>
                  {websiteUrl && (
                    <Button variant="outline" size="lg" className="group" asChild>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsCompletionDialogOpen(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Update Progress</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="flex-grow w-full">
        {/* Info Cards Section */}
        <div className="relative z-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-24">
              {/* Genres Card */}
              <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-purple-400" />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres?.map((genre) => (
                    <Badge 
                      key={genre.id}
                      variant="secondary"
                      className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-3 py-1"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platforms Card */}
              <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-blue-400" />
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms?.map((platform) => (
                    <Badge
                      key={platform.id}
                      variant="outline"
                      className="hover:bg-white/10 px-3 py-1"
                    >
                      {platform.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Companies Card */}
              <div className="bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Development
                </h3>
                <div className="space-y-2">
                  {game.involved_companies?.map((company) => (
                    <div key={company.id} className="text-sm">
                      <span className="text-white font-medium">{company.company.name}</span>
                      <span className="text-gray-400 ml-2">
                        {company.developer && company.publisher ? "(Dev & Pub)" : 
                         company.developer ? "(Developer)" : "(Publisher)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-gray-950 mt-24 w-full pb-24">
          <div className="max-w-7xl mx-auto px-4">
            {/* About Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">About</h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                {game.summary}
              </p>
            </div>

            <Separator className="my-16 bg-gray-800" />

            {/* Screenshots */}
            {game.screenshots && game.screenshots.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {game.screenshots.map((screenshot, index) => (
                  <div 
                    key={screenshot.id}
                    className="cursor-pointer relative aspect-video"
                    onClick={() => handleScreenshotClick(index)}
                  >
                    <Image
                      src={getHighQualityImageUrl(screenshot.url)}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-16 bg-gray-800" />

            {/* Similar Games */}
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-lg bg-white/5 animate-pulse w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      <ScreenshotModal
        screenshots={game.screenshots?.map(screenshot => ({
          id: screenshot.id,
          url: getHighQualityImageUrl(screenshot.url)
        })) || []}
        currentIndex={currentScreenshotIndex}
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        onNext={() => setCurrentScreenshotIndex((prev) => 
          Math.min(prev + 1, (game.screenshots?.length || 1) - 1)
        )}
        onPrevious={() => setCurrentScreenshotIndex((prev) => 
          Math.max(prev - 1, 0)
        )}
      />

      <CompletionDialog
        game={game}
        isOpen={isCompletionDialogOpen}
        onClose={() => setIsCompletionDialogOpen(false)}
      />
    </div>
  );
}); 