"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Game, GameProgress } from "@/types/game";
import { Profile } from "@/types/profile";
import { BackButton } from "@/components/BackButton";
import { GameCover } from "./GameCover";
import { GameQuickStats } from "./GameQuickStats";
import { getHighQualityImageUrl } from "@/utils/image-utils";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { UpdateProgressButton } from "@/components/update-progress-button";
import { ArrowLeft, Star, Calendar, Users, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface GameHeroProps {
  game: Game;
  profile?: Profile | null;
  progress?: Partial<GameProgress>;
}

export function GameHero({ game, profile, progress }: GameHeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shouldRenderTrailer, setShouldRenderTrailer] = useState(false);

  // Get the background image URL, using cover as fallback if no background image
  const backgroundImage = useMemo(
    () => game.background_image || game.cover_url || game.coverImage,
    [game.background_image, game.cover_url, game.coverImage]
  );

  // Check if game has a trailer
  const hasTrailer = useMemo(
    () => game.videos && game.videos.length > 0,
    [game.videos]
  );

  const trailerUrl = useMemo(
    () => (hasTrailer ? game.videos?.[0]?.url : null),
    [hasTrailer, game.videos]
  );

  // If it's a YouTube URL, convert it to an embed URL
  const getEmbedUrl = useCallback((url: string) => {
    if (!url) return null;

    // YouTube URL pattern
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }

    return url;
  }, []);

  const embedUrl = useMemo(
    () => (trailerUrl ? getEmbedUrl(trailerUrl) : null),
    [trailerUrl, getEmbedUrl]
  );

  React.useEffect(() => {
    setMounted(true);

    // Preload the background image
    if (backgroundImage) {
      const img = new Image();
      img.src = getHighQualityImageUrl(backgroundImage);
      img.onload = () => setBackgroundLoaded(true);
    }

    return () => setMounted(false);
  }, [backgroundImage]);

  // Format platforms for display
  const platformNames = useMemo(
    () => game.platforms?.map((p) => p.name).join(", ") || "",
    [game.platforms]
  );

  // Format genres for display
  const genreNames = useMemo(
    () => game.genres?.map((g) => g.name).join(", ") || "",
    [game.genres]
  );

  // Get release year
  const releaseYear = useMemo(
    () =>
      game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null,
    [game.first_release_date]
  );

  const handleTrailerDialogChange = useCallback((open: boolean) => {
    setTrailerOpen(open);
    if (open) {
      setShouldRenderTrailer(true);
    } else {
      // Delay unsetting the trailer to allow for exit animations
      setTimeout(() => {
        setShouldRenderTrailer(false);
      }, 300);
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  // Memoize the background style to prevent unnecessary recalculations
  const backgroundStyle = useMemo(
    () => ({
      backgroundImage: backgroundImage
        ? `url(${getHighQualityImageUrl(backgroundImage)})`
        : "none",
    }),
    [backgroundImage]
  );

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden">
      {/* Background Image with Parallax */}
      {backgroundImage && mounted && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-fixed transform scale-105 filter blur-[2px] transition-opacity duration-500 ${
            backgroundLoaded ? "opacity-70" : "opacity-0"
          }`}
          style={backgroundStyle}
          aria-hidden="true"
        />
      )}

      {/* Background Overlay with Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-gray-950/70 to-gray-950/90">
        <div
          className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"
          aria-hidden="true"
        />
      </div>

      {/* Hero Content - Improved centering */}
      <div className="relative z-30 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {/* Back Button */}
        <div className="pt-8">
          <Link href="/all-games">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-800/70 text-gray-400 hover:text-white"
              aria-label="Back to All Games"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Game Info Container - Improved centering */}
        <div className="flex-grow flex items-end pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start w-full max-w-6xl mx-auto"
          >
            {/* Game Cover - Fixed width for better alignment */}
            <div className="w-full md:w-64 lg:w-80 flex-shrink-0">
              <GameCover game={game} onLoad={handleImageLoad} />
            </div>

            {/* Game Details */}
            <div className="w-full md:flex-1 text-center md:text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-3"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  {game.name}
                </h1>

                {/* Game metadata badges - Improved alignment */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  {releaseYear && (
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        className="h-4 w-4 text-purple-400"
                        aria-hidden="true"
                      />
                      <span>{releaseYear}</span>
                    </div>
                  )}

                  {game.rating && (
                    <div className="flex items-center gap-1.5">
                      <Star
                        className="h-4 w-4 text-yellow-500 fill-yellow-500"
                        aria-hidden="true"
                      />
                      <span>
                        {typeof game.rating === "number"
                          ? game.rating.toFixed(1)
                          : game.rating}
                      </span>
                    </div>
                  )}

                  {platformNames && (
                    <div className="flex items-center gap-1.5">
                      <Users
                        className="h-4 w-4 text-blue-400"
                        aria-hidden="true"
                      />
                      <span className="truncate max-w-[200px]">
                        {platformNames}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              <GameQuickStats game={game} progress={progress} />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-gray-300/90 leading-relaxed line-clamp-3 max-w-3xl"
              >
                {game.summary}
              </motion.p>

              {/* Genre tags - Improved spacing and alignment */}
              {genreNames && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {game.genres?.map((genre) => (
                    <span
                      key={`genre-${genre.id}`}
                      className="px-3 py-1 bg-gray-800/70 text-gray-300 text-sm rounded-full border border-gray-700/50"
                    >
                      {genre.name}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Action buttons - Improved alignment and spacing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap items-center gap-4 pt-4"
              >
                <AddToLibraryButton
                  gameId={game.id}
                  gameName={game.name}
                  cover={game.cover_url || game.coverImage}
                  rating={game.rating}
                  releaseDate={game.first_release_date}
                  platforms={game.platforms}
                  genres={game.genres}
                  summary={game.summary}
                />
                <UpdateProgressButton
                  gameId={game.id}
                  gameName={game.name}
                  game={game}
                  progress={progress}
                />

                {/* Trailer Button */}
                {hasTrailer && embedUrl && (
                  <Dialog
                    open={trailerOpen}
                    onOpenChange={handleTrailerDialogChange}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "min-w-[140px] h-10 transition-all duration-200 font-medium",
                          "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700",
                          "border-none text-white shadow-md hover:shadow-lg",
                          "relative overflow-hidden group"
                        )}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span className="relative z-10">Watch Trailer</span>
                        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-gray-900/95 border-gray-800">
                      <DialogTitle className="text-white">
                        {game.name} - Official Trailer
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Watch the official trailer for {game.name}. Press Escape
                        to close.
                      </DialogDescription>
                      <div className="aspect-video w-full overflow-hidden rounded-md">
                        {embedUrl && shouldRenderTrailer ? (
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`${game.name} trailer`}
                            loading="lazy"
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
