import { GITHUB_CHARACTER_IMAGE_PATHS } from '../data/githubCharacterImagePaths';

const GITHUB_OWNER = 'jaz206';
const GITHUB_REPO = 'MisionesMZC';
const GITHUB_BRANCH = 'main';

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
    const directMatch = IMAGE_URL_BY_KEY.get(normalizedAlias);
    if (directMatch) return directMatch;

    if (alignment === 'ZOMBIE') {
        const zombieMatch = IMAGE_URL_BY_KEY.get(`${normalizedAlias}z`);
        if (zombieMatch) return zombieMatch;
    }

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
