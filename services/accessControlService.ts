import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../firebaseConfig';
import { LoginAccessConfig, LoginAccessMode } from '../types';

const SETTINGS_COLLECTION = 'systemSettings';
const ACCESS_DOC_ID = 'loginAccess';
const DEFAULT_ACCESS_MODE: LoginAccessMode = 'DEVELOPMENT';

const ensureDb = () => {
    if (!firebaseReady || !db) {
        throw new Error('La base de datos no esta disponible.');
    }
};

const normalizeMode = (mode?: string): LoginAccessMode => {
    return mode === 'PUBLIC' ? 'PUBLIC' : 'DEVELOPMENT';
};

export const getLoginAccessConfig = async (): Promise<LoginAccessConfig> => {
    if (!firebaseReady || !db) {
        return { mode: DEFAULT_ACCESS_MODE };
    }

    const ref = doc(db, SETTINGS_COLLECTION, ACCESS_DOC_ID);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        return { mode: DEFAULT_ACCESS_MODE };
    }

    return {
        mode: normalizeMode(snapshot.data()?.mode)
    };
};

export const saveLoginAccessMode = async (mode: LoginAccessMode): Promise<void> => {
    ensureDb();

    await setDoc(doc(db!, SETTINGS_COLLECTION, ACCESS_DOC_ID), {
        mode,
        updatedAt: serverTimestamp()
    }, { merge: true });
};
