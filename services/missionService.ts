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

const stripUndefinedFields = <T,>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map((item) => stripUndefinedFields(item)) as T;
    }

    if (value && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).reduce((acc, [key, item]) => {
            if (item !== undefined) {
                acc[key] = stripUndefinedFields(item);
            }
            return acc;
        }, {} as Record<string, unknown>) as T;
    }

    return value;
};

const normalizeComparableText = (value?: string) => (
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
);

const isMh0Mission = (mission: Mission) => {
    const normalizedTitle = normalizeComparableText(mission.title);
    return mission.id === 'm_intro_0'
        || normalizedTitle.includes('mh0')
        || normalizedTitle.includes('cadenas rotas')
        || normalizedTitle.includes('mision 0')
        || normalizedTitle.includes('mission 0');
};

const collapseMh0Duplicates = (missions: Mission[]): Mission[] => {
    const mh0Candidates = missions.filter(isMh0Mission);
    if (mh0Candidates.length <= 1) return missions;

    const canonicalMission = mh0Candidates.find((mission) => mission.id === 'm_intro_0')
        || mh0Candidates.find((mission) => (mission.status || 'PUBLISHED') === 'PUBLISHED')
        || mh0Candidates[0];

    const duplicateIds = new Set(
        mh0Candidates
            .filter((mission) => mission.id !== canonicalMission.id)
            .map((mission) => mission.id)
    );

    return missions.filter((mission) => !duplicateIds.has(mission.id));
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

const buildMissionWritePayload = (data: Partial<Mission>, useDefaults = false): Record<string, unknown> => {
    let normalizedPrereqs: string[] = [];

    if (Array.isArray(data.prereqs)) {
        normalizedPrereqs = data.prereqs.filter(Boolean);
    } else if (data.prereq) {
        normalizedPrereqs = [data.prereq];
    }

    const payload: Record<string, unknown> = {};
    const assign = (key: string, value: unknown) => {
        payload[key] = value;
    };

    if (useDefaults || 'title' in data) assign('title', data.title || 'MISION SIN NOMBRE');
    if (useDefaults || 'description' in data) assign('description', Array.isArray(data.description) ? data.description : []);
    if (useDefaults || 'objectives' in data) assign('objectives', Array.isArray(data.objectives) ? data.objectives : []);
    if (useDefaults || 'location' in data) assign('location', data.location || { state: 'Ohio', coordinates: [-82.5, 40.2] });
    if (useDefaults || 'threatLevel' in data) assign('threatLevel', data.threatLevel || 'INMINENTE');
    if (useDefaults || 'type' in data) assign('type', data.type || 'STANDARD');
    if (useDefaults || 'triggerStage' in data) assign('triggerStage', data.triggerStage || null);
    if (useDefaults || 'alignment' in data) assign('alignment', data.alignment || 'BOTH');
    if (useDefaults || 'requirements' in data) assign('requirements', Array.isArray(data.requirements) ? data.requirements : []);
    if (useDefaults || 'specialRules' in data) assign('specialRules', Array.isArray(data.specialRules) ? data.specialRules : []);
    if (useDefaults || 'setupInstructions' in data) assign('setupInstructions', Array.isArray(data.setupInstructions) ? data.setupInstructions : []);
    if (useDefaults || 'pdfUrl' in data) assign('pdfUrl', data.pdfUrl || null);
    if (useDefaults || 'layoutUrl' in data) assign('layoutUrl', data.layoutUrl || null);
    if (useDefaults || 'outcomeText' in data) assign('outcomeText', data.outcomeText || null);
    if (useDefaults || 'isIntroMission' in data) assign('isIntroMission', data.isIntroMission === true);
    if (useDefaults || 'status' in data) assign('status', (data.status as MissionStatus) || (useDefaults ? 'PUBLISHED' : undefined));
    if (useDefaults || 'mapPosition' in data) assign('mapPosition', data.mapPosition || null);
    if (useDefaults || 'isProtected' in data) assign('isProtected', data.isProtected === true);

    if (useDefaults || 'prereqs' in data || 'prereq' in data) {
        assign('prereqs', normalizedPrereqs);
        assign('prereq', normalizedPrereqs[0] || null);
    }

    return stripUndefinedFields(payload);
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
        const missions = await loadRawMissionRepository();
        return collapseMh0Duplicates(missions);
    } catch (error) {
        console.error('Error fetching missions:', error);
        return [];
    }
};

