const CACHE = 'attendance-v3';
const FILES = [
  '/attendance-system/',
  '/attendance-system/index.html',
  '/attendance-system/icon.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches including v1 and v2
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Google Sheets API — always network
  if(e.request.url.includes('script.google.com')){
    e.respondWith(fetch(e.request).catch(()=> new Response('{}',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  // Everything else — network first, cache as fallback
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
