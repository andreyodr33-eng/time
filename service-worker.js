const CACHE_NAME = "english-time-v2";
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

 // Активация: удаляем старый кэш приложения.
 self.addEventListener("activate", event => {
   event.waitUntil(
     caches.keys().then(keys => {
       return Promise.all( 
        keys 
           .filter(key =>
               key.startsWith("english-time-") &&
               key !== CACHE_NAME
              ) 
              .map(key => caches.delete(key))
    );
   }).then(() => self.clients.claim())
  );
 });
 // HTML: сначала сеть, при отсутствии интернета — кэш.
 // Остальные файлы: сеть с сохранением в кэш.
 self.addEventListener("fetch", event => { 
 if (event.request.method !== "GET") return;

 const url = new URL(event.request.url);

 if (url.origin !== self.location.origin) return;

 const isHTML = 
     event.request.mode === "navigate" || 
     url.pathname.endsWith("/index.html") || 
     url.pathname.endsWith("/");

 if (isHTML) { 
   event.respondWith( 
      fetch(event.request)
         .then(response => { 
           if (response.ok) { 
             const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
            cache.put("./index.html", response.clone());
        });
      }

      return response;
    })
    .catch(async () => {
      return (
        await caches.match(event.request) ||
        await caches.match("./index.html")
      );
    })
 );

 return;
 }
 event.respondWith( 
    fetch(event.request) 
      .then(response => { 
         if (response.ok) {
          const copy = response.clone();

      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, copy);
      });
    }

    return response;
  })
  .catch(async () => {
    return await caches.match(event.request);
  })
 );
});
