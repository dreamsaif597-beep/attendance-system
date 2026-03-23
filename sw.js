const CACHE = 'attendance-v1';
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
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // For Google Sheets API calls - always go to network
  if(e.request.url.includes('script.google.com')){
    e.respondWith(fetch(e.request).catch(()=> new Response('{}',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  // For everything else - cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached);
    })
  );
});
