/**
 * Video Security Utilities
 * Provides URL validation, sanitization, and security measures for video embeds
 */

import type { ValidatedVideoUrl, MediaProvider, VideoSecurityConfig, MediaError } from '@/types/media.types';
import { VIDEO_PROVIDERS } from '@/types/media.types';

/**
 * Validates if a URL is from an allowed video provider domain
 */
export function validateVideoUrl(url: string): ValidatedVideoUrl {
  console.log('validateVideoUrl: Input URL:', url);
  
  if (!url || typeof url !== 'string') {
    console.log('validateVideoUrl: Invalid URL type');
    return {
      isValid: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Invalid URL provided',
        retryable: false,
      }
    };
  }

  try {
    const urlObj = new URL(url);
    console.log('validateVideoUrl: Parsed URL hostname:', urlObj.hostname);
    
    // Check against allowed providers
    for (const [provider, config] of Object.entries(VIDEO_PROVIDERS)) {
      console.log(`validateVideoUrl: Checking provider ${provider} with domains:`, config.allowedDomains);
      if (isValidDomainForProvider(urlObj.hostname, config)) {
        console.log(`validateVideoUrl: Domain match found for provider: ${provider}`);
        const sanitizedUrl = sanitizeVideoUrl(urlObj, provider as MediaProvider);
        console.log('validateVideoUrl: Sanitized URL:', sanitizedUrl);
        return {
          isValid: true,
          sanitizedUrl,
          provider: provider as MediaProvider,
        };
      }
    }

    console.log('validateVideoUrl: No matching provider found for domain:', urlObj.hostname);
    return {
      isValid: false,
      error: {
        type: 'SECURITY_ERROR',
        message: `Domain ${urlObj.hostname} is not allowed`,
        retryable: false,
      }
    };
  } catch (error) {
    console.log('validateVideoUrl: URL parsing error:', error);
    return {
      isValid: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Malformed URL',
        retryable: false,
      }
    };
  }
}

/**
 * Checks if a domain is valid for a specific provider
 */
function isValidDomainForProvider(hostname: string, config: VideoSecurityConfig): boolean {
  const isValid = config.allowedDomains.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
  console.log(`isValidDomainForProvider: ${hostname} against domains [${config.allowedDomains.join(', ')}] = ${isValid}`);
  return isValid;
}

/**
 * Sanitizes video URLs by removing potentially dangerous parameters
 */
function sanitizeVideoUrl(urlObj: URL, provider: MediaProvider): string {
  const config = VIDEO_PROVIDERS[provider];
  
  // Remove potentially dangerous parameters
  const dangerousParams = ['onload', 'onerror', 'onclick', 'javascript:', 'data:', 'blob:'];
  
  Array.from(urlObj.searchParams.keys()).forEach(key => {
    const value = urlObj.searchParams.get(key) || '';
    if (dangerousParams.some(param => key.includes(param) || value.includes(param))) {
      urlObj.searchParams.delete(key);
    }
  });

  // Add security-focused parameters based on provider
  switch (provider) {
    case 'youtube':
      // Prevent related videos and enforce origin restrictions
      urlObj.searchParams.set('rel', '0');
      urlObj.searchParams.set('modestbranding', '1');
      if (!config.allowAutoplay) {
        urlObj.searchParams.set('autoplay', '0');
      }
      break;
    case 'vimeo':
      // Vimeo security parameters
      urlObj.searchParams.set('byline', '0');
      urlObj.searchParams.set('portrait', '0');
      break;
  }

  return urlObj.toString();
}

/**
 * Converts a regular video URL to a secure embed URL
 */
