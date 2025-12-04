import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// 1. Leemos las variables de entorno
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let authExport: Auth | null = null;
let dbExport: Firestore | null = null;

// 2. Verificamos si la API Key existe antes de intentar iniciar
// Esto evita el error "auth/invalid-api-key" que bloquea la app
const hasValidKey = firebaseConfig.apiKey && 
                    firebaseConfig.apiKey !== "PLACEHOLDER_API_KEY" &&
                    !firebaseConfig.apiKey.includes("Pega_Aqui");

if (hasValidKey) {
    try {
        app = initializeApp(firebaseConfig);
        authExport = getAuth(app);
        dbExport = getFirestore(app);
        console.log("✅ Firebase inicializado correctamente");
    } catch (error) {
        console.error("❌ Error al inicializar Firebase:", error);
    }
} else {
    console.warn("⚠️ AVISO: No se detectaron claves válidas de Firebase en .env.local. La app funcionará en modo limitado.");
}

// Exportamos las instancias (pueden ser null si falló la config)
export const auth = authExport;
export const db = dbExport;