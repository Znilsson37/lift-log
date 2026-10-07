/* Lift Log service worker: offline shell. HTML is network-first (always fresh when online); the decoder is cache-first. */
var CACHE = 'liftlog-v3';
var ASSETS = ['./', 'index.html', 'workout-program.html', 'cut-plan.html', 'supplements.html', 'trt-cut-structure.html', 'vendor/zxing-0.21.3.min.js'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return; /* food APIs etc. go straight to the network */
  if(url.pathname.indexOf('/vendor/') !== -1){
    e.respondWith(caches.match(req).then(function(r){ return r || fetch(req).then(function(res){ var cp = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, cp); }); return res; }); }));
    return;
  }
  e.respondWith(fetch(req).then(function(res){ if(res.ok){ var cp = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, cp); }); } return res; })
    .catch(function(){ return caches.match(req, {ignoreSearch:true}).then(function(r){ return r || caches.match('index.html'); }); }));
});
