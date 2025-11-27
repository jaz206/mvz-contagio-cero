// services/genaiService.ts
import { GoogleGenAI } from "@google/genai";

// Safely access environment variables to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env;
const apiKey = env?.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
    console.log("S.H.I.E.L.D. DATABASE: GEMINI MODULE ACTIVE");
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("S.H.I.E.L.D. WARNING: GEMINI API KEY MISSING IN ENVIRONMENT");
}

export const generateHeroImage = async (name: string, heroClass: string, bio: string): Promise<string | null> => {
    if (!ai) {
        console.warn("Gemini API Key missing. Cannot generate image.");
        return null;
    }

    try {
        const prompt = `Generate a comic book style portrait of a superhero named ${name} (Class: ${heroClass}). Bio: ${bio}. Style: Gritty, Marvel Zombies universe, S.H.I.E.L.D. database file photo, tactical gear, high contrast, dark atmosphere, intricate details.`;
        
        // Using gemini-2.5-flash-image for image generation as per system instructions
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                // The API generates the image and returns it in the response structure
            }
        });

        // Extract image from response
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error("Error generating hero image:", error);
        return null;
    }
};