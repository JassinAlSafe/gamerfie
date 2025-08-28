/**
 * Image optimization utilities and configurations
 * Centralized settings for consistent image quality across the app
 */

export interface ImageOptimizationConfig {
  quality: number;
  sizes: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  loading?: 'eager' | 'lazy';
}

/**
 * Predefined image optimization configs for different use cases
 */
export const imageConfigs = {
  // High-quality game covers and hero images
  gameHero: {
    quality: 95,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw",
    priority: true,
    loading: "eager" as const,
  },
  
  // Standard game card images  
  gameCard: {
    quality: 95, // Increased quality for better mobile experience
    sizes: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px",
    loading: "lazy" as const,
  },
  
  // Small thumbnail images
  gameThumbnail: {
    quality: 90, // Improved quality for mobile
    sizes: "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px",
    loading: "lazy" as const,
  },
  
  // List view small images
  listView: {
    quality: 90, // Improved quality for mobile
    sizes: "(max-width: 640px) 120px, 80px",
    loading: "lazy" as const,
  },
  
  // Avatar images
  avatar: {
    quality: 90,
    sizes: "(max-width: 640px) 60px, 80px",
    loading: "lazy" as const,
  },
  
  // Profile banners and headers
  banner: {
    quality: 85,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
    loading: "eager" as const,
  },
  
  // Screenshot modal - highest quality
  screenshot: {
    quality: 100,
    sizes: "(max-width: 768px) 100vw, 90vw",
    priority: true,
    loading: "eager" as const,
  },
  
  // Media gallery thumbnails
  mediaThumbnail: {
    quality: 85,
    sizes: "(max-width: 640px) 33vw, (max-width: 768px) 25vw, 200px",
    loading: "lazy" as const,
  }
} as const;

/**
 * Generate optimized cover URL for IGDB images
 * Converts IGDB thumbnail URLs to higher quality versions
 * Enhanced for mobile devices to ensure high quality
 */
export function getOptimizedCoverUrl(
  originalUrl: string, 
  size: 'thumb' | 'cover_small' | 'cover_big' | 'cover_big_2x' | '1080p' = 'cover_big'
): string {
  if (!originalUrl) return '';
  
  // Handle IGDB image URLs
  if (originalUrl.includes('images.igdb.com')) {
    // For mobile devices, always use highest quality available
    const isMobile = typeof window !== 'undefined' && 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const targetSize = isMobile ? 'cover_big_2x' : size;
    return originalUrl.replace(/t_[a-zA-Z0-9_]+/, `t_${targetSize}`);
  }
  
  // Handle other image URLs (return as-is)
  return originalUrl;
}

/**
 * Get responsive image configuration with priority handling
 */
export function getImageConfig(
  configName: keyof typeof imageConfigs,
  overrides?: Partial<ImageOptimizationConfig>,
  index?: number
): ImageOptimizationConfig {
  const baseConfig = imageConfigs[configName];
  const config = { ...baseConfig, ...overrides };
  
  // Auto-set priority for first few images in lists
  if (index !== undefined && config.priority === undefined) {
    config.priority = index < 6;
    config.loading = index < 6 ? 'eager' : 'lazy';
  } else if (config.priority === true) {
    // If priority is explicitly set to true, ensure loading is eager
    config.loading = 'eager';
  }
  
  return config;
}

/**
 * Get placeholder image URL based on content type
 */
export function getPlaceholderImage(type: 'game' | 'avatar' | 'banner' | 'screenshot' = 'game'): string {
  const placeholders = {
    game: '/images/placeholders/game-cover.jpg',
    avatar: '/images/placeholders/avatar.png', 
    banner: '/images/placeholders/banner.jpg',
    screenshot: '/images/placeholders/screenshot.jpg'
  };
  
  return placeholders[type];
}

/**
 * Image error handling with fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackSrc?: string
) {
  const img = event.currentTarget;
  if (fallbackSrc && img.src !== fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    img.src = getPlaceholderImage('game');
  }
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload images with concurrent limit
 */
export async function preloadImages(
  urls: string[], 
  concurrentLimit: number = 3
): Promise<void> {
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += concurrentLimit) {
    batches.push(urls.slice(i, i + concurrentLimit));
  }
  
  for (const batch of batches) {
    await Promise.allSettled(batch.map(preloadImage));
  }
}