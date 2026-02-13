import { collection, getDocs, doc, writeBatch, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Mission } from '../types';

const MISSIONS_COLLECTION = 'missions';

// Helper para verificar si la DB está lista
const isDbReady = (): boolean => {
    if (!db) {
        console.warn("⚠️ Operación de base de datos omitida: Firebase no está inicializado.");
        return false;
    }
    return true;
};

export const getCustomMissions = async (): Promise<Mission[]> => {
    if (!db) return [];
    try {
        const querySnapshot = await getDocs(collection(db, MISSIONS_COLLECTION));
        const missions: Mission[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Mission;
            let normalizedPrereqs: string[] = [];
            if (data.prereqs && Array.isArray(data.prereqs)) {
                normalizedPrereqs = data.prereqs;
            } else if (data.prereq) {
                normalizedPrereqs = [data.prereq];
            }

            missions.push({
                ...data,
                id: doc.id,
                prereqs: normalizedPrereqs,
                prereq: normalizedPrereqs.length > 0 ? normalizedPrereqs[0] : undefined
            });
        });
        return missions;
    } catch (error) {
        console.error("Error fetching missions:", error);
        return [];
    }
};

export const createMissionInDB = async (missionData: Omit<Mission, 'id'>): Promise<string> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), missionData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating mission:", error);
        throw error;
    }
};

export const updateMissionInDB = async (id: string, missionData: Partial<Mission>): Promise<void> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        const { id: _, ...dataToUpdate } = missionData as any;
        await setDoc(docRef, dataToUpdate, { merge: true });
    } catch (error) {
        console.error("Error updating mission:", error);
        throw error;
    }
};

export const deleteMissionInDB = async (id: string): Promise<void> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting mission:", error);
        throw error;
    }
};

export const uploadLocalMissionsToDB = async (missions: Mission[]): Promise<void> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const batch = writeBatch(db);
        let count = 0;
        missions.forEach((mission) => {
            if (mission.id) {
                const docRef = doc(db!, MISSIONS_COLLECTION, mission.id);
                const cleanMission = JSON.parse(JSON.stringify(mission));
                batch.set(docRef, cleanMission);
                count++;
            }
        });
        await batch.commit();
        alert(`ÉXITO: Se han copiado ${count} misiones locales a la base de datos.`);
    } catch (error) {
        console.error("Error subiendo misiones locales:", error);
        alert("ERROR al subir misiones.");
        throw error;
    }
};
