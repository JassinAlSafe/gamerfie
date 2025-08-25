import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getHighQualityImageUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/image-utils'
import type { ScreenshotData, VideoData } from '@/types/auth.types'

interface ProcessedMedia {
  screenshots: Array<{
    id: string
    originalUrl: string
    highQualityUrl: string
    thumbnailUrl: string
  }>
  videos: Array<{
    id: string
    name: string
    videoId: string
    embedUrl: string
    thumbnailUrl: string
  }>
}

interface MediaState {
  // Processed media cache
  processedMediaCache: Record<string, ProcessedMedia>
  
  // UI State
  preferredTab: 'screenshots' | 'videos'
  modalState: {
    isOpen: boolean
    currentIndex: number
    gameId: string | null
  }
  videoModalState: {
    isOpen: boolean
    currentVideoUrl: string | null
    gameId: string | null
  }
  
  // Actions
  processGameMedia: (gameId: string, screenshots?: ScreenshotData[], videos?: VideoData[]) => ProcessedMedia
  setPreferredTab: (tab: 'screenshots' | 'videos') => void
  openScreenshotModal: (gameId: string, index: number) => void
  closeScreenshotModal: () => void
  setScreenshotIndex: (index: number) => void
  openVideoModal: (gameId: string, videoUrl: string) => void
  closeVideoModal: () => void
  clearCache: () => void
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      processedMediaCache: {},
      preferredTab: 'screenshots',
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

      processGameMedia: (gameId, screenshots = [], videos = []) => {
        const existing = get().processedMediaCache[gameId]
        if (existing) return existing

        // Process screenshots with caching
        const processedScreenshots = screenshots.map((screenshot, index) => ({
          id: screenshot.id || `screenshot-${index}`,
          originalUrl: screenshot.url,
          highQualityUrl: getHighQualityImageUrl(screenshot.url),
          thumbnailUrl: screenshot.url, // Could add thumbnail optimization here
        }))

        // Process videos with caching
        const processedVideos = videos.map((video, index) => {
          const videoId = video.video_id || video.id || `video-${index}`
          return {
            id: video.id || `video-${index}`,
            name: video.name || `Video ${index + 1}`,
            videoId,
            embedUrl: getYouTubeEmbedUrl(`https://www.youtube.com/watch?v=${videoId}`) || '',
            thumbnailUrl: getYouTubeThumbnail(videoId, 'maxres'),
          }
        })

        const processed: ProcessedMedia = {
          screenshots: processedScreenshots,
          videos: processedVideos,
        }

        // Cache the processed media
        set((state) => ({
          processedMediaCache: {
            ...state.processedMediaCache,
            [gameId]: processed,
          },
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

      clearCache: () => set({ processedMediaCache: {} }),
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