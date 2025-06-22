"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/utils/image-utils";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  context?: "hero" | "card" | "thumbnail" | "background";
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  context = "card",
  className,
  priority = false,
  onLoad,
  onError,
  placeholder = "/placeholder.png",
  sizes,
  width = 300,
  height = 400,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || inView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, inView]);

  const optimizedSrc = getOptimizedImageUrl(src, context);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)} ref={imgRef}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-700 rounded opacity-50" />
        </div>
      )}

      {/* Main image */}
      {(inView || priority) && (
        <Image
          src={hasError ? placeholder : optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          sizes={sizes}
          {...props}
        />
      )}
    </div>
  );
});
