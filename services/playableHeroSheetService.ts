import playableHeroesMarkdown from '../Heroes jugables.md?raw';
import playableHeroesMarkdownEs from '../Heroes_jugables_es.md?raw';
import { Hero } from '../types';
import { Language } from '../translations';
import playableHeroSheetTranslationsEs from '../data/playableHeroSheetTranslations.es.json';

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

const PLAYABLE_HERO_SHEET_TRANSLATIONS_ES = playableHeroSheetTranslationsEs as Record<string, string>;

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

const HEADER_TO_FIELD: Record<string, keyof PlayableHeroSheet> = {
    charactername: 'characterName',
    set: 'set',
    health: 'life',
    attack: 'attack',
    type: 'type',
    range: 'range',
    dice: 'dice',
    tohit: 'toHit',
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

const parseSheetTable = (markdown: string) => {
    const lines = markdown.split(/\r?\n/);
    const tableStart = lines.findIndex((line) => line.startsWith('|Character Name|'));
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

const candidateKeys = (hero: Pick<Hero, 'alias' | 'name'>) => [
    hero.alias,
    hero.name,
    `${hero.alias} ${hero.name}`
];

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

const translateSheetText = (value: string, language: Language) => {
    if (!value || language !== 'es') return value;
    return PLAYABLE_HERO_SHEET_TRANSLATIONS_ES[value] || value;
};

const localizeSheetField = (englishValue: string, spanishValue: string | undefined, language: Language) => {
    if (language !== 'es') return englishValue;

    if (spanishValue && spanishValue.trim() && spanishValue.trim() !== englishValue.trim()) {
        return spanishValue;
    }

    return translateSheetText(englishValue, language);
};

export const getLocalizedPlayableHeroSheetForHero = (hero: Pick<Hero, 'alias' | 'name'>, language: Language) => {
    const sheet = getPlayableHeroSheetForHero(hero);
    if (!sheet) return undefined;
    if (language !== 'es') return sheet;

    const localizedSheet = SHEET_BY_KEY_ES.get(normalizeSheetKey(sheet.characterName));

    return {
        ...sheet,
        set: localizeSheetField(sheet.set, localizedSheet?.set, language),
        attack: localizeSheetField(sheet.attack, localizedSheet?.attack, language),
        type: localizeSheetField(sheet.type, localizedSheet?.type, language),
        blueSkillName: localizeSheetField(sheet.blueSkillName, localizedSheet?.blueSkillName, language),
        blueSkillDescription: localizeSheetField(sheet.blueSkillDescription, localizedSheet?.blueSkillDescription, language),
        yellowSkillName: localizeSheetField(sheet.yellowSkillName, localizedSheet?.yellowSkillName, language),
        yellowSkillDescription: localizeSheetField(sheet.yellowSkillDescription, localizedSheet?.yellowSkillDescription, language),
        orangeSkillName: localizeSheetField(sheet.orangeSkillName, localizedSheet?.orangeSkillName, language),
        orangeSkillDescription: localizeSheetField(sheet.orangeSkillDescription, localizedSheet?.orangeSkillDescription, language),
        redSkillName: localizeSheetField(sheet.redSkillName, localizedSheet?.redSkillName, language),
        redSkillDescription: localizeSheetField(sheet.redSkillDescription, localizedSheet?.redSkillDescription, language),
        spawnAbility: localizeSheetField(sheet.spawnAbility, localizedSheet?.spawnAbility, language)
    };
};
