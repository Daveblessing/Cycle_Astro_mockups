/* Cycle & Astro · service worker (v1.2.0)
 * - index.html, styles.css, app.js, i18n.js : RÉSEAU D’ABORD (le cache ne sert qu’hors connexion),
 *   pour que le téléphone ne reste jamais bloqué sur une ancienne version.
 * - images et polices : cache d’abord.
 * - Les instantanés figés (/releases/...) ne passent pas par ce service worker.
 */
const VERSION = '1.2.0';
const CACHE = 'cycle-astro-v' + VERSION;
const CORE = ['./', './index.html', './styles.css', './app.js', './i18n.js', './manifest.webmanifest', './assets/logo-3-5.png', './assets/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' }))))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('cycle-astro-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isAsset(url) {
  return /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname) ||
    url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com';
}

/* Clé de cache sans ?v=… pour retrouver la page hors connexion. */
function cacheKey(req) {
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    url.search = '';
    if (req.mode === 'navigate' || url.pathname.endsWith('/')) url.pathname = url.pathname.replace(/\/$/, '/index.html');
    return url.toString();
  }
  return req.url;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok) cache.put(cacheKey(req), res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(cacheKey(req));
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const shell = await cache.match(new URL('./index.html', self.registration.scope).toString());
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req) || await cache.match(cacheKey(req));
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && url.pathname.includes('/releases/')) return;
  if (isAsset(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(req));
  }
});
