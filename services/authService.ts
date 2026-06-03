import {
  GoogleAuthProvider,
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

export const signInWithGoogle = async (): Promise<User | null> => {
  ensureAuth();
  await signInWithRedirect(auth!, googleProvider);
  return null;
};

export const logout = async () => {
  ensureAuth();

  try {
    await firebaseSignOut(auth!);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
