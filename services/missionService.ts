import { collection, getDocs, doc, writeBatch, addDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { translations } from '../translations';
import { getInitialMissions } from '../data/initialMissions';
import { Mission, MissionStatus } from '../types';

const MISSIONS_COLLECTION = 'missions';

const isDbReady = (): boolean => {
    if (!db) {
        console.warn('Operacion de base de datos omitida: Firebase no esta inicializado.');
        return false;
    }
    return true;
};

const normalizeMission = (id: string, data: Partial<Mission>): Mission => {
    let normalizedPrereqs: string[] = [];

    if (Array.isArray(data.prereqs)) {
        normalizedPrereqs = data.prereqs.filter(Boolean);
    } else if (data.prereq) {
        normalizedPrereqs = [data.prereq];
    }

    return {
        id,
        title: data.title || 'MISION SIN NOMBRE',
        description: Array.isArray(data.description) ? data.description : [],
        objectives: Array.isArray(data.objectives) ? data.objectives : [],
        location: data.location || { state: 'Ohio', coordinates: [-82.5, 40.2] },
        threatLevel: data.threatLevel || 'INMINENTE',
        type: data.type || 'STANDARD',
        triggerStage: data.triggerStage || 'NORMAL',
        prereqs: normalizedPrereqs,
        prereq: normalizedPrereqs[0],
        pdfUrl: data.pdfUrl || undefined,
        alignment: data.alignment || 'BOTH',
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        specialRules: Array.isArray(data.specialRules) ? data.specialRules : [],
        setupInstructions: Array.isArray(data.setupInstructions) ? data.setupInstructions : [],
        layoutUrl: data.layoutUrl || undefined,
        outcomeText: data.outcomeText || undefined,
        isIntroMission: data.isIntroMission === true,
        status: (data.status as MissionStatus) || 'PUBLISHED',
        mapPosition: data.mapPosition || undefined,
        isProtected: data.isProtected === true
    };
};

const buildInitialRepositorySeed = (): Mission[] => {
    const seed = getInitialMissions(translations.es);
    return seed.map((mission, index) => normalizeMission(mission.id, {
        ...mission,
        status: 'PUBLISHED',
        isProtected: mission.id === 'm_intro_0',
        mapPosition: mission.mapPosition || {
            x: 180 + ((index % 4) * 220),
            y: 120 + (Math.floor(index / 4) * 170)
        }
    }));
};

export const getMissionRepository = async (): Promise<Mission[]> => {
    if (!db) return [];

    try {
        const querySnapshot = await getDocs(collection(db, MISSIONS_COLLECTION));
        const missions: Mission[] = [];

        querySnapshot.forEach((missionDoc) => {
            missions.push(normalizeMission(missionDoc.id, missionDoc.data() as Partial<Mission>));
        });

        return missions;
    } catch (error) {
        console.error('Error fetching missions:', error);
        return [];
    }
};

export const getCustomMissions = getMissionRepository;

export const syncInitialMissionRepository = async (): Promise<Mission[]> => {
    const initialMissions = buildInitialRepositorySeed();

    if (!isDbReady() || !db) {
        return initialMissions;
    }

    try {
        const batch = writeBatch(db);
        let hasPendingSeed = false;

        for (const mission of initialMissions) {
            const docRef = doc(db, MISSIONS_COLLECTION, mission.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) continue;

            batch.set(docRef, mission);
            hasPendingSeed = true;
        }

        if (hasPendingSeed) {
            await batch.commit();
        }

        return await getMissionRepository();
    } catch (error) {
        console.error('Error syncing initial mission repository:', error);
        return initialMissions;
    }
};

export const createMissionInDB = async (missionData: Omit<Mission, 'id'>): Promise<string> => {
    if (!db) throw new Error('DB no disponible');

    try {
        const normalizedMission = normalizeMission(`mission_${Date.now()}`, {
            ...missionData,
            status: missionData.status || 'DRAFT',
            isProtected: false
        });
        const { id: _, ...payload } = normalizedMission;
        const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), payload);
        return docRef.id;
    } catch (error) {
        console.error('Error creating mission:', error);
        throw error;
    }
};

export const updateMissionInDB = async (id: string, missionData: Partial<Mission>): Promise<void> => {
    if (!db) throw new Error('DB no disponible');

    try {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        const normalizedMission = normalizeMission(id, missionData);
        const { id: _, prereq, ...dataToUpdate } = normalizedMission;
        await setDoc(docRef, dataToUpdate, { merge: true });
    } catch (error) {
        console.error('Error updating mission:', error);
        throw error;
    }
};

export const deleteMissionInDB = async (id: string): Promise<void> => {
    if (!db) throw new Error('DB no disponible');

    try {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting mission:', error);
        throw error;
    }
};

export const uploadLocalMissionsToDB = async (missions: Mission[]): Promise<void> => {
    if (!db) throw new Error('DB no disponible');

    try {
        const batch = writeBatch(db);
        let count = 0;

        missions.forEach((mission) => {
            if (!mission.id) return;

            const docRef = doc(db, MISSIONS_COLLECTION, mission.id);
            const normalizedMission = normalizeMission(mission.id, mission);
            const { id: _, prereq, ...payload } = normalizedMission;
            batch.set(docRef, payload, { merge: true });
            count += 1;
        });

        await batch.commit();
        alert(`Se han copiado ${count} misiones al repositorio.`);
    } catch (error) {
        console.error('Error subiendo misiones:', error);
        alert('Error al subir misiones.');
        throw error;
    }
};