export function createSecureEmbedUrl(url: string): ValidatedVideoUrl {
  const validation = validateVideoUrl(url);
  
  if (!validation.isValid || !validation.sanitizedUrl || !validation.provider) {
    return validation;
  }

  try {
    const urlObj = new URL(validation.sanitizedUrl);
    let embedUrl: string;

    switch (validation.provider) {
      case 'youtube':
        embedUrl = convertYouTubeToEmbed(urlObj);
        break;
      case 'vimeo':
        embedUrl = convertVimeoToEmbed(urlObj);
        break;
      case 'twitch':
        embedUrl = convertTwitchToEmbed(urlObj);
        break;
      default:
        throw new Error(`Unsupported provider: ${validation.provider}`);
    }

    return {
      isValid: true,
      sanitizedUrl: embedUrl,
      provider: validation.provider,
    };
  } catch (error) {
    return {
      isValid: false,
      error: {
        type: 'SECURITY_ERROR',
        message: `Failed to create secure embed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        retryable: false,
      }
    };
  }
}

/**
 * Converts YouTube URL to secure embed format
 */
function convertYouTubeToEmbed(urlObj: URL): string {
  let videoId: string | null = null;

  // Extract video ID from different YouTube URL formats
  if (urlObj.hostname.includes('youtu.be')) {
    videoId = urlObj.pathname.slice(1);
  } else if (urlObj.hostname.includes('youtube.com')) {
    videoId = urlObj.searchParams.get('v');
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  
  // Copy safe search parameters
  const safeParams = ['start', 't', 'end', 'cc_load_policy', 'hl'];
  safeParams.forEach(param => {
    const value = urlObj.searchParams.get(param);
    if (value) embedUrl.searchParams.set(param, value);
  });

  // Set security parameters
  embedUrl.searchParams.set('rel', '0');
  embedUrl.searchParams.set('modestbranding', '1');
  
  // Only set origin if we're in the browser
  if (typeof window !== 'undefined') {
    embedUrl.searchParams.set('origin', window.location.origin);
  }

  return embedUrl.toString();
}

/**
 * Converts Vimeo URL to secure embed format
 */
function convertVimeoToEmbed(urlObj: URL): string {
  const videoId = urlObj.pathname.split('/').pop();
  
  if (!videoId || !/^\d+$/.test(videoId)) {
    throw new Error('Invalid Vimeo video ID');
  }

  const embedUrl = new URL(`https://player.vimeo.com/video/${videoId}`);
  embedUrl.searchParams.set('byline', '0');
  embedUrl.searchParams.set('portrait', '0');
  
  return embedUrl.toString();
}

/**
 * Converts Twitch URL to secure embed format
 */
function convertTwitchToEmbed(urlObj: URL): string {
  // Twitch embed implementation would go here
  // For now, return the sanitized URL
  return urlObj.toString();
}

/**
 * Generates Content Security Policy-compliant iframe attributes
 */
export function getSecureIframeAttributes(provider: MediaProvider) {
  const config = VIDEO_PROVIDERS[provider];
  
  return {
    sandbox: config.sandboxAttributes.join(' '),
    allow: [
      'accelerometer',
      'encrypted-media',
      'gyroscope',
      'picture-in-picture',
      config.allowAutoplay ? 'autoplay' : '',
    ].filter(Boolean).join('; '),
    referrerPolicy: 'strict-origin-when-cross-origin' as const,
    loading: 'lazy' as const,
  };
}

/**
 * Validates video ID format for different providers
 */
export function isValidVideoId(videoId: string, provider: MediaProvider): boolean {
  switch (provider) {
    case 'youtube':
      return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    case 'vimeo':
      return /^\d+$/.test(videoId);
    case 'twitch':
      return /^[a-zA-Z0-9_-]+$/.test(videoId);
    default:
      return false;
  }
}

/**
 * Creates a safe video thumbnail URL
 */
export function createSafeThumbnailUrl(videoId: string, provider: MediaProvider, quality: string = 'maxresdefault'): string {
  if (!isValidVideoId(videoId, provider)) {
    return '/images/placeholders/video-thumbnail.jpg';
  }

  switch (provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    case 'vimeo':
      // Vimeo thumbnails require API call, return placeholder for now
      return '/images/placeholders/video-thumbnail.jpg';
    case 'twitch':
      return '/images/placeholders/video-thumbnail.jpg';
    default:
      return '/images/placeholders/video-thumbnail.jpg';
  }
}