/* Quar Patrol Builder: offline helper (service worker).
   - Online: everything comes from the network as normal (so updates arrive straight away),
     and a copy is kept for offline use.
   - Offline: the last copy is used, so the app still opens at the table with no signal.
   Saved patrols, games and campaigns are in the browser's own storage and are never touched here. */
const CACHE = "quar-pb-v1";
const CORE = [
  "./", "index.html", "data/quar-data.json",
  "campaign.css", "campaign-rules.js", "tales-rules.js", "tales.js", "mhuddball-rules.js", "mhuddball.js", "campaign.js",
  "icons/icon.svg", "icons/app-192.png", "manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all(CORE.map(url => cache.add(new Request(url, {cache: "reload"})).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("quar-pb-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const isFont = url => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin && url.pathname.startsWith(new URL(self.registration.scope).pathname);
  if (!same && !isFont(url)) return;            // visit counter, Ko-fi etc.: leave alone

  // Fonts: use the saved copy if there is one, otherwise fetch and save it
  if (isFont(url)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }))));
    return;
  }

  // The site's own files: network first, saved copy when offline
  event.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(cache => cache.put(stripVersion(req), copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.open(CACHE).then(cache =>
    cache.match(stripVersion(req), {ignoreSearch: true}).then(hit => hit || (req.mode === "navigate" ? cache.match("index.html").then(h => h || cache.match("./")) : Response.error()))
  )));
});

// "campaign.js?v=…" and "campaign.js" share one saved copy
function stripVersion(req) { const u = new URL(req.url); if (!u.search) return req; u.search = ""; return new Request(u.href); }
