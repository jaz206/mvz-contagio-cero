import { Hero, HeroClass } from '../types';

export interface GameExpansion {
    id: string;
    name: string;
    heroes: Hero[];       // Héroes Vivos (Supervivientes / "Heroes Mode")
    zombieHeroes: Hero[]; // Héroes Zombies (Infectados / "Zombie Mode")
}

// Helper para crear héroes rápidamente
const createHero = (
    id: string, 
    name: string, 
    alias: string, 
    hClass: HeroClass, 
    bio: string, 
    img: string, 
    stats: {s:number, a:number, i:number}
): Hero => ({
    id, 
    templateId: id, 
    name, 
    alias, 
    class: hClass, 
    bio, 
    status: 'AVAILABLE', 
    currentStory: '', 
    objectives: [], 
    completedObjectiveIndices: [], 
    imageUrl: img, 
    characterSheetUrl: '',
    stats: { strength: stats.s, agility: stats.a, intellect: stats.i }, 
    assignedMissionId: null
});

// Imagen genérica para cuando no tengamos URL específica
const GENERIC_IMG = "https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg";

export const GAME_EXPANSIONS: GameExpansion[] = [
    {
        id: 'core_box',
        name: 'Marvel Zombies (Core Box)',
        heroes: [
            createHero('h_panther', "T'Challa", 'BLACK PANTHER', 'BRAWLER', 'Rey de Wakanda.', 'https://i.pinimg.com/736x/22/16/63/2216634b075306cb6de8e099f92b95b6.jpg', {s:8, a:9, i:9}),
            createHero('h_strange', 'Stephen Strange', 'DOCTOR STRANGE', 'BLASTER', 'Hechicero Supremo.', 'https://i.pinimg.com/736x/5c/e3/38/5ce3385c44cd7c8023c1ddf62d3d954a.jpg', {s:4, a:5, i:10}),
            createHero('h_msmarvel', 'Kamala Khan', 'MS. MARVEL', 'BRAWLER', 'Inhumana elástica.', 'https://i.pinimg.com/736x/a5/8f/e9/a58fe99516a31f494c1d4dcb22231c46.jpg', {s:7, a:7, i:6}),
            createHero('h_scarlet', 'Wanda Maximoff', 'SCARLET WITCH', 'BLASTER', 'Magia del Caos.', 'https://i.pinimg.com/736x/13/4c/e4/134ce4e1ef6112ad48a0883e1c5e4f23.jpg', {s:5, a:6, i:10}),
            createHero('h_spidey', 'Peter Parker', 'SPIDER-MAN', 'SCOUT', 'Tu vecino y amigo.', 'https://i.pinimg.com/736x/97/f1/96/97f1965bf162c5eb2f7aa8cb4be4bf97.jpg', {s:7, a:10, i:8}),
            createHero('h_thor', 'Thor Odinson', 'THOR', 'BRAWLER', 'Dios del Trueno.', 'https://i.pinimg.com/736x/43/45/8b/43458b29272370723226334336066223.jpg', {s:10, a:6, i:5})
        ],
        zombieHeroes: [
            createHero('z_cap', 'Steve Rogers', 'CAPTAIN AMERICA', 'TACTICIAN', 'El Primer Vengador... caído.', 'https://i.pinimg.com/736x/be/82/49/be8249c6a34eb0a40c3429cca8504bab.jpg', {s:8, a:7, i:8}),
            createHero('z_marvel', 'Carol Danvers', 'CAPTAIN MARVEL', 'BLASTER', 'Energía cósmica corrupta.', 'https://i.pinimg.com/736x/b2/89/d4/b289d415b0b846ffc85a7956d576915b.jpg', {s:9, a:7, i:6}),
            createHero('z_deadpool', 'Wade Wilson', 'DEADPOOL', 'SCOUT', 'El mercenario bocazas (y mordedor).', 'https://i.pinimg.com/736x/26/e3/38/26e3385c44cd7c8023c1ddf62d3d954a.jpg', {s:7, a:8, i:5}),
            createHero('z_hulk', 'Bruce Banner', 'HULK', 'BRAWLER', 'HULK TIENE HAMBRE.', 'https://i.pinimg.com/736x/bb/2a/f6/bb2af63dbdbf782daf9af337915489c0.jpg', {s:10, a:5, i:3}),
            createHero('z_ironman', 'Tony Stark', 'IRON MAN', 'BLASTER', 'Tecnología caníbal.', 'https://i.pinimg.com/736x/3a/ad/5b/3aad5b8a9b89b928e33bd8e71a047de1.jpg', {s:7, a:6, i:10}),
            createHero('z_wasp', 'Janet Van Dyne', 'WASP', 'SCOUT', 'Pequeña y letal.', 'https://i.pinimg.com/736x/5c/e8/83/5ce883dd3030f0b7f85a847bcaf47486.jpg', {s:4, a:10, i:6})
        ]
    },
    {
        id: 'xmen_resistance',
        name: 'X-Men Resistance',
        heroes: [
            createHero('h_colossus', 'Piotr Rasputin', 'COLOSSUS', 'BRAWLER', 'Acero orgánico.', 'https://i.pinimg.com/736x/ec/e9/87/ece98736e0cca78734ed0d4a29e222b1.jpg', {s:10, a:4, i:5}),
            createHero('h_magneto', 'Erik Lehnsherr', 'MAGNETO', 'TACTICIAN', 'Amo del magnetismo.', 'https://i.pinimg.com/736x/c0/b5/d5/c0b5d511f39d428725dd24e5d883a548.jpg', {s:6, a:5, i:10}),
            createHero('h_mystique', 'Raven Darkholme', 'MYSTIQUE', 'SCOUT', 'Cambiaformas letal.', 'https://i.pinimg.com/736x/a5/8f/e9/a58fe99516a31f494c1d4dcb22231c46.jpg', {s:5, a:9, i:8}),
            createHero('h_rogue', 'Anna Marie', 'ROGUE', 'BRAWLER', 'Absorción de poderes.', 'https://i.pinimg.com/736x/3d/04/bd/3d04bd41a1f395cf2bf4324729734f1e.jpg', {s:9, a:6, i:5}),
            createHero('h_storm', 'Ororo Munroe', 'STORM', 'BLASTER', 'Diosa del clima.', 'https://i.pinimg.com/736x/32/33/21/32332155621526365215151216515151.jpg', {s:5, a:8, i:8}),
            createHero('h_wolverine', 'Logan', 'WOLVERINE', 'BRAWLER', 'El mejor en lo que hace.', 'https://i.pinimg.com/736x/31/eb/4c/31eb4c0f0dba5c96c80da093a4d83a50.jpg', {s:8, a:8, i:6})
        ],
        zombieHeroes: [
            createHero('z_cyclops', 'Scott Summers', 'CYCLOPS', 'TACTICIAN', 'Líder caído.', 'https://i.pinimg.com/736x/c0/b5/d5/c0b5d511f39d428725dd24e5d883a548.jpg', {s:6, a:6, i:8}),
            createHero('z_phoenix', 'Jean Grey', 'DARK PHOENIX', 'BLASTER', 'Fuego cósmico.', 'https://i.pinimg.com/736x/77/26/00/772600dfc2f3599608a19f4618aedcb8.jpg', {s:10, a:6, i:7}),
            createHero('z_iceman', 'Bobby Drake', 'ICEMAN', 'BLASTER', 'Cero absoluto.', 'https://i.pinimg.com/736x/e6/bf/cb/e6bfcb7bc171610a028f1f2bbda38e29.jpg', {s:5, a:7, i:5}),
            createHero('z_juggernaut', 'Cain Marko', 'JUGGERNAUT', 'BRAWLER', 'Imparable.', 'https://i.pinimg.com/736x/ec/e9/87/ece98736e0cca78734ed0d4a29e222b1.jpg', {s:10, a:4, i:3}),
            createHero('z_psylocke', 'Betsy Braddock', 'PSYLOCKE', 'SCOUT', 'Cuchillo psíquico.', 'https://i.pinimg.com/736x/3d/04/bd/3d04bd41a1f395cf2bf4324729734f1e.jpg', {s:6, a:9, i:7}),
            createHero('z_sabretooth', 'Victor Creed', 'SABRETOOTH', 'BRAWLER', 'Depredador.', 'https://i.pinimg.com/736x/31/eb/4c/31eb4c0f0dba5c96c80da093a4d83a50.jpg', {s:9, a:7, i:4})
        ]
    },
    {
        id: 'f4_siege',
        name: 'Fantastic 4: Under Siege',
        heroes: [
            createHero('h_humantorch', 'Johnny Storm', 'HUMAN TORCH', 'BLASTER', '¡Llamas a mí!', 'https://i.pinimg.com/736x/43/45/8b/43458b29272370723226334336066223.jpg', {s:6, a:9, i:5}),
            createHero('h_invisiblewoman', 'Sue Storm', 'INVISIBLE WOMAN', 'SCOUT', 'Campos de fuerza.', 'https://i.pinimg.com/736x/b8/33/d5/b833d599d8b2049ff72014182c1d98ea.jpg', {s:5, a:6, i:8}),
            createHero('h_mrfantastic', 'Reed Richards', 'MISTER FANTASTIC', 'TACTICIAN', 'Mente elástica.', 'https://i.pinimg.com/736x/58/3c/d3/583cd39457c96e1858ecfbab1db06cce.jpg', {s:5, a:7, i:10}),
            createHero('h_superskull', "Kl'rt", 'SUPER-SKRULL', 'TACTICIAN', 'El poder de los 4.', GENERIC_IMG, {s:9, a:7, i:7}),
            createHero('h_thing', 'Ben Grimm', 'THE THING', 'BRAWLER', 'Es la hora de las tortas.', 'https://i.pinimg.com/736x/ec/e9/87/ece98736e0cca78734ed0d4a29e222b1.jpg', {s:10, a:4, i:6})
        ],
        zombieHeroes: [
            createHero('z_blackbolt', 'Blackagar Boltagon', 'BLACK BOLT', 'BLASTER', 'Voz destructiva.', GENERIC_IMG, {s:9, a:6, i:7}),
            createHero('z_doom', 'Victor Von Doom', 'DOCTOR DOOM', 'TACTICIAN', 'Gobernante de Latveria.', GENERIC_IMG, {s:8, a:6, i:10}),
            createHero('z_invisiblewoman', 'Sue Storm', 'INVISIBLE WOMAN (Z)', 'SCOUT', 'Invisible y mortal.', GENERIC_IMG, {s:5, a:6, i:8}),
            createHero('z_mrfantastic', 'Reed Richards', 'MISTER FANTASTIC (Z)', 'TACTICIAN', 'Cerebro podrido.', GENERIC_IMG, {s:5, a:7, i:10}),
            createHero('z_namor', 'Namor', 'NAMOR', 'BRAWLER', 'Imperius Rex.', GENERIC_IMG, {s:9, a:7, i:6}),
            createHero('z_superskull', "Kl'rt", 'SUPER-SKRULL (Z)', 'TACTICIAN', 'Todos los poderes.', GENERIC_IMG, {s:9, a:7, i:7}),
            createHero('z_thing', 'Ben Grimm', 'THE THING (Z)', 'BRAWLER', 'Roca muerta.', GENERIC_IMG, {s:10, a:4, i:6})
        ]
    },
    {
        id: 'sinister_six',
        name: 'Clash of the Sinister Six',
        heroes: [
            createHero('h_blackcat', 'Felicia Hardy', 'BLACK CAT', 'SCOUT', 'Mala suerte.', GENERIC_IMG, {s:5, a:9, i:6}),
            createHero('h_greengoblin', 'Norman Osborn', 'GREEN GOBLIN', 'BLASTER', 'Bombas calabaza.', GENERIC_IMG, {s:7, a:8, i:9}),
            createHero('h_kraven', 'Sergei Kravinoff', 'KRAVEN', 'SCOUT', 'El cazador.', GENERIC_IMG, {s:8, a:8, i:6}),
            createHero('h_mysterio', 'Quentin Beck', 'MYSTERIO', 'TACTICIAN', 'Maestro de la ilusión.', GENERIC_IMG, {s:4, a:6, i:9}),
            createHero('h_rhino', 'Aleksei Sytsevich', 'RHINO', 'BRAWLER', 'Carga brutal.', GENERIC_IMG, {s:9, a:4, i:3}),
            createHero('h_sandman', 'William Baker', 'SANDMAN', 'BRAWLER', 'Cuerpo de arena.', GENERIC_IMG, {s:8, a:5, i:4}),
            createHero('h_scorpion', 'Mac Gargan', 'SCORPION', 'BRAWLER', 'Cola letal.', GENERIC_IMG, {s:8, a:7, i:4}),
            createHero('h_venom', 'Eddie Brock', 'VENOM', 'BRAWLER', 'Simbionte letal.', GENERIC_IMG, {s:9, a:7, i:5})
        ],
        zombieHeroes: [
            createHero('z_docock', 'Otto Octavius', 'DOCTOR OCTOPUS', 'TACTICIAN', 'Brazos mecánicos.', GENERIC_IMG, {s:7, a:6, i:10}),
            createHero('z_electro', 'Max Dillon', 'ELECTRO', 'BLASTER', 'Alto voltaje.', GENERIC_IMG, {s:6, a:7, i:5}),
            createHero('z_greengoblin', 'Norman Osborn', 'GREEN GOBLIN (Z)', 'BLASTER', 'Locura verde.', GENERIC_IMG, {s:7, a:8, i:9}),
            createHero('z_lizard', 'Curt Connors', 'LIZARD', 'BRAWLER', 'Instinto reptil.', GENERIC_IMG, {s:8, a:7, i:7}),
            createHero('z_mysterio', 'Quentin Beck', 'MYSTERIO (Z)', 'TACTICIAN', 'Ilusión mortal.', GENERIC_IMG, {s:4, a:6, i:9}),
            createHero('z_rhino', 'Aleksei Sytsevich', 'RHINO (Z)', 'BRAWLER', 'Carga zombie.', GENERIC_IMG, {s:9, a:4, i:3}),
            createHero('z_venom', 'Eddie Brock', 'VENOM (Z)', 'BRAWLER', 'Hambre simbionte.', GENERIC_IMG, {s:9, a:7, i:5}),
            createHero('z_vulture', 'Adrian Toomes', 'VULTURE', 'SCOUT', 'Ataque aéreo.', GENERIC_IMG, {s:5, a:8, i:7})
        ]
    },
    {
        id: 'hydra_resurrection',
        name: 'Hydra Resurrection',
        heroes: [
            createHero('h_antman', 'Scott Lang', 'ANT-MAN', 'SCOUT', 'Tamaño variable.', GENERIC_IMG, {s:4, a:8, i:7}),
            createHero('h_blackwidow', 'Natasha Romanoff', 'BLACK WIDOW', 'SCOUT', 'Espía maestra.', GENERIC_IMG, {s:5, a:9, i:8}),
            createHero('h_falcon', 'Sam Wilson', 'FALCON', 'SCOUT', 'Vuelo táctico.', GENERIC_IMG, {s:6, a:8, i:6}),
            createHero('h_quicksilver', 'Pietro Maximoff', 'QUICKSILVER', 'SCOUT', 'Velocidad sónica.', GENERIC_IMG, {s:6, a:10, i:5}),
            createHero('h_redskull', 'Johann Schmidt', 'RED SKULL', 'TACTICIAN', 'Hail Hydra.', GENERIC_IMG, {s:6, a:6, i:9}),
            createHero('h_shehulk', 'Jennifer Walters', 'SHE-HULK', 'BRAWLER', 'Fuerza legal.', GENERIC_IMG, {s:10, a:5, i:7}),
            createHero('h_vision', 'Vision', 'VISION', 'BLASTER', 'Densidad variable.', GENERIC_IMG, {s:9, a:6, i:10})
        ],
        zombieHeroes: [
            createHero('z_blackwidow', 'Natasha Romanoff', 'BLACK WIDOW (Z)', 'SCOUT', 'Asesina silenciosa.', GENERIC_IMG, {s:5, a:9, i:8}),
            createHero('z_falcon', 'Sam Wilson', 'FALCON (Z)', 'SCOUT', 'Depredador aéreo.', GENERIC_IMG, {s:6, a:8, i:6}),
            createHero('z_hawkeye', 'Clint Barton', 'HAWKEYE (Z)', 'SCOUT', 'Puntería muerta.', GENERIC_IMG, {s:6, a:9, i:6}),
            createHero('z_loki', 'Loki Laufeyson', 'LOKI', 'TACTICIAN', 'Dios del engaño.', GENERIC_IMG, {s:7, a:7, i:9}),
            createHero('z_quicksilver', 'Pietro Maximoff', 'QUICKSILVER (Z)', 'SCOUT', 'Muerte rápida.', GENERIC_IMG, {s:6, a:10, i:5}),
            createHero('z_shehulk', 'Jennifer Walters', 'SHE-HULK (Z)', 'BRAWLER', 'Furia gamma.', GENERIC_IMG, {s:10, a:5, i:7})
        ]
    },
    {
        id: 'guardians_galaxy',
        name: 'Guardians of the Galaxy Set',
        heroes: [
            createHero('h_drax', 'Drax', 'DRAX', 'BRAWLER', 'El Destructor.', GENERIC_IMG, {s:9, a:5, i:4}),
            createHero('h_gamora', 'Gamora', 'GAMORA', 'BRAWLER', 'La mujer más letal.', GENERIC_IMG, {s:7, a:9, i:6}),
            createHero('h_groot', 'Groot', 'GROOT', 'BRAWLER', 'Yo soy Groot.', GENERIC_IMG, {s:9, a:4, i:5}),
            createHero('h_mantis', 'Mantis', 'MANTIS', 'TACTICIAN', 'Empatía.', GENERIC_IMG, {s:4, a:7, i:8}),
            createHero('h_nebula', 'Nebula', 'NEBULA', 'SCOUT', 'Cyborg asesina.', GENERIC_IMG, {s:7, a:8, i:7}),
            createHero('h_nova', 'Richard Rider', 'NOVA', 'BLASTER', 'Cohete humano.', GENERIC_IMG, {s:8, a:9, i:6}),
            createHero('h_rocket', 'Rocket', 'ROCKET', 'BLASTER', 'Armas pesadas.', GENERIC_IMG, {s:4, a:8, i:9})
        ],
        zombieHeroes: [
            createHero('z_drax', 'Drax', 'DRAX (Z)', 'BRAWLER', 'Destructor hambriento.', GENERIC_IMG, {s:9, a:5, i:4}),
            createHero('z_mantis', 'Mantis', 'MANTIS (Z)', 'TACTICIAN', 'Mente colmena.', GENERIC_IMG, {s:4, a:7, i:8}),
            createHero('z_nebula', 'Nebula', 'NEBULA (Z)', 'SCOUT', 'Mejora necrótica.', GENERIC_IMG, {s:7, a:8, i:7}),
            createHero('z_rocket', 'Rocket', 'ROCKET (Z)', 'BLASTER', 'Rabia pura.', GENERIC_IMG, {s:4, a:8, i:9}),
            createHero('z_starlord', 'Peter Quill', 'STAR-LORD (Z)', 'TACTICIAN', 'Líder caído.', GENERIC_IMG, {s:6, a:7, i:7}),
            createHero('z_thanos', 'Thanos', 'THANOS', 'BRAWLER', 'La muerte inevitable.', GENERIC_IMG, {s:10, a:5, i:10})
        ]
    },
    {
        id: 'galactus',
        name: 'Galactus the Devourer',
        heroes: [
            createHero('h_surfer', 'Norrin Radd', 'SILVER SURFER', 'BLASTER', 'Poder cósmico.', GENERIC_IMG, {s:9, a:10, i:8})
        ],
        zombieHeroes: [
            createHero('z_surfer', 'Norrin Radd', 'SILVER SURFER (Z)', 'BLASTER', 'Heraldo del hambre.', GENERIC_IMG, {s:9, a:10, i:8})
        ]
    },
    {
        id: 'sentinel_strike',
        name: 'Sentinel Strike',
        heroes: [
            createHero('h_nana', 'Nana', 'NANA', 'TACTICIAN', 'Centinela reprogramado.', GENERIC_IMG, {s:8, a:4, i:6}),
            createHero('h_profx', 'Charles Xavier', 'PROFESSOR X', 'TACTICIAN', 'Mente suprema.', GENERIC_IMG, {s:2, a:3, i:10})
        ],
        zombieHeroes: [
            createHero('z_profx', 'Charles Xavier', 'PROFESSOR X (Z)', 'TACTICIAN', 'Cerebro muerto.', GENERIC_IMG, {s:2, a:3, i:10})
        ]
    },
    {
        id: 'artist_special',
        name: "Artist's Special Edition Set",
        heroes: [
            createHero('h_daredevil_art', 'Matt Murdock', 'DAREDEVIL (ARTIST)', 'BRAWLER', 'Edición especial.', GENERIC_IMG, {s:7, a:9, i:8}),
            createHero('h_elektra_art', 'Elektra Natchios', 'DAREDEVIL ELEKTRA', 'SCOUT', 'La nueva Daredevil.', GENERIC_IMG, {s:6, a:10, i:7}),
            createHero('h_bullseye_art', 'Lester', 'MARSHALL BULLSEYE', 'BLASTER', 'La ley del oeste.', GENERIC_IMG, {s:6, a:9, i:6}),
            createHero('h_hawkeye_old', 'Clint Barton', 'OLD MAN HAWKEYE', 'SCOUT', 'El último vengador.', GENERIC_IMG, {s:5, a:8, i:7}),
            createHero('h_logan_old', 'Logan', 'OLD MAN LOGAN', 'BRAWLER', 'Viejo y cansado.', GENERIC_IMG, {s:8, a:7, i:6}),
            createHero('h_spidey_art', 'Peter Parker', 'SPIDER-MAN (ARTIST)', 'SCOUT', 'Edición especial.', GENERIC_IMG, {s:7, a:10, i:8})
        ],
        zombieHeroes: [] // No se especificaron zombies para este set en la lista
    },
    {
        id: 'stretch_goals',
        name: 'Stretch Goals (Promos)',
        heroes: [
            createHero('sg_baronzemo', 'Helmut Zemo', 'BARON ZEMO', 'TACTICIAN', 'Estratega.', GENERIC_IMG, {s:6, a:7, i:9}),
            createHero('sg_beast', 'Hank McCoy', 'BEAST', 'TACTICIAN', 'Genio bestial.', GENERIC_IMG, {s:8, a:8, i:9}),
            createHero('sg_blackbolt', 'Blackagar Boltagon', 'BLACK BOLT', 'BLASTER', 'Voz real.', GENERIC_IMG, {s:9, a:6, i:7}),
            createHero('sg_blackknight', 'Dane Whitman', 'BLACK KNIGHT', 'BRAWLER', 'Espada de Ébano.', GENERIC_IMG, {s:7, a:7, i:6}),
            createHero('sg_blade', 'Eric Brooks', 'BLADE', 'BRAWLER', 'Cazavampiros.', GENERIC_IMG, {s:8, a:8, i:6}),
            createHero('sg_bullseye', 'Lester', 'BULLSEYE', 'BLASTER', 'Puntería perfecta.', GENERIC_IMG, {s:6, a:9, i:5}),
            createHero('sg_cap', 'Steve Rogers', 'CAPTAIN AMERICA', 'TACTICIAN', 'El Capi.', GENERIC_IMG, {s:7, a:7, i:8}),
            createHero('sg_marvel', 'Carol Danvers', 'CAPTAIN MARVEL', 'BLASTER', 'Binaria.', GENERIC_IMG, {s:9, a:7, i:6}),
            createHero('sg_carnage', 'Cletus Kasady', 'CARNAGE', 'BRAWLER', 'Caos.', GENERIC_IMG, {s:9, a:8, i:3}),
            createHero('sg_crossbones', 'Brock Rumlow', 'CROSSBONES', 'BRAWLER', 'Mercenario.', GENERIC_IMG, {s:8, a:6, i:5}),
            createHero('sg_cyclops', 'Scott Summers', 'CYCLOPS', 'TACTICIAN', 'Líder X.', GENERIC_IMG, {s:6, a:6, i:8}),
            createHero('sg_daredevil', 'Matt Murdock', 'DAREDEVIL', 'BRAWLER', 'Sin miedo.', GENERIC_IMG, {s:7, a:9, i:8}),
            createHero('sg_darkphoenix', 'Jean Grey', 'DARK PHOENIX', 'BLASTER', 'Fuerza cósmica.', GENERIC_IMG, {s:10, a:6, i:7}),
            createHero('sg_deadpool', 'Wade Wilson', 'DEADPOOL', 'BRAWLER', 'Regeneración.', GENERIC_IMG, {s:7, a:8, i:5}),
            createHero('sg_doom', 'Victor Von Doom', 'DOCTOR DOOM', 'TACTICIAN', 'Latveria.', GENERIC_IMG, {s:8, a:6, i:10}),
            createHero('sg_docock', 'Otto Octavius', 'DOCTOR OCTOPUS', 'TACTICIAN', 'Tentáculos.', GENERIC_IMG, {s:7, a:6, i:10}),
            createHero('sg_electro', 'Max Dillon', 'ELECTRO', 'BLASTER', 'Rayo vivo.', GENERIC_IMG, {s:6, a:7, i:5}),
            createHero('sg_elektra', 'Elektra Natchios', 'ELEKTRA', 'SCOUT', 'Ninja.', GENERIC_IMG, {s:6, a:9, i:6}),
            createHero('sg_emmafrost', 'Emma Frost', 'EMMA FROST', 'TACTICIAN', 'Diamante.', GENERIC_IMG, {s:5, a:6, i:9}),
            createHero('sg_gambit', 'Remy LeBeau', 'GAMBIT', 'BLASTER', 'Cartas.', GENERIC_IMG, {s:6, a:8, i:6}),
            createHero('sg_ghostrider', 'Johnny Blaze', 'GHOST RIDER', 'BRAWLER', 'Fuego infernal.', GENERIC_IMG, {s:9, a:7, i:5}),
            createHero('sg_hawkeye', 'Clint Barton', 'HAWKEYE', 'SCOUT', 'Arquero.', GENERIC_IMG, {s:6, a:9, i:6}),
            createHero('sg_hulk', 'Bruce Banner', 'HULK', 'BRAWLER', 'Aplasta.', GENERIC_IMG, {s:10, a:5, i:7}),
            createHero('sg_iceman', 'Bobby Drake', 'ICEMAN', 'BLASTER', 'Hielo.', GENERIC_IMG, {s:5, a:7, i:5}),
            createHero('sg_ironman', 'Tony Stark', 'IRON MAN', 'BLASTER', 'Stark Tech.', GENERIC_IMG, {s:7, a:6, i:10}),
            createHero('sg_jessicajones', 'Jessica Jones', 'JESSICA JONES', 'BRAWLER', 'Investigadora.', GENERIC_IMG, {s:8, a:6, i:6}),
            createHero('sg_juggernaut', 'Cain Marko', 'JUGGERNAUT', 'BRAWLER', 'Cyttorak.', GENERIC_IMG, {s:10, a:4, i:3}),
            createHero('sg_kingpin', 'Wilson Fisk', 'KINGPIN', 'BRAWLER', 'El Rey.', GENERIC_IMG, {s:9, a:4, i:8}),
            createHero('sg_kittypryde', 'Kitty Pryde', 'KITTY PRYDE', 'SCOUT', 'Fase.', GENERIC_IMG, {s:5, a:9, i:8}),
            createHero('sg_lizard', 'Curt Connors', 'LIZARD', 'BRAWLER', 'Reptil.', GENERIC_IMG, {s:8, a:7, i:7}),
            createHero('sg_loki', 'Loki', 'LOKI', 'TACTICIAN', 'Travesura.', GENERIC_IMG, {s:7, a:7, i:9}),
            createHero('sg_lukecage', 'Luke Cage', 'LUKE CAGE', 'BRAWLER', 'Piel dura.', GENERIC_IMG, {s:9, a:6, i:5}),
            createHero('sg_miles', 'Miles Morales', 'MILES MORALES', 'SCOUT', 'Spider-Man II.', GENERIC_IMG, {s:6, a:10, i:7}),
            createHero('sg_moonknight', 'Marc Spector', 'MOON KNIGHT', 'BRAWLER', 'Khonshu.', GENERIC_IMG, {s:7, a:8, i:6}),
            createHero('sg_morbius', 'Michael Morbius', 'MORBIUS', 'SCOUT', 'Vampiro.', GENERIC_IMG, {s:7, a:8, i:7}),
            createHero('sg_namor', 'Namor', 'NAMOR', 'BRAWLER', 'Atlantis.', GENERIC_IMG, {s:9, a:7, i:6}),
            createHero('sg_nightcrawler', 'Kurt Wagner', 'NIGHTCRAWLER', 'SCOUT', 'BAMF.', GENERIC_IMG, {s:5, a:10, i:6}),
            createHero('sg_psylocke', 'Betsy Braddock', 'PSYLOCKE', 'SCOUT', 'Mariposa.', GENERIC_IMG, {s:6, a:9, i:7}),
            createHero('sg_sabretooth', 'Victor Creed', 'SABRETOOTH', 'BRAWLER', 'Garras.', GENERIC_IMG, {s:9, a:7, i:4}),
            createHero('sg_shangchi', 'Shang-Chi', 'SHANG-CHI', 'BRAWLER', 'Kung Fu.', GENERIC_IMG, {s:7, a:10, i:7}),
            createHero('sg_spiderwoman', 'Jessica Drew', 'SPIDER-WOMAN', 'SCOUT', 'Veneno.', GENERIC_IMG, {s:7, a:8, i:7}),
            createHero('sg_starlord', 'Peter Quill', 'STAR-LORD', 'TACTICIAN', 'Legendario.', GENERIC_IMG, {s:6, a:7, i:7}),
            createHero('sg_vulture', 'Adrian Toomes', 'VULTURE', 'SCOUT', 'Alas.', GENERIC_IMG, {s:5, a:8, i:7}),
            createHero('sg_warmachine', 'James Rhodes', 'WAR MACHINE', 'BLASTER', 'Artillería.', GENERIC_IMG, {s:8, a:5, i:6}),
            createHero('sg_wasp', 'Janet Van Dyne', 'WASP', 'SCOUT', 'Tamaño.', GENERIC_IMG, {s:4, a:10, i:7}),
            createHero('sg_wintersoldier', 'Bucky Barnes', 'WINTER SOLDIER', 'SCOUT', 'Brazo metal.', GENERIC_IMG, {s:7, a:8, i:6})
        ],
        zombieHeroes: [
            createHero('sg_z_beast', 'Hank McCoy', 'BEAST (Z)', 'TACTICIAN', 'Bestia azul.', GENERIC_IMG, {s:8, a:8, i:9}),
            createHero('sg_z_blackcat', 'Felicia Hardy', 'BLACK CAT (Z)', 'SCOUT', 'Mala suerte.', GENERIC_IMG, {s:5, a:9, i:6}),
            createHero('sg_z_bullseye', 'Lester', 'BULLSEYE (Z)', 'BLASTER', 'Blanco fijo.', GENERIC_IMG, {s:6, a:9, i:5}),
            createHero('sg_z_colossus', 'Piotr Rasputin', 'COLOSSUS (Z)', 'BRAWLER', 'Metal muerto.', GENERIC_IMG, {s:10, a:4, i:5}),
            createHero('sg_z_daredevil', 'Matt Murdock', 'DAREDEVIL (Z)', 'BRAWLER', 'Sin miedo.', GENERIC_IMG, {s:7, a:9, i:8}),
            createHero('sg_z_strange', 'Stephen Strange', 'DOCTOR STRANGE (Z)', 'BLASTER', 'Magia negra.', GENERIC_IMG, {s:4, a:5, i:10}),
            createHero('sg_z_elektra', 'Elektra Natchios', 'ELEKTRA (Z)', 'SCOUT', 'Ninja zombie.', GENERIC_IMG, {s:6, a:9, i:6}),
            createHero('sg_z_gambit', 'Remy LeBeau', 'GAMBIT (Z)', 'BLASTER', 'Cartas.', GENERIC_IMG, {s:6, a:8, i:6}),
            createHero('sg_z_gamora', 'Gamora', 'GAMORA (Z)', 'BRAWLER', 'Asesina.', GENERIC_IMG, {s:7, a:9, i:6}),
            createHero('sg_z_giantman', 'Hank Pym', 'GIANT-MAN (Z)', 'BRAWLER', 'Hambre gigante.', GENERIC_IMG, {s:10, a:4, i:9}),
            createHero('sg_z_humantorch', 'Johnny Storm', 'HUMAN TORCH (Z)', 'BLASTER', 'Fuego.', GENERIC_IMG, {s:6, a:9, i:5}),
            createHero('sg_z_kingpin', 'Wilson Fisk', 'KINGPIN (Z)', 'BRAWLER', 'Jefe zombie.', GENERIC_IMG, {s:9, a:4, i:8}),
            createHero('sg_z_kraven', 'Sergei Kravinoff', 'KRAVEN (Z)', 'SCOUT', 'Cazador.', GENERIC_IMG, {s:8, a:8, i:6}),
            createHero('sg_z_lukecage', 'Luke Cage', 'LUKE CAGE (Z)', 'BRAWLER', 'Piel muerta.', GENERIC_IMG, {s:9, a:6, i:5}),
            createHero('sg_z_magneto', 'Erik Lehnsherr', 'MAGNETO (Z)', 'TACTICIAN', 'Magnetismo.', GENERIC_IMG, {s:6, a:5, i:10}),
            createHero('sg_z_moonknight', 'Marc Spector', 'MOON KNIGHT (Z)', 'BRAWLER', 'Luna muerta.', GENERIC_IMG, {s:7, a:8, i:6}),
            createHero('sg_z_msmarvel', 'Kamala Khan', 'MS. MARVEL (Z)', 'BRAWLER', 'Elástica.', GENERIC_IMG, {s:7, a:7, i:6}),
            createHero('sg_z_multipleman', 'Jamie Madrox', 'MULTIPLE MAN (Z)', 'SCOUT', 'Legión.', GENERIC_IMG, {s:5, a:7, i:6}),
            createHero('sg_z_mystique', 'Raven Darkholme', 'MYSTIQUE (Z)', 'SCOUT', 'Cambiaformas.', GENERIC_IMG, {s:5, a:9, i:8}),
            createHero('sg_z_nightcrawler', 'Kurt Wagner', 'NIGHTCRAWLER (Z)', 'SCOUT', 'Teleport.', GENERIC_IMG, {s:5, a:10, i:6}),
            createHero('sg_z_nova', 'Richard Rider', 'NOVA (Z)', 'BLASTER', 'Cohete.', GENERIC_IMG, {s:8, a:9, i:6}),
            createHero('sg_z_rogue', 'Anna Marie', 'ROGUE (Z)', 'BRAWLER', 'Absorción.', GENERIC_IMG, {s:9, a:6, i:5}),
            createHero('sg_z_scarlet', 'Wanda Maximoff', 'SCARLET WITCH (Z)', 'BLASTER', 'Caos.', GENERIC_IMG, {s:5, a:6, i:10}),
            createHero('sg_z_scorpion', 'Mac Gargan', 'SCORPION (Z)', 'BRAWLER', 'Veneno.', GENERIC_IMG, {s:8, a:7, i:4}),
            createHero('sg_z_storm', 'Ororo Munroe', 'STORM (Z)', 'BLASTER', 'Tormenta.', GENERIC_IMG, {s:5, a:8, i:8}),
            createHero('sg_z_thor', 'Thor Odinson', 'THOR (Z)', 'BRAWLER', 'Trueno.', GENERIC_IMG, {s:10, a:6, i:5}),
            createHero('sg_z_wintersoldier', 'Bucky Barnes', 'WINTER SOLDIER (Z)', 'SCOUT', 'Soldado.', GENERIC_IMG, {s:7, a:8, i:6}),
            createHero('sg_z_wolverine', 'Logan', 'WOLVERINE (Z)', 'BRAWLER', 'Garras.', GENERIC_IMG, {s:8, a:8, i:6})
        ]
    }
];