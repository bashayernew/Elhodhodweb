// Placeholder service worker for future Web Push integration
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'HodHod', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'HodHod', {
      body: data.body || '',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: data.data || {}
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});


