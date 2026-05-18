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
import {
    createUserWithEmailAndPassword,
    getAuth,
    signOut,
    updateProfile
} from 'firebase/auth';
import { db, getScopedFirebaseApp, firebaseReady } from '../firebaseConfig';
import { StaffAccount, StaffPermissions, PermissionBlock } from '../types';

const STAFF_COLLECTION = 'staffAccounts';

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

const normalizePermissions = (permissions?: Partial<StaffPermissions> | null): StaffPermissions => ({
    missions: {
        ...buildEditorPermissions().missions,
        ...(permissions?.missions || {})
    },
    characters: {
        ...buildEditorPermissions().characters,
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
    email: data.email || '',
    displayName: data.displayName || data.email || 'Editor',
    role: data.role || 'editor',
    isActive: data.isActive !== false,
    permissions: normalizePermissions(data.permissions),
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

export const ensureAdminStaffAccount = async (uid: string, email: string, displayName?: string): Promise<StaffAccount> => {
    ensureDb();

    const account: StaffAccount = {
        uid,
        email,
        displayName: displayName || email || 'Admin',
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
    password: string;
    displayName: string;
    permissions?: Partial<StaffPermissions>;
}): Promise<StaffAccount> => {
    ensureDb();

    const secondaryApp = getScopedFirebaseApp('staff-account-admin');
    const secondaryAuth = getAuth(secondaryApp);
    const credentials = await createUserWithEmailAndPassword(secondaryAuth, payload.email, payload.password);

    if (payload.displayName.trim()) {
        await updateProfile(credentials.user, { displayName: payload.displayName.trim() });
    }

    const account: StaffAccount = {
        uid: credentials.user.uid,
        email: payload.email.trim(),
        displayName: payload.displayName.trim() || payload.email.trim(),
        role: 'editor',
        isActive: true,
        permissions: normalizePermissions(payload.permissions)
    };

    await setDoc(doc(db!, STAFF_COLLECTION, credentials.user.uid), {
        ...account,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    await signOut(secondaryAuth);

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
