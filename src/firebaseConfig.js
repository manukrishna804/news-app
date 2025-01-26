// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCjc05v1qMjPMU7urb1SQn42eMCqvCrYs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "login-page1-1c331.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "login-page1-1c331",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "login-page1-1c331.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1064646866441",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1064646866441:web:d4c683b70fae2876202ad8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth,db };
export default app;