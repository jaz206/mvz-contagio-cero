import playableHeroesMarkdown from '../Heroes jugables.md?raw';
import playableHeroesMarkdownEs from '../Heroes_jugables_es.md?raw';
import { Hero } from '../types';
import { Language } from '../translations';

export interface PlayableHeroSheet {
    characterName: string;
    set: string;
    life: string;
    attack: string;
    type: string;
    range: string;
    dice: string;
    toHit: string;
    blueSkillName: string;
    blueSkillDescription: string;
    yellowSkillName: string;
    yellowSkillDescription: string;
    orangeSkillName: string;
    orangeSkillDescription: string;
    redSkillName: string;
    redSkillDescription: string;
    spawnAbility: string;
    toughness: string;
}

const normalizeSheetKey = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(artist edition\)/g, '')
    .replace(/\(artist\)/g, '')
    .replace(/\(old man\)/g, '')
    .replace(/\(zombie\)/g, '')
    .replace(/\(z\)/g, '')
    .replace(/\bedition\b/g, '')
    .replace(/\bartist\b/g, '')
    .replace(/\boldman\b/g, '')
    .replace(/\bzombie\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const normalizeSheetHeader = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const isSpanishLanguage = (language: Language | string) => String(language).toLowerCase().startsWith('es');

const HEADER_TO_FIELD: Record<string, keyof PlayableHeroSheet> = {
    charactername: 'characterName',
    set: 'set',
    health: 'life',
    life: 'life',
    salud: 'life',
    attack: 'attack',
    ataque: 'attack',
    type: 'type',
    tipo: 'type',
    range: 'range',
    alcance: 'range',
    dice: 'dice',
    dados: 'dice',
    tohit: 'toHit',
    precision: 'toHit',
    blueskillname: 'blueSkillName',
    blueskilldecription: 'blueSkillDescription',
    blueskilldescription: 'blueSkillDescription',
    nombredehabilidadazul: 'blueSkillName',
    descripciondehabilidadazul: 'blueSkillDescription',
    yellowskillname: 'yellowSkillName',
    yellowskilldescription: 'yellowSkillDescription',
    nombredehabilidadamarilla: 'yellowSkillName',
    descripciondehabilidadamarilla: 'yellowSkillDescription',
    orangeskillname: 'orangeSkillName',
    orangeskilldescription: 'orangeSkillDescription',
    nombredehabilidadnaranja: 'orangeSkillName',
    descripciondehabilidadnaranja: 'orangeSkillDescription',
    redskillname: 'redSkillName',
    redskilldescription: 'redSkillDescription',
    nombredehabilidadroja: 'redSkillName',
    descripciondehabilidadroja: 'redSkillDescription',
    spawnability: 'spawnAbility',
    toughness: 'toughness'
};

const HEADER_ALIASES = new Set([
    'charactername',
    'nombredelpersonaje'
]);

const parseSheetTable = (markdown: string) => {
    const lines = markdown.split(/\r?\n/);
    const tableStart = lines.findIndex((line) => {
        if (!line.startsWith('|')) return false;
        const headers = line.split('|').map((part) => part.trim()).filter(Boolean);
        return headers.length > 0 && HEADER_ALIASES.has(normalizeSheetHeader(headers[0]));
    });
    if (tableStart === -1) return [];

    const headerLine = lines[tableStart];
    const headers = headerLine.split('|').map((part) => part.trim()).filter(Boolean);
    const rows: PlayableHeroSheet[] = [];

    for (let i = tableStart + 2; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line.startsWith('|')) break;
        if (/^\|\s*---/.test(line)) continue;

        const cells = line.split('|').map((part) => part.trim());
        const values = cells.slice(1, -1);
        while (values.length < headers.length) values.push('');

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            const field = HEADER_TO_FIELD[normalizeSheetHeader(header)];
            if (field) {
                row[field] = values[index] || '';
            }
        });

        rows.push({
            characterName: row.characterName || '',
            set: row.set || '',
            life: row.life || '',
            attack: row.attack || '',
            type: row.type || '',
            range: row.range || '',
            dice: row.dice || '',
            toHit: row.toHit || '',
            blueSkillName: row.blueSkillName || '',
            blueSkillDescription: row.blueSkillDescription || '',
            yellowSkillName: row.yellowSkillName || '',
            yellowSkillDescription: row.yellowSkillDescription || '',
            orangeSkillName: row.orangeSkillName || '',
            orangeSkillDescription: row.orangeSkillDescription || '',
            redSkillName: row.redSkillName || '',
            redSkillDescription: row.redSkillDescription || '',
            spawnAbility: row.spawnAbility || '',
            toughness: row.toughness || ''
        });
    }

    return rows;
};

