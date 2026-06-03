import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db, firebaseReady } from '../firebaseConfig';
import { StaffAccount, StaffPermissions, PermissionBlock } from '../types';

const STAFF_COLLECTION = 'staffAccounts';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const buildPermissionBlock = (view = false, create = false, edit = false, remove = false): PermissionBlock => ({
    view,
    create,
    edit,
    delete: remove
});

export const buildAdminPermissions = (): StaffPermissions => ({
    missions: buildPermissionBlock(true, true, true, true),
    characters: buildPermissionBlock(true, true, true, true)
});

export const buildEditorPermissions = (): StaffPermissions => ({
    missions: buildPermissionBlock(true, true, true, false),
    characters: buildPermissionBlock(false, false, false, false)
});

export const buildTesterPermissions = (): StaffPermissions => ({
    missions: buildPermissionBlock(false, false, false, false),
    characters: buildPermissionBlock(false, false, false, false)
});

const getBasePermissions = (role?: 'admin' | 'editor' | 'tester' | null): StaffPermissions => {
    if (role === 'admin') return buildAdminPermissions();
    if (role === 'tester') return buildTesterPermissions();
    return buildEditorPermissions();
};

const normalizePermissions = (permissions?: Partial<StaffPermissions> | null, role?: 'admin' | 'editor' | 'tester' | null): StaffPermissions => ({
    missions: {
        ...getBasePermissions(role).missions,
        ...(permissions?.missions || {})
    },
    characters: {
        ...getBasePermissions(role).characters,
        ...(permissions?.characters || {})
    }
});

const ensureDb = () => {
    if (!firebaseReady || !db) {
        throw new Error('La base de datos no esta disponible.');
    }
};

const staffDocToAccount = (uid: string, data: any): StaffAccount => ({
    uid,
    email: (data.email || '').toLowerCase(),
    displayName: data.displayName || data.email || 'Editor',
    role: data.role || 'editor',
    isActive: data.isActive !== false,
    permissions: normalizePermissions(data.permissions, data.role),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
});

export const getStaffAccount = async (uid: string): Promise<StaffAccount | null> => {
    ensureDb();

    const staffRef = doc(db!, STAFF_COLLECTION, uid);
    const snapshot = await getDoc(staffRef);

    if (!snapshot.exists()) {
        return null;
    }

    return staffDocToAccount(snapshot.id, snapshot.data());
};

export const getStaffAccountByEmail = async (email: string): Promise<StaffAccount | null> => {
    ensureDb();

    const normalizedEmail = normalizeEmail(email);
    const directSnapshot = await getDoc(doc(db!, STAFF_COLLECTION, normalizedEmail));
    if (directSnapshot.exists()) {
        return staffDocToAccount(directSnapshot.id, directSnapshot.data());
    }

    return null;
};

export const ensureAdminStaffAccount = async (uid: string, email: string, displayName?: string): Promise<StaffAccount> => {
    ensureDb();
    const normalizedEmail = normalizeEmail(email);

    const account: StaffAccount = {
        uid,
        email: normalizedEmail,
        displayName: displayName || normalizedEmail || 'Admin',
        role: 'admin',
        isActive: true,
        permissions: buildAdminPermissions()
    };

    await setDoc(doc(db!, STAFF_COLLECTION, uid), {
        ...account,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });

    return account;
};

export const listStaffAccounts = async (): Promise<StaffAccount[]> => {
    ensureDb();

    const staffQuery = query(collection(db!, STAFF_COLLECTION), orderBy('email'));
    const snapshot = await getDocs(staffQuery);

    return snapshot.docs.map((item) => staffDocToAccount(item.id, item.data()));
};

export const createEditorAccount = async (payload: {
    email: string;
    displayName: string;
    role?: 'admin' | 'editor' | 'tester';
    permissions?: Partial<StaffPermissions>;
}): Promise<StaffAccount> => {
    ensureDb();
    const normalizedEmail = normalizeEmail(payload.email);

    const account: StaffAccount = {
        uid: normalizedEmail,
        email: normalizedEmail,
        displayName: payload.displayName.trim() || normalizedEmail,
        role: payload.role || 'editor',
        isActive: true,
        permissions: normalizePermissions(payload.permissions, payload.role)
    };

    await setDoc(doc(db!, STAFF_COLLECTION, account.uid), {
        ...account,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return account;
};

export const updateStaffPermissions = async (uid: string, permissions: StaffPermissions): Promise<void> => {
    ensureDb();
    await updateDoc(doc(db!, STAFF_COLLECTION, uid), {
        permissions,
        updatedAt: serverTimestamp()
    });
};

export const updateStaffStatus = async (uid: string, isActive: boolean): Promise<void> => {
    ensureDb();
    await updateDoc(doc(db!, STAFF_COLLECTION, uid), {
        isActive,
        updatedAt: serverTimestamp()
    });
};

export const updateStaffRole = async (uid: string, role: 'admin' | 'editor' | 'tester'): Promise<void> => {
    ensureDb();
    await updateDoc(doc(db!, STAFF_COLLECTION, uid), {
        role,
        permissions: normalizePermissions(null, role),
        updatedAt: serverTimestamp()
    });
};

/**
 * Actualiza el UID de autenticación de un usuario staff en su documento de Firestore.
 * Esto es necesario porque las cuentas de editores/testers se crean inicialmente
 * usando su correo como ID y UID provisional. Al iniciar sesión por primera vez
 * con Google Auth, se asocia su identificador único real de Firebase para que
 * coincida en futuras validaciones locales y de cliente.
 */
export const updateStaffUid = async (docId: string, newUid: string): Promise<void> => {
    ensureDb();
    await updateDoc(doc(db!, STAFF_COLLECTION, docId), {
        uid: newUid,
        updatedAt: serverTimestamp()
    });
};
