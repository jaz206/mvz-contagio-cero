
import { collection, getDocs, doc, writeBatch, getDoc, setDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HeroTemplate, HeroClass, Hero, Mission } from '../types';
import { HERO_DATABASE } from '../data/heroDatabase';

// Changed to 'heroes' to match your manual collection
const COLLECTION_NAME = 'heroes';
const USERS_COLLECTION = 'users';
const MISSIONS_COLLECTION = 'missions';

// Helper to find a value in an object using multiple possible key variations (case-insensitive, trimming whitespace)
const findField = (data: any, possibleKeys: string[]): any => {
    const dataKeys = Object.keys(data);
    for (const key of possibleKeys) {
        // 1. Try exact match
        if (data[key] !== undefined) return data[key];
        
        // 2. Try case-insensitive and trimmed match
        const foundKey = dataKeys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
        if (foundKey) return data[foundKey];
    }
    return undefined;
};

// Fetch all hero templates from Firestore
export const getHeroTemplates = async (): Promise<HeroTemplate[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const templates: HeroTemplate[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Use helper to find fields regardless of capitalization or accidental spaces
      const name = findField(data, ['defaultName', 'nombre_Real', 'nombreReal', 'realName', 'name', 'nombre']);
      const heroClass = findField(data, ['defaultClass', 'clase', 'class', 'rol']);
      const stats = findField(data, ['defaultStats', 'stats', 'estadisticas']);
      
      // Flattened stats support
      const str = findField(data, ['strength', 'fuerza', 'str']);
      const agi = findField(data, ['agility', 'agilidad', 'agi']);
      const int = findField(data, ['intellect', 'intelecto', 'int']);

      const imageUrl = findField(data, ['imageUrl', 'foto', 'image', 'img', 'url', 'picture']);
      const bio = findField(data, ['bio', 'biografia', 'biography', 'historia', 'history']);
      const alias = findField(data, ['alias', 'codename', 'nombre_en_clave', 'heroname']);
      
      // New Fields
      const currentStory = findField(data, ['currentStory', 'historia_actual', 'historiaActual', 'current_story']);
      const objectives = findField(data, ['objectives', 'objetivos', 'goals', 'misiones']);

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
          objectives: Array.isArray(objectives) ? objectives : []
      });
    });
    return templates;
  } catch (error: any) {
    console.error("Error fetching hero templates:", error);
    if (error.code === 'permission-denied') {
        console.warn("Check Firebase Console > Firestore > Rules. Ensure read access is allowed.");
    }
    return [];
  }
};

// Seed the database with the static HERO_DATABASE data
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

// Update an existing hero template in Firestore
export const updateHeroTemplate = async (id: string, data: Partial<HeroTemplate>): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        // Map back to the fields likely used in your DB if you want consistency, 
        // or just update the fields the app uses. 
        // For simplicity, we update the fields the app reads.
        await updateDoc(docRef, data);
        console.log(`Hero ${id} updated successfully`);
    } catch (error) {
        console.error("Error updating hero:", error);
        throw error;
    }
};

// --- USER PROFILE (CLOUD SAVE) ---

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
            // Data is structured as: { ALIVE: { heroes: [], missions: [] }, ZOMBIE: { ... } }
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
        
        // We use merge: true to avoid overwriting the other campaign (e.g. if saving ALIVE, don't delete ZOMBIE)
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

// --- CUSTOM MISSIONS ---

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
        // Remove id from data if present to avoid overwriting document ID with field
        const { id: _, ...dataToUpdate } = missionData as any;
        // Use setDoc with merge: true. This allows updating an existing doc OR creating it if it doesn't exist
        // (which happens when editing a hardcoded mission that hasn't been saved to DB yet)
        await setDoc(docRef, dataToUpdate, { merge: true });
    } catch (error) {
        console.error("Error updating mission:", error);
        throw error;
    }
};
