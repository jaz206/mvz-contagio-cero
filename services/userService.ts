import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Hero } from '../types';

const USERS_COLLECTION = 'users';

// Helper para verificar si la DB está lista
const isDbReady = (): boolean => {
    if (!db) {
        console.warn("⚠️ Operación de base de datos omitida: Firebase no está inicializado.");
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

export const getUserProfile = async (uid: string, campaignMode: 'ALIVE' | 'ZOMBIE'): Promise<UserProfileData | null> => {
    if (!isDbReady() || !db) return null;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const campaignData = data[campaignMode];
            if (campaignData) {
                return {
                    heroes: campaignData.heroes || [],
                    completedMissionIds: campaignData.missions || [],
                    resources: campaignData.resources || { omegaCylinders: 0 },
                    lastUpdated: data.lastUpdated
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const saveUserProfile = async (
    uid: string,
    campaignMode: 'ALIVE' | 'ZOMBIE',
    heroes: Hero[],
    completedMissionIds: string[],
    resources?: { omegaCylinders: number }
): Promise<void> => {
    if (!isDbReady() || !db) return;
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        const updateData = {
            [campaignMode]: {
                heroes: heroes,
                missions: completedMissionIds,
                resources: resources || { omegaCylinders: 0 }
            },
            lastUpdated: Timestamp.now()
        };
        await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
        console.error("Error saving user profile:", error);
    }
};
