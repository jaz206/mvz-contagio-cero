import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, firebaseReady } from '../firebaseConfig';
import { Mission, ZoneControlConfig, ZoneControlKey } from '../types';

const SETTINGS_COLLECTION = 'appConfig';
const ZONE_CONTROL_DOC_ID = 'zoneControlConfig';

const ZONE_STATE_SETS: Record<ZoneControlKey, Set<string>> = {
    magneto: new Set(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii']),
    kingpin: new Set(['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia']),
    hulk: new Set(['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio']),
    doom: new Set(['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'])
};

const ensureDb = () => {
    if (!firebaseReady || !db) {
        throw new Error('La base de datos no esta disponible.');
    }
};

const normalizeZoneIds = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())));
};

export const getDefaultZoneControlConfig = (missions: Mission[]): ZoneControlConfig => {
    const zones: Record<ZoneControlKey, string[]> = {
        magneto: [],
        kingpin: [],
        hulk: [],
        doom: []
    };

    missions.forEach((mission) => {
        if (!mission?.id || mission.type === 'GALACTUS') return;
        const role = mission.missionRole || 'PRIMARY';
        if (role === 'OPTIONAL') return;

        const stateName = mission.location?.state || '';
        (Object.keys(ZONE_STATE_SETS) as ZoneControlKey[]).forEach((zone) => {
            if (ZONE_STATE_SETS[zone].has(stateName)) {
                zones[zone].push(mission.id);
            }
        });
    });

    return { zones };
};

export const getZoneControlConfig = async (): Promise<ZoneControlConfig | null> => {
    if (!firebaseReady || !db) {
        return null;
    }

    const ref = doc(db, SETTINGS_COLLECTION, ZONE_CONTROL_DOC_ID);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        return null;
    }

    const data = snapshot.data();
    return {
        zones: {
            magneto: normalizeZoneIds(data?.zones?.magneto),
            kingpin: normalizeZoneIds(data?.zones?.kingpin),
            hulk: normalizeZoneIds(data?.zones?.hulk),
            doom: normalizeZoneIds(data?.zones?.doom)
        }
    };
};

export const saveZoneControlConfig = async (config: ZoneControlConfig): Promise<void> => {
    ensureDb();

    await setDoc(doc(db!, SETTINGS_COLLECTION, ZONE_CONTROL_DOC_ID), {
        zones: {
            magneto: normalizeZoneIds(config.zones?.magneto),
            kingpin: normalizeZoneIds(config.zones?.kingpin),
            hulk: normalizeZoneIds(config.zones?.hulk),
            doom: normalizeZoneIds(config.zones?.doom)
        },
        updatedAt: Timestamp.now()
    }, { merge: true });
};
