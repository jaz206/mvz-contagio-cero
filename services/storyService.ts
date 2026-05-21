import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { translations } from '../translations';
import { StoryConfig, StorySlide } from '../types';

const STORY_COLLECTION = 'appConfig';
const STORY_DOC_ID = 'mainStorySequence';

const buildDefaultSlides = (): StorySlide[] => {
    const esSlides = translations.es.story.slides;
    const enSlides = translations.en.story.slides;

    return esSlides.map((slide, index) => ({
        id: `story_${index + 1}`,
        textEs: slide.text,
        textEn: enSlides[index]?.text || '',
        image: slide.image
    }));
};

export const getDefaultStoryConfig = (): StoryConfig => ({
    slides: buildDefaultSlides()
});

const sanitizeSlides = (slides: any[]): StorySlide[] => {
    if (!Array.isArray(slides)) return getDefaultStoryConfig().slides;

    return slides.map((slide, index) => ({
        id: slide?.id || `story_${index + 1}`,
        textEs: slide?.textEs || '',
        textEn: slide?.textEn || '',
        image: slide?.image || ''
    }));
};

export const getStoryConfig = async (): Promise<StoryConfig> => {
    if (!db) {
        return getDefaultStoryConfig();
    }

    try {
        const docRef = doc(db, STORY_COLLECTION, STORY_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return getDefaultStoryConfig();
        }

        const data = docSnap.data();
        return {
            slides: sanitizeSlides(data.slides || [])
        };
    } catch (error) {
        console.error('Error loading story config:', error);
        return getDefaultStoryConfig();
    }
};

export const saveStoryConfig = async (config: StoryConfig): Promise<void> => {
    if (!db) {
        throw new Error('Firebase no esta disponible.');
    }

    const docRef = doc(db, STORY_COLLECTION, STORY_DOC_ID);
    await setDoc(docRef, {
        slides: config.slides,
        updatedAt: Timestamp.now()
    }, { merge: true });
};
