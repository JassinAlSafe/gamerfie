/**
 * Safe Video Embed Component
 * Provides secure video embedding with validation and sanitization
 */

'use client';

import React, { memo, useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Play } from 'lucide-react';
import { createSecureEmbedUrl, getSecureIframeAttributes } from '@/utils/video-security';
import type { MediaProvider, MediaError } from '@/types/media.types';

interface SafeVideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
  onError?: (error: MediaError) => void;
  onLoad?: () => void;
  fallbackContent?: React.ReactNode;
}

export const SafeVideoEmbed = memo<SafeVideoEmbedProps>(({
  url,
  title = 'Video Player',
  className = 'w-full h-full',
  onError,
  onLoad,
  fallbackContent
}) => {
  const [embedState, setEmbedState] = useState<{
    isLoading: boolean;
    embedUrl: string | null;
    provider: MediaProvider | null;
    error: MediaError | null;
  }>({
    isLoading: true,
    embedUrl: null,
    provider: null,
    error: null,
  });

  useEffect(() => {
    const validateAndSanitize = async () => {
      setEmbedState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log('SafeVideoEmbed: Validating URL:', url);
        
        // Handle null or empty URLs
        if (!url || url.trim() === '') {
          console.warn('SafeVideoEmbed: No URL provided');
          const error = {
            type: 'VALIDATION_ERROR' as const,
            message: 'No video URL provided',
            retryable: false,
          };
          setEmbedState({
            isLoading: false,
            embedUrl: null,
            provider: null,
            error,
          });
          onError?.(error);
          return;
        }
        
        const validation = createSecureEmbedUrl(url);
        console.log('SafeVideoEmbed: Validation result:', validation);
        
        if (!validation.isValid) {
          const error = validation.error || {
            type: 'VALIDATION_ERROR',
            message: 'Unknown validation error',
            retryable: false,
          };
          console.error('SafeVideoEmbed: URL validation failed:', error);
          setEmbedState({
            isLoading: false,
            embedUrl: null,
            provider: null,
            error,
          });
          onError?.(error);
          return;
        }

        setEmbedState({
          isLoading: false,
          embedUrl: validation.sanitizedUrl || null,
          provider: validation.provider || null,
          error: null,
        });
      } catch (error) {
        const mediaError: MediaError = {
          type: 'SECURITY_ERROR',
          message: error instanceof Error ? error.message : 'Security validation failed',
          retryable: false,
        };
        setEmbedState({
          isLoading: false,
          embedUrl: null,
          provider: null,
          error: mediaError,
        });
        onError?.(mediaError);
      }
    };

    validateAndSanitize();
  }, [url, onError]);

  // Loading state
  if (embedState.isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800`}>
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading video...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (embedState.error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800 border-2 border-red-500/20`}>
        {fallbackContent || (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Video Unavailable</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              {embedState.error.type === 'SECURITY_ERROR' 
                ? 'This video cannot be displayed for security reasons.'
                : embedState.error.message
              }
            </p>
            {embedState.error.retryable && (
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Success state - render secure iframe
  if (embedState.embedUrl && embedState.provider) {
    const iframeAttributes = getSecureIframeAttributes(embedState.provider);
    
    return (
      <iframe
        src={embedState.embedUrl}
        title={title}
        className={className}
        frameBorder="0"
        allow={iframeAttributes.allow}
        sandbox={iframeAttributes.sandbox}
        referrerPolicy={iframeAttributes.referrerPolicy}
        loading={iframeAttributes.loading}
        allowFullScreen
        onLoad={() => onLoad?.()}
        onError={() => {
          const error: MediaError = {
            type: 'LOAD_ERROR',
            message: 'Failed to load video',
            retryable: true,
          };
          setEmbedState(prev => ({ ...prev, error }));
          onError?.(error);
        }}
      />
    );
  }

  // Fallback state
  return (
    <div className={`${className} flex items-center justify-center bg-gray-800`}>
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <Play className="w-12 h-12" />
        <span className="text-sm">No video available</span>
      </div>
    </div>
  );
});

SafeVideoEmbed.displayName = 'SafeVideoEmbed';

// Higher-order component for additional security wrapper
export const withVideoSecurity = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return memo((props: P) => {
    // Add global video security measures here
    // e.g., CSP headers, global error tracking, etc.
    
    return <Component {...props} />;
  });
};

export default SafeVideoEmbed;