import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  User
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getStaffAccountByEmail } from "./staffService";
import { getLoginAccessConfig } from "./accessControlService";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
const ADMIN_UID = (import.meta as any).env.VITE_ADMIN_UID || '60mH4M1SClV793Nq1WjQ3CExkLp1';
const ADMIN_EMAIL = ((import.meta as any).env.VITE_ADMIN_EMAIL || 'jorgeaz206@gmail.com').toLowerCase();

const ensureAuth = () => {
  if (!auth) {
    throw new Error("La autenticacion no esta disponible.");
  }
};

const findStaffAccount = async (email: string) => {
  try {
    const byEmail = await getStaffAccountByEmail(email);
    if (byEmail) return byEmail;
  } catch (error) {
    console.warn('No se pudo leer la cuenta por correo.');
  }
  return null;
};

export const signInWithGoogle = async (): Promise<User | null> => {
  ensureAuth();

  try {
    const result = await signInWithPopup(auth!, googleProvider);
    const currentEmail = (result.user.email || '').toLowerCase();
    const isAdminUser = result.user.uid === ADMIN_UID || currentEmail === ADMIN_EMAIL;
    const accessConfig = await getLoginAccessConfig();
    const staffAccount = await findStaffAccount(currentEmail);
    const isApprovedStaff = !!staffAccount && staffAccount.isActive && (
      staffAccount.role === 'editor'
      || staffAccount.role === 'admin'
      || staffAccount.role === 'tester'
    );

    if (staffAccount && !staffAccount.isActive) {
      await firebaseSignOut(auth!);
      throw new Error("Esta cuenta está desactivada.");
    }

    if (!isAdminUser && accessConfig.mode === 'DEVELOPMENT' && !isApprovedStaff) {
      await firebaseSignOut(auth!);
      throw new Error("Solo pueden entrar las cuentas autorizadas por el admin. El resto debe usar el modo local.");
    }

    return result.user;
  } catch (error) {
    const message = String((error as any)?.message || error || '');
    const code = String((error as any)?.code || '');
    const isPopupIssue = /cross-origin-opener-policy|window\.closed|popup/i.test(message) || /popup/i.test(code);

    if (isPopupIssue) {
      await signInWithRedirect(auth!, googleProvider);
      return null;
    }

    console.error("Error signing in with Google", error);
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
