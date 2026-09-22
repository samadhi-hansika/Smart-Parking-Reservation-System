import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5-Hu0XTV0SlFZ4fv6ZMBQGIJzQhNyjpk",
  authDomain: "parklink-1516e.firebaseapp.com",
  projectId: "parklink-1516e",
  storageBucket: "parklink-1516e.firebasestorage.app",
  messagingSenderId: "541983240428",
  appId: "1:541983240428:web:67a283117a0bb4b483b5c9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;