import { deleteField, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Hero } from '../types';

const USERS_COLLECTION = 'users';

const isDbReady = (): boolean => {
    if (!db) {
        console.warn('⚠️ Operación de base de datos omitida: Firebase no está inicializado.');
        return false;
    }
    return true;
};

interface UserProfileData {
    heroes: Hero[];
    completedMissionIds: string[];
    resources: { omegaCylinders: number };
    lastUpdated: any;
}

interface UserCampaignMeta {
    alignment: 'ALIVE' | 'ZOMBIE' | null;
    flowStep: string | null;
}

export const getUserProfile = async (uid: string, campaignMode: 'ALIVE' | 'ZOMBIE'): Promise<UserProfileData | null> => {
    if (!isDbReady() || !db) return null;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const campaignData = data[campaignMode];
            if (campaignData) {
                const heroes = campaignData.heroes || [];
                const missions = campaignData.missions || [];
                const resources = campaignData.resources || { omegaCylinders: 0 };
                const hasProgress = heroes.length > 0 || missions.length > 0 || (resources.omegaCylinders || 0) > 0;

                if (!hasProgress) {
                    return null;
                }

                return {
                    heroes,
                    completedMissionIds: missions,
                    resources,
                    lastUpdated: data.lastUpdated
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

export const getUserCampaignMeta = async (uid: string): Promise<UserCampaignMeta | null> => {
    if (!isDbReady() || !db) return null;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        const meta = data.campaignMeta || {};

        return {
            alignment: meta.alignment === 'ALIVE' || meta.alignment === 'ZOMBIE' ? meta.alignment : null,
            flowStep: typeof meta.flowStep === 'string' ? meta.flowStep : null
        };
    } catch (error) {
        console.error('Error fetching user campaign meta:', error);
        return null;
    }
};

export const saveUserProfile = async (
    uid: string,
    campaignMode: 'ALIVE' | 'ZOMBIE',
    heroes: Hero[],
    completedMissionIds: string[],
    resources?: { omegaCylinders: number },
    meta?: UserCampaignMeta
): Promise<void> => {
    if (!isDbReady() || !db) return;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        const updateData = {
            [campaignMode]: {
                heroes,
                missions: completedMissionIds,
                resources: resources || { omegaCylinders: 0 }
            },
            ...(meta ? { campaignMeta: meta } : {}),
            lastUpdated: Timestamp.now()
        };
        await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
};

export const saveUserCampaignMeta = async (uid: string, meta: UserCampaignMeta): Promise<void> => {
    if (!isDbReady() || !db) return;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(docRef, {
            campaignMeta: meta,
            lastUpdated: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user campaign meta:', error);
    }
};

export const resetUserProfiles = async (uid: string): Promise<void> => {
    if (!isDbReady() || !db) return;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(docRef, {
            ALIVE: deleteField(),
            ZOMBIE: deleteField(),
            campaignMeta: deleteField(),
            lastUpdated: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error resetting user profile:', error);
    }
};
