const CACHE_NAME = 'chess-clock-cache-v1'; // Consider changing to v2 if you want to force update for existing users
const urlsToCache = [
    '/chess_clock/', // Alias for index.html at the new root
    '/chess_clock/index.html',
    '/chess_clock/dist/app.js',
    '/chess_clock/manifest.json',
    // We are not caching Tailwind CSS from CDN as it's an external resource.
    // If there were local CSS or icon files that are critical, they would be listed here.
    // For example, if actual icon files 'icons/icon-192x192.png' and 'icons/icon-512x512.png' exist and were to be cached:
    // '/chess_clock/icons/icon-192x192.png',
    // '/chess_clock/icons/icon-512x512.png'
    // Note: Ensure these icon files actually exist if uncommented.
];

// Install a service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // It's good practice to ensure addAll doesn't fail if one URL is bad.
                // However, for core assets, failure should be an error.
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to open cache or add all URLs: ', err);
                // If addAll fails, the SW installation will fail. This is usually desired for core assets.
            })
    );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // We only want to handle GET requests for caching
    if (event.request.method !== 'GET') {
        return;
    }

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
                        // Only cache responses that are 2xx and of type 'basic' (same-origin) or 'cors' (if you trust the source)
                        // Opaque responses (type 'opaque') for third-party resources without CORS shouldn't be cached if you can't verify their content/status.
                        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Cache the fetched resource.
                                // Be careful about caching everything; this example is quite broad.
                                // Consider only caching resources from your origin or specific CDNs.
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.log('Fetch failed; possibly offline or network error.', error);
                    // If fetch fails (e.g., offline) and request is for navigation,
                    // you might want to return a generic offline page.
                    // For this app, if '/chess_clock/index.html' is cached, it should handle it for the main page.
                    // If event.request.mode === 'navigate'
                    // return caches.match('/chess_clock/offline.html'); // Example for a dedicated offline page
                });
            })
    );
});

// Update a service worker - activate event
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]; // Add new cache names here if you update CACHE_NAME
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tell the active service worker to take control of the page immediately.
            return self.clients.claim();
        })
    );
});
