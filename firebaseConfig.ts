// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Usamos variables de entorno (VITE_...) para Vercel.
// Si no existen (entorno local simple), usa los valores hardcoded como respaldo.
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || "AIzaSyBdIxIAAI72tofAu_RMm5Q3mim9bGIsudY",
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || "mvz-contagio-cero.firebaseapp.com",
  projectId: env?.VITE_FIREBASE_PROJECT_ID || "mvz-contagio-cero",
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || "mvz-contagio-cero.firebasestorage.app",
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "353667894452",
  appId: env?.VITE_FIREBASE_APP_ID || "1:353667894452:web:818125f7c39a964a975be1",
  measurementId: env?.VITE_FIREBASE_MEASUREMENT_ID || "G-4V4KGYDBG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);