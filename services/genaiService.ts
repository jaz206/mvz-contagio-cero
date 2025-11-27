// services/genaiService.ts
// AI Feature disabled to resolve Vercel build issues

// Mock function to prevent import errors in other files if they still reference it
// (Though BunkerInterior has already been cleaned)
export const generateHeroImage = async (name: string, heroClass: string, bio: string): Promise<string | null> => {
    console.warn("AI Generation Disabled due to package dependencies issues.");
    return null;
};