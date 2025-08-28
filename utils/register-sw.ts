/**
 * Service Worker Registration Utility
 * Handles service worker registration with proper error handling
 */

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }
  
  if ('serviceWorker' in navigator) {
    try {
      // Wait for the page to load before registering
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(null);
        } else {
          window.addEventListener('load', () => resolve(null));
        }
      });
      
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Service Worker updated, please refresh');
              // Optionally show a notification to the user about the update
              if (window.confirm('App updated! Refresh to get the latest features?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service Workers are not supported in this browser');
  }
}

export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        const result = await registration.unregister();
        console.log('Service Worker unregistered:', result);
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      throw error;
    }
  }
}

export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}