const PLAYABLE_HERO_SHEETS = parseSheetTable(playableHeroesMarkdown);
const PLAYABLE_HERO_SHEETS_ES = parseSheetTable(playableHeroesMarkdownEs);

const SHEET_BY_KEY = new Map<string, PlayableHeroSheet>();
const SHEET_BY_KEY_ES = new Map<string, PlayableHeroSheet>();

PLAYABLE_HERO_SHEETS.forEach((sheet) => {
    SHEET_BY_KEY.set(normalizeSheetKey(sheet.characterName), sheet);
});

PLAYABLE_HERO_SHEETS_ES.forEach((sheet) => {
    SHEET_BY_KEY_ES.set(normalizeSheetKey(sheet.characterName), sheet);
});

export const getPlayableHeroSheetForHero = (hero: Pick<Hero, 'alias' | 'name'>) => {
    for (const key of candidateKeys(hero)) {
        const sheet = SHEET_BY_KEY.get(normalizeSheetKey(key));
        if (sheet) return sheet;
    }

    return undefined;
};

export const getPlayableHeroSheetByName = (characterName: string) => {
    return SHEET_BY_KEY.get(normalizeSheetKey(characterName));
};

const candidateKeys = (hero: Pick<Hero, 'alias' | 'name'>) => [
    hero.alias,
    hero.name,
    `${hero.alias} ${hero.name}`
];

const findMatchingSheets = (hero: Pick<Hero, 'alias' | 'name'>, sheets: PlayableHeroSheet[]) => {
    const normalizedCandidates = new Set(candidateKeys(hero).map((value) => normalizeSheetKey(value)));
    return sheets.filter((sheet) => normalizedCandidates.has(normalizeSheetKey(sheet.characterName)));
};

const preferPrimarySheet = (hero: Pick<Hero, 'alias' | 'name'>, sheets: PlayableHeroSheet[]) => {
    if (sheets.length <= 1) return sheets[0];

    const isArtistHero = /artist/i.test(hero.alias) || /artist/i.test(hero.name);
    const ranked = [...sheets].sort((a, b) => {
        const aArtist = /artist/i.test(a.characterName) || /artist/i.test(a.set);
        const bArtist = /artist/i.test(b.characterName) || /artist/i.test(b.set);
        if (aArtist === bArtist) return 0;
        return isArtistHero ? (aArtist ? -1 : 1) : (aArtist ? 1 : -1);
    });

    return ranked[0];
};

export const getPlayableHeroSheetsForHero = (hero: Pick<Hero, 'alias' | 'name'>) => {
    return findMatchingSheets(hero, PLAYABLE_HERO_SHEETS);
};

export const getLocalizedPlayableHeroSheetsForHero = (hero: Pick<Hero, 'alias' | 'name'>, language: Language) => {
    const sourceSheets = isSpanishLanguage(language) ? PLAYABLE_HERO_SHEETS_ES : PLAYABLE_HERO_SHEETS;
    return findMatchingSheets(hero, sourceSheets);
};

export const getLocalizedPlayableHeroSheetForHero = (hero: Pick<Hero, 'alias' | 'name'>, language: Language) => {
    const sheets = getLocalizedPlayableHeroSheetsForHero(hero, language);
    return preferPrimarySheet(hero, sheets) || undefined;
};
