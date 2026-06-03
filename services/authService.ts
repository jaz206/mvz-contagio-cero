import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const ensureAuth = () => {
  if (!auth) {
    throw new Error("La autenticacion no esta disponible.");
  }
};

const shouldFallbackToRedirect = (error: any) => {
  const code = String(error?.code || '').toLowerCase();
  return (
    code.includes('popup-blocked')
    || code.includes('popup-closed-by-user')
    || code.includes('cancelled-popup-request')
    || code.includes('operation-not-supported')
  );
};

export const signInWithGoogle = async (): Promise<User | null> => {
  ensureAuth();

  await setPersistence(auth!, browserLocalPersistence);

  try {
    const result = await signInWithPopup(auth!, googleProvider);
    return result.user;
  } catch (error) {
    if (!shouldFallbackToRedirect(error)) {
      throw error;
    }

    await signInWithRedirect(auth!, googleProvider);
    return null;
  }
};

export const logout = async () => {
  ensureAuth();

  try {
    await firebaseSignOut(auth!);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
