/**
 * Offline Page
 * Displayed when the user is offline and trying to access the app
 */
"use client";

import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function OfflinePage() {
  // Handle network status changes
  useEffect(() => {
    const updateNetworkStatus = () => {
      const statusEl = document.getElementById('network-status');
      if (navigator.onLine && statusEl) {
        statusEl.classList.remove('hidden');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };
    
    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('load', updateNetworkStatus);
    
    // Check initial status
    updateNetworkStatus();
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('load', updateNetworkStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="h-24 w-24 text-muted-foreground" />
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg leading-relaxed">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>

        {/* Features Available Offline */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            Available Offline:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            <li>• Cached game library</li>
            <li>• Previously viewed game details</li>
            <li>• Local data and statistics</li>
            <li>• Basic app navigation</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            Go to Home
          </Link>
        </div>

        {/* Connection Status */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p>
            <strong>Tip:</strong> Check your network connection and try refreshing the page.
            Your data will sync automatically when you're back online.
          </p>
        </div>

        {/* Network Status Indicator */}
        <div id="network-status" className="hidden">
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded-lg">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Back Online!</span>
          </div>
        </div>
      </div>

    </div>
  );
}