import { collection, getDocs, doc, writeBatch, getDoc, setDoc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HeroTemplate, HeroClass, Hero, Mission } from '../types';
import { HERO_DATABASE } from '../data/heroDatabase';
import { GAME_EXPANSIONS } from '../data/gameContent';

const COLLECTION_NAME = 'heroes';
const USERS_COLLECTION = 'users';
const MISSIONS_COLLECTION = 'missions';

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
      
      const name = findField(data, ['defaultName', 'nombre_Real', 'nombreReal', 'realName', 'name', 'nombre']);
      const heroClass = findField(data, ['defaultClass', 'clase', 'class', 'rol']);
      const stats = findField(data, ['defaultStats', 'stats', 'estadisticas']);
      
      const str = findField(data, ['strength', 'fuerza', 'str']);
      const agi = findField(data, ['agility', 'agilidad', 'agi']);
      const int = findField(data, ['intellect', 'intelecto', 'int']);

      const imageUrl = findField(data, ['imageUrl', 'foto', 'image', 'img', 'url', 'picture']);
      const bio = findField(data, ['bio', 'biografia', 'biography', 'historia', 'history']);
      const alias = findField(data, ['alias', 'codename', 'nombre_en_clave', 'heroname']);
      
      const currentStory = findField(data, ['currentStory', 'historia_actual', 'historiaActual', 'current_story']);
      const objectives = findField(data, ['objectives', 'objetivos', 'goals', 'misiones']);
      
      const defaultAlignment = findField(data, ['defaultAlignment', 'alignment', 'bando', 'tipo']);
      
      // Recuperamos el campo oculto
      const expansionId = findField(data, ['expansionId', 'expansion', 'caja']);

      templates.push({
          id: doc.id,
          defaultName: name || 'Unknown Agent',
          defaultClass: (heroClass || 'BRAWLER') as HeroClass,
          defaultStats: stats || { 
              strength: Number(str) || 5, 
              agility: Number(agi) || 5, 
              intellect: Number(int) || 5 
          },
          imageUrl: imageUrl || '',
          bio: bio || '',
          alias: alias || '',
          currentStory: currentStory || '',
          objectives: Array.isArray(objectives) ? objectives : [],
          defaultAlignment: defaultAlignment || 'ALIVE',
          expansionId: expansionId || 'unknown'
      });
    });
    return templates;
  } catch (error: any) {
    console.error("Error fetching hero templates:", error);
    return [];
  }
};

export const seedHeroTemplates = async (): Promise<void> => {
  if (!db) throw new Error("Base de datos no configurada");
  try {
    const batch = writeBatch(db);
    HERO_DATABASE.forEach((hero) => {
      const docRef = doc(db, COLLECTION_NAME, hero.id);
      batch.set(docRef, hero);
    });
    await batch.commit();
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// --- ESTA ES LA FUNCIÓN QUE FALTABA O ESTABA MAL ESCRITA ---
export const updateHeroTemplate = async (id: string, data: Partial<HeroTemplate>): Promise<void> => {
    if (!db) return;
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
        console.log(`Hero ${id} updated successfully`);
    } catch (error) {
        console.error("Error updating hero:", error);
        throw error;
    }
};
// -----------------------------------------------------------

export const createHeroTemplateInDB = async (heroData: Omit<HeroTemplate, 'id'>): Promise<string> => {
    if (!db) throw new Error("Base de datos no configurada");
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), heroData);
        console.log("Hero created with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error creating hero template:", error);
        throw error;
    }
};

export const deleteHeroInDB = async (id: string): Promise<void> => {
    if (!db) throw new Error("Base de datos no configurada");
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        console.log(`Hero ${id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting hero:", error);
        throw error;
    }
};

export interface UserProfileData {
    heroes: Hero[];
    completedMissionIds: string[];
    resources?: { omegaCylinders: number };
    lastUpdated: any;
}

export const getUserProfile = async (uid: string, campaignMode: 'ALIVE' | 'ZOMBIE'): Promise<UserProfileData | null> => {
    if (!db) return null;
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
    if (!db) return;
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
        console.log(`Cloud save successful for ${campaignMode}`);
    } catch (error) {
        console.error("Error saving user profile:", error);
        throw error;
    }
};

export const getCustomMissions = async (): Promise<Mission[]> => {
    if (!db) { console.warn("DB no disponible (getCustomMissions)"); return []; }
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
    if (!db) throw new Error("Base de datos no configurada");
    try {
        const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), missionData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating mission:", error);
        throw error;
    }
};

export const updateMissionInDB = async (id: string, missionData: Partial<Mission>): Promise<void> => {
    if (!db) throw new Error("Base de datos no configurada");
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
    if (!db) throw new Error("Base de datos no configurada");
    try {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        await deleteDoc(docRef);
        console.log(`Mission ${id} deleted successfully`);
    } catch (error) {
        console.error("Error deleting mission:", error);
        throw error;
    }
};

export const seedExpansionsToDB = async (): Promise<void> => {
    if (!db) throw new Error("Base de datos no configurada");
    try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log("Colección de héroes limpiada.");

        const createBatch = writeBatch(db);
        let count = 0;

        for (const exp of GAME_EXPANSIONS) {
            for (const hero of exp.heroes) {
                const docRef = doc(db, COLLECTION_NAME, hero.id);
                const templateData: HeroTemplate = {
                    id: hero.id,
                    defaultName: hero.name,
                    alias: hero.alias,
                    defaultClass: hero.class,
                    bio: hero.bio,
                    imageUrl: hero.imageUrl || '',
                    defaultStats: hero.stats,
                    defaultAlignment: 'ALIVE',
                    currentStory: '',
                    objectives: [],
                    expansionId: exp.id
                };
                createBatch.set(docRef, templateData);
                count++;
            }

            for (const zHero of exp.zombieHeroes) {
                const docRef = doc(db, COLLECTION_NAME, zHero.id);
                const templateData: HeroTemplate = {
                    id: zHero.id,
                    defaultName: zHero.name,
                    alias: zHero.alias,
                    defaultClass: zHero.class,
                    bio: zHero.bio,
                    imageUrl: zHero.imageUrl || '',
                    defaultStats: zHero.stats,
                    defaultAlignment: 'ZOMBIE',
                    currentStory: '',
                    objectives: [],
                    expansionId: exp.id
                };
                createBatch.set(docRef, templateData);
                count++;
            }
        }

        await createBatch.commit();
        console.log(`Se han subido ${count} héroes de expansiones a la base de datos.`);
        alert(`BBDD REINICIADA: ${count} personajes creados correctamente.`);
    } catch (error) {
        console.error("Error seeding expansions:", error);
        alert("ERROR al sincronizar expansiones. Revisa la consola.");
        throw error;
    }
};

export const uploadLocalMissionsToDB = async (missions: Mission[]): Promise<void> => {
    if (!db) throw new Error("Base de datos no configurada");
    
    try {
        const batch = writeBatch(db);
        let count = 0;

        missions.forEach((mission) => {
            if (mission.id) {
                const docRef = doc(db, MISSIONS_COLLECTION, mission.id);
                const cleanMission = JSON.parse(JSON.stringify(mission));
                batch.set(docRef, cleanMission);
                count++;
            }
        });

        await batch.commit();
        console.log(`${count} misiones locales subidas a la BBDD.`);
        alert(`ÉXITO: Se han copiado ${count} misiones locales a la base de datos.`);
    } catch (error) {
        console.error("Error subiendo misiones locales:", error);
        alert("ERROR al subir misiones. Revisa la consola.");
        throw error;
    }
};