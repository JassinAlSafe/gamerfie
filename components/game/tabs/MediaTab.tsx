"use client";

import React, {
  useCallback,
  useMemo,
  lazy,
  Suspense,
  memo,
  useState,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "@/types";
import { useMediaStore } from "@/stores/useMediaStore";
// Import the ScreenshotModal component lazily
const ScreenshotModal = lazy(() =>
  import("@/components/screenshot-modal").then((mod) => ({
    default: mod.ScreenshotModal,
  }))
);
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  Film, 
  Camera, 
  Loader2, 
  Grid3X3, 
  LayoutGrid, 
  SortAsc,
  Filter,
  Maximize,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MediaTabProps {
  game: Game;
}

type ViewMode = 'grid' | 'masonry' | 'compact';
type SortOption = 'default' | 'name' | 'size';

// Loading skeleton component (available for future use)
// const MediaSkeleton = ({ count = 6, aspectRatio = "aspect-video" }: { count?: number, aspectRatio?: string }) => (
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
//     {Array.from({ length: count }).map((_, i) => (
//       <div
//         key={i}
//         className={cn(
//           "rounded-lg bg-gray-800/50 animate-pulse",
//           aspectRatio
//         )}
//       />
//     ))}
//   </div>
// );

// Enhanced screenshot component with preview
const ScreenshotCard = memo(({ 
  screenshot, 
  index, 
  viewMode,
  onScreenshotClick,
  onPreview 
}: {
  screenshot: any;
  index: number;
  viewMode: ViewMode;
  onScreenshotClick: (index: number) => void;
  onPreview?: (screenshot: any) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardStyles = useMemo(() => {
    switch (viewMode) {
      case 'compact':
        return "aspect-video sm:aspect-[4/3]";
      case 'masonry':
        return index % 3 === 0 ? "aspect-[4/3]" : index % 3 === 1 ? "aspect-video" : "aspect-[3/4]";
      default:
        return "aspect-video";
    }
  }, [viewMode, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.05, 0.5),
      }}
      whileHover={{ scale: 1.02, y: -8 }}
      className={cn(
        "relative rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300",
        cardStyles
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onScreenshotClick(index)}
    >
      <Image
        src={screenshot.highQualityUrl}
        alt={`Screenshot ${index + 1}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        loading={index < 6 ? "eager" : "lazy"}
        quality={95}
      />
      
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Action buttons */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="secondary"
            className="bg-black/60 hover:bg-black/80 text-white border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(screenshot);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-black/60 hover:bg-black/80 text-white border-white/20"
          >
            <Maximize className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
      </div>
      
      {/* Image counter */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white text-xs font-medium">{index + 1}</span>
      </div>
      
      {/* Quick preview on hover */}
      {isHovered && onPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg p-2"
        >
          <p className="text-white text-xs">Screenshot {index + 1}</p>
        </motion.div>
      )}
    </motion.div>
  );
});

ScreenshotCard.displayName = 'ScreenshotCard';

// Enhanced video component
const VideoCard = memo(({ 
  video, 
  index,
  onVideoClick 
}: {
  video: any;
  index: number;
  onVideoClick: (videoId: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.05, 0.5),
      }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300"
      onClick={() => onVideoClick(video.videoId)}
    >
      {/* Video Thumbnail */}
      <div className="absolute inset-0 bg-gray-800">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.name || `Video ${index + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading={index < 4 ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-600" />
          </div>
        )}
      </div>

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      {/* Play button with enhanced design */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-20 h-20 rounded-full bg-purple-600/90 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 transition-all duration-300 group-hover:bg-purple-500/90"
        >
          <PlayCircle className="w-12 h-12 text-white ml-1" />
        </motion.div>
      </div>

      {/* Video title with enhanced styling */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
        <p className="text-white text-sm font-semibold truncate mb-1">
          {video.name || `Video ${index + 1}`}
        </p>
        <div className="flex items-center gap-2 text-gray-300 text-xs">
          <PlayCircle className="w-3 h-3" />
          <span>Video</span>
        </div>
      </div>

      {/* Duration badge (if available) */}
      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-md px-2 py-1">
        <span className="text-white text-xs font-medium">HD</span>
      </div>
    </motion.div>
  );
});

VideoCard.displayName = 'VideoCard';

function MediaTabComponent({ game }: MediaTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    processGameMedia,
    preferredTab,
    setPreferredTab,
    modalState,
    videoModalState,
    openScreenshotModal,
    closeScreenshotModal,
    setScreenshotIndex,
    openVideoModal,
    closeVideoModal,
  } = useMediaStore();

  // Process and cache media data
  const processedMedia = useMemo(() => {
    return processGameMedia(game.id, game.screenshots, game.videos);
  }, [game.id, game.screenshots, game.videos, processGameMedia]);

  const hasScreenshots = processedMedia.screenshots.length > 0;
  const hasVideos = processedMedia.videos.length > 0;

  // Sort media based on selected option
  const sortedScreenshots = useMemo(() => {
    const screenshots = [...processedMedia.screenshots];
    switch (sortBy) {
      case 'name':
        return screenshots.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      default:
        return screenshots;
    }
  }, [processedMedia.screenshots, sortBy]);

  // Determine active tab
  const activeTab = useMemo(() => {
    if (preferredTab === 'screenshots' && hasScreenshots) return 'screenshots';
    if (preferredTab === 'videos' && hasVideos) return 'videos';
    if (hasScreenshots) return 'screenshots';
    if (hasVideos) return 'videos';
    return 'screenshots';
  }, [preferredTab, hasScreenshots, hasVideos]);

  // Enhanced tab change handler
  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'screenshots' || tab === 'videos') {
      setPreferredTab(tab);
    }
  }, [setPreferredTab]);

  const handleScreenshotClick = useCallback((index: number) => {
    openScreenshotModal(game.id, index);
  }, [game.id, openScreenshotModal]);

  const handleVideoClick = useCallback((videoId: string) => {
    const video = processedMedia.videos.find(v => v.videoId === videoId);
    if (video && video.embedUrl) {
      openVideoModal(game.id, video.embedUrl);
    }
  }, [game.id, processedMedia.videos, openVideoModal]);

  const handleCloseScreenshotModal = useCallback(() => {
    closeScreenshotModal();
  }, [closeScreenshotModal]);

  const handleVideoDialogChange = useCallback((open: boolean) => {
    if (!open) {
      closeVideoModal();
    }
  }, [closeVideoModal]);

  const handlePreview = useCallback((screenshot: any) => {
    setPreviewImage(screenshot.highQualityUrl);
  }, []);

  // Enhanced grid layout classes
  const getGridClasses = useCallback((type: 'screenshots' | 'videos') => {
    if (type === 'videos') return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
    
    switch (viewMode) {
      case 'compact':
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3";
      case 'masonry':
        return "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6";
    }
  }, [viewMode]);

  // If no media is available
  if (!hasScreenshots && !hasVideos) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/40 to-gray-900/20 rounded-2xl p-12 backdrop-blur-md border border-gray-800/30 shadow-xl"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-700/80 flex items-center justify-center mb-6 shadow-lg">
            <Film className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">No Media Available</h3>
          <p className="text-gray-400 max-w-md leading-relaxed">
            Screenshots and videos for this game aren't available in our database yet.
            Media content may be added as it becomes available.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-gray-900/40 to-gray-900/20 rounded-2xl backdrop-blur-md border border-gray-800/30 shadow-xl overflow-hidden"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Enhanced header with controls */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-800/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">Media Gallery</h2>
              
              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* View mode toggle */}
                {activeTab === 'screenshots' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700 text-gray-300">
                        {viewMode === 'grid' ? <Grid3X3 className="w-4 h-4 mr-2" /> :
                         viewMode === 'masonry' ? <LayoutGrid className="w-4 h-4 mr-2" /> :
                         <LayoutGrid className="w-4 h-4 mr-2" />}
                        View
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700">
                      <DropdownMenuItem onClick={() => setViewMode('grid')} className="text-gray-300">
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Grid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode('masonry')} className="text-gray-300">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Masonry
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode('compact')} className="text-gray-300">
                        <Filter className="w-4 h-4 mr-2" />
                        Compact
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700 text-gray-300">
                      <SortAsc className="w-4 h-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    <DropdownMenuItem onClick={() => setSortBy('default')} className="text-gray-300">
                      Default Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')} className="text-gray-300">
                      By Name
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Enhanced tabs */}
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/30 p-1 rounded-xl">
              <TabsTrigger
                value="screenshots"
                disabled={!hasScreenshots}
                className={cn(
                  "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg",
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200",
                  "text-gray-400 hover:text-gray-200"
                )}
              >
                <Camera className="w-4 h-4" />
                <span className="font-medium">Screenshots</span>
                {hasScreenshots && (
                  <span className="text-xs ml-1 opacity-70 bg-white/10 px-2 py-0.5 rounded-full">
                    {processedMedia.screenshots.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                disabled={!hasVideos}
                className={cn(
                  "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg",
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200",
                  "text-gray-400 hover:text-gray-200"
                )}
              >
                <PlayCircle className="w-4 h-4" />
                <span className="font-medium">Videos</span>
                {hasVideos && (
                  <span className="text-xs ml-1 opacity-70 bg-white/10 px-2 py-0.5 rounded-full">
                    {processedMedia.videos.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Screenshots tab */}
          <TabsContent value="screenshots" className="focus-visible:outline-none">
            {hasScreenshots ? (
              <div className="p-8">
                <div className={getGridClasses('screenshots')}>
                  <AnimatePresence>
                    {sortedScreenshots.map((screenshot, index) => (
                      <ScreenshotCard
                        key={`screenshot-${screenshot.id}-${index}`}
                        screenshot={screenshot}
                        index={index}
                        viewMode={viewMode}
                        onScreenshotClick={handleScreenshotClick}
                        onPreview={handlePreview}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="p-8 py-16 text-center">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No screenshots available</p>
              </div>
            )}
          </TabsContent>

          {/* Videos tab */}
          <TabsContent value="videos" className="focus-visible:outline-none">
            {hasVideos ? (
              <div className="p-8">
                <div className={getGridClasses('videos')}>
                  <AnimatePresence>
                    {processedMedia.videos.map((video, index) => (
                      <VideoCard
                        key={`video-${video.id}-${index}`}
                        video={video}
                        index={index}
                        onVideoClick={handleVideoClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="p-8 py-16 text-center">
                <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No videos available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Screenshot Modal with Suspense */}
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        }
      >
        <ScreenshotModal
          isOpen={modalState.isOpen && modalState.gameId === game.id}
          onClose={handleCloseScreenshotModal}
          screenshots={processedMedia.screenshots.map(s => ({ ...s, id: parseInt(s.id) || 0, url: s.highQualityUrl }))}
          currentIndex={modalState.currentIndex}
          onIndexChange={setScreenshotIndex}
        />
      </Suspense>

      {/* Enhanced Video Dialog */}
      <Dialog open={videoModalState.isOpen && videoModalState.gameId === game.id} onOpenChange={handleVideoDialogChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[900px] bg-gray-900/95 border-gray-700 shadow-2xl">
          <DialogTitle className="text-white text-xl font-bold">{game.name} - Video</DialogTitle>
          <DialogDescription className="sr-only">
            Video player for {game.name}. Press Escape to close.
          </DialogDescription>
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow-xl">
            {videoModalState.currentVideoUrl ? (
              <iframe
                src={videoModalState.currentVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${game.name} video`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[800px] bg-gray-900/95 border-gray-700">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Quick preview of the selected image.
          </DialogDescription>
          {previewImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-contain"
                quality={95}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export const MediaTab = memo(MediaTabComponent);