const CACHE_NAME = 'verificador-xml-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // Ícones que devem ser criados e salvos na raiz do projeto
    '/icon-192.png',
    '/icon-512.png',
    // O logo CDN para que apareça no cabeçalho mesmo offline
    'https://res.cloudinary.com/drsyomd2a/image/upload/v1762261454/Design-sem-nome_uxeex5.png'
];

// Instalação do Service Worker: Abre um cache e armazena os assets estáticos
self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando e cacheando shell estático');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação do Service Worker: Limpa caches antigos
self.addEventListener('activate', event => {
    console.log('[Service Worker] Ativando e limpando caches antigos');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch (Busca): Serve recursos do cache ou da rede (Cache-First)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o recurso estiver no cache, retorna-o
                if (response) {
                    return response;
                }
                // Se não, busca na rede
                return fetch(event.request);
            })
    );
});
