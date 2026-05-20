import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { translations } from '../translations';
import { IntroConfig, IntroSlide } from '../types';

const INTRO_COLLECTION = 'appConfig';
const INTRO_DOC_ID = 'introSequence';

const buildDefaultSlides = (alignment: 'alive' | 'zombie'): IntroSlide[] => {
    const esSlides = translations.es.introSequence[alignment];
    const enSlides = translations.en.introSequence[alignment];

    return esSlides.map((slide, index) => ({
        id: `${alignment}_${index + 1}`,
        textEs: slide.text,
        textEn: enSlides[index]?.text || '',
        image: slide.image
    }));
};

export const getDefaultIntroConfig = (): IntroConfig => ({
    alive: buildDefaultSlides('alive'),
    zombie: buildDefaultSlides('zombie')
});

const sanitizeSlides = (slides: any[], alignment: 'alive' | 'zombie'): IntroSlide[] => {
    if (!Array.isArray(slides)) return getDefaultIntroConfig()[alignment];

    return slides.map((slide, index) => ({
        id: slide?.id || `${alignment}_${index + 1}`,
        textEs: slide?.textEs || '',
        textEn: slide?.textEn || '',
        image: slide?.image || ''
    }));
};

export const getIntroConfig = async (): Promise<IntroConfig> => {
    if (!db) {
        return getDefaultIntroConfig();
    }

    try {
        const docRef = doc(db, INTRO_COLLECTION, INTRO_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return getDefaultIntroConfig();
        }

        const data = docSnap.data();
        return {
            alive: sanitizeSlides(data.alive || [], 'alive'),
            zombie: sanitizeSlides(data.zombie || [], 'zombie')
        };
    } catch (error) {
        console.error('Error loading intro config:', error);
        return getDefaultIntroConfig();
    }
};

export const saveIntroConfig = async (config: IntroConfig): Promise<void> => {
    if (!db) {
        throw new Error('Firebase no esta disponible.');
    }

    const docRef = doc(db, INTRO_COLLECTION, INTRO_DOC_ID);
    await setDoc(docRef, {
        alive: config.alive,
        zombie: config.zombie,
        updatedAt: Timestamp.now()
    }, { merge: true });
};
