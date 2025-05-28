const CACHE_NAME = 'chess-clock-cache-v1';
const urlsToCache = [
    '/', // Alias for index.html
    'index.html',
    'dist/app.js',
    'manifest.json',
    // We are not caching Tailwind CSS from CDN as it's an external resource.
    // If there were local CSS or icon files that are critical, they would be listed here.
    // For example, if 'icons/icon-192x192.png' and 'icons/icon-512x512.png' were present:
    // 'icons/icon-192x192.png',
    // 'icons/icon-512x512.png'
];

// Install a service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to open cache or add urls: ', err);
            })
    );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not found in cache, fetch from network
                return fetch(event.request).then(
                    networkResponse => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // We don't cache every single request, e.g. Chrome extension requests
                                // Only cache if it's a GET request and from our origin or a CDN we trust for core assets.
                                // For simplicity here, we're caching what was fetched if not in initial urlsToCache
                                // but one might want more specific rules.
                                if (event.request.method === 'GET') {
                                     // Let's only cache resources that are part of initial urlsToCache or from same origin for safety.
                                     // This simple example will try to cache any new GET request.
                                     // A more robust strategy would be to check event.request.url origin.
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.log('Fetch failed; returning offline page instead.', error);
                    // If fetch fails (e.g., offline) and request is for navigation,
                    // you might want to return a generic offline page.
                    // For this app, if index.html is cached, it should handle it.
                });
            })
    );
});

// Update a service worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
