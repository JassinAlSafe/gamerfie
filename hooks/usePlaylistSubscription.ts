"use client";

import { useEffect, useRef } from 'react';
import { PlaylistService } from '@/services/playlistService';

/**
 * Hook to manage real-time playlist subscriptions
 * Automatically sets up and cleans up Supabase subscriptions for playlist changes
 */
export function usePlaylistSubscription() {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Set up real-time subscription
    console.log('Setting up playlist subscription...');
    unsubscribeRef.current = PlaylistService.subscribeToPlaylistChanges();

    // Warm up the cache for better initial performance
    PlaylistService.warmUpCache();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        console.log('Cleaning up playlist subscription...');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Return a function to manually refresh if needed
  const forceRefresh = () => {
    PlaylistService.clearCache();
  };

  return { forceRefresh };
} 