const loadRawMissionRepository = async (): Promise<Mission[]> => {
    if (!db) return [];

    const querySnapshot = await getDocs(collection(db, MISSIONS_COLLECTION));
    const missions: Mission[] = [];

    querySnapshot.forEach((missionDoc) => {
        missions.push(normalizeMission(missionDoc.id, missionDoc.data() as Partial<Mission>));
    });

    return missions;
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

            batch.set(docRef, buildMissionWritePayload(mission, true));
            hasPendingSeed = true;
        }

        if (hasPendingSeed) {
            await batch.commit();
        }

        const repository = await loadRawMissionRepository();
        const mh0Base = initialMissions.find((mission) => mission.id === 'm_intro_0');
        const mh0Candidates = repository.filter(isMh0Mission);

        if (!mh0Base || mh0Candidates.length <= 1) {
            return collapseMh0Duplicates(repository);
        }

        const canonicalMission = mh0Candidates.find((mission) => mission.id === 'm_intro_0') || mh0Base;
        const duplicateMissions = mh0Candidates.filter((mission) => mission.id !== canonicalMission.id);

        if (duplicateMissions.length === 0) {
            return collapseMh0Duplicates(repository);
        }

        const duplicateIds = new Set(duplicateMissions.map((mission) => mission.id));
        const replacementPosition = canonicalMission.mapPosition
            || duplicateMissions.find((mission) => mission.mapPosition)?.mapPosition
            || mh0Base.mapPosition;

        const repairBatch = writeBatch(db);

        repairBatch.set(
            doc(db, MISSIONS_COLLECTION, 'm_intro_0'),
            buildMissionWritePayload({
                ...mh0Base,
                status: 'PUBLISHED',
                isProtected: true,
                isIntroMission: true,
                mapPosition: replacementPosition
            }, true),
            { merge: true }
        );

        repository.forEach((mission) => {
            if (mission.id === 'm_intro_0' || duplicateIds.has(mission.id)) return;

            const currentPrereqs = Array.isArray(mission.prereqs) && mission.prereqs.length > 0
                ? mission.prereqs
                : (mission.prereq ? [mission.prereq] : []);

            const remappedPrereqs = Array.from(new Set(
                currentPrereqs.map((prereqId) => duplicateIds.has(prereqId) ? 'm_intro_0' : prereqId).filter(Boolean)
            ));

            const shouldUpdate = remappedPrereqs.length !== currentPrereqs.length
                || remappedPrereqs.some((prereqId, index) => prereqId !== currentPrereqs[index]);

            if (!shouldUpdate) return;

            repairBatch.set(
                doc(db, MISSIONS_COLLECTION, mission.id),
                buildMissionWritePayload({
                    prereqs: remappedPrereqs,
                    prereq: remappedPrereqs[0] || undefined
                }, false),
                { merge: true }
            );
        });

        duplicateMissions.forEach((mission) => {
            repairBatch.delete(doc(db, MISSIONS_COLLECTION, mission.id));
        });

        await repairBatch.commit();

        return await getMissionRepository();
    } catch (error) {
        console.error('Error syncing initial mission repository:', error);
        return initialMissions;
    }
};


export const createMissionInDB = async (missionData: Omit<Mission, 'id'>): Promise<string> => {
    if (!db) throw new Error('DB no disponible');

    try {
        const normalizedMission = buildMissionWritePayload({
            ...missionData,
            status: missionData.status || 'DRAFT',
            isProtected: false
        }, true);
        const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), normalizedMission);
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
        const dataToUpdate = buildMissionWritePayload(missionData, false);
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
            const payload = buildMissionWritePayload(mission, true);
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
