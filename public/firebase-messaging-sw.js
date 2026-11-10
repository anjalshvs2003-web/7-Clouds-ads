// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDEMO-KEY-7CLOUDS-STUDIO",
  authDomain: "seven-clouds-studio.firebaseapp.com",
  projectId: "seven-clouds-studio",
  storageBucket: "seven-clouds-studio.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:987654321abcdef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || '7 Clouds Studio Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New studio notification arrived.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
