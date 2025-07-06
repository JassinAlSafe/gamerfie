/**
 * Image proxy utilities for secure external image loading
 */

const ALLOWED_EXTERNAL_DOMAINS = [
  'images.igdb.com',
  'media.rawg.io',
  'steamcdn-a.akamaihd.net',
  'img.youtube.com',
  'i.ytimg.com',
];

/**
 * Check if an image URL should use the proxy
 */
export function shouldUseProxy(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return ALLOWED_EXTERNAL_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Get proxied image URL for external images
 */
export function getProxiedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  if (!originalUrl) return '';
  
  // If it's a relative URL or already on our domain, return as-is
  if (originalUrl.startsWith('/') || originalUrl.includes(window?.location?.hostname || 'localhost')) {
    return originalUrl;
  }
  
  // If it's not from an allowed domain, return as-is (Next.js Image will handle it)
  if (!shouldUseProxy(originalUrl)) {
    return originalUrl;
  }
  
  // Build proxy URL
  const proxyUrl = new URL('/api/image-proxy', window?.location?.origin || 'http://localhost:3000');
  proxyUrl.searchParams.set('url', originalUrl);
  
  if (options.width) {
    proxyUrl.searchParams.set('w', options.width.toString());
  }
  
  if (options.height) {
    proxyUrl.searchParams.set('h', options.height.toString());
  }
  
  if (options.quality) {
    proxyUrl.searchParams.set('q', options.quality.toString());
  }
  
  return proxyUrl.toString();
}

/**
 * Enhanced image URL function that combines existing optimization with proxy
 */
export function getOptimizedProxiedImageUrl(
  originalUrl: string,
  type: 'cover' | 'screenshot' | 'background' | 'thumbnail' = 'cover',
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  if (!originalUrl) return '';
  
  // Default quality settings based on image type
  const defaultQuality = {
    cover: 85,
    screenshot: 80,
    background: 75,
    thumbnail: 70,
  };
  
  const quality = options.quality || defaultQuality[type];
  
  // For external images that should use proxy
  if (shouldUseProxy(originalUrl)) {
    return getProxiedImageUrl(originalUrl, {
      ...options,
      quality,
    });
  }
  
  // For internal images or non-proxied external images, return as-is
  // Next.js Image component will handle optimization
  return originalUrl;
}