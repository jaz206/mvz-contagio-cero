import { GAME_EXPANSIONS } from '../data/gameContent';
import { Hero, HeroTemplate } from '../types';

export type TransformAvailabilityReason = 'OK' | 'NO_VARIANT' | 'MISSING_EXPANSION' | 'NO_COUNTERPART';

export interface TransformAvailability {
    allowed: boolean;
    reason: TransformAvailabilityReason;
    targetTemplate?: HeroTemplate;
}

const cleanComparableText = (value: string) => value.toLowerCase()
    .replace(/\(z\)/g, '')
    .replace(/\(zombie\)/g, '')
    .replace(/\(artist\)/g, '')
    .replace(/\(old man\)/g, '')
    .replace(/zombie/g, '')
    .replace(/hero/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const isTemplateAvailableInOwnedExpansions = (template: HeroTemplate, ownedExpansions: Set<string>) => {
    if (!template.expansionId || template.expansionId === 'custom_database') return true;
    return ownedExpansions.has(template.expansionId);
};

const buildTemplateFromExpansionHero = (
    expansionId: string,
    targetAlignment: 'ALIVE' | 'ZOMBIE',
    hero: Hero
): HeroTemplate => ({
    id: hero.id,
    defaultName: hero.name,
    alias: hero.alias,
    defaultClass: hero.class,
    defaultStats: hero.stats,
    imageUrl: hero.imageUrl || '',
    bio: hero.bio,
    defaultAlignment: targetAlignment,
    objectives: hero.objectives,
    currentStory: hero.currentStory,
    imageParams: hero.imageParams,
    characterSheetUrl: hero.characterSheetUrl,
    expansionId
});

const getExpansionCandidates = (
    targetAlignment: 'ALIVE' | 'ZOMBIE',
    comparableAlias: string
) => {
    const candidates: HeroTemplate[] = [];

    for (const expansion of GAME_EXPANSIONS) {
        const list = targetAlignment === 'ALIVE' ? expansion.heroes : expansion.zombieHeroes;
        list.forEach((hero) => {
            if (cleanComparableText(hero.alias) !== comparableAlias) return;
            candidates.push(buildTemplateFromExpansionHero(expansion.id, targetAlignment, hero));
        });
    }

    return candidates;
};

export const getHeroTransformAvailability = (
    hero: Hero,
    targetAlignment: 'ALIVE' | 'ZOMBIE',
    allTemplates: HeroTemplate[],
    ownedExpansions: Set<string>
): TransformAvailability => {
    if (hero.relatedHeroId === 'NO_VARIANT') {
        return { allowed: false, reason: 'NO_VARIANT' };
    }

    const candidates: HeroTemplate[] = [];
    const comparableAlias = cleanComparableText(hero.alias);
    const addCandidate = (candidate?: HeroTemplate) => {
        if (!candidate) return;
        if (candidate.defaultAlignment !== targetAlignment) return;
        if (candidates.some((item) => item.id === candidate.id)) return;
        candidates.push(candidate);
    };

    if (hero.relatedHeroId) {
        addCandidate(allTemplates.find((item) => item.id === hero.relatedHeroId));
    }

    allTemplates.forEach((template) => {
        if (cleanComparableText(template.alias) === comparableAlias) {
            addCandidate(template);
        }
    });

    getExpansionCandidates(targetAlignment, comparableAlias).forEach(addCandidate);

    if (candidates.length === 0) {
        return { allowed: false, reason: 'NO_COUNTERPART' };
    }

    const availableCandidate = candidates.find((candidate) => isTemplateAvailableInOwnedExpansions(candidate, ownedExpansions));
    if (!availableCandidate) {
        return { allowed: false, reason: 'MISSING_EXPANSION' };
    }

    return {
        allowed: true,
        reason: 'OK',
        targetTemplate: availableCandidate
    };
};

export const hasAnyHeroWithTransformRule = (
    heroes: Hero[],
    targetAlignment: 'ALIVE' | 'ZOMBIE',
    allTemplates: HeroTemplate[],
    ownedExpansions: Set<string>
) => heroes.some((hero) => getHeroTransformAvailability(hero, targetAlignment, allTemplates, ownedExpansions).allowed);
