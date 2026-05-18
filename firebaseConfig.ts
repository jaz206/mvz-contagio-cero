import { initializeApp, getApp, getApps, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const env = (import.meta as any).env || {};

export const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

const hasValidKey = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "PLACEHOLDER_API_KEY" &&
  !firebaseConfig.apiKey.includes("Pega_Aqui")
);

let appExport: FirebaseApp | null = null;
let authExport: Auth | null = null;
let dbExport: Firestore | null = null;

if (hasValidKey) {
  try {
    appExport = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authExport = getAuth(appExport);
    dbExport = getFirestore(appExport);
    console.log("Firebase inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
} else {
  console.warn("Aviso: faltan claves validas de Firebase. La app funcionara en modo limitado.");
}

export const app = appExport;
export const auth = authExport;
export const db = dbExport;
export const firebaseReady = hasValidKey && !!appExport && !!authExport && !!dbExport;

export const getScopedFirebaseApp = (name: string): FirebaseApp => {
  if (!firebaseReady) {
    throw new Error("Firebase no esta disponible.");
  }

  const existing = getApps().find((candidate) => candidate.name === name);
  return existing || initializeApp(firebaseConfig, name);
};
