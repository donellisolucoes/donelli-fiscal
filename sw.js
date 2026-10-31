// Donelli Fiscal: guarda a tela do app no celular para abrir rápido.
// Sempre tenta buscar a versão nova primeiro; sem internet, usa a cópia guardada.
// As chamadas ao servidor (Google) e às bibliotecas externas passam direto, sem cache.
const CACHE = 'donelli-fiscal-7.1';
const ARQUIVOS = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icone-192.png', './icone-512.png', './icone-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
