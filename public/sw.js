/**
 * Minimal Service Worker for Gamerfie
 * Handles CSP-compliant image caching and basic PWA functionality
 */

const CACHE_NAME = 'gamerfie-v1';
const STATIC_CACHE = 'gamerfie-static-v1';

// URLs to cache on install
const STATIC_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Cache install failed:', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.hostname === 'lh3.googleusercontent.com' ||
      url.hostname === 'lh4.googleusercontent.com' ||
      url.hostname === 'lh5.googleusercontent.com' ||
      url.hostname === 'lh6.googleusercontent.com' ||
      url.hostname === 'images.igdb.com') {
    
    // Image caching strategy - cache first, then network
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fetch from network and cache
          return fetch(event.request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return offline placeholder if available
            return new Response('Image temporarily unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
      })
    );
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - network first
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('API temporarily unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  } else {
    // Static assets and pages - cache first, then network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/offline');
          }
          return new Response('Resource temporarily unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      console.log('Service Worker: Handling background sync')
    );
  }
});

// Push notification handler (future enhancement)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Gamerfie',
    icon: '/logo.svg',
    badge: '/icons/icon-96x96.png',
    tag: 'gamerfie-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Gamerfie', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/') // Navigate to app
    );
  }
});

// Error handler
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error:', event.error);
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
  event.preventDefault();
});