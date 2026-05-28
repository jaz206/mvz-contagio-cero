export const STORY_LOCKED_ALIAS_KEYS = ['KINGPIN', 'MAGNETO', 'DOCTOR DOOM', 'DOOM', 'HULK'];

export const normalizeStoryAlias = (alias: string) => alias
    .toUpperCase()
    .replace(/\(Z\)/g, '')
    .replace(/\(ZOMBIE\)/g, '')
    .replace(/\(ARTIST\)/g, '')
    .replace(/\(OLD MAN\)/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .trim();

export const isStoryLockedAlias = (alias: string) => {
    const comparableAlias = normalizeStoryAlias(alias);
    return STORY_LOCKED_ALIAS_KEYS.some((lockedAlias) => normalizeStoryAlias(lockedAlias) === comparableAlias);
};

