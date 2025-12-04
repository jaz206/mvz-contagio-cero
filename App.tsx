import React, { useState, useEffect, useMemo, useRef } from 'react';
import { translations, Language } from './translations';
import { User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, saveUserProfile, getCustomMissions, getHeroTemplates } from './services/dbService';
import { logout } from './services/authService';

import { LoginScreen } from './components/LoginScreen';
import { StoryMode } from './components/StoryMode';
import { TutorialOverlay } from './components/TutorialOverlay';
import { USAMap } from './components/USAMap';
import { BunkerInterior } from './components/BunkerInterior';
import { MissionModal } from './components/MissionModal';
import { EventModal } from './components/EventModal';
import { MissionEditor } from './components/MissionEditor';
import { CharacterEditor } from './components/CharacterEditor';

import { Mission, Hero, WorldStage, GlobalEvent, HeroTemplate } from './types';

const FACTION_STATES = {
    magneto: new Set(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii']),
    kingpin: new Set(['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia']),
    hulk: new Set(['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio']),
    doom: new Set(['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'])
};

const getFactionForState = (state: string) => {
    if (FACTION_STATES.magneto.has(state)) return 'magneto';
    if (FACTION_STATES.kingpin.has(state)) return 'kingpin';
    if (FACTION_STATES.hulk.has(state)) return 'hulk';
    if (FACTION_STATES.doom.has(state)) return 'doom';
    return 'neutral';
};

const INITIAL_HEROES: Hero[] = [
    {
        id: 'h1', templateId: 'spiderman', name: 'Peter Parker', alias: 'SPIDER-MAN', status: 'AVAILABLE', class: 'SCOUT',
        bio: 'Former Avenger. High agility and spider-sense make him an ideal scout for infected zones.',
        currentStory: "Peter no hace chistes. La máscara está sucia y huele a sangre seca. El día del brote, Peter tuvo que tomar una decisión en fracciones de segundo: detener un camión cisterna fuera de control o llegar a casa de Tía May. Salvó el camión. Cuando llegó a Queens, la casa estaba en silencio. Encontró a May sentada en su sillón, ya transformada. Peter no pudo matarla; la envolvió en una crisálida de telaraña reforzada y selló la puerta. Ella sigue allí. De MJ solo tiene un rastro digital. Le regaló un reloj con rastreador de Stark Industries. La señal sigue activa en los túneles del metro.",
        objectives: ['El Fantasma de Queens: Peter debe volver a su casa y enfrentarse a lo que queda de Tía May.', 'Rastro Fantasma: Triangular la señal del reloj Stark en los túneles del metro.'],
        completedObjectiveIndices: [], imageUrl: 'https://i.pinimg.com/736x/97/f1/96/97f1965bf162c5eb2f7aa8cb4be4bf97.jpg',
        characterSheetUrl: 'https://i.pinimg.com/736x/c2/61/0a/c2610afec3022fc70a882e1452e167b8.jpg', stats: { strength: 8, agility: 10, intellect: 9 }, assignedMissionId: null
    },
    {
        id: 'h2', templateId: 'sabretooth', name: 'Victor Creed', alias: 'SABRETOOTH', status: 'AVAILABLE', class: 'BRAWLER',
        bio: 'Driven by pure predatory instinct. S.H.I.E.L.D. keeps him on a short leash.',
        currentStory: "Víctor Creed fue el primer experimento. Antes de capturar a Banner, la Tríada necesitaba probar la resistencia del tejido al virus. Capturaron a Creed y lo ataron en el \"Laboratorio X\". Lo infectaban, esperaban a que la carne se pudriera, y luego cortaban los trozos podridos mientras su factor de curación regeneraba tejido nuevo. Escapó el día que Hulk estalló. Ahora, su factor de curación está sobrecargado, luchando perpetuamente contra residuos del virus.",
        objectives: ['Venganza en Frío: Localizar y destruir el "Laboratorio X".', 'Cosecha Sangrienta: Eliminar a los científicos responsables.'],
        completedObjectiveIndices: [], imageUrl: 'https://i.pinimg.com/736x/31/eb/4c/31eb4c0f0dba5c96c80da093a4d83a50.jpg',
        characterSheetUrl: 'https://i.pinimg.com/736x/c3/07/13/c307131f0f570d9768fd017eae400a39.jpg', stats: { strength: 9, agility: 7, intellect: 4 }, assignedMissionId: null
    },
    {
        id: 'h3', templateId: 'blackwidow', name: 'Natasha Romanoff', alias: 'BLACK WIDOW', status: 'AVAILABLE', class: 'SCOUT',
        bio: 'Expert spy and assassin. Her skills are crucial for infiltration missions.',
        currentStory: "Natasha no es una víctima. Ella fue quien colocó los explosivos en la carretera para volcar el transporte de la Tríada. Ha pasado meses rastreando prisioneros útiles para formar la Iniciativa Lázaro. S.H.I.E.L.D. cayó, pero Natasha sobrevivió. Su frialdad es una armadura. Sin embargo, ha interceptado una señal analógica, un código Morse antiguo que solo dos personas conocen. Clint Barton (Hawkeye) está vivo, retenido por Kingpin.",
        objectives: ['Código Morse: Triangular la señal analógica de Clint Barton.', 'Extracción Letal: Infiltrarse en la torre de Kingpin y extraer a Hawkeye.'],
        completedObjectiveIndices: [], imageUrl: 'https://i.pinimg.com/736x/a5/8f/e9/a58fe99516a31f494c1d4dcb22231c46.jpg',
        characterSheetUrl: 'https://i.pinimg.com/736x/13/4c/e4/134ce4e1ef6112ad48a0883e1c5e4f23.jpg', stats: { strength: 5, agility: 9, intellect: 8 }, assignedMissionId: null
    },
    {
        id: 'h4', templateId: 'emmafrost', name: 'Emma Frost', alias: 'WHITE QUEEN', status: 'AVAILABLE', class: 'TACTICIAN',
        bio: 'Telépata de clase Omega. Su piel de diamante la hace inmune a las mordeduras.',
        currentStory: "Emma estaba dando clase cuando la infección brotó. Fueron sus 'Cucos'. La mente colmena de las niñas se infectó al unísono. Emma tuvo que adoptar su forma de diamante un segundo antes de que los dientes de Sophie rompieran su garganta. Tuvo que romperles el cuello, una a una, mientras sus mentes moribundas le transmitían telepáticamente la imagen de cómo sabría el cerebro de su propia 'madre'. Emma no ha vuelto a su forma humana desde entonces.",
        objectives: ['Santuario de Cristal: Establecer un perímetro psíquico seguro en Genosha.', 'El Destino de Scott: Localizar a Cyclops.'],
        completedObjectiveIndices: [], imageUrl: 'https://i.pinimg.com/736x/36/73/8b/36738b0e8995b32aafd5493f0174807f.jpg',
        characterSheetUrl: 'https://i.pinimg.com/736x/8d/60/a3/8d60a340788644365735165842813583.jpg', stats: { strength: 4, agility: 5, intellect: 10 }, assignedMissionId: null
    },
    {
        id: 'h5', templateId: 'reed', name: 'Reed Richards', alias: 'MR. FANTASTIC', status: 'AVAILABLE', class: 'TACTICIAN',
        bio: 'The smartest man alive, struggling to find a cure.',
        currentStory: "Reed no habla de ese día. La horda irrumpió en el Edificio Baxter. Johnny Storm se lanzó con una 'Supernova' desesperada. Ben Grimm no huyó. Sue Storm empujó a Reed y a los niños a la cámara de estasis y selló el acceso con un campo de fuerza desde fuera. Reed, impotente, vio por última vez a Sue mientras su figura se volvía invisible entre los infectados. Sin cuerpos confirmados, Reed vive en una tortura constante.",
        objectives: ['Cero Absoluto: Recuperar núcleos de criogenización.', 'Informe de Bajas: Localizar a Sue, Johnny y Ben.'],
        completedObjectiveIndices: [], imageUrl: 'https://i.pinimg.com/736x/58/3c/d3/583cd39457c96e1858ecfbab1db06cce.jpg',
        characterSheetUrl: 'https://i.pinimg.com/736x/b8/33/d5/b833d599d8b2049ff72014182c1d98ea.jpg', stats: { strength: 5, agility: 6, intellect: 10 }, assignedMissionId: null
    },
    {
        id: 'h6', templateId: 'shehulk', name: 'Jennifer Walters', alias: 'SHE-HULK', status: 'AVAILABLE', class: 'BRAWLER',
        bio: 'A lawyer who can lift a tank. Retains her intelligence while transformed.',
        currentStory: "Jennifer intentó detenerlos legalmente, pero la Tríada secuestró a Bruce. Lo querían como cobaya. Jennifer asaltó el laboratorio, pero llegó tarde. Vio el momento exacto en que le inyectaron el virus y cómo la sangre Gamma reaccionó. Ella sobrevivió a la explosión gracias a su piel; Bruce se convirtió en el Monstruo Infinito. Ahora Jennifer sabe que el Apocalipsis tiene nombres y apellidos.",
        objectives: ['Juicio Sumario: Eliminar a los lugartenientes clave.', 'Paz Gamma: Localizar a Hulk y neutralizarlo.'],
        completedObjectiveIndices: [], imageUrl: 'https://i.pinimg.com/736x/bb/2a/f6/bb2af63dbdbf782daf9af337915489c0.jpg',
        characterSheetUrl: 'https://i.pinimg.com/736x/c4/e0/c2/c4e0c25246a050d9cd276228ccb3f8ba.jpg', stats: { strength: 10, agility: 5, intellect: 7 }, assignedMissionId: null
    }
];

const INITIAL_ZOMBIE_HEROES: Hero[] = [
    {
        id: 'z_cap', templateId: 'Captain_America', name: 'Steve Rogers', alias: 'Captain America', status: 'AVAILABLE', class: 'TACTICIAN',
        bio: 'El antiguo símbolo de la libertad, ahora con el cráneo expuesto.',
        currentStory: "Steve ya no siente lealtad a la bandera, solo al Hambre. Mantiene su intelecto táctico intacto.",
        objectives: ["Consumir cerebros estratégicos", "Liderar la Horda"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/be/82/49/be8249c6a34eb0a40c3429cca8504bab.jpg', stats: { strength: 8, agility: 8, intellect: 8 }, assignedMissionId: null
    },
    {
        id: 'z_marvel', templateId: 'cap_marvel_z', name: 'Carol Danvers', alias: 'CAPTAIN MARVEL', status: 'AVAILABLE', class: 'BLASTER',
        bio: 'Poder cósmico corrompido.',
        currentStory: "Carol es la artillería pesada. Disfruta cazando presas en vuelo.",
        objectives: ["Derribar el Helicarrier", "Cazar supervivientes aéreos"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/b2/89/d4/b289d415b0b846ffc85a7956d576915b.jpg', stats: { strength: 10, agility: 8, intellect: 6 }, assignedMissionId: null
    },
    {
        id: 'z_deadpool', templateId: 'deadpool_z', name: 'Wade Wilson', alias: 'DEADPOOL', status: 'AVAILABLE', class: 'BRAWLER',
        bio: 'El mercenario que muerde.',
        currentStory: "Wade piensa que todo esto es una broma muy larga.",
        objectives: ["Encontrar salsa picante", "Hacer amigos (y comerlos)"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/26/e3/38/26e3385c44cd7c8023c1ddf62d3d954a.jpg', stats: { strength: 7, agility: 9, intellect: 4 }, assignedMissionId: null
    },
    {
        id: 'z_ironman', templateId: 'ironman_z', name: 'Tony Stark', alias: 'IRON MAN', status: 'AVAILABLE', class: 'TACTICIAN',
        bio: 'Tecnología punta al servicio del canibalismo.',
        currentStory: "Tony está obsesionado con encontrar una cura... para el hecho de que la carne se acaba.",
        objectives: ["Reparar armadura con huesos", "Optimizar la cosecha"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/3a/ad/5b/3aad5b8a9b89b928e33bd8e71a047de1.jpg', stats: { strength: 7, agility: 7, intellect: 10 }, assignedMissionId: null
    },
    {
        id: 'z_wasp', templateId: 'wasp_z', name: 'Janet Van Dyne', alias: 'WASP', status: 'AVAILABLE', class: 'SCOUT',
        bio: 'Pequeña, rápida y letal.',
        currentStory: "Janet perdió la cabeza cuando Hank Pym fue devorado (por ella).",
        objectives: ["Infiltración microscópica", "Enjambre"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/5c/e8/83/5ce883dd3030f0b7f85a847bcaf47486.jpg', stats: { strength: 4, agility: 10, intellect: 6 }, assignedMissionId: null
    },
    {
        id: 'z_cyclops', templateId: 'cyclops_z', name: 'Scott Summers', alias: 'CYCLOPS', status: 'AVAILABLE', class: 'BLASTER',
        bio: 'Sin su visor, sus ojos podridos disparan energía incontrolable.',
        currentStory: "Scott se comió a Jean. Es lo único que recuerda.",
        objectives: ["Liderar mutantes caídos", "Visión letal"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/c0/b5/d5/c0b5d511f39d428725dd24e5d883a548.jpg', stats: { strength: 6, agility: 7, intellect: 9 }, assignedMissionId: null
    },
    {
        id: 'z_phoenix', templateId: 'phoenix_z', name: 'Jean Grey', alias: 'DARK PHOENIX', status: 'AVAILABLE', class: 'BLASTER',
        bio: 'Nivel Omega. El Fénix y el Hambre se han fusionado.',
        currentStory: "La entidad Fénix está agonizando dentro del cuerpo podrido de Jean.",
        objectives: ["Consumir estrellas", "Quemar la resistencia"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/77/26/00/772600dfc2f3599608a19f4618aedcb8.jpg', stats: { strength: 10, agility: 7, intellect: 8 }, assignedMissionId: null
    },
    {
        id: 'z_iceman', templateId: 'iceman_z', name: 'Bobby Drake', alias: 'ICEMAN', status: 'AVAILABLE', class: 'BLASTER',
        bio: 'Su hielo ya no es transparente, es turbio y está lleno de sangre.',
        currentStory: "Bobby ha perdido su humor. Es una estatua de hielo necrótico.",
        objectives: ["Congelar suministros", "Cero absoluto"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/e6/bf/cb/e6bfcb7bc171610a028f1f2bbda38e29.jpg', stats: { strength: 6, agility: 8, intellect: 5 }, assignedMissionId: null
    },
    {
        id: 'z_juggernaut', templateId: 'juggernaut_z', name: 'Cain Marko', alias: 'JUGGERNAUT', status: 'AVAILABLE', class: 'BRAWLER',
        bio: 'Imparable. Inmortal. Hambriento.',
        currentStory: "La gema de Cyttorak lo mantiene vivo a pesar de que le falta la mitad del torso.",
        objectives: ["Aplastar defensas", "Carga imparable"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/ec/e9/87/ece98736e0cca78734ed0d4a29e222b1.jpg', stats: { strength: 10, agility: 4, intellect: 3 }, assignedMissionId: null
    },
    {
        id: 'z_psylocke', templateId: 'psylocke_z', name: 'Betsy Braddock', alias: 'PSYLOCKE', status: 'AVAILABLE', class: 'SCOUT',
        bio: 'Su cuchillo psíquico ahora induce el dolor de ser devorado vivo.',
        currentStory: "Betsy usa su telepatía para atraer a los supervivientes.",
        objectives: ["Trampa mental", "Asesinato psíquico"], completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/3d/04/bd/3d04bd41a1f395cf2bf4324729734f1e.jpg', stats: { strength: 6, agility: 9, intellect: 7 }, assignedMissionId: null
    }
];

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [lang, setLang] = useState<Language>('es');
    const [viewMode, setViewMode] = useState<'login' | 'story' | 'tutorial' | 'map' | 'bunker'>('login');
    
    const [playerAlignment, setPlayerAlignment] = useState<'ALIVE' | 'ZOMBIE' | null>(null);
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(new Set());
    const [worldStage, setWorldStage] = useState<WorldStage>('NORMAL');
    const [activeGlobalEvent, setActiveGlobalEvent] = useState<GlobalEvent | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const isDataLoadedRef = useRef(false);
    
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [showMissionEditor, setShowMissionEditor] = useState(false); 
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null); 
    
    const [showCharacterEditor, setShowCharacterEditor] = useState(false);

    const [customMissions, setCustomMissions] = useState<Mission[]>([]);
    const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([]);

    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [showStory, setShowStory] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['kingpin', 'magneto', 'hulk', 'doom', 'neutral']));

    const t = translations[lang];

    useEffect(() => {
        if (!auth) {
            console.log("Modo sin conexión/invitado activado (Firebase no configurado)");
            setLoadingAuth(false);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
            if (currentUser) {
                const hasSeenIntro = localStorage.getItem(`shield_intro_seen_${currentUser.uid}`);
                if (!hasSeenIntro) {
                    setShowStory(true);
                    setViewMode('story');
                } else {
                    setViewMode('map');
                }
            } else if (!isGuest) {
                setViewMode('login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isGuest]);

    const handleEditorLogin = () => {
        setIsGuest(true);
        setIsEditorMode(true);
        setPlayerAlignment('ALIVE');
        setShowStory(false);
        setShowTutorial(false);
        setViewMode('map');
        setHeroes(INITIAL_HEROES);
        setCompletedMissionIds(new Set());
        setWorldStage('NORMAL');
        isDataLoadedRef.current = true;
    };

    const handleGuestLogin = () => {
        setIsGuest(true);
        setPlayerAlignment('ALIVE');
        setShowStory(true);
        setViewMode('story');
    };

    const handleLogout = async () => {
      if (auth) await logout();
      setIsGuest(false);
      setIsEditorMode(false);
      isDataLoadedRef.current = false;
      setPlayerAlignment(null);
      setViewMode('login');
    };

    const toggleDimension = () => {
        const newAlignment = playerAlignment === 'ALIVE' ? 'ZOMBIE' : 'ALIVE';
        setPlayerAlignment(newAlignment);
        if (isEditorMode) {
            setHeroes(newAlignment === 'ZOMBIE' ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES);
        }
        setViewMode('map');
    };

    // --- CORRECCIÓN: BÚSQUEDA ROBUSTA EN DB PARA TRANSFORMACIÓN ---
    const handleTransformHero = (heroId: string, targetAlignment: 'ALIVE' | 'ZOMBIE') => {
        const currentHero = heroes.find(h => h.id === heroId);
        if (!currentHero) return;

        // Función auxiliar para normalizar strings (quitar comillas, espacios, minúsculas)
        const normalize = (str: string) => str ? str.replace(/['"]/g, '').trim().toLowerCase() : '';

        // 1. Buscar en listas hardcoded
        const hardcodedTargetList = targetAlignment === 'ALIVE' ? INITIAL_HEROES : INITIAL_ZOMBIE_HEROES;
        let counterpart: any = hardcodedTargetList.find(h => normalize(h.alias) === normalize(currentHero.alias));

        // 2. Si no está en hardcoded, buscar en DB Templates
        if (!counterpart) {
            const dbCounterpart = dbTemplates.find(t => 
                // Comparamos Alias O Nombre Real, normalizados
                (normalize(t.alias) === normalize(currentHero.alias) || normalize(t.defaultName) === normalize(currentHero.name)) && 
                t.defaultAlignment === targetAlignment
            );

            if (dbCounterpart) {
                // Convertir Template a estructura Hero
                counterpart = {
                    id: heroId, // Mantenemos el ID original
                    templateId: dbCounterpart.id,
                    name: dbCounterpart.defaultName,
                    alias: dbCounterpart.alias,
                    class: dbCounterpart.defaultClass,
                    bio: dbCounterpart.bio || '',
                    currentStory: dbCounterpart.currentStory || '',
                    objectives: dbCounterpart.objectives || [],
                    imageUrl: dbCounterpart.imageUrl,
                    characterSheetUrl: dbCounterpart.characterSheetUrl,
                    stats: dbCounterpart.defaultStats,
                    status: 'AVAILABLE',
                    assignedMissionId: null
                };
            }
        }

        if (counterpart) {
            // Reemplazar datos
            const newHeroes = heroes.map(h => {
                if (h.id === heroId) {
                    return {
                        ...h,
                        name: counterpart.name,
                        alias: counterpart.alias,
                        class: counterpart.class,
                        bio: counterpart.bio,
                        currentStory: counterpart.currentStory,
                        objectives: counterpart.objectives,
                        imageUrl: counterpart.imageUrl,
                        characterSheetUrl: counterpart.characterSheetUrl,
                        stats: counterpart.stats,
                        status: 'AVAILABLE',
                        assignedMissionId: null
                    };
                }
                return h;
            });
            setHeroes(newHeroes);
        } else {
            // Fallback: Si no existe la versión alternativa, solo lo liberamos
            const newHeroes = heroes.map(h => {
                if (h.id === heroId) {
                    return { ...h, status: 'AVAILABLE', assignedMissionId: null };
                }
                return h;
            });
            setHeroes(newHeroes);
        }
    };

    const mergeWithLatestContent = (savedHeroes: Hero[], isZombie: boolean, templates: HeroTemplate[]): Hero[] => {
        const baseList = isZombie ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES;
        return savedHeroes.map(savedHero => {
            const codeHero = baseList.find(h => (h.templateId && h.templateId === savedHero.templateId) || (h.alias === savedHero.alias));
            if (codeHero) {
                return { ...savedHero, currentStory: codeHero.currentStory, objectives: codeHero.objectives, bio: codeHero.bio, imageUrl: codeHero.imageUrl, characterSheetUrl: codeHero.characterSheetUrl };
            }
            if (savedHero.templateId) {
                const dbTemplate = templates.find(t => t.id === savedHero.templateId);
                if (dbTemplate) {
                    return { ...savedHero, currentStory: dbTemplate.currentStory || savedHero.currentStory, objectives: dbTemplate.objectives || savedHero.objectives, bio: dbTemplate.bio || savedHero.bio, imageUrl: dbTemplate.imageUrl || savedHero.imageUrl, characterSheetUrl: dbTemplate.characterSheetUrl || savedHero.characterSheetUrl };
                }
            }
            return savedHero;
        });
    };

    useEffect(() => {
        const loadMissions = async () => {
            const loaded = await getCustomMissions();
            setCustomMissions(loaded);
        };
        loadMissions();
    }, [isEditorMode]);

    useEffect(() => {
        const loadData = async () => {
            if (isEditorMode) return; 
            isDataLoadedRef.current = false;
            if ((user || isGuest) && playerAlignment) {
                let profileHeroes: Hero[] = [];
                let profileMissions: string[] = [];
                let dataFound = false;
                try {
                    const templates = await getHeroTemplates();
                    setDbTemplates(templates);
                    if (user) {
                        const profile = await getUserProfile(user.uid, playerAlignment);
                        if (profile) {
                            profileHeroes = mergeWithLatestContent(profile.heroes, playerAlignment === 'ZOMBIE', templates);
                            profileMissions = profile.completedMissionIds;
                            dataFound = true;
                        }
                    } else {
                        const storageKey = `shield_heroes_${isGuest ? 'guest' : user?.uid}_${playerAlignment}`;
                        const saved = localStorage.getItem(storageKey);
                        if (saved) {
                            const parsed = JSON.parse(saved);
                            profileHeroes = mergeWithLatestContent(parsed.heroes, playerAlignment === 'ZOMBIE', templates);
                            profileMissions = parsed.completedMissionIds || [];
                            dataFound = true;
                        }
                    }
                    if (dataFound && profileHeroes.length > 0) {
                        setHeroes(profileHeroes);
                        setCompletedMissionIds(new Set(profileMissions));
                        checkGlobalEvents(profileMissions.length);
                    } else {
                        setHeroes(playerAlignment === 'ZOMBIE' ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES);
                        setCompletedMissionIds(new Set());
                    }
                } catch (e) {
                    console.error("Error loading data:", e);
                    setHeroes(playerAlignment === 'ZOMBIE' ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES);
                } finally {
                    isDataLoadedRef.current = true;
                }
            }
        };
        loadData();
    }, [user, isGuest, playerAlignment, isEditorMode]);

    useEffect(() => {
        if (isEditorMode || !user || !playerAlignment || !isDataLoadedRef.current) return;
        if (heroes.length === 0) return;
        const timeout = setTimeout(async () => {
            setIsSaving(true);
            try {
                await saveUserProfile(user.uid, playerAlignment, heroes, Array.from(completedMissionIds));
            } catch (e) {
                console.error("Auto-save failed", e);
            } finally {
                setTimeout(() => setIsSaving(false), 1000);
            }
        }, 2000);
        return () => clearTimeout(timeout);
    }, [heroes, completedMissionIds, user, playerAlignment, isEditorMode]);

    useEffect(() => {
        if (!playerAlignment) return;
        if (showStory) return;
        if (isEditorMode) return;
        const tutorialKey = user ? `shield_tutorial_seen_${user.uid}` : 'shield_tutorial_seen_guest';
        const hasSeenTutorial = localStorage.getItem(tutorialKey);
        if (!hasSeenTutorial && viewMode === 'map') {
             setTimeout(() => setShowTutorial(true), 500);
        }
    }, [playerAlignment, showStory, user, viewMode, isEditorMode]);

    const checkGlobalEvents = (completedCount: number) => {
        if (completedCount >= 15 && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'GALACTUS', title: '', description: '' });
            setWorldStage('GALACTUS');
        } else if (completedCount >= 10 && completedCount < 15 && worldStage !== 'SURFER' && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'SURFER', title: '', description: '' });
            setWorldStage('SURFER');
        } else if (completedCount >= 4 && completedCount < 10 && worldStage === 'NORMAL') {
            setActiveGlobalEvent({ stage: 'ANOMALY', title: '', description: '' });
            setWorldStage('ANOMALY');
        }
    };

    const handleSimulateProgress = (amount: number) => {
        const newSet = new Set(completedMissionIds);
        for (let i = 0; i < amount; i++) {
            newSet.add(`sim_mission_${Date.now()}_${Math.random()}`);
        }
        setCompletedMissionIds(newSet);
        checkGlobalEvents(newSet.size);
    };

    const handleResetProgress = () => {
        setCompletedMissionIds(newSet);
        setWorldStage('NORMAL');
        setActiveGlobalEvent(null);
    };

    const handleMissionComplete = async (id: string) => {
        const newSet = new Set(completedMissionIds);
        newSet.add(id);
        setCompletedMissionIds(newSet);
        setSelectedMission(null);
        if (user && playerAlignment) {
            setIsSaving(true);
            try {
                await saveUserProfile(user.uid, playerAlignment, heroes, Array.from(newSet));
            } catch (e) {
                console.error("Error saving mission progress immediately:", e);
            } finally {
                setTimeout(() => setIsSaving(false), 500);
            }
        }
        if (id === 'boss-galactus') {
            setWorldStage('NORMAL');
            setActiveGlobalEvent(null);
        } else {
            checkGlobalEvents(newSet.size);
        }
    };

    const handleMissionReactivate = (id: string) => {
        const newSet = new Set(completedMissionIds);
        newSet.delete(id);
        setCompletedMissionIds(newSet);
    };

    const handleEventAcknowledge = () => setActiveGlobalEvent(null);
    
    const handleToggleHeroObjective = (heroId: string, idx: number) => {
         const hIndex = heroes.findIndex(h => h.id === heroId);
         if (hIndex >= 0) {
             const newHeroes = [...heroes];
             const h = newHeroes[hIndex];
             const indices = h.completedObjectiveIndices ? [...h.completedObjectiveIndices] : [];
             if (indices.includes(idx)) {
                 newHeroes[hIndex] = { ...h, completedObjectiveIndices: indices.filter(i => i !== idx) };
             } else {
                 newHeroes[hIndex] = { ...h, completedObjectiveIndices: [...indices, idx] };
             }
             setHeroes(newHeroes);
         }
    };

    const toggleZone = (zone: string) => {
        const newSet = new Set(expandedZones);
        if (newSet.has(zone)) newSet.delete(zone);
        else newSet.add(zone);
        setExpandedZones(newSet);
    };

    const allMissions: Mission[] = useMemo(() => {
        const missionMap = new Map<string, Mission>();
        const DEFAULT_MISSIONS: Mission[] = [
            {
                id: 'm_kraven', title: t.missions.kraven.title, description: t.missions.kraven.description, objectives: t.missions.kraven.objectives,
                location: { state: 'New York', coordinates: [-74.006, 40.7128] }, threatLevel: 'ALTA', type: 'STANDARD', alignment: 'ALIVE' // Kraven es solo para Héroes
            },
            {
                id: 'm_zombie_feast', title: "EL FESTÍN DE LOS MUTANTES", description: ["La Escuela de Xavier está fortificada.", "Cerebro detecta mucha carne fresca dentro."], objectives: [{ title: "Romper las defensas", desc: "Destruir los muros." }],
                location: { state: 'New York', coordinates: [-73.8, 41.0] }, threatLevel: 'EXTREMA', type: 'STANDARD', alignment: 'ZOMBIE' // Solo para Zombies
            },
            {
                id: 'm_flesh', title: t.missions.fleshSleeps.title, description: t.missions.fleshSleeps.description, objectives: t.missions.fleshSleeps.objectives,
                location: { state: 'Nevada', coordinates: [-115.1398, 36.1699] }, threatLevel: 'MEDIA', type: 'STANDARD', alignment: 'BOTH'
            },
            {
                id: 'm_base_alpha', title: t.missions.bases.alpha, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: t.missions.bases.objRetrieve }],
                location: { state: 'Colorado', coordinates: [-104.9903, 39.7392] }, threatLevel: 'BAJA', type: 'SHIELD_BASE', alignment: 'BOTH'
            }
        ];
        DEFAULT_MISSIONS.forEach(m => missionMap.set(m.id, m));
        customMissions.forEach(m => { if (m && m.id) missionMap.set(m.id, m); });
        const missionList = Array.from(missionMap.values());
        if (worldStage === 'GALACTUS') {
            missionList.push({
                id: 'boss-galactus', type: 'BOSS', title: t.missions.galactus.title, description: t.missions.galactus.description, objectives: t.missions.galactus.objectives,
                location: { state: 'Kansas', coordinates: [-98.0, 38.0] }, threatLevel: 'OMEGA++', alignment: 'BOTH'
            });
        }
        return missionList;
    }, [t, playerAlignment, worldStage, customMissions]);

    const visibleMissions = useMemo(() => {
        // 1. Filtrado por Bando (Alignment) - SIEMPRE APLICA
        const alignmentFiltered = allMissions.filter(m => {
            if (!m.alignment || m.alignment === 'BOTH') return true;
            return m.alignment === playerAlignment;
        });

        // 2. Lógica MODO EDITOR: Devuelve TODAS las del bando actual, ignorando etapa y requisitos
        if (isEditorMode) {
            return alignmentFiltered;
        }

        // 3. Lógica MODO JUEGO (Normal)
        let stageFiltered = alignmentFiltered;
        if (worldStage === 'GALACTUS') {
            stageFiltered = alignmentFiltered.filter(m => m.type === 'BOSS');
        }

        return stageFiltered.filter(m => {
            if (!m) return false;
            const isCompleted = completedMissionIds.has(m.id);
            const prereqMet = !m.prereq || completedMissionIds.has(m.prereq);
            return isCompleted || prereqMet;
        });
    }, [allMissions, completedMissionIds, isEditorMode, worldStage, playerAlignment]);

    const groupedMissions = useMemo(() => {
        const activeMissions = visibleMissions.filter(m => m && !completedMissionIds.has(m.id));
        const groups: Record<string, Mission[]> = { kingpin: [], magneto: [], hulk: [], doom: [], neutral: [] };
        activeMissions.forEach(m => {
            const isMainMission = m.title && m.title.toUpperCase().includes("CADENAS ROTAS");
            if (isMainMission) {
                groups.neutral.push(m);
            } else {
                const faction = getFactionForState(m.location.state);
                if (groups[faction]) { groups[faction].push(m); } else { groups.neutral.push(m); }
            }
        });
        return groups;
    }, [visibleMissions, completedMissionIds]);

    if (loading || loadingAuth) return <div className="bg-slate-950 text-cyan-500 h-screen flex items-center justify-center font-mono">LOADING SHIELD OS...</div>;

    return (
        <div className={`flex flex-col h-screen w-full bg-slate-950 text-cyan-400 font-mono overflow-hidden relative ${playerAlignment === 'ZOMBIE' ? 'hue-rotate-15 saturate-50' : ''}`}>
            <CharacterEditor isOpen={showCharacterEditor} onClose={() => setShowCharacterEditor(false)} language={lang} />
            <MissionEditor isOpen={showMissionEditor} onClose={() => { setShowMissionEditor(false); setMissionToEdit(null); }} onSave={async (newMission) => { const loaded = await getCustomMissions(); setCustomMissions(loaded); }} language={lang} initialData={missionToEdit} existingMissions={allMissions} />
            {activeGlobalEvent && (<EventModal event={activeGlobalEvent} isOpen={!!activeGlobalEvent} onAcknowledge={handleEventAcknowledge} language={lang} />)}
            {selectedMission && (<MissionModal mission={selectedMission} isOpen={!!selectedMission} onClose={() => setSelectedMission(null)} onComplete={handleMissionComplete} onReactivate={handleMissionReactivate} language={lang} isCompleted={completedMissionIds.has(selectedMission.id)} isEditorMode={isEditorMode} onEdit={(m) => { setMissionToEdit(m); setShowMissionEditor(true); setSelectedMission(null); }} />)}
            {viewMode === 'login' && (<LoginScreen onLogin={handleGuestLogin} onGoogleLogin={() => {}} onEditorLogin={handleEditorLogin} language={lang} setLanguage={setLang} />)}
            {viewMode === 'story' && (<StoryMode language={lang} onComplete={(choice) => { setPlayerAlignment(choice); if(user) localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true'); setViewMode('tutorial'); }} onSkip={() => { setPlayerAlignment('ALIVE'); setViewMode('map'); }} />)}
            {(viewMode === 'map' || viewMode === 'bunker' || viewMode === 'tutorial') && (
                <>
                    <header className="flex-none h-16 border-b border-cyan-900 bg-slate-900/90 flex items-center justify-between px-6 z-30 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border-2 border-cyan-500 rounded-full flex items-center justify-center overflow-hidden bg-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]"><img src="https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg" alt="Logo" className="w-full h-full object-cover" /></div>
                            <div><h1 className="text-xl font-bold tracking-[0.2em] text-cyan-100 leading-none">{t.header.project}</h1><div className="text-[10px] text-red-500 font-bold tracking-widest animate-pulse">{t.header.failure}</div></div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button onClick={toggleDimension} className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded transition-all duration-500 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/20 text-lime-400 hover:bg-lime-900/40' : 'border-cyan-500 bg-cyan-900/20 text-cyan-300 hover:bg-cyan-900/40'}`}>
                                <span className="text-lg">{playerAlignment === 'ZOMBIE' ? '🧟' : '🛡️'}</span>
                                <div className="flex flex-col items-start leading-none"><span className="text-[8px] font-bold tracking-widest opacity-70">DIMENSION</span><span className="text-[10px] font-bold">{playerAlignment === 'ZOMBIE' ? 'EARTH-Z' : 'EARTH-616'}</span></div>
                            </button>
                            <div className="text-right hidden lg:block"><div className="text-[10px] text-cyan-600 font-bold">{t.header.biohazard}</div><div className="text-xs text-cyan-300 tracking-widest">{t.header.clearance}</div></div>
                            <div className="flex items-center gap-3 border-l border-cyan-900 pl-6">
                                <div className="flex flex-col items-end mr-2">{isSaving ? <div className="text-[9px] font-bold tracking-widest text-yellow-500 animate-pulse">{t.header.saving}</div> : <div className="text-[9px] font-bold tracking-widest text-emerald-500/80">{t.header.saved}</div>}</div>
                                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50 transition-colors">{lang.toUpperCase()}</button>
                                <button onClick={handleLogout} className="text-xs bg-red-900/20 text-red-400 border border-red-900 px-3 py-1 hover:bg-red-900/40 transition-colors">{t.header.logout}</button>
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 flex overflow-hidden relative">
                        <aside className="w-80 flex-none bg-slate-900 border-r border-cyan-900 flex flex-col z-20 shadow-xl overflow-hidden relative">
                            {isEditorMode && (
                                <div className="p-4 bg-slate-800 border-b border-cyan-500 overflow-y-auto max-h-[50vh]">
                                    <h3 className="text-[10px] font-bold text-cyan-300 mb-3 tracking-widest border-b border-cyan-600 pb-1">EDITOR CONTROL</h3>
                                    <div className="mb-3 p-2 border border-blue-600/50 bg-blue-900/10 rounded space-y-2">
                                        <div className="text-[8px] text-blue-400 font-bold mb-2 uppercase tracking-wider">CONTENT MANAGEMENT</div>
                                        <button onClick={() => { setMissionToEdit(null); setShowMissionEditor(true); }} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-blue-500/20">CREATE MISSION</button>
                                        <button onClick={() => setShowCharacterEditor(true)} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-purple-500/20">CREATE CHARACTER</button>
                                    </div>
                                    <div className="p-2 border border-orange-600/50 bg-orange-900/10 rounded">
                                        <div className="text-[8px] text-orange-400 font-bold mb-2 uppercase tracking-wider">EVENT SIMULATION</div>
                                        <div className="text-[9px] text-gray-400 mb-2 flex justify-between"><span>COMPLETED: <span className="text-white">{completedMissionIds.size}</span></span><span>STAGE: <span className="text-yellow-400">{worldStage}</span></span></div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <button onClick={() => handleSimulateProgress(1)} className="py-1 bg-slate-700 border border-orange-500/50 text-orange-200 text-[9px] hover:bg-orange-900/50 hover:text-white transition-colors">+1 MISSION</button>
                                            <button onClick={() => handleSimulateProgress(5)} className="py-1 bg-slate-700 border border-orange-500/50 text-orange-200 text-[9px] hover:bg-orange-900/50 hover:text-white transition-colors">+5 MISSIONS</button>
                                        </div>
                                        <button onClick={handleResetProgress} className="w-full py-1 bg-red-900/50 border border-red-600 text-red-300 text-[9px] hover:bg-red-900 hover:text-white transition-colors">RESET PROGRESS</button>
                                    </div>
                                </div>
                            )}
                            <div className="p-6 border-b border-cyan-900 bg-red-950/10">
                                <div className="flex justify-between items-end mb-2"><h3 className="text-xs font-bold text-red-500 tracking-widest">{t.sidebar.threatLevelTitle}</h3><span className="text-3xl font-black text-red-600 tracking-tighter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">{t.sidebar.threatLevelValue}</span></div>
                                <div className="w-full bg-red-900/30 h-1 mt-1"><div className="h-full bg-red-600 w-[95%] animate-pulse"></div></div>
                                <div className="text-[9px] text-red-400 mt-1 text-right">{t.sidebar.infectionRate}</div>
                            </div>
                            <div className="p-4 border-b border-cyan-900">
                                <button id="tutorial-bunker-btn" onClick={() => setViewMode('bunker')} className={`w-full py-4 border-2 flex items-center justify-center gap-3 transition-all duration-300 group relative overflow-hidden ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/10 hover:bg-lime-900/30 text-lime-400' : 'border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/30 text-cyan-300'}`}>
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${playerAlignment === 'ZOMBIE' ? 'bg-[linear-gradient(45deg,transparent_25%,rgba(132,204,22,0.1)_50%,transparent_75%)]' : 'bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)]'} bg-[length:250%_250%] animate-[shimmer_2s_linear_infinite]`}></div>
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{playerAlignment === 'ZOMBIE' ? '☣' : '🛡'}</span><span className="font-bold tracking-widest text-xs">{playerAlignment === 'ZOMBIE' ? t.sidebar.hiveBtn : t.sidebar.bunkerBtn}</span>
                                </button>
                            </div>
                            <div id="tutorial-sidebar-missions" className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-cyan-900">
                                <h4 className="text-[10px] font-bold text-cyan-600 uppercase mb-3 tracking-widest border-b border-cyan-900 pb-1">{t.sidebar.activeMissions}</h4>
                                <div className="space-y-2">
                                    {Object.entries(groupedMissions).map(([zoneKey, missions]) => {
                                        if (missions.length === 0) return null;
                                        const isExpanded = expandedZones.has(zoneKey);
                                        const factionLabel = t.factions[zoneKey as keyof typeof t.factions]?.name || zoneKey.toUpperCase();
                                        return (
                                            <div key={zoneKey} className="mb-2 border border-cyan-900/30 bg-slate-900/30">
                                                <button onClick={() => toggleZone(zoneKey)} className="w-full flex justify-between items-center p-2 bg-slate-800/80 hover:bg-cyan-900/30 transition-colors border-b border-cyan-900/30">
                                                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest truncate max-w-[160px]">{factionLabel}</span>
                                                    <div className="flex items-center gap-2"><span className="text-[9px] bg-cyan-900/50 text-cyan-200 px-1.5 py-0.5 rounded font-mono border border-cyan-700">{missions.length}</span><span className={`text-[10px] text-cyan-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span></div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="p-2 space-y-2 animate-fade-in bg-slate-950/20">
                                                        {missions.map(m => {
                                                            const isShield = m.type === 'SHIELD_BASE';
                                                            const isStartMission = m.id === 'm_kraven' || (m.title && m.title.includes("MH0")) || (m.title && m.title.toUpperCase().includes("CADENAS ROTAS"));
                                                            const isBoss = m.type === 'BOSS';
                                                            let borderClass = 'border-yellow-500/30 bg-yellow-900/5 hover:bg-yellow-900/20';
                                                            let barClass = 'bg-yellow-500';
                                                            let textClass = 'text-yellow-200';
                                                            let subTextClass = 'text-yellow-500/70';
                                                            if (isBoss) { borderClass = 'border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40 animate-pulse'; barClass = 'bg-purple-500'; textClass = 'text-purple-200'; subTextClass = 'text-purple-500/70'; }
                                                            else if (isShield) { borderClass = 'border-cyan-500/30 bg-cyan-900/5 hover:bg-cyan-900/20'; barClass = 'bg-cyan-500'; textClass = 'text-cyan-200'; subTextClass = 'text-cyan-500/70'; }
                                                            else if (isStartMission) { borderClass = 'border-emerald-500/30 bg-emerald-900/5 hover:bg-emerald-900/20'; barClass = 'bg-emerald-500'; textClass = 'text-emerald-200'; subTextClass = 'text-emerald-500/70'; }
                                                            return (
                                                                <div key={m.id} onClick={() => setSelectedMission(m)} className={`p-2 border cursor-pointer transition-all group relative overflow-hidden ${borderClass}`}>
                                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${barClass} group-hover:w-1.5 transition-all`}></div>
                                                                    <div className="flex justify-between items-start pl-2"><div className={`text-[9px] font-bold ${textClass} group-hover:text-white uppercase tracking-wider leading-tight`}>{m.title || 'UNKNOWN MISSION'}</div></div>
                                                                    <div className={`pl-2 mt-0.5 text-[8px] ${subTextClass}`}>LOC: {m.location?.state || 'UNKNOWN'}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {Object.values(groupedMissions).every(g => g.length === 0) && (<div className="text-center text-[10px] text-gray-600 italic py-4">{t.sidebar.noMissions}</div>)}
                                    {Array.from(completedMissionIds).length > 0 && (
                                        <>
                                            <div className="my-4 border-t border-cyan-900/50 pt-2"><h5 className="text-[9px] font-bold text-emerald-700/70 mb-2 uppercase tracking-widest pl-1">COMPLETED ARCHIVES</h5></div>
                                            {visibleMissions.filter(m => m && completedMissionIds.has(m.id)).map(m => (
                                                <div key={m.id} onClick={() => setSelectedMission(m)} className="p-2 border border-emerald-900/30 bg-emerald-900/5 hover:bg-emerald-900/10 cursor-pointer opacity-70 hover:opacity-100 transition-all pl-3 mb-1">
                                                    <div className="flex justify-between items-center"><div className="text-[9px] font-bold text-emerald-400 line-through decoration-emerald-600 truncate">{m.title || 'COMPLETED MISSION'}</div><div className="text-[10px] text-emerald-600">✓</div></div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-cyan-900 bg-slate-900 text-center">
                                <button onClick={() => setViewMode('story')} className="text-[9px] text-cyan-800 hover:text-cyan-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>{t.sidebar.replayStory}
                                </button>
                            </div>
                        </aside>
                        <main className="flex-1 relative bg-slate-950 overflow-hidden">
                            {viewMode === 'map' && (<USAMap language={lang} missions={visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={handleMissionComplete} onMissionSelect={setSelectedMission} onBunkerClick={() => setViewMode('bunker')} factionStates={FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} />)}
                            {viewMode === 'bunker' && (<BunkerInterior heroes={heroes} missions={visibleMissions.filter(m => m && !completedMissionIds.has(m.id))} onAssign={(heroId, missionId) => { const hIndex = heroes.findIndex(h => h.id === heroId); if(hIndex >= 0) { const newHeroes = [...heroes]; newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'DEPLOYED', assignedMissionId: missionId }; setHeroes(newHeroes); return true; } return false; }} onUnassign={(heroId) => { const hIndex = heroes.findIndex(h => h.id === heroId); if(hIndex >= 0) { const newHeroes = [...heroes]; newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'AVAILABLE', assignedMissionId: null }; setHeroes(newHeroes); } }} onAddHero={(hero) => setHeroes([...heroes, hero])} onToggleObjective={handleToggleHeroObjective} onBack={() => setViewMode('map')} language={lang} playerAlignment={playerAlignment} isEditorMode={isEditorMode} onTransformHero={handleTransformHero} />)}
                            {viewMode === 'tutorial' && (<div className="absolute inset-0 z-40"><USAMap language={lang} missions={visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={() => {}} onMissionSelect={() => {}} onBunkerClick={() => {}} factionStates={FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} /><TutorialOverlay language={lang} onComplete={() => { if(user) localStorage.setItem(`shield_tutorial_seen_${user.uid}`, 'true'); setViewMode('map'); }} onStepChange={(stepKey) => { if (['roster', 'file', 'recruit'].includes(stepKey)) { setViewMode('bunker'); } }} /></div>)}
                        </main>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;