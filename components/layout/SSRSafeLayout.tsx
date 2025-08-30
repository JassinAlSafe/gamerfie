"use client";

import React, { useState, useEffect } from "react";
import { useUIStore } from "@/stores/useUIStore";

interface SSRSafeLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SSR-Safe Layout Component
 * 
 * Prevents hydration mismatches by:
 * 1. Starting with safe defaults that match server-side rendering
 * 2. Only applying client-side state after hydration is complete
 * 3. Using a two-phase rendering approach
 */
export function SSRSafeLayout({ children, className = "" }: SSRSafeLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isBetaBannerVisible } = useUIStore();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  // During SSR and initial render, use safe defaults
  // After hydration, use actual UI store state
  const shouldShowBetaBanner = isHydrated ? isBetaBannerVisible : false;

  const dynamicClasses = shouldShowBetaBanner ? 'beta-banner-visible' : '';
  const finalClassName = `${className} ${dynamicClasses}`.trim();

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
}

/**
 * Hook for SSR-safe UI state
 * Returns safe defaults during SSR, actual state after hydration
 */
export function useSSRSafeUIState() {
  const [isHydrated, setIsHydrated] = useState(false);
  const uiState = useUIStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return safe defaults during SSR
  if (!isHydrated) {
    return {
      isBetaBannerVisible: false,
      isMobileMenuOpen: false,
      isProfileMenuOpen: false,
      ...uiState,
    };
  }

  return uiState;
}