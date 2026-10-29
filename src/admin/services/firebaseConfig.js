/**
 * ParkLink Admin Module - Firebase Configuration Loader
 * Loads credentials from Vite environment variables (.env) with safe fallback.
 */

export function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD5-Hu0XTV0SlFZ4fv6ZMBQGIJzQhNyjpk",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "parklink-1516e.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parklink-1516e",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "parklink-1516e.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "541983240428",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:541983240428:web:67a283117a0bb4b483b5c9",
  };
}
