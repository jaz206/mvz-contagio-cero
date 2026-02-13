import { collection, getDocs, doc, writeBatch, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HeroTemplate, HeroClass } from '../types';
import { HERO_DATABASE } from '../data/heroDatabase';
import { GAME_EXPANSIONS } from '../data/gameContent';

const COLLECTION_NAME = 'heroes';

// Helper para buscar campos insensible a mayúsculas/minúsculas
const findField = (data: any, possibleKeys: string[]): any => {
    const dataKeys = Object.keys(data);
    for (const key of possibleKeys) {
        if (data[key] !== undefined) return data[key];
        const foundKey = dataKeys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
        if (foundKey) return data[foundKey];
    }
    return undefined;
};

// Helper para verificar si la DB está lista
const isDbReady = (): boolean => {
    if (!db) {
        console.warn("⚠️ Operación de base de datos omitida: Firebase no está inicializado.");
        return false;
    }
    return true;
};

export const getHeroTemplates = async (): Promise<HeroTemplate[]> => {
    if (!db) return [];
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
            const characterSheetUrl = findField(data, ['characterSheetUrl', 'ficha', 'gameCard', 'sheet', 'carta']);
            const bio = findField(data, ['bio', 'biografia', 'biography', 'historia', 'history']);
            const origin = findField(data, ['origin', 'origen', 'source']);
            const alias = findField(data, ['alias', 'codename', 'nombre_en_clave', 'heroname']);
            const currentStory = findField(data, ['currentStory', 'historia_actual', 'historiaActual', 'current_story']);
            const objectives = findField(data, ['objectives', 'objetivos', 'goals', 'misiones']);
            const defaultAlignment = findField(data, ['defaultAlignment', 'alignment', 'bando', 'tipo']);
            const expansionId = findField(data, ['expansionId', 'expansion', 'caja']);
            const relatedHeroId = findField(data, ['relatedHeroId', 'relatedId', 'counterpart', 'version_contraria']);
            const imageParams = findField(data, ['imageParams', 'ajusteImagen', 'crop']);

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
                characterSheetUrl: characterSheetUrl || '',
                bio: bio || '',
                origin: origin || '',
                alias: alias || '',
                currentStory: currentStory || '',
                objectives: Array.isArray(objectives) ? objectives : [],
                defaultAlignment: defaultAlignment || 'ALIVE',
                expansionId: expansionId || 'unknown',
                relatedHeroId: relatedHeroId || undefined,
                imageParams: imageParams || undefined
            });
        });
        return templates;
    } catch (error: any) {
        console.error("Error fetching hero templates:", error);
        return [];
    }
};

export const seedHeroTemplates = async (): Promise<void> => {
    if (!db) return;
    try {
        const batch = writeBatch(db);
        HERO_DATABASE.forEach((hero) => {
            const docRef = doc(db!, COLLECTION_NAME, hero.id);
            batch.set(docRef, hero);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
};

export const updateHeroTemplate = async (id: string, data: Partial<HeroTemplate>): Promise<void> => {
    if (!db) return;
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data as any);
    } catch (error) {
        console.error("Error updating hero:", error);
        throw error;
    }
};

export const createHeroTemplateInDB = async (heroData: Omit<HeroTemplate, 'id'>): Promise<string> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), heroData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating hero template:", error);
        throw error;
    }
};

export const deleteHeroInDB = async (id: string): Promise<void> => {
    if (!isDbReady() || !db) throw new Error("DB no disponible");
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting hero:", error);
        throw error;
    }
};

export const seedExpansionsToDB = async (): Promise<void> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();

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
        alert(`BBDD REINICIADA: ${count} personajes creados correctamente.`);
    } catch (error) {
        console.error("Error seeding expansions:", error);
        alert("ERROR al sincronizar expansiones.");
        throw error;
    }
};
