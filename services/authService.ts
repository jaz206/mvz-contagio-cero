import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  User
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getStaffAccount } from "./staffService";

const googleProvider = new GoogleAuthProvider();
const ADMIN_UID = (import.meta as any).env.VITE_ADMIN_UID || '60mH4M1SClV793Nq1WjQ3CExkLp1';
const ADMIN_EMAIL = ((import.meta as any).env.VITE_ADMIN_EMAIL || 'jorgeaz206@gmail.com').toLowerCase();

const ensureAuth = () => {
  if (!auth) {
    throw new Error("La autenticacion no esta disponible.");
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  ensureAuth();

  try {
    const result = await signInWithPopup(auth!, googleProvider);
    const currentEmail = (result.user.email || '').toLowerCase();
    const isAdminUser = result.user.uid === ADMIN_UID || currentEmail === ADMIN_EMAIL;
    const staffAccount = await getStaffAccount(result.user.uid);
    const isApprovedStaff = !!staffAccount && staffAccount.isActive && (staffAccount.role === 'editor' || staffAccount.role === 'admin');

    if (!isAdminUser && !isApprovedStaff) {
      await firebaseSignOut(auth!);
      throw new Error("Solo pueden entrar con cuenta el admin y los editores activos. El resto debe usar el modo local.");
    }

    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInEditor = async (email: string, password: string): Promise<User> => {
  ensureAuth();

  try {
    const result = await signInWithEmailAndPassword(auth!, email.trim(), password);
    const staffAccount = await getStaffAccount(result.user.uid);

    if (!staffAccount || (staffAccount.role !== 'editor' && staffAccount.role !== 'admin')) {
      await firebaseSignOut(auth!);
      throw new Error("Esta cuenta no tiene acceso de edicion.");
    }

    if (!staffAccount.isActive) {
      await firebaseSignOut(auth!);
      throw new Error("Esta cuenta esta desactivada.");
    }

    return result.user;
  } catch (error) {
    console.error("Error signing in editor", error);
    throw error;
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
