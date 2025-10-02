import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using environment variables with fallbacks
// IMPORTANT: Using the same Firebase project as the dashboard
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNo2IxShyuJpOpQVQb5oO4nTH05nfrFlc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auratech-f8365.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "auratech-f8365",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "auratech-f8365.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "370977821738",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:370977821738:web:6e2780aa894a6c22ab9f53",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8PH13H31P9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

