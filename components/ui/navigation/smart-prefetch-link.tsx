"use client";

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SmartPrefetchLinkProps extends LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchStrategy?: 'hover' | 'viewport' | 'intent' | 'disabled';
  priority?: boolean;
  threshold?: number; // For viewport strategy
}

export function SmartPrefetchLink({
  href,
  children,
  className,
  prefetchStrategy = 'intent',
  priority = false,
  threshold = 0.1,
  ...props
}: SmartPrefetchLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const prefetchTimerRef = useRef<NodeJS.Timeout>();

  // Determine prefetch behavior based on strategy
  const getPrefetchValue = () => {
    if (prefetchStrategy === 'disabled') return false;
    
    switch (prefetchStrategy) {
      case 'hover':
        return isHovered;
      case 'viewport':
        return isInViewport && priority;
      case 'intent':
        return shouldPrefetch;
      default:
        return false;
    }
  };

  // Intent-based prefetching (hover with delay)
  useEffect(() => {
    if (prefetchStrategy !== 'intent') return;

    const handleMouseEnter = () => {
      setIsHovered(true);
      // Prefetch after 100ms of hover to indicate user intent
      prefetchTimerRef.current = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };

    const element = linkRef.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        if (prefetchTimerRef.current) {
          clearTimeout(prefetchTimerRef.current);
        }
      };
    }
  }, [prefetchStrategy]);

  // Viewport-based prefetching
  useEffect(() => {
    if (prefetchStrategy !== 'viewport') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: '50px', // Start prefetching 50px before element enters viewport
      }
    );

    const element = linkRef.current;
    if (element) {
      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }
  }, [prefetchStrategy, threshold]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, []);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={cn(className)}
      prefetch={getPrefetchValue()}
      {...props}
    >
      {children}
    </Link>
  );
}