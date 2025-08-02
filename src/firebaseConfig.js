// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfdhAWIe2A1BSH3UxkJZRSHI2I5mG6D3w",
  authDomain: "ecosphere-db224.firebaseapp.com",
  projectId: "ecosphere-db224",
  storageBucket: "ecosphere-db224.firebasestorage.app",
  messagingSenderId: "672323137718",
  appId: "1:672323137718:web:dd34069955e2c41f477617",
  measurementId: "G-MRFYQSVD2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
export default app;