const GITHUB_OWNER = 'jaz206';
const GITHUB_REPO = 'MisionesMZC';
const GITHUB_BRANCH = 'main';

const HERO_IMAGE_FILES: Record<string, string> = {
    'blackpanther': 'black_panther.png',
    'doctorstrange': 'doctor_strange.png',
    'msmarvel': 'ms_marvel.png',
    'scarletwitch': 'scarlet_witch.png',
    'spiderman': 'spider_man.png',
    'thor': 'thor.png',
    'colossus': 'colossus.png',
    'magneto': 'magneto.png',
    'mystique': 'mystique.png',
    'rogue': 'rogue.png',
    'storm': 'storm.png',
    'wolverine': 'wolverine.png',
    'humantorch': 'human_torch.png',
    'invisiblewoman': 'invisible_woman.png',
    'misterfantastic': 'mister_fantastic.png',
    'superskrull': 'super_skrull.png',
    'thething': 'the_thing.png',
    'blackcat': 'black_cat.png',
    'greengoblin': 'green_goblin.png',
    'kraven': 'kraven.png',
    'mysterio': 'mysterio.png',
    'rhino': 'rhino.png',
    'sandman': 'sandman.png',
    'scorpion': 'scorpion.png',
    'venom': 'venom.png',
    'antman': 'ant_man.png',
    'blackwidow': 'black_widow.png',
    'falcon': 'falcon.png',
    'quicksilver': 'quicksilver.png',
    'redskull': 'red_skull.png',
    'shehulk': 'she_hulk.png',
    'vision': 'vision.png',
    'drax': 'drax.png',
    'gamora': 'gamora.png',
    'groot': 'groot.png',
    'mantis': 'mantis.png',
    'nebula': 'nebula.png',
    'nova': 'nova.png',
    'rocket': 'rocket.png',
    'silversurfer': 'silver_surfer.png',
    'nana': 'nana.png',
    'professorx': 'professor_x.png',
    'daredevilartist': 'daredevil.png',
    'daredevilelektra': 'elektra.png',
    'marshallbullseye': 'marshall_bullseye.png',
    'oldmanhawkeye': 'old_man_hawkeye.png',
    'oldmanlogan': 'old_man_logan.png',
    'spidermanartist': 'spider_man_artist.png',
    'baronzemo': 'baron_zemo.png',
    'beast': 'beast.png',
    'blackbolt': 'black_bolt.png',
    'blackknight': 'black_knight.png',
    'blade': 'blade.png',
    'bullseye': 'bullseye.png',
    'captainamerica': 'captain_america.png',
    'captainmarvel': 'captain_marvel.png',
    'carnage': 'carnage.png',
    'crossbones': 'crossbones.png',
    'cyclops': 'cyclops.png',
    'daredevil': 'daredevil.png',
    'darkphoenix': 'dark_phoenix.png',
    'deadpool': 'deadpool.png',
    'doctordoom': 'doctor_doom.png',
    'doctoroctopus': 'doctor_octopus.png',
    'electro': 'electro.png',
    'elektra': 'elektra.png',
    'emmafrost': 'emma_frost.jpg',
    'gambit': 'gambit.png',
    'ghostrider': 'ghost_rider.png',
    'hawkeye': 'hawkeye.png',
    'hulk': 'hulk.png',
    'iceman': 'iceman.png',
    'ironman': 'iron_man.png',
    'jessicajones': 'jessica_jones.png',
    'juggernaut': 'juggernaut.png',
    'kingpin': 'kingpin.png',
    'kittypryde': 'kitty_pryde.png',
    'lizard': 'lizard.png',
    'loki': 'loki.png',
    'lukecage': 'luke_cage.png',
    'milesmorales': 'miles_morales.png',
    'moonknight': 'moon_knight.png',
    'morbius': 'morbius.png',
    'namor': 'namor.png',
    'nightcrawler': 'nightcrawler.png',
    'psylocke': 'psylocke.png',
    'sabretooth': 'sabretooth.png',
    'shangchi': 'shang_chi.png',
    'spiderwoman': 'spider_woman.png',
    'starlord': 'star_lord.png',
    'vulture': 'vulture.png',
    'warmachine': 'war_machine.png',
    'wasp': 'wasp.png',
    'wintersoldier': 'winter_soldier.png'
};

const normalizeAlias = (alias: string) => {
    return alias
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\(artist\)/g, 'artist')
        .replace(/\(z\)/g, '')
        .replace(/\(zombie\)/g, '')
        .replace(/[^a-z0-9]+/g, '');
};

const buildGithubImageUrl = (folder: 'Heroes' | 'Zombis', fileName: string) => {
    const encodedFileName = fileName
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

    return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}/Personajes/${folder}/${encodedFileName}`;
};

export const getGithubCharacterImageUrl = (alias?: string, alignment: 'ALIVE' | 'ZOMBIE' = 'ALIVE') => {
    if (!alias || alignment !== 'ALIVE') return null;

    const fileName = HERO_IMAGE_FILES[normalizeAlias(alias)];
    if (!fileName) return null;

    return buildGithubImageUrl('Heroes', fileName);
};

export const preferGithubCharacterImage = (
    alias: string | undefined,
    alignment: 'ALIVE' | 'ZOMBIE',
    fallbackUrl?: string
) => {
    return getGithubCharacterImageUrl(alias, alignment) || fallbackUrl || '';
};
