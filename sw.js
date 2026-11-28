// Service worker: o app abre mesmo sem sinal na academia.
// Arquivos do app: tenta a rede primeiro (pega atualizações) e usa a cópia guardada se estiver offline.
// Fontes e imagens: usa a cópia guardada primeiro. O banco (Supabase) nunca passa pelo cache.
const CACHE = 'jau-v11';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest',
  'img/logo.webp', 'img/logo-hi.webp', 'img/cheetah.webp', 'img/icon-192.png', 'img/apple-touch-icon.png', 'img/favicon-32.png',
  'fonts/montserrat-latin-400-normal.woff2', 'fonts/montserrat-latin-500-normal.woff2', 'fonts/montserrat-latin-600-normal.woff2', 'fonts/montserrat-latin-700-normal.woff2', 'fonts/montserrat-latin-800-normal.woff2', 'fonts/playfair-display-latin-600-italic.woff2', 'fonts/playfair-display-latin-700-italic.woff2'];

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
  // Rede primeiro, mas se a internet demorar mais de 2,5 s o app abre pela cópia guardada (e atualiza na próxima).
  const net = fetch(req).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  });
  const saved = () => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
  e.respondWith(new Promise(resolve => {
    let done = false; const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => saved().then(finish), 2500);
    net.then(r => { clearTimeout(t); finish(r); }).catch(() => { clearTimeout(t); saved().then(r => r ? finish(r) : finish(Response.error())); });
  }));
});

// Notificações do personal: treino concluído por um aluno.
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = {title: 'Jau Training', body: e.data ? e.data.text() : ''}; }
  const jobs = [self.registration.showNotification(d.title || 'Jau Training', {body: d.body || '', icon: 'img/icon-192.png', badge: 'img/icon-192.png', tag: d.tag || undefined, data: {go: 'feed'}})];
  if (typeof d.badge === 'number' && self.navigator && 'setAppBadge' in self.navigator) jobs.push((d.badge ? self.navigator.setAppBadge(d.badge) : self.navigator.clearAppBadge()).catch(() => {}));
  jobs.push(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => cs.forEach(c => c.postMessage({type: 'jau-push'}))));
  e.waitUntil(Promise.all(jobs));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    const c = cs.find(x => 'focus' in x);
    if (c) { c.postMessage({type: 'jau-go', go: 'feed'}); return c.focus(); }
    return self.clients.openWindow('./?go=feed');
  }));
});
