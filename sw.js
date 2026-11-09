// Service worker: o app abre mesmo sem sinal na academia.
// Arquivos do app: tenta a rede primeiro (pega atualizações) e usa a cópia guardada se estiver offline.
// Fontes e imagens: usa a cópia guardada primeiro. O banco (Supabase) nunca passa pelo cache.
const CACHE = 'jau-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'img/logo.webp', 'img/logo-hi.webp', 'img/cheetah.webp', 'img/icon-192.png', 'img/apple-touch-icon.png', 'img/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const same = url.origin === self.location.origin;
  if (!same && !fonts) return;
  if (fonts || url.pathname.includes('/img/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
