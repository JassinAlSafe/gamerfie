"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Game } from "@/types";
import { Profile } from "@/types/profile";

interface GameProgress {
  playTime: number;
  completionPercentage?: number;
  achievementsCompleted?: number;
  lastPlayedAt?: string;
  userRating?: number;
  notes?: string;
}
import { GameCover } from "./GameCover";
import { GameQuickStats } from "./GameQuickStats";
import { getOptimizedImageUrl } from "@/utils/image-utils";
import Image from "next/image";
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
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameHeroProps {
  // Use any for the game prop and handle type checking internally
  game: any;
  profile?: Profile | null;
  progress?: Partial<GameProgress>;
}

export const GameHero = memo(function GameHero({ game, profile: _profile, progress }: GameHeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shouldRenderTrailer, setShouldRenderTrailer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Process the game object to ensure it has the correct structure
  const processedGame: Game = useMemo(() => ({
    ...game,
    // Ensure cover is an object with id and url properties
    cover:
      typeof game.cover === "string"
        ? { id: "placeholder", url: game.cover }
        : game.cover,
    // Ensure videos have the url property
    videos: game.videos?.map((video: any) => ({
      id: video.id,
      name: video.name || "",
      url:
        video.url || `https://www.youtube.com/watch?v=${video.video_id || ""}`,
      thumbnail_url: video.thumbnail_url,
      video_id: video.video_id,
      provider: video.provider || "youtube",
    })),
  } as Game), [game]);

  // Get the background image URL with proper fallbacks and debugging
  const backgroundImage = useMemo(() => {
    const bg = (processedGame as any).background_image;
    const coverUrl = (processedGame as any).cover_url;
    const coverImage = (processedGame as any).coverImage;
    const coverObj = processedGame.cover;
    const artworks = (processedGame as any).artworks;
    const screenshots = (processedGame as any).screenshots;
    
    // Debug log to see what we have (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Background image sources:', {
        background_image: bg,
        cover_url: coverUrl,
        coverImage: coverImage,
        cover: coverObj,
        artworks: artworks?.length || 0,
        screenshots: screenshots?.length || 0
      });
    }
    
    // Priority: background_image > artworks > screenshots > cover_url > coverImage > cover.url
    let finalImage = null;
    
    if (bg) {
      finalImage = bg;
    } else if (artworks && artworks.length > 0) {
      finalImage = artworks[0].url;
    } else if (screenshots && screenshots.length > 0) {
      finalImage = screenshots[0].url;
    } else if (coverUrl) {
      finalImage = coverUrl;
    } else if (coverImage) {
      finalImage = coverImage;
    } else if (coverObj?.url) {
      finalImage = coverObj.url;
    }
    
    
    return finalImage;
  }, [processedGame]);

  // Check if game has a trailer
  const hasTrailer = useMemo(
    () => processedGame.videos && processedGame.videos.length > 0,
    [processedGame.videos]
  );

  const trailerUrl = useMemo(() => {
    if (!hasTrailer || !processedGame.videos?.length) return null;
    
    // Prioritize videos that are likely to be main trailers
    const trailerKeywords = ['trailer', 'launch', 'official', 'announcement', 'reveal', 'cinematic'];
    
    // First try to find a video with "trailer" in the name
    let selectedVideo = processedGame.videos.find((video: any) => 
      trailerKeywords.some(keyword => 
        video.name?.toLowerCase().includes(keyword)
      )
    );
    
    // If no trailer found, use the first video
    if (!selectedVideo) {
      selectedVideo = processedGame.videos[0];
    }
    
    const video = selectedVideo as any;
    
    // Check if we already have a full URL
    if (video.url && video.url.includes('youtube.com')) {
      return video.url;
    }
    
    // If we have a video_id, construct the URL
    if (video.video_id) {
      return `https://www.youtube.com/watch?v=${video.video_id}`;
    }
    
    // Fallback to url if it exists
    return video.url || null;
  }, [hasTrailer, processedGame.videos]);

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
    return () => setMounted(false);
  }, []);

  // Format platforms for display
  const platformNames = useMemo(
    () => processedGame.platforms?.map((p) => p.name).join(", ") || "",
    [processedGame.platforms]
  );

  // Format genres for display
  const genreNames = useMemo(
    () => processedGame.genres?.map((g) => g.name).join(", ") || "",
    [processedGame.genres]
  );

  // Get release year
  const releaseYear = useMemo(
    () =>
      processedGame.first_release_date
        ? new Date(processedGame.first_release_date * 1000).getFullYear()
        : null,
    [processedGame.first_release_date]
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

  // Memoize the optimized background URL
  const optimizedBackgroundUrl = useMemo(
    () => backgroundImage ? getOptimizedImageUrl(backgroundImage, 'background') : null,
    [backgroundImage]
  );

  // Initialize component state
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden">
      {/* Background Image with better loading states */}
      <div className="absolute inset-0 w-full h-full">
        {/* Always show fallback gradient first */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-gray-950" />
        
        {/* Show background image if available */}
        {backgroundImage && mounted && (
          <>
            <Image
              src={optimizedBackgroundUrl || backgroundImage}
              alt={`${processedGame.name} background`}
              fill
              priority={true}
              sizes="100vw"
              className={cn(
                "object-cover transition-all duration-1000",
                backgroundLoaded 
                  ? "opacity-40 scale-100" 
                  : "opacity-0 scale-110"
              )}
              onLoad={() => {
                setBackgroundLoaded(true);
              }}
              onError={() => {
                setBackgroundLoaded(false);
              }}
              unoptimized={backgroundImage.includes('rawg.io')}
            />
            
            {/* Loading state for background */}
            {!backgroundLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-gray-950 animate-pulse" />
            )}
          </>
        )}
      </div>

      {/* Background Overlay with Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-gray-950/70 to-gray-950/90">
        <div
          className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"
          aria-hidden="true"
        />
      </div>

      {/* Hero Content - Improved centering */}
      <div className="relative z-30 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {/* Enhanced Back Button with Better Visibility and Spacing */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pt-6 pb-12 md:pt-8 md:pb-16"
        >
          <Link href="/all-games">
            <Button
              variant="ghost"
              className="group flex items-center gap-3 px-6 py-3.5 bg-black/70 backdrop-blur-md border border-gray-600/40 rounded-xl hover:bg-black/80 hover:border-purple-400/60 text-white hover:text-purple-300 transition-all duration-300 shadow-xl hover:shadow-purple-500/25 font-medium text-sm hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Back to All Games"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Back to Games</span>
            </Button>
          </Link>
        </motion.div>

        {/* Game Info Container - Enhanced layout and spacing */}
        <div className="flex-grow flex items-center md:items-end pb-16 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start w-full max-w-7xl mx-auto"
          >
            {/* Game Cover - Enhanced sizing and spacing */}
            <div className="flex justify-center md:justify-start w-full md:w-auto flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <GameCover game={processedGame} />
              </motion.div>
            </div>

            {/* Game Details - Enhanced typography and spacing */}
            <div className="w-full md:flex-1 text-center md:text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-lg px-4 md:px-0">
                  {processedGame.name}
                </h1>

                {/* Game metadata badges - Enhanced design */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-5 text-sm px-4 md:px-0">
                  {releaseYear && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 rounded-full backdrop-blur-sm border border-gray-700/30">
                      <Calendar
                        className="h-4 w-4 text-purple-400"
                        aria-hidden="true"
                      />
                      <span className="text-gray-200 font-medium">{releaseYear}</span>
                    </div>
                  )}

                  {processedGame.rating && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 rounded-full backdrop-blur-sm border border-gray-700/30">
                      <Star
                        className="h-4 w-4 text-yellow-500 fill-yellow-500"
                        aria-hidden="true"
                      />
                      <span className="text-gray-200 font-medium">
                        {typeof processedGame.rating === "number"
                          ? processedGame.rating.toFixed(1)
                          : processedGame.rating}
                      </span>
                    </div>
                  )}

                  {platformNames && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 rounded-full backdrop-blur-sm border border-gray-700/30">
                      <Users
                        className="h-4 w-4 text-blue-400"
                        aria-hidden="true"
                      />
                      <span className="text-gray-200 font-medium truncate max-w-[200px]">
                        {platformNames}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="px-4 md:px-0">
                <GameQuickStats game={processedGame} progress={progress} />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-gray-300/90 leading-relaxed line-clamp-4 max-w-4xl drop-shadow-sm px-4 md:px-0"
              >
                {(processedGame as any).summary}
              </motion.p>

              {/* Genre tags - Improved spacing and alignment */}
              {genreNames && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 px-4 md:px-0"
                >
                  {processedGame.genres?.map((genre) => (
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
                className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4 px-4 md:px-0"
              >
                <AddToLibraryButton
                  key={`library-${refreshKey}`}
                  gameId={processedGame.id}
                  gameName={processedGame.name}
                  cover={(processedGame as any).cover_url || (processedGame as any).coverImage}
                  rating={processedGame.rating}
                  releaseDate={(processedGame as any).first_release_date}
                  platforms={processedGame.platforms}
                  genres={processedGame.genres}
                  summary={(processedGame as any).summary}
                  onSuccess={() => {
                    // Trigger re-render of both buttons
                    setRefreshKey(prev => prev + 1);
                  }}
                />
                <UpdateProgressButton
                  key={`progress-${refreshKey}`}
                  gameId={processedGame.id}
                  gameName={processedGame.name}
                  game={processedGame}
                  progress={progress}
                  onSuccess={() => {
                    // Trigger re-render of both buttons when progress updates
                    setRefreshKey(prev => prev + 1);
                  }}
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
                        {processedGame.name} - Official Trailer
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Watch the official trailer for {processedGame.name}.
                        Press Escape to close.
                      </DialogDescription>
                      <div className="aspect-video w-full overflow-hidden rounded-md">
                        {embedUrl && shouldRenderTrailer ? (
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`${processedGame.name} trailer`}
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
});
