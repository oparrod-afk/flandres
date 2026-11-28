/* Service worker : permet de rouvrir la page (programme, bergs, tracé GPX) sans réseau */
const V = 'flandres-v3';
const CORE = ['./', './index.html', './en.html', './nl.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function store(r, res) {
  if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)).catch(() => {}); }
  return res;
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => store(r, res)).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
  } else if (/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => store(r, res))));
  }
});
