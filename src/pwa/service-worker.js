self.addEventListener('install', function(event) {
  caches.open('v1').then(function(cache) {
    return cache.addAll([
      '/'
    ])
  }, function(error){

  })
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
