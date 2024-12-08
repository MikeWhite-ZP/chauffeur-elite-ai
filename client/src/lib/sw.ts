/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

interface SyncEvent extends Event {
  tag: string;
  waitUntil(promise: Promise<any>): void;
}

const CACHE_NAME = 'usa-luxury-limo-cache-v1';

const CACHED_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHED_URLS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Background sync will be implemented in a future update
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-bookings') {
//     event.waitUntil(syncBookings());
//   }
// });

async function syncBookings() {
  try {
    const response = await fetch('/api/bookings/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any pending bookings from IndexedDB here
      }),
    });

    if (!response.ok) {
      throw new Error('Booking sync failed');
    }
  } catch (error) {
    console.error('Error syncing bookings:', error);
  }
}

export {};
