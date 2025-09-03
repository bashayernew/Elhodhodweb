export async function getVapidPublicKey() {
  // For now, read from env (injected at build). Could be fetched from backend if needed
  const key = process.env.REACT_APP_VAPID_PUBLIC_KEY;
  if (key) return urlBase64ToUint8Array(key);
  // Fallback: ask backend
  const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/config/vapid`);
  const data = await res.json();
  return urlBase64ToUint8Array(data.publicKey);
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
  const applicationServerKey = await getVapidPublicKey();
  const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  // Send to backend
  await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/notifications/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}` },
    body: JSON.stringify({ subscription })
  });
  return subscription;
}


