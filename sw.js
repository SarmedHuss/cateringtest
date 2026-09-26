/* Catering Order Book — service worker. Cache-first: the app keeps working
   offline and even if the website is taken down. Orders never leave the phone. */
const VERSION = "2d3ee6ff7c";
const CACHE = "order-book-" + VERSION;
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./fonts/figtree-400.woff2", "./fonts/figtree-500.woff2", "./fonts/figtree-600.woff2", "./fonts/figtree-700.woff2", "./fonts/naskh-400.woff2", "./fonts/naskh-700.woff2", "./fonts/bodoni-500.woff2", "./fonts/bodoni-600.woff2"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: "reload"})))));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("order-book-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => { if (event.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(caches.open(CACHE).then(c => c.match("./index.html")).then(r => r || fetch(req)));
    return;
  }
  event.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req)));
});
