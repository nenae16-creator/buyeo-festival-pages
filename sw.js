// 오프라인 캐시: 앱 화면·데이터는 캐시 우선(마지막으로 받은 안내를 통신이 끊겨도 표시), 지도 타일·외부 자원은 네트워크 우선.
const CACHE = 'buyeo-demo-v1';
const SHELL = ['./', 'index.html', 'css/style.css', 'js/app.bundle.js', 'data/festival.js', 'data/festival.json', 'vendor/leaflet/leaflet.css', 'vendor/leaflet/leaflet.js', 'assets/favicon.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {
    // 데이터는 새 버전을 먼저 시도하고 실패하면 캐시 (변경 공지가 늦게 보이지 않게)
    if (u.pathname.includes('/data/')) { e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request))); return; }
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
