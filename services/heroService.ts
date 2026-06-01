import { collection, getDocs, doc, writeBatch, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { HeroTemplate, HeroClass, HeroPlayableSheetsByLanguage } from '../types';
import { HERO_DATABASE } from '../data/heroDatabase';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { getHeroLoreEntry } from '../data/heroLore';
import { preferGithubCharacterImage } from './characterGithubImageService';
import { buildPlayableHeroSheetCollectionForHero } from './playableHeroSheetService';

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

const hasDetailedCopy = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim().length > 80;
    if (typeof value === 'object') {
        const es = typeof value.es === 'string' ? value.es.trim().length : 0;
        const en = typeof value.en === 'string' ? value.en.trim().length : 0;
        return es > 80 || en > 80;
    }
    return false;
};

const normalizePlayableSheets = (value: any): HeroPlayableSheetsByLanguage | undefined => {
    if (!value) return undefined;

    if (Array.isArray(value)) {
        return { es: value };
    }

    if (typeof value !== 'object') return undefined;

    const result: HeroPlayableSheetsByLanguage = {};
    if (Array.isArray(value.es)) result.es = value.es;
    if (Array.isArray(value.en)) result.en = value.en;
    if (!result.es && !result.en) return undefined;

    return result;
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
            const playableSheets = normalizePlayableSheets(findField(data, ['playableSheets', 'heroSheets', 'sheets', 'fichas']));
            const isSelectable = findField(data, ['isSelectable', 'selectable', 'jugable', 'playable']);
            const resolvedAlignment = defaultAlignment || 'ALIVE';
            const resolvedAlias = alias || name || '';
            const loreEntry = resolvedAlignment === 'ALIVE' ? getHeroLoreEntry(resolvedAlias) : undefined;
            const resolvedBio = hasDetailedCopy(bio) ? bio : (loreEntry?.bio || bio || '');
            const resolvedOrigin = hasDetailedCopy(origin) ? origin : (loreEntry?.origin || origin || '');
            const resolvedCurrentStory = hasDetailedCopy(currentStory) ? currentStory : (loreEntry?.currentStory || currentStory || '');

            templates.push({
                id: doc.id,
                defaultName: name || 'Unknown Agent',
                defaultClass: (heroClass || 'BRAWLER') as HeroClass,
                defaultStats: stats || {
                    strength: Number(str) || 5,
                    agility: Number(agi) || 5,
                    intellect: Number(int) || 5
                },
                imageUrl: preferGithubCharacterImage(resolvedAlias, resolvedAlignment, imageUrl || ''),
                characterSheetUrl: characterSheetUrl || '',
                bio: resolvedBio,
                origin: resolvedOrigin,
                alias: resolvedAlias,
                currentStory: resolvedCurrentStory,
                objectives: Array.isArray(objectives) ? objectives : [],
                defaultAlignment: resolvedAlignment,
                expansionId: expansionId || 'unknown',
                relatedHeroId: relatedHeroId || undefined,
                imageParams: imageParams || undefined,
                playableSheets,
                isSelectable: isSelectable !== undefined ? Boolean(isSelectable) : true
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

export const syncHeroRepositoryToDB = async (): Promise<number> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const existingDocs = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
        const writeBatchOp = writeBatch(db);
        let count = 0;

        const allSourceHeroes = GAME_EXPANSIONS.flatMap((exp) => ([
            ...exp.heroes.map((hero) => ({ ...hero, expansionId: exp.id, defaultAlignment: 'ALIVE' as const })),
            ...exp.zombieHeroes.map((hero) => ({ ...hero, expansionId: exp.id, defaultAlignment: 'ZOMBIE' as const }))
        ]));

        const allKnownIds = new Set([...existingDocs.keys(), ...allSourceHeroes.map((hero) => hero.id)]);

        for (const heroId of allKnownIds) {
            const existing = existingDocs.get(heroId) || {};
            const localSource = allSourceHeroes.find((hero) => hero.id === heroId);
            const existingAlias = findField(existing, ['alias', 'codename', 'nombre_en_clave', 'heroname']);
            const existingName = findField(existing, ['defaultName', 'nombre_Real', 'nombreReal', 'realName', 'name', 'nombre']);
            const resolvedAlias = existingAlias || localSource?.alias || existingName || '';
            const resolvedName = existingName || localSource?.name || 'Unknown Agent';
            const resolvedAlignment = findField(existing, ['defaultAlignment', 'alignment', 'bando', 'tipo']) || localSource?.defaultAlignment || 'ALIVE';
            const resolvedClass = findField(existing, ['defaultClass', 'clase', 'class', 'rol']) || localSource?.class || 'BRAWLER';
            const resolvedStats = findField(existing, ['defaultStats', 'stats', 'estadisticas']) || localSource?.stats || { strength: 5, agility: 5, intellect: 5 };
            const resolvedImageUrl = findField(existing, ['imageUrl', 'foto', 'image', 'img', 'url', 'picture']) || localSource?.imageUrl || '';
            const resolvedCharacterSheetUrl = findField(existing, ['characterSheetUrl', 'ficha', 'gameCard', 'sheet', 'carta']) || '';
            const loreEntry = getHeroLoreEntry(resolvedAlias);
            const existingPlayables = normalizePlayableSheets(findField(existing, ['playableSheets', 'heroSheets', 'sheets', 'fichas']));
            const playableSheets = existingPlayables || buildPlayableHeroSheetCollectionForHero({ alias: resolvedAlias, name: resolvedName });
            const isSelectable = findField(existing, ['isSelectable', 'selectable', 'jugable', 'playable']);

            const templateData: HeroTemplate = {
                id: heroId,
                defaultName: resolvedName,
                alias: resolvedAlias,
                defaultClass: resolvedClass as HeroClass,
                bio: hasDetailedCopy(findField(existing, ['bio', 'biografia', 'biography', 'historia', 'history'])) ? findField(existing, ['bio', 'biografia', 'biography', 'historia', 'history']) : (loreEntry?.bio || localSource?.bio || ''),
                imageUrl: preferGithubCharacterImage(resolvedAlias, resolvedAlignment, resolvedImageUrl),
                defaultStats: resolvedStats,
                defaultAlignment: resolvedAlignment,
                origin: hasDetailedCopy(findField(existing, ['origin', 'origen', 'source'])) ? findField(existing, ['origin', 'origen', 'source']) : (loreEntry?.origin || ''),
                currentStory: hasDetailedCopy(findField(existing, ['currentStory', 'historia_actual', 'historiaActual', 'current_story'])) ? findField(existing, ['currentStory', 'historia_actual', 'historiaActual', 'current_story']) : (loreEntry?.currentStory || ''),
                objectives: Array.isArray(findField(existing, ['objectives', 'objetivos', 'goals', 'misiones'])) ? findField(existing, ['objectives', 'objetivos', 'goals', 'misiones']) : [],
                expansionId: findField(existing, ['expansionId', 'expansion', 'caja']) || localSource?.expansionId || 'custom_database',
                relatedHeroId: findField(existing, ['relatedHeroId', 'relatedId', 'counterpart', 'version_contraria']) || undefined,
                imageParams: findField(existing, ['imageParams', 'ajusteImagen', 'crop']) || undefined,
                characterSheetUrl: resolvedCharacterSheetUrl || '',
                playableSheets,
                isSelectable: isSelectable !== undefined ? Boolean(isSelectable) : true
            };

            const docRef = doc(db, COLLECTION_NAME, heroId);
            writeBatchOp.set(docRef, templateData, { merge: true });
            count++;
        }

        await writeBatchOp.commit();
        return count;
    } catch (error) {
        console.error("Error syncing heroes:", error);
        throw error;
    }
};

export const seedExpansionsToDB = async (): Promise<void> => {
    if (!db) throw new Error("DB no disponible");
    try {
        const count = await syncHeroRepositoryToDB();
        alert(`BBDD REINICIADA: ${count} personajes creados correctamente.`);
    } catch (error) {
        console.error("Error seeding expansions:", error);
        alert("ERROR al sincronizar expansiones.");
        throw error;
    }
};
