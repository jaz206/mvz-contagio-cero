import { collection, getDocs, doc, writeBatch, getDoc, setDoc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HeroTemplate, HeroClass, Hero, Mission } from '../types';
import { HERO_DATABASE } from '../data/heroDatabase';
import { GAME_EXPANSIONS } from '../data/gameContent';

const COLLECTION_NAME = 'heroes';
const USERS_COLLECTION = 'users';
const MISSIONS_COLLECTION = 'missions';

// ... (Mantén las funciones auxiliares findField y getHeroTemplates igual que antes) ...
const findField = (data: any, possibleKeys: string[]): any => {
    const dataKeys = Object.keys(data);
    for (const key of possibleKeys) {
        if (data[key] !== undefined) return data[key];
        const foundKey = dataKeys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
        if (foundKey) return data[foundKey];
    }
    return undefined;
};

export const getHeroTemplates = async (): Promise<HeroTemplate[]> => {
  if (!db) { console.warn("DB no disponible (getHeroTemplates)"); return []; }
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const templates: HeroTemplate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // ... (Lógica de mapeo existente) ...
      templates.push({
          id: doc.id,
          defaultName: findField(data, ['defaultName', 'name']) || 'Unknown',
          defaultClass: (findField(data, ['defaultClass', 'class']) || 'BRAWLER') as HeroClass,
          defaultStats: findField(data, ['defaultStats', 'stats']) || { strength: 5, agility: 5, intellect: 5 },
          imageUrl: findField(data, ['imageUrl', 'image']) || '',
          bio: findField(data, ['bio']) || '',
          alias: findField(data, ['alias']) || '',
          currentStory: findField(data, ['currentStory']) || '',
          objectives: findField(data, ['objectives']) || [],
          defaultAlignment: findField(data, ['defaultAlignment']) || 'ALIVE',
          expansionId: findField(data, ['expansionId']) || 'unknown'
      });
    });
    return templates;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ... (Mantén seedHeroTemplates, updateHeroTemplate, createHeroTemplateInDB, deleteHeroInDB, getUserProfile, saveUserProfile igual) ...

export const getCustomMissions = async (): Promise<Mission[]> => {
    if (!db) { console.warn("DB no disponible"); return []; }
    try {
        const querySnapshot = await getDocs(collection(db, MISSIONS_COLLECTION));
        const missions: Mission[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Mission;
            missions.push({ ...data, id: doc.id });
        });
        return missions;
    } catch (error) {
        console.error("Error fetching missions:", error);
        return [];
    }
};

export const createMissionInDB = async (missionData: Omit<Mission, 'id'>): Promise<string> => {
    if (!db) throw new Error("No DB");
    const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), missionData);
    return docRef.id;
};

export const updateMissionInDB = async (id: string, missionData: Partial<Mission>): Promise<void> => {
    if (!db) throw new Error("No DB");
    const docRef = doc(db, MISSIONS_COLLECTION, id);
    const { id: _, ...data } = missionData as any;
    await setDoc(docRef, data, { merge: true });
};

export const deleteMissionInDB = async (id: string): Promise<void> => {
    if (!db) throw new Error("No DB");
    await deleteDoc(doc(db, MISSIONS_COLLECTION, id));
};

export const seedExpansionsToDB = async (): Promise<void> => {
    // ... (Tu código de seedExpansionsToDB existente) ...
    if (!db) return;
    // Implementación simplificada para el ejemplo, usa la versión completa que te di antes si la tienes
    console.log("Seeding expansions...");
};

// --- ESTA ES LA FUNCIÓN CLAVE QUE NECESITAS ---
export const uploadLocalMissionsToDB = async (missions: Mission[]): Promise<void> => {
    if (!db) throw new Error("Base de datos no configurada");
    
    try {
        const batch = writeBatch(db);
        let count = 0;

        missions.forEach((mission) => {
            // Usamos el ID de la misión (ej: 'm_intro_0') como ID del documento
            if (mission.id) {
                const docRef = doc(db, MISSIONS_COLLECTION, mission.id);
                // Limpiamos el objeto para evitar errores de 'undefined' en Firestore
                const cleanMission = JSON.parse(JSON.stringify(mission));
                batch.set(docRef, cleanMission);
                count++;
            }
        });

        await batch.commit();
        console.log(`${count} misiones locales subidas a la BBDD.`);
        alert(`ÉXITO: Se han copiado ${count} misiones locales a la base de datos.\n\nAhora 'MH0: Cadenas Rotas' existe en la nube y las conexiones funcionarán.`);
    } catch (error) {
        console.error("Error subiendo misiones locales:", error);
        alert("ERROR al subir misiones. Revisa la consola.");
        throw error;
    }
};