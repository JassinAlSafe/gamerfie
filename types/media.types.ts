/**
 * Media Types - Comprehensive type definitions for media components
 * Created to replace 'any' types and improve type safety
 */

// Base media types
export type ViewMode = 'grid' | 'masonry' | 'compact';
export type SortOption = 'default' | 'name' | 'size' | 'date';
export type MediaProvider = 'youtube' | 'vimeo' | 'twitch';

// Raw screenshot data (from API)
export interface RawScreenshotData {
  id: string;
  url: string;
  image_id?: string;
  width?: number;
  height?: number;
}

// Raw video data (from API) 
export interface RawVideoData {
  id: string;
  name: string;
  video_id: string;
  url: string;
  thumbnail_url?: string;
  provider: MediaProvider;
  duration?: number;
}

// Processed screenshot data (after transformation)
export interface ProcessedScreenshot {
  id: string;
  originalUrl: string;
  highQualityUrl: string;
  thumbnailUrl: string;
  metadata?: {
    width?: number;
    height?: number;
    alt?: string;
    aspectRatio?: string;
  };
}

// Processed video data (after transformation)
export interface ProcessedVideo {
  id: string;
  name: string;
  videoId: string;
  embedUrl: string | null;
  thumbnailUrl: string;
  provider: MediaProvider;
  duration?: number;
  isTrailer?: boolean;
}

// Processed media collection
export interface ProcessedMedia {
  screenshots: ProcessedScreenshot[];
  videos: ProcessedVideo[];
  totalCount: number;
  hasMedia: boolean;
}

// Media modal states
export interface ScreenshotModalState {
  isOpen: boolean;
  currentIndex: number;
  gameId: string | null;
}

export interface VideoModalState {
  isOpen: boolean;
  currentVideoUrl: string | null;
  gameId: string | null;
  currentVideoId?: string;
}

// Media store state interface
export interface MediaStoreState {
  // Processed media cache
  processedMediaCache: Record<string, ProcessedMedia>;
  cacheMetadata: Record<string, {
    timestamp: number;
    lastAccessed: number;
    size: number;
  }>;
  
  // UI State
  preferredTab: 'screenshots' | 'videos';
  modalState: ScreenshotModalState;
  videoModalState: VideoModalState;
  
  // Configuration
  cacheSize: number;
  maxCacheSize: number;
  cacheTTL: number;
  
  // Actions
  processGameMedia: (gameId: string, screenshots?: RawScreenshotData[], videos?: RawVideoData[]) => ProcessedMedia;
  setPreferredTab: (tab: 'screenshots' | 'videos') => void;
  openScreenshotModal: (gameId: string, index: number) => void;
  closeScreenshotModal: () => void;
  setScreenshotIndex: (index: number) => void;
  openVideoModal: (gameId: string, videoUrl: string) => void;
  closeVideoModal: () => void;
  clearCache: () => void;
  cleanupOldCache: () => void;
}

// Component prop interfaces
export interface MediaTabProps {
  game: GameWithMedia;
}

export interface GameWithMedia {
  id: string;
  name: string;
  screenshots?: RawScreenshotData[];
  videos?: RawVideoData[];
  [key: string]: unknown; // Allow other game properties
}

export interface ScreenshotCardProps {
  screenshot: ProcessedScreenshot;
  index: number;
  viewMode: ViewMode;
  totalCount: number;
  onScreenshotClick: (index: number) => void;
  onPreview?: (screenshot: ProcessedScreenshot) => void;
}

export interface VideoCardProps {
  video: ProcessedVideo;
  index: number;
  totalCount: number;
  onVideoClick: (videoId: string) => void;
}

// Error types
export interface MediaError {
  type: 'LOAD_ERROR' | 'SECURITY_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
  message: string;
  code?: string;
  retryable: boolean;
}

// Security-related types
export interface VideoSecurityConfig {
  allowedDomains: string[];
  allowAutoplay: boolean;
  sandboxAttributes: string[];
}

export interface ValidatedVideoUrl {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: MediaError;
  provider?: MediaProvider;
}

// Constants
export const MEDIA_CONSTANTS = {
  ANIMATION_DELAYS: {
    BASE: 0.05,
    MAX_DELAY: 0.5,
    CARD_TRANSITION: 0.3,
    MODAL_TRANSITION: 0.3,
  },
  CACHE: {
    MAX_SIZE: 50,
    TTL: 1000 * 60 * 60, // 1 hour
    CLEANUP_THRESHOLD: 40,
  },
  BREAKPOINTS: {
    SM: 'sm:grid-cols-2',
    MD: 'md:grid-cols-3', 
    LG: 'lg:grid-cols-4',
    XL: 'lg:grid-cols-6',
  },
  PLACEHOLDERS: {
    IMAGE: "/images/placeholders/game-cover.jpg",
    VIDEO_THUMBNAIL: "/images/placeholders/video-thumbnail.jpg",
  }
} as const;

// Video provider configurations
export const VIDEO_PROVIDERS: Record<MediaProvider, VideoSecurityConfig> = {
  youtube: {
    allowedDomains: ['youtube.com', 'youtu.be', 'www.youtube.com'],
    allowAutoplay: true,
    sandboxAttributes: ['allow-scripts', 'allow-same-origin', 'allow-presentation'],
  },
  vimeo: {
    allowedDomains: ['vimeo.com', 'player.vimeo.com'],
    allowAutoplay: true,
    sandboxAttributes: ['allow-scripts', 'allow-same-origin', 'allow-presentation'],
  },
  twitch: {
    allowedDomains: ['twitch.tv', 'player.twitch.tv'],
    allowAutoplay: false,
    sandboxAttributes: ['allow-scripts', 'allow-same-origin'],
  },
} as const;