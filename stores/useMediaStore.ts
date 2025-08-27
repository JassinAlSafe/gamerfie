import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getHighQualityImageUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/image-utils'
import type { 
  MediaStoreState, 
  ProcessedMedia, 
  ProcessedScreenshot, 
  ProcessedVideo,
  RawScreenshotData,
  RawVideoData
} from '@/types/media.types'

// Remove local interface - using types from media.types.ts

// Remove local interface - using MediaStoreState from media.types.ts

export const useMediaStore = create<MediaStoreState>()(
  persist(
    (set, get) => ({
      processedMediaCache: {},
      cacheMetadata: {},
      preferredTab: 'screenshots' as const,
      modalState: {
        isOpen: false,
        currentIndex: 0,
        gameId: null,
      },
      videoModalState: {
        isOpen: false,
        currentVideoUrl: null,
        gameId: null,
      },
      cacheSize: 0,
      maxCacheSize: 50,
      cacheTTL: 1000 * 60 * 60, // 1 hour

      processGameMedia: (gameId: string, screenshots: RawScreenshotData[] = [], videos: RawVideoData[] = []) => {
        const state = get()
        const existing = state.processedMediaCache[gameId]
        
        // Update last accessed time for existing cache
        if (existing) {
          const now = Date.now()
          set((prevState) => ({
            cacheMetadata: {
              ...prevState.cacheMetadata,
              [gameId]: {
                ...prevState.cacheMetadata[gameId],
                lastAccessed: now,
              }
            }
          }))
          return existing
        }
        
        // Check cache size and cleanup if necessary
        if (state.cacheSize >= state.maxCacheSize) {
          get().cleanupOldCache()
        }

        // Process screenshots with caching
        const processedScreenshots: ProcessedScreenshot[] = screenshots.map((screenshot, index) => ({
          id: screenshot.id || `screenshot-${index}`,
          originalUrl: screenshot.url,
          highQualityUrl: getHighQualityImageUrl(screenshot.url),
          thumbnailUrl: screenshot.url, // Could add thumbnail optimization here
          metadata: {
            width: screenshot.width,
            height: screenshot.height,
            alt: `Screenshot ${index + 1}`,
            aspectRatio: screenshot.width && screenshot.height 
              ? `${screenshot.width}/${screenshot.height}`
              : undefined
          }
        }))

        // Process videos with caching
        const processedVideos: ProcessedVideo[] = videos.map((video, index) => {
          // Since IGDB service provides properly structured videos,
          // we should have video_id directly available
          const actualVideoId = video.video_id
          
          // Determine provider from video data or default to youtube
          const provider = (video.provider && ['youtube', 'vimeo', 'twitch'].includes(video.provider)) 
            ? video.provider as 'youtube' | 'vimeo' | 'twitch'
            : 'youtube' as const
          
          // Only proceed if we have a valid video ID
          if (!actualVideoId) {
            console.warn('No valid video ID found for video:', video)
            return {
              id: String(video.id || `video-${index}`),
              name: video.name || `Video ${index + 1}`,
              videoId: String(video.id || `video-${index}`),
              embedUrl: null, // No URL available
              thumbnailUrl: video.thumbnail_url || "/images/placeholders/game-cover.jpg",
              provider,
              duration: video.duration,
              isTrailer: video.name?.toLowerCase().includes('trailer') || false
            }
          }
          
          // Store the original watch URL for SafeVideoEmbed to validate and convert
          const videoUrl = video.url || `https://www.youtube.com/watch?v=${actualVideoId}`
          
          console.log('MediaStore: Processing video:', {
            name: video.name,
            videoId: actualVideoId,
            originalUrl: video.url,
            constructedUrl: videoUrl,
            provider
          });
          
          return {
            id: String(video.id || `video-${index}`),
            name: video.name || `Video ${index + 1}`,
            videoId: actualVideoId,
            embedUrl: videoUrl, // Store original URL, SafeVideoEmbed will handle conversion
            thumbnailUrl: video.thumbnail_url || getYouTubeThumbnail(actualVideoId, 'maxres'),
            provider,
            duration: video.duration,
            isTrailer: video.name?.toLowerCase().includes('trailer') || false
          }
        })

        const processed: ProcessedMedia = {
          screenshots: processedScreenshots,
          videos: processedVideos,
          totalCount: processedScreenshots.length + processedVideos.length,
          hasMedia: processedScreenshots.length > 0 || processedVideos.length > 0
        }

        // Cache the processed media with metadata
        const now = Date.now()
        const mediaSize = processed.screenshots.length + processed.videos.length
        
        set((state) => ({
          processedMediaCache: {
            ...state.processedMediaCache,
            [gameId]: processed,
          },
          cacheMetadata: {
            ...state.cacheMetadata,
            [gameId]: {
              timestamp: now,
              lastAccessed: now,
              size: mediaSize,
            }
          },
          cacheSize: state.cacheSize + 1,
        }))

        return processed
      },

      setPreferredTab: (tab) => set({ preferredTab: tab }),

      openScreenshotModal: (gameId, index) =>
        set({
          modalState: {
            isOpen: true,
            currentIndex: index,
            gameId,
          },
        }),

      closeScreenshotModal: () =>
        set({
          modalState: {
            isOpen: false,
            currentIndex: 0,
            gameId: null,
          },
        }),

      setScreenshotIndex: (index) =>
        set((state) => ({
          modalState: {
            ...state.modalState,
            currentIndex: index,
          },
        })),

      openVideoModal: (gameId, videoUrl) =>
        set({
          videoModalState: {
            isOpen: true,
            currentVideoUrl: videoUrl,
            gameId,
          },
        }),

      closeVideoModal: () =>
        set({
          videoModalState: {
            isOpen: false,
            currentVideoUrl: null,
            gameId: null,
          },
        }),

      clearCache: () => set({ processedMediaCache: {}, cacheMetadata: {}, cacheSize: 0 }),
      
      cleanupOldCache: () => {
        const state = get()
        const now = Date.now()
        const entries = Object.entries(state.processedMediaCache)
        
        // Sort by last accessed time (oldest first)
        const sortedEntries = entries
          .map(([key, value]) => ({
            key,
            value,
            metadata: state.cacheMetadata[key],
          }))
          .filter(entry => entry.metadata) // Only keep entries with metadata
          .sort((a, b) => a.metadata!.lastAccessed - b.metadata!.lastAccessed)
        
        // Keep only the most recently accessed entries within TTL
        const maxKeepSize = Math.floor(state.maxCacheSize * 0.75) // Keep 75% of max size
        const validEntries = sortedEntries.filter(
          entry => (now - entry.metadata!.lastAccessed) < state.cacheTTL
        )
        
        // Take the most recent entries up to maxKeepSize
        const keepEntries = validEntries.slice(-maxKeepSize)
        
        const newCache: Record<string, ProcessedMedia> = {}
        const newMetadata: Record<string, { timestamp: number; lastAccessed: number; size: number }> = {}
        
        keepEntries.forEach(({ key, value, metadata }) => {
          newCache[key] = value
          newMetadata[key] = metadata!
        })
        
        console.log(`Cache cleanup: ${entries.length} -> ${Object.keys(newCache).length} entries`)
        
        set({ 
          processedMediaCache: newCache, 
          cacheMetadata: newMetadata,
          cacheSize: Object.keys(newCache).length 
        })
      },
    }),
    {
      name: 'media-store',
      partialize: (state) => ({
        preferredTab: state.preferredTab,
        // Don't persist modal states or cache (too much data)
      }),
    }
  )
)