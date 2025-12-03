import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Acceso seguro a las variables de entorno.
// Usamos un objeto vacío {} como fallback por si import.meta.env es undefined.
const env = (import.meta as any).env || {};

// 2. Configuración con Fallbacks (Valores por defecto).
// He eliminado la comprobación de 'PROD' que causaba el error.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "mvz-contagio-cero.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "mvz-contagio-cero",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "mvz-contagio-cero.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "353667894452",
  appId: env.VITE_FIREBASE_APP_ID || "1:353667894452:web:818125f7c39a964a975be1",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-4V4KGYDBG5"
};

// 3. Inicialización controlada con Try/Catch
// Esto asegura que si Firebase falla, la app no se quede en blanco, sino que continúe.
let app;
let authExport;
let dbExport;

try {
    app = initializeApp(firebaseConfig);
    authExport = getAuth(app);
    dbExport = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase (Check configuration):", error);
    // Mock objects para evitar que la app explote si falla la config
    authExport = {} as any;
    dbExport = {} as any;
}

export const auth = authExport;
export const db = dbExport;