import { GITHUB_CHARACTER_IMAGE_PATHS } from '../data/githubCharacterImagePaths';

const GITHUB_OWNER = 'jaz206';
const GITHUB_REPO = 'MisionesMZC';
const GITHUB_BRANCH = 'main';
export const GITHUB_ZOMBIE_LOGO_URL = 'https://raw.githubusercontent.com/jaz206/MisionesMZC/main/icono%20%20Zombie%20logo.png';
export const GITHUB_SHIELD_LOGO_URL = 'https://cdn.jsdelivr.net/gh/jaz206/MisionesMZC@main/icono%20SHIELDpng.png';

const normalizeLookupKey = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(artist edition\)/g, ' artist ')
    .replace(/\(artist\)/g, ' artist ')
    .replace(/\(old man\)/g, ' old man ')
    .replace(/\(zombie\)/g, ' zombie ')
    .replace(/\(z\)/g, ' z ')
    .replace(/[^a-z0-9]+/g, '');

const buildGithubImageUrl = (relativePath: string) => {
    const encodedPath = relativePath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

    return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}/Personajes/${encodedPath}`;
};

const IMAGE_URL_BY_KEY = new Map<string, string>();

GITHUB_CHARACTER_IMAGE_PATHS.forEach((relativePath) => {
    const fileName = relativePath.split('/').pop() || relativePath;
    const fileStem = fileName.replace(/\.[^.]+$/, '');
    const key = normalizeLookupKey(fileStem);

    if (!IMAGE_URL_BY_KEY.has(key)) {
        IMAGE_URL_BY_KEY.set(key, buildGithubImageUrl(relativePath));
    }
});

export const getGithubCharacterImageUrl = (alias?: string, alignment: 'ALIVE' | 'ZOMBIE' = 'ALIVE') => {
    if (!alias) return null;

    const normalizedAlias = normalizeLookupKey(alias);

    if (alignment === 'ZOMBIE') {
        const zombieMatch = IMAGE_URL_BY_KEY.get(`${normalizedAlias}z`);
        if (zombieMatch) return zombieMatch;
    }

    const directMatch = IMAGE_URL_BY_KEY.get(normalizedAlias);
    if (directMatch) return directMatch;

    const strippedAlias = normalizedAlias.replace(/zombie$/, '').replace(/z$/, '');
    if (strippedAlias !== normalizedAlias) {
        const strippedMatch = IMAGE_URL_BY_KEY.get(strippedAlias);
        if (strippedMatch) return strippedMatch;
    }

    return null;
};

export const preferGithubCharacterImage = (
    alias: string | undefined,
    alignment: 'ALIVE' | 'ZOMBIE',
    fallbackUrl?: string
) => {
    return getGithubCharacterImageUrl(alias, alignment) || fallbackUrl || '';
};
