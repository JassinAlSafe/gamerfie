"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "@/types/game";
// Import the ScreenshotModal component lazily
const ScreenshotModal = lazy(() =>
  import("@/components/screenshot-modal").then((mod) => ({
    default: mod.ScreenshotModal,
  }))
);
import {
  getHighQualityImageUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from "@/utils/image-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, PlayCircle, Film, Camera, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaTabProps {
  game: Game;
}

export function MediaTab({ game }: MediaTabProps) {
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("screenshots");
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  const gameScreenshots = (game as any).screenshots;
  const gameVideos = game.videos;

  const hasScreenshots = useMemo(
    () => gameScreenshots && gameScreenshots.length > 0,
    [gameScreenshots]
  );

  const hasVideos = useMemo(
    () => gameVideos && gameVideos.length > 0,
    [gameVideos]
  );

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // If there are no screenshots but there are videos, default to videos tab
  useEffect(() => {
    if (!hasScreenshots && hasVideos) {
      setActiveTab("videos");
    }
  }, [hasScreenshots, hasVideos]);

  const handleScreenshotClick = useCallback((index: number) => {
    setCurrentScreenshotIndex(index);
    setIsScreenshotModalOpen(true);
  }, []);

  const handleVideoClick = useCallback((videoId: string) => {
    // Convert video ID to embed URL
    const embedUrl = getYouTubeEmbedUrl(
      `https://www.youtube.com/watch?v=${videoId}`
    );
    setCurrentVideoUrl(embedUrl);
    setVideoDialogOpen(true);
  }, []);

  const handleCloseScreenshotModal = useCallback(() => {
    setIsScreenshotModalOpen(false);
  }, []);

  const handleVideoDialogChange = useCallback((open: boolean) => {
    setVideoDialogOpen(open);
    // If closing the dialog, delay unsetting the video URL to allow for exit animations
    if (!open) {
      setTimeout(() => {
        setCurrentVideoUrl(null);
        setShouldRenderVideo(false);
      }, 300);
    } else {
      // If opening, set the flag to render the video
      setShouldRenderVideo(true);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-900/40 rounded-xl p-8 backdrop-blur-md transition-all duration-300 border border-gray-800/30 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400 text-center">Loading media...</p>
        </div>
      </div>
    );
  }

  // If no media is available
  if (!hasScreenshots && !hasVideos) {
    return (
      <div className="bg-gray-900/40 rounded-xl p-8 backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 text-center text-lg">
            No media available for this game
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/40 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-gray-900/50 border border-gray-800/30 shadow-lg overflow-hidden"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-6 pb-2">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
              <TabsTrigger
                value="screenshots"
                disabled={!hasScreenshots}
                className={cn(
                  "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400",
                  "flex items-center justify-center gap-2 py-2.5"
                )}
              >
                <Camera className="w-4 h-4" />
                Screenshots{" "}
                {hasScreenshots && (
                  <span className="text-xs ml-1 opacity-70">
                    ({(game as any).screenshots?.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                disabled={!hasVideos}
                className={cn(
                  "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400",
                  "flex items-center justify-center gap-2 py-2.5"
                )}
              >
                <PlayCircle className="w-4 h-4" />
                Videos{" "}
                {hasVideos && (
                  <span className="text-xs ml-1 opacity-70">
                    ({game.videos?.length})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="screenshots"
            className="focus-visible:outline-none"
          >
            {hasScreenshots ? (
              <div className="p-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  <AnimatePresence>
                    {(game as any).screenshots.map(
                      (screenshot: any, index: number) => (
                        <motion.div
                          key={`screenshot-${screenshot.id}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{
                            duration: 0.3,
                            delay: Math.min(index * 0.05, 0.5),
                          }}
                          whileHover={{ scale: 1.03, y: -5 }}
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group shadow-md"
                          onClick={() => handleScreenshotClick(index)}
                        >
                          <Image
                            src={getHighQualityImageUrl(screenshot.url)}
                            alt={`Screenshot ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            loading={index < 4 ? "eager" : "lazy"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-3 left-3 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="p-6 pt-2">
                <p className="text-gray-400 text-center py-12">
                  No screenshots available
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="focus-visible:outline-none">
            {hasVideos ? (
              <div className="p-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  <AnimatePresence>
                    {game.videos?.map((video, index) => (
                      <motion.div
                        key={`video-${video.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(index * 0.05, 0.5),
                        }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group shadow-md"
                        onClick={() => handleVideoClick(video.video_id)}
                      >
                        {/* Video Thumbnail */}
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          {video.video_id ? (
                            <Image
                              src={getYouTubeThumbnail(video.video_id)}
                              alt={video.name || `Video ${index + 1}`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              loading={index < 4 ? "eager" : "lazy"}
                            />
                          ) : (
                            <Film className="w-12 h-12 text-gray-600" />
                          )}
                        </div>

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-purple-600/80 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <PlayCircle className="w-10 h-10 text-white" />
                          </div>
                        </div>

                        {/* Video title */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-white text-sm font-medium truncate">
                            {video.name || `Video ${index + 1}`}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="p-6 pt-2">
                <p className="text-gray-400 text-center py-12">
                  No videos available
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Screenshot Modal - Lazy loaded */}
      {isScreenshotModalOpen && (
        <Suspense fallback={null}>
          <ScreenshotModal
            isOpen={isScreenshotModalOpen}
            onClose={handleCloseScreenshotModal}
            screenshots={(game as any).screenshots || []}
            currentIndex={currentScreenshotIndex}
            onIndexChange={setCurrentScreenshotIndex}
          />
        </Suspense>
      )}

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={handleVideoDialogChange}>
        <DialogContent className="sm:max-w-[900px] bg-gray-900/95 border-gray-800">
          <DialogTitle className="text-white">{game.name} - Video</DialogTitle>
          <DialogDescription className="sr-only">
            Video player for {game.name}. Press Escape to close.
          </DialogDescription>
          <div className="aspect-video w-full overflow-hidden rounded-md">
            {currentVideoUrl && shouldRenderVideo && (
              <iframe
                src={currentVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${game.name} video`}
                loading="lazy"
              ></iframe>
            )}
            {currentVideoUrl && !shouldRenderVideo && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
