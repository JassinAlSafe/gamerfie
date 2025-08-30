"use client";

import { useState, useEffect } from "react";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";

/**
 * SSR-Safe Authentication Hook
 * 
 * Prevents hydration mismatches by ensuring server and client
 * render with consistent authentication states initially.
 * 
 * During SSR and initial render: Returns safe defaults
 * After hydration: Returns actual auth store state
 */
export function useSSRSafeAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const authUser = useAuthUser();
  const authStatus = useAuthStatus();

  useEffect(() => {
    // Mark as hydrated after first client-side render
    setIsHydrated(true);
  }, []);

  // During SSR and initial render, return safe defaults
  if (!isHydrated) {
    return {
      // User state
      user: null,
      profile: null,
      isProfileLoading: false,
      
      // Status state  
      isLoading: false,
      isInitialized: false, // Will show loading state initially
      error: null,
      
      // Helper
      isAuthenticated: false,
    };
  }

  // After hydration, return actual store state
  return {
    ...authUser,
    ...authStatus,
    isAuthenticated: !!authUser.user,
  };
}

/**
 * SSR-Safe Authentication Status Hook
 * 
 * For components that only need to know if user is authenticated
 * Returns false during SSR, actual state after hydration
 */
export function useSSRSafeAuthStatus() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    isAuthenticated: isHydrated ? !!user : false,
    isInitialized: isHydrated ? isInitialized : false,
    isHydrated,
  };
}