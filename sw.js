// 화면(html)·데이터(json)는 네트워크 우선 → 배포하면 바로 새 화면. 해시 붙은 assets·사진만 캐시 우선. 오프라인이면 캐시로.
const CACHE = "festival-v2";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./festival.json"]))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const fresh = () => fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
  const stable = /\/(assets|img)\//.test(url.pathname);
  e.respondWith(stable ? caches.match(e.request).then(hit => hit || fresh()) : fresh().catch(() => caches.match(e.request)));
});
