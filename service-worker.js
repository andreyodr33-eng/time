const CACHE_NAME = "english-time-v1";

const FILES_TO_CACHE = [
   "./", 
   "./index.html",
   "./manifest.json",
   "./icon-32.png",
   "./icon-180.png",
   "./icon-192.png",
   "./icon-512.png" 
];
// Установка: сохраняем файлы для работы без интернета. 
 self.addEventListener("install", event => { 
 event.waitUntil(
 caches.open(CACHE_NAME).then(cache => {
 return cache.addAll(FILES_TO_CACHE);
 }) 
);
self.skipWaiting(); 
});

// Активация: удаляем старые версии кэша.
 self.addEventListener("activate", event => { 
 event.waitUntil(
 caches.keys().then(keys => {
   return Promise.all( 
    keys
       .filter(key => key !== CACHE_NAME)
       .map(key => caches.delete(key)) 
   ); 
 }) 
);
 self.clients.claim();
 });
// Загружаем файлы из сети, а при отсутствии интернета — из кэша.
 self.addEventListener("fetch", event => { 
 if (event.request.method !== "GET") return;
     event.respondWith( 
       fetch(event.request) 
         .then(response => {
           if (
              response.ok &&
              new URL(event.request.url).origin === self.location.origin
   ) { 
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, copy);
      });
    }

    return response;
  })
  .catch(() => {
    return caches.match(event.request).then(cached => {
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }
    });
  })
 ); 
});