"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useThrottledScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafId = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafId.current !== null) {
      return;
    }

    rafId.current = requestAnimationFrame(() => {
      setScrollY(window.scrollY);
      rafId.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true } as EventListenerOptions);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return scrollY;
}

export function useScrollToTopVisibility(threshold: number = 500) {
  const [isVisible, setIsVisible] = useState(false);
  const rafId = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafId.current !== null) {
      return;
    }

    rafId.current = requestAnimationFrame(() => {
      const shouldBeVisible = window.scrollY > threshold;
      setIsVisible(current => current !== shouldBeVisible ? shouldBeVisible : current);
      rafId.current = null;
    });
  }, [threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true } as EventListenerOptions);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return isVisible;
}