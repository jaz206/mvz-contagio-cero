import playableHeroesMarkdown from '../Heroes jugables.md?raw';
import { Hero } from '../types';

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
            row[header] = values[index] || '';
        });

        rows.push({
            characterName: row['Character Name'] || '',
            set: row['Set'] || '',
            life: row['Health'] || '',
            attack: row['Attack'] || '',
            type: row['Type'] || '',
            range: row['Range'] || '',
            dice: row['Dice'] || '',
            toHit: row['To Hit'] || '',
            blueSkillName: row['Blue Skill Name'] || '',
            blueSkillDescription: row['Blue Skill Decription'] || '',
            yellowSkillName: row['Yellow Skill Name'] || '',
            yellowSkillDescription: row['Yellow Skill Description'] || '',
            orangeSkillName: row['Orange Skill Name'] || '',
            orangeSkillDescription: row['Orange Skill Description'] || '',
            redSkillName: row['Red Skill Name'] || '',
            redSkillDescription: row['Red Skill Description'] || '',
            spawnAbility: row['Spawn Ability'] || '',
            toughness: row['Toughness'] || ''
        });
    }

    return rows;
};

const PLAYABLE_HERO_SHEETS = parseSheetTable(playableHeroesMarkdown);

const SHEET_BY_KEY = new Map<string, PlayableHeroSheet>();

PLAYABLE_HERO_SHEETS.forEach((sheet) => {
    SHEET_BY_KEY.set(normalizeSheetKey(sheet.characterName), sheet);
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

