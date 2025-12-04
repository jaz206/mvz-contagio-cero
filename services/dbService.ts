import { collection, getDocs, doc, writeBatch, getDoc, setDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HeroTemplate, HeroClass, Hero, Mission } from '../types';
import { HERO_DATABASE } from '../data/heroDatabase';

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
      
      // NUEVO CAMPO
      const defaultAlignment = findField(data, ['defaultAlignment', 'alignment', 'bando', 'tipo']);

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
          // Si no existe, asumimos ALIVE por defecto
          defaultAlignment: defaultAlignment || 'ALIVE' 
      });
    });
    return templates;
  } catch (error: any) {
    console.error("Error fetching hero templates:", error);
    return [];
  }
};

export const seedHeroTemplates = async (): Promise<void> => {
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

export const updateHeroTemplate = async (id: string, data: Partial<HeroTemplate>): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
        console.log(`Hero ${id} updated successfully`);
    } catch (error) {
        console.error("Error updating hero:", error);
        throw error;
    }
};

// ... (Resto de funciones de usuario y misiones igual que antes) ...
export interface UserProfileData {
    heroes: Hero[];
    completedMissionIds: string[];
    lastUpdated: any;
}

export const getUserProfile = async (uid: string, campaignMode: 'ALIVE' | 'ZOMBIE'): Promise<UserProfileData | null> => {
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
    completedMissionIds: string[]
): Promise<void> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, uid);
        const updateData = {
            [campaignMode]: {
                heroes: heroes,
                missions: completedMissionIds
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
    try {
        const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), missionData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating mission:", error);
        throw error;
    }
};

export const updateMissionInDB = async (id: string, missionData: Partial<Mission>): Promise<void> => {
    try {
        const docRef = doc(db, MISSIONS_COLLECTION, id);
        const { id: _, ...dataToUpdate } = missionData as any;
        await setDoc(docRef, dataToUpdate, { merge: true });
    } catch (error) {
        console.error("Error updating mission:", error);
        throw error;
    }
};