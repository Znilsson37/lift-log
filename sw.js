/* Lift Log service worker: offline shell. HTML is network-first so updates appear when online. */
var CACHE = 'liftlog-v4';
var ASSETS = ['./', 'index.html', 'workout-program.html', 'cut-plan.html', 'supplements.html', 'trt-cut-structure.html'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function(res){ if(res.ok){ var cp = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, cp); }); } return res; })
    .catch(function(){ return caches.match(req, {ignoreSearch:true}).then(function(r){ return r || caches.match('index.html'); }); }));
});
