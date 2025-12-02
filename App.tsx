
import React, { useState, useEffect, useMemo } from 'react';
import { translations, Language } from './translations';
import { User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, saveUserProfile, getCustomMissions } from './services/dbService';
import { logout } from './services/authService';

import { LoginScreen } from './components/LoginScreen';
import { StoryMode } from './components/StoryMode';
import { TutorialOverlay } from './components/TutorialOverlay';
import { USAMap } from './components/USAMap';
import { BunkerInterior } from './components/BunkerInterior';
import { MissionModal } from './components/MissionModal';
import { EventModal } from './components/EventModal';
import { MissionEditor } from './components/MissionEditor';

import { Mission, Hero, WorldStage, GlobalEvent } from './types';

const FACTION_STATES = {
    magneto: new Set([
        'Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 
        'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 
        'Alaska', 'Hawaii'
    ]),
    kingpin: new Set([
        'Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 
        'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 
        'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia'
    ]),
    hulk: new Set([
        'North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 
        'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 
        'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio'
    ]),
    doom: new Set([
        'Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 
        'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'
    ])
};

const INITIAL_HEROES: Hero[] = [
    {
        id: 'h1',
        templateId: 'spiderman',
        name: 'Peter Parker',
        alias: 'SPIDER-MAN',
        status: 'AVAILABLE',
        class: 'SCOUT',
        bio: 'Former Avenger. High agility and spider-sense make him an ideal scout for infected zones. Carries the guilt of survival.',
        currentStory: "Peter no hace chistes. La máscara está sucia y huele a sangre seca. El día del brote, Peter tuvo que tomar una decisión en fracciones de segundo: detener un camión cisterna fuera de control o llegar a casa de Tía May. Salvó el camión. Cuando llegó a Queens, la casa estaba en silencio. Encontró a May sentada en su sillón, ya transformada, con la boca manchada de sangre. Peter no pudo matarla; la envolvió en una crisálida de telaraña reforzada y selló la puerta con tablas. Ella sigue allí, siseando en la oscuridad. De MJ solo tiene un rastro digital. Le regaló un reloj con rastreador de Stark Industries. La señal sigue activa. Se mueve por los túneles del metro y las azoteas de la Zona Roja. Peter no sabe si persigue a su esposa viva huyendo, a una MJ zombie vagando sin rumbo, o a una Abominación que se tragó el reloj. Cada noche, Peter sale a cazar esa señal, aterrorizado de alcanzarla y descubrir la verdad.",
        objectives: [
            'El Fantasma de Queens: Peter debe volver a su casa. Debe entrar, enfrentarse a lo que queda de Tía May, matarla definitivamente para darle descanso y recuperar el álbum de fotos familiar que ella protegía.',
            'Rastro Fantasma: Triangular la señal del reloj Stark en los túneles de la Zona Roja. Confirmar estado de MJ: Superviviente o Hostil.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/97/f1/96/97f1965bf162c5eb2f7aa8cb4be4bf97.jpg',
        stats: { strength: 8, agility: 10, intellect: 9 },
        assignedMissionId: null
    },
    {
        id: 'h2',
        templateId: 'sabretooth',
        name: 'Victor Creed',
        alias: 'SABRETOOTH',
        status: 'DEPLOYED',
        class: 'BRAWLER',
        bio: 'Driven by pure predatory instinct. S.H.I.E.L.D. keeps him on a short leash. He tracks the infected not to save them, but for sport.',
        currentStory: "Víctor Creed fue el primer experimento. Antes de capturar a Banner, la Tríada necesitaba probar la resistencia del tejido al virus. Capturaron a Creed y lo ataron en el \"Laboratorio X\". No buscaban un arma; buscaban una granja. Lo infectaban, esperaban a que la carne se pudriera, y luego cortaban los trozos podridos mientras su factor de curación regeneraba tejido nuevo. Un ciclo infinito de infección y vivisección. Creed era carne infinita para alimentar sus pruebas. Escapó el día que Hulk estalló, aprovechando el fallo de seguridad para arrancar la garganta de su torturador con los dientes. Ahora, su factor de curación está sobrecargado, luchando perpetuamente contra residuos del virus en su sangre. Se une a Lázaro porque sabe dónde están los laboratorios secretos y quiere quemarlos hasta los cimientos... con los científicos dentro.",
        objectives: [
            'Venganza en Frío: Localizar y destruir el "Laboratorio X" donde fue torturado.',
            'Cosecha Sangrienta: Eliminar a los científicos responsables de la Tríada que experimentaron con él.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/31/eb/4c/31eb4c0f0dba5c96c80da093a4d83a50.jpg',
        stats: { strength: 9, agility: 7, intellect: 4 },
        assignedMissionId: 'm_kraven'
    },
    {
        id: 'h3',
        templateId: 'blackwidow',
        name: 'Natasha Romanoff',
        alias: 'BLACK WIDOW',
        status: 'AVAILABLE',
        class: 'SCOUT',
        bio: 'Expert spy and assassin. Her skills are crucial for infiltration missions in Fisk territory. Keeps the team focused on the objective.',
        currentStory: "Natasha no es una víctima. Ella fue quien colocó los explosivos en la carretera para volcar el transporte de la Tríada. Esa figura que emergió de las sombras en la Misión 0 era ella. Ha pasado meses rastreando prisioneros útiles para formar la Iniciativa Lázaro. S.H.I.E.L.D. cayó, Fury murió gritando, pero Natasha sobrevivió porque sabe ser invisible. Su frialdad es una armadura; sacrifica peones para salvar reyes. Sin embargo, su armadura tiene una grieta: ha interceptado una señal analógica, un código Morse antiguo que solo dos personas conocen. Clint Barton (Hawkeye) está vivo, retenido por Kingpin como trofeo o cebo. Natasha quemará la ciudad entera y usará a este nuevo equipo de \"zombies renegados\" como carne de cañón si eso le permite llegar hasta él.",
        objectives: [
            'Código Morse: Triangular la señal analógica de Clint Barton.',
            'Extracción Letal: Infiltrarse en la torre de Kingpin y extraer a Hawkeye, cueste lo que cueste.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/a5/8f/e9/a58fe99516a31f494c1d4dcb22231c46.jpg',
        stats: { strength: 5, agility: 9, intellect: 8 },
        assignedMissionId: null
    },
    {
        id: 'h4',
        templateId: 'loki',
        name: 'Loki Laufeyson',
        alias: 'LOKI',
        status: 'INJURED',
        class: 'TACTICIAN',
        bio: 'Former villain turned desperate survivor. His illusions hide him from the horde. Unpredictable, but necessary magic support.',
        currentStory: "Loki estaba en la Tierra para conquistar, como siempre. Cuando Thor cayó infectado en la primera oleada, Loki se rio. Pensó que era el final perfecto para su arrogante hermano: convertido en un animal babeante. Se acercó para burlarse de él... y Thor, con la mente podrida, lo miró y lloró sangre. En ese momento, Loki se dio cuenta de que sin Thor, él no es nada. Intentó usar su magia para curarlo, pero el virus de la Tríada (Ciencia + Magia de Doom) rechazó sus hechizos. Loki tuvo que huir de su propio hermano. Asgard cerró el Bifrost, dejándolo exiliado en este infierno. Ahora, Loki camina entre los muertos usando ilusiones para parecer uno de ellos. Se ha unido a la Iniciativa Lázaro por puro rencor: Doom usó magia asgardiana robada para crear el virus. Loki va a recuperar esa magia, va a despellejar a Doom y luego va a buscar a Thor para concederle la misericordia que le negó el primer día.",
        objectives: [
            'Robo Arcano: Recuperar el libro de hechizos asgardianos de la fortaleza de Doom.',
            'Misericordia Fraternal: Localizar a Thor Zombi y concederle el descanso final.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/98/50/d0/9850d063395efd498cce84be09da69fd.jpg',
        stats: { strength: 7, agility: 6, intellect: 10 },
        assignedMissionId: null
    },
    {
        id: 'h5',
        templateId: 'reed',
        name: 'Reed Richards',
        alias: 'MR. FANTASTIC',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'The smartest man alive, struggling to find a cure in a world that has rejected science. His intellect is humanity\'s last hope.',
        currentStory: "Reed no habla de ese día. La horda irrumpió en el Edificio Baxter. Johnny Storm se lanzó con una 'Supernova' desesperada, pero fue sofocado por la carne muerta. Ben Grimm no huyó; gritando el nombre de Johnny, se lanzó a ayudarlo y a bloquear el pasillo principal. Sue Storm, sabiendo que Reed era la única esperanza de cura, lo empujó a él y a los niños a la cámara de estasis y selló el acceso con un campo de fuerza desde fuera. Reed, impotente, vio por última vez a Sue, apenas visible tras su campo de energía, mientras su figura se volvía invisible entre los infectados. Sin cuerpos confirmados, Reed vive en una tortura constante: debe encontrarlos para descubrir la verdad, sin saber si hallará a su familia o a monstruos que llevan sus rostros.",
        objectives: [
            'Cero Absoluto: Recuperar núcleos de criogenización de un laboratorio SHIELD para mantener a los niños en estasis.',
            'Informe de Bajas: Localizar a Sue, Johnny y Ben. Confirmar estado: Supervivientes o Hostiles.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/58/3c/d3/583cd39457c96e1858ecfbab1db06cce.jpg',
        stats: { strength: 5, agility: 6, intellect: 10 },
        assignedMissionId: null
    },
    {
        id: 'h6',
        templateId: 'shehulk',
        name: 'Jennifer Walters',
        alias: 'SHE-HULK',
        status: 'AVAILABLE',
        class: 'BRAWLER',
        bio: 'A lawyer who can lift a tank. Retains her intelligence while transformed, making her a lethal combination of brains and brawn on the battlefield.',
        currentStory: "Jennifer intentó detenerlos legalmente, pero la Tríada secuestró a Bruce bajo \"Leyes de Emergencia\". Mentira. Lo querían como cobaya para el Pulso Nulificador. Jennifer asaltó el laboratorio rompiendo paredes, pero llegó segundos tarde. Vio a Bruce atado como un animal de matadero. Vio el momento exacto en que le inyectaron el virus y cómo la sangre Gamma reaccionó, convirtiéndolo en una bomba biológica que reventó el mundo. Ella sobrevivió a la explosión gracias a su piel; Bruce se convirtió en el Monstruo Infinito. Ahora Jennifer sabe que el Apocalipsis tiene nombres y apellidos: Doom, Magneto, Fisk. No descansará hasta romperles la columna a los tres y darle a su primo la eutanasia que merece.",
        objectives: [
            'Juicio Sumario: Eliminar a los lugartenientes clave de Kingpin, Magneto y Doom.',
            'Paz Gamma: Localizar a Hulk y encontrar una forma de neutralizarlo o eliminarlo.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/bb/2a/f6/bb2af63dbdbf782daf9af337915489c0.jpg',
        stats: { strength: 10, agility: 5, intellect: 7 },
        assignedMissionId: null
    }
];

const INITIAL_ZOMBIE_HEROES: Hero[] = [
    {
        id: 'z1',
        templateId: 'colonel',
        name: 'Steve Rogers',
        alias: 'CORONEL AMÉRICA',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'The former symbol of freedom, now with his skull exposed. Leads the horde with military precision. His shield no longer protects, it only beheads.',
        currentStory: "CLASSIFIED",
        objectives: ["Consume Brains", "Lead the Horde"],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/1a/2b/3c/1a2b3c...jpg', // Placeholder
        stats: { strength: 8, agility: 8, intellect: 8 },
        assignedMissionId: null
    },
];

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [lang, setLang] = useState<Language>('es');
    const [viewMode, setViewMode] = useState<'login' | 'story' | 'tutorial' | 'map' | 'bunker'>('login');
    
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [playerAlignment, setPlayerAlignment] = useState<'ALIVE' | 'ZOMBIE' | null>(null);
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(new Set());
    const [worldStage, setWorldStage] = useState<WorldStage>('NORMAL');
    const [activeGlobalEvent, setActiveGlobalEvent] = useState<GlobalEvent | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [showMissionEditor, setShowMissionEditor] = useState(false); 
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null); 
    
    const [customMissions, setCustomMissions] = useState<Mission[]>([]);

    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [showStory, setShowStory] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    
    const t = translations[lang];

    useEffect(() => {
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
    };

    const handleGuestLogin = () => {
        setIsGuest(true);
        setPlayerAlignment('ALIVE');
        setShowStory(true);
        setViewMode('story');
    };

    const handleLogout = async () => {
      await logout();
      setIsGuest(false);
      setIsEditorMode(false);
      setViewMode('login');
    };

    const mergeWithLatestContent = (savedHeroes: Hero[], isZombie: boolean): Hero[] => {
        const baseList = isZombie ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES;
        return savedHeroes.map(savedHero => {
            const codeHero = baseList.find(h => 
                (h.templateId && h.templateId === savedHero.templateId) || 
                (h.alias === savedHero.alias)
            );
            if (codeHero) {
                return {
                    ...savedHero,
                    currentStory: codeHero.currentStory,
                    objectives: codeHero.objectives,
                    bio: codeHero.bio,
                    imageUrl: codeHero.imageUrl
                };
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

            if ((user || isGuest) && playerAlignment) {
                let profileHeroes: Hero[] = [];
                let profileMissions: string[] = [];

                if (user) {
                    const profile = await getUserProfile(user.uid, playerAlignment);
                    if (profile) {
                        profileHeroes = mergeWithLatestContent(profile.heroes, playerAlignment === 'ZOMBIE');
                        profileMissions = profile.completedMissionIds;
                    }
                } else {
                    const storageKey = `shield_heroes_${isGuest ? 'guest' : user?.uid}_${playerAlignment}`;
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        profileHeroes = mergeWithLatestContent(parsed.heroes, playerAlignment === 'ZOMBIE');
                        profileMissions = parsed.completedMissionIds || [];
                    }
                }

                if (profileHeroes.length > 0) {
                    setHeroes(profileHeroes);
                    setCompletedMissionIds(new Set(profileMissions));
                    checkGlobalEvents(profileMissions.length);
                } else {
                    setHeroes(playerAlignment === 'ZOMBIE' ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES);
                    setCompletedMissionIds(new Set());
                }
            }
        };
        loadData();
    }, [user, isGuest, playerAlignment, isEditorMode]);

    useEffect(() => {
        if (isEditorMode || !user || !playerAlignment) return;

        const timeout = setTimeout(async () => {
            setIsSaving(true);
            await saveUserProfile(user.uid, playerAlignment, heroes, Array.from(completedMissionIds));
            setTimeout(() => setIsSaving(false), 1000);
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
        setCompletedMissionIds(new Set());
        setWorldStage('NORMAL');
        setActiveGlobalEvent(null);
    };

    const handleMissionComplete = (id: string) => {
        const newSet = new Set(completedMissionIds);
        newSet.add(id);
        setCompletedMissionIds(newSet);
        setSelectedMission(null);
        
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

    const getMissionFaction = (state: string) => {
        if (FACTION_STATES.magneto.has(state)) return 'MAGNETO';
        if (FACTION_STATES.kingpin.has(state)) return 'KINGPIN';
        if (FACTION_STATES.hulk.has(state)) return 'HULK';
        if (FACTION_STATES.doom.has(state)) return 'DOOM';
        return 'NEUTRAL';
    };

    const allMissions: Mission[] = useMemo(() => {
        const hardcodedMissions: Mission[] = [
            {
                id: 'm_kraven',
                title: t.missions.kraven.title,
                description: t.missions.kraven.description,
                objectives: t.missions.kraven.objectives,
                location: { state: 'New York', coordinates: [-74.006, 40.7128] },
                threatLevel: 'HIGH',
                type: 'STANDARD'
            },
            {
                id: 'm_prison',
                title: t.missions.fleshSleeps.title,
                description: t.missions.fleshSleeps.description,
                objectives: t.missions.fleshSleeps.objectives,
                location: { state: 'Pennsylvania', coordinates: [-77.1945, 41.2033] },
                threatLevel: 'EXTREME',
                type: 'STANDARD',
                prereq: 'm_kraven'
            },
             { id: 'base_alpha', title: t.missions.bases.alpha, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: '' }, { title: t.missions.bases.objRetrieve, desc: '' }], location: { state: 'Colorado', coordinates: [-105.7821, 39.5501] }, threatLevel: 'MEDIUM', type: 'SHIELD_BASE' },
             { id: 'base_beta', title: t.missions.bases.beta, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: '' }, { title: t.missions.bases.objRetrieve, desc: '' }], location: { state: 'New Jersey', coordinates: [-74.4, 40.0] }, threatLevel: 'MEDIUM', type: 'SHIELD_BASE' },
             { id: 'base_gamma', title: t.missions.bases.gamma, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: '' }, { title: t.missions.bases.objRetrieve, desc: '' }], location: { state: 'Massachusetts', coordinates: [-71.3, 42.4] }, threatLevel: 'MEDIUM', type: 'SHIELD_BASE' },
             { id: 'base_delta', title: t.missions.bases.delta, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: '' }, { title: t.missions.bases.objRetrieve, desc: '' }], location: { state: 'Maryland', coordinates: [-76.6, 39.0] }, threatLevel: 'MEDIUM', type: 'SHIELD_BASE' },
             { id: 'base_epsilon', title: t.missions.bases.epsilon, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: '' }, { title: t.missions.bases.objRetrieve, desc: '' }], location: { state: 'Connecticut', coordinates: [-72.7, 41.6] }, threatLevel: 'MEDIUM', type: 'SHIELD_BASE' },
             { id: 'base_zeta', title: t.missions.bases.zeta, description: [t.missions.bases.desc], objectives: [{ title: t.missions.bases.objSecure, desc: '' }, { title: t.missions.bases.objRetrieve, desc: '' }], location: { state: 'Pennsylvania', coordinates: [-78.0, 40.5] }, threatLevel: 'MEDIUM', type: 'SHIELD_BASE' }
        ];

        const missionMap = new Map<string, Mission>();
        hardcodedMissions.forEach(m => missionMap.set(m.id, m));
        customMissions.forEach(m => missionMap.set(m.id, m));
        const missionList = Array.from(missionMap.values());

        if (worldStage === 'GALACTUS' && playerAlignment === 'ALIVE') {
            const galactusData = t.missions?.galactus;
            missionList.push({
                id: 'boss-galactus',
                type: 'BOSS',
                title: galactusData?.title || "GALACTUS ARRIVES",
                description: galactusData?.description || ["CRITICAL THREAT: GALACTUS"],
                objectives: galactusData?.objectives || [{ title: "Defeat Galactus", desc: "Save the world" }],
                location: { state: 'Kansas', coordinates: [-98.0, 38.0] },
                threatLevel: 'OMEGA++'
            });
        }
        
        return missionList;
    }, [t, playerAlignment, worldStage, customMissions]);

    const visibleMissions = useMemo(() => {
        if (isEditorMode) return allMissions;
        if (worldStage === 'GALACTUS') {
            return allMissions.filter(m => m.type === 'BOSS');
        }
        return allMissions.filter(m => {
            const isCompleted = completedMissionIds.has(m.id);
            const prereqMet = !m.prereq || completedMissionIds.has(m.prereq);
            return isCompleted || prereqMet;
        });
    }, [allMissions, completedMissionIds, isEditorMode, worldStage]);

    // Group missions by faction
    const factionOrder = ['MAGNETO', 'KINGPIN', 'HULK', 'DOOM', 'NEUTRAL'];
    const missionsByFaction = useMemo(() => {
        const groups: Record<string, Mission[]> = { MAGNETO: [], KINGPIN: [], HULK: [], DOOM: [], NEUTRAL: [] };
        visibleMissions.forEach(m => {
            const faction = getMissionFaction(m.location.state);
            if (groups[faction]) groups[faction].push(m);
            else groups.NEUTRAL.push(m);
        });
        return groups;
    }, [visibleMissions]);

    if (loading || loadingAuth) return <div className="bg-slate-950 text-cyan-500 h-screen flex items-center justify-center font-mono">LOADING SHIELD OS...</div>;

    return (
        <div className={`flex flex-col h-screen w-full bg-slate-950 text-cyan-400 font-mono overflow-hidden relative ${playerAlignment === 'ZOMBIE' ? 'hue-rotate-15 saturate-50' : ''}`}>
            
            <MissionEditor 
                isOpen={showMissionEditor}
                onClose={() => { setShowMissionEditor(false); setMissionToEdit(null); }}
                onSave={async (newMission) => {
                    const loaded = await getCustomMissions();
                    setCustomMissions(loaded);
                }}
                language={lang}
                initialData={missionToEdit}
            />

            {activeGlobalEvent && (
                <EventModal event={activeGlobalEvent} isOpen={!!activeGlobalEvent} onAcknowledge={handleEventAcknowledge} language={lang} />
            )}
            {selectedMission && (
                <MissionModal 
                    mission={selectedMission} 
                    isOpen={!!selectedMission} 
                    onClose={() => setSelectedMission(null)} 
                    onComplete={handleMissionComplete} 
                    onReactivate={handleMissionReactivate} 
                    language={lang} 
                    isCompleted={completedMissionIds.has(selectedMission.id)}
                    isEditorMode={isEditorMode}
                    onEdit={(m) => {
                        setMissionToEdit(m);
                        setShowMissionEditor(true);
                        setSelectedMission(null);
                    }}
                />
            )}

            {viewMode === 'login' && (
                <LoginScreen 
                    onLogin={handleGuestLogin} 
                    onGoogleLogin={() => {}} 
                    onEditorLogin={handleEditorLogin} 
                    language={lang}
                    setLanguage={setLang}
                />
            )}

            {viewMode === 'story' && (
                <StoryMode 
                    language={lang} 
                    onComplete={(choice) => { setPlayerAlignment(choice); if(user) localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true'); setViewMode('tutorial'); }}
                    onSkip={() => { setPlayerAlignment('ALIVE'); setViewMode('map'); }}
                />
            )}

            {(viewMode === 'map' || viewMode === 'bunker' || viewMode === 'tutorial') && (
                <>
                    <header className="flex-none h-16 border-b border-cyan-900 bg-slate-900/90 flex items-center justify-between px-6 z-30 relative">
                        {/* Header content ... */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border-2 border-cyan-500 rounded-full flex items-center justify-center overflow-hidden bg-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                <img src="https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-[0.2em] text-cyan-100 leading-none hidden md:block">{t.header.project}</h1>
                                <div className="text-[10px] text-red-500 font-bold tracking-widest animate-pulse">{t.header.failure}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <div className="text-[10px] text-cyan-600 font-bold">{t.header.biohazard}</div>
                                <div className="text-xs text-cyan-300 tracking-widest">{t.header.clearance}</div>
                            </div>
                            
                            <div className="flex items-center gap-3 border-l border-cyan-900 pl-6">
                                <div className="flex flex-col items-end mr-2">
                                    {isSaving ? <div className="text-[9px] font-bold tracking-widest text-yellow-500 animate-pulse">{t.header.saving}</div> : <div className="text-[9px] font-bold tracking-widest text-emerald-500/80">{t.header.saved}</div>}
                                </div>
                                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50 transition-colors">{lang.toUpperCase()}</button>
                                <button onClick={handleLogout} className="text-xs bg-red-900/20 text-red-400 border border-red-900 px-3 py-1 hover:bg-red-900/40 transition-colors">{t.header.logout}</button>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden relative">
                        
                        <aside className={`flex-none bg-slate-900 border-r border-cyan-900 flex flex-col z-20 shadow-xl overflow-hidden relative transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
                            
                            <button 
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="absolute top-1/2 -right-0 w-4 h-12 bg-cyan-900/80 hover:bg-cyan-600 rounded-l flex items-center justify-center cursor-pointer z-50 translate-x-0"
                                style={{ transform: 'translateY(-50%)' }}
                            >
                                <span className="text-[8px] text-white">{isSidebarCollapsed ? '»' : '«'}</span>
                            </button>

                            <div className={`p-2 border-b border-cyan-900 bg-red-950/10 flex flex-col justify-center ${isSidebarCollapsed ? 'items-center' : ''}`}>
                                {isSidebarCollapsed ? (
                                    <div className="text-xs font-black text-red-600 animate-pulse">Ω</div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-end">
                                            <h3 className="text-[10px] font-bold text-red-500 tracking-widest">THREAT</h3>
                                            <span className="text-xl font-black text-red-600 tracking-tighter">{t.sidebar.threatLevelValue}</span>
                                        </div>
                                        <div className="w-full bg-red-900/30 h-1 mt-1"><div className="h-full bg-red-600 w-[95%] animate-pulse"></div></div>
                                    </>
                                )}
                            </div>

                            <div className={`grid ${isSidebarCollapsed ? 'grid-cols-1 gap-2 p-2' : 'grid-cols-2 gap-1 p-2'} border-b border-cyan-900`}>
                                <button id="tutorial-bunker-btn" onClick={() => setViewMode('bunker')} className={`flex items-center justify-center p-2 border transition-all hover:scale-105 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/10 text-lime-400' : 'border-cyan-500 bg-cyan-900/10 text-cyan-300'}`} title="BUNKER">
                                    <span className="text-xl">{playerAlignment === 'ZOMBIE' ? '☣' : '🛡'}</span>
                                    {!isSidebarCollapsed && <span className="text-[9px] font-bold ml-1">{playerAlignment === 'ZOMBIE' ? 'HIVE' : 'BUNKER'}</span>}
                                </button>
                                
                                <button onClick={() => setViewMode('story')} className="flex items-center justify-center p-2 border border-gray-700 bg-slate-800 text-gray-400 hover:text-white transition-all" title="REPLAY STORY">
                                    <span className="text-lg">↺</span>
                                </button>
                            </div>

                            {isEditorMode && !isSidebarCollapsed && (
                                <div className="p-2 bg-slate-800 border-b border-cyan-500">
                                    <div className="mb-2">
                                        <div className="text-[8px] font-bold text-blue-400 uppercase border-b border-blue-900 mb-1">CONTENT MANAGEMENT</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setMissionToEdit(null); setShowMissionEditor(true); }} className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-bold uppercase border border-blue-400">CREATE MISSION</button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-bold text-orange-400 uppercase border-b border-orange-900 mb-1">EVENT SIMULATION</div>
                                        <div className="flex gap-1 mb-1">
                                            <button onClick={() => handleSimulateProgress(1)} className="flex-1 py-1 border border-orange-500/50 text-orange-200 text-[8px] hover:bg-orange-900/20">+1</button>
                                            <button onClick={() => handleSimulateProgress(5)} className="flex-1 py-1 border border-orange-500/50 text-orange-200 text-[8px] hover:bg-orange-900/20">+5</button>
                                        </div>
                                        <button onClick={handleResetProgress} className="w-full py-1 bg-red-900/50 border border-red-600 text-red-300 text-[8px] hover:bg-red-800">RESET PROGRESS</button>
                                    </div>
                                </div>
                            )}

                            <div id="tutorial-sidebar-missions" className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
                                {!isSidebarCollapsed && <h4 className="text-[9px] font-bold text-gray-500 uppercase px-2 py-1 bg-slate-950 tracking-widest sticky top-0">{t.sidebar.activeMissions}</h4>}
                                
                                {visibleMissions.length === 0 && !isSidebarCollapsed && (
                                    <div className="text-center text-[9px] text-gray-600 italic py-4">{t.sidebar.noMissions}</div>
                                )}

                                {factionOrder.map(faction => {
                                    const factionMissions = missionsByFaction[faction];
                                    if (!factionMissions || factionMissions.length === 0) return null;
                                    
                                    // Faction Colors
                                    let headerColor = 'text-gray-400 border-gray-700 bg-gray-900/50';
                                    if (faction === 'MAGNETO') headerColor = 'text-red-400 border-red-900 bg-red-900/20';
                                    if (faction === 'KINGPIN') headerColor = 'text-purple-400 border-purple-900 bg-purple-900/20';
                                    if (faction === 'HULK') headerColor = 'text-lime-400 border-lime-900 bg-lime-900/20';
                                    if (faction === 'DOOM') headerColor = 'text-emerald-600 border-emerald-900 bg-emerald-900/20';

                                    return (
                                        <div key={faction} className="mb-1">
                                            {!isSidebarCollapsed && (
                                                <div className={`text-[8px] font-bold px-2 py-1 border-y ${headerColor} uppercase tracking-wider sticky top-0`}>
                                                    {faction} SECTOR
                                                </div>
                                            )}
                                            {factionMissions.map(m => {
                                                const isCompleted = completedMissionIds.has(m.id);
                                                const isShield = m.type === 'SHIELD_BASE';
                                                const isStartMission = m.id === 'm_kraven' || m.title.includes("MH0") || m.title.toUpperCase().includes("CADENAS ROTAS");
                                                const isBoss = m.type === 'BOSS';
                                                
                                                let barColor = 'bg-yellow-500';
                                                let textColor = 'text-yellow-100';
                                                let itemOpacity = isCompleted ? 'opacity-50 hover:opacity-80' : 'opacity-100';
                                                
                                                if (isCompleted) {
                                                    textColor = 'text-emerald-500 line-through';
                                                    barColor = 'bg-emerald-600';
                                                } else {
                                                    if (isBoss) { barColor = 'bg-purple-500'; textColor = 'text-purple-200'; }
                                                    else if (isShield) { barColor = 'bg-cyan-500'; textColor = 'text-cyan-200'; }
                                                    else if (isStartMission) { barColor = 'bg-emerald-500'; textColor = 'text-emerald-200'; }
                                                }

                                                return (
                                                    <div 
                                                        key={m.id} 
                                                        onClick={() => setSelectedMission(m)} 
                                                        className={`group cursor-pointer border-b border-cyan-900/30 hover:bg-cyan-900/10 transition-colors relative ${itemOpacity} ${isSidebarCollapsed ? 'h-8 flex items-center justify-center' : 'p-2 pl-3'}`}
                                                        title={m.title}
                                                    >
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor} group-hover:w-1.5 transition-all`}></div>
                                                        
                                                        {isSidebarCollapsed ? (
                                                            <div className={`w-2 h-2 rounded-full ${barColor} ${!isCompleted ? 'animate-pulse' : ''}`}></div>
                                                        ) : (
                                                            <div className="flex justify-between items-center w-full">
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <div className={`text-[9px] font-bold ${textColor} truncate uppercase`}>{m.title}</div>
                                                                    <div className="text-[7px] text-gray-500 truncate">{m.location.state}</div>
                                                                </div>
                                                                {isCompleted ? (
                                                                    <div className="text-[8px] text-emerald-600">✓</div>
                                                                ) : (
                                                                    <div className="text-[7px] text-gray-600 border border-gray-800 px-1">{m.threatLevel.substring(0,3)}</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        <main className="flex-1 relative bg-slate-950 overflow-hidden">
                            {viewMode === 'map' && (
                                <USAMap language={lang} missions={visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={handleMissionComplete} onMissionSelect={setSelectedMission} onBunkerClick={() => setViewMode('bunker')} factionStates={FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} />
                            )}
                            
                            {viewMode === 'bunker' && (
                                <BunkerInterior 
                                    heroes={heroes} 
                                    missions={visibleMissions.filter(m => !completedMissionIds.has(m.id))} 
                                    onAssign={(heroId, missionId) => { 
                                        const hIndex = heroes.findIndex(h => h.id === heroId); 
                                        if(hIndex >= 0) { 
                                            const newHeroes = [...heroes]; 
                                            newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'DEPLOYED', assignedMissionId: missionId }; 
                                            setHeroes(newHeroes); 
                                            return true; 
                                        } 
                                        return false; 
                                    }} 
                                    onUnassign={(heroId) => { 
                                        const hIndex = heroes.findIndex(h => h.id === heroId); 
                                        if(hIndex >= 0) { 
                                            const newHeroes = [...heroes]; 
                                            newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'AVAILABLE', assignedMissionId: null }; 
                                            setHeroes(newHeroes); 
                                        } 
                                    }} 
                                    onAddHero={(hero) => setHeroes([...heroes, hero])} 
                                    onToggleObjective={handleToggleHeroObjective} 
                                    onBack={() => setViewMode('map')} 
                                    language={lang} 
                                    playerAlignment={playerAlignment} 
                                    isEditorMode={isEditorMode}
                                />
                            )}

                            {viewMode === 'tutorial' && (
                                <div className="absolute inset-0 z-40">
                                    <USAMap language={lang} missions={visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={() => {}} onMissionSelect={() => {}} onBunkerClick={() => {}} factionStates={FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} />
                                    <TutorialOverlay language={lang} onComplete={() => { if(user) localStorage.setItem(`shield_tutorial_seen_${user.uid}`, 'true'); setViewMode('map'); }} onStepChange={(stepKey) => { if (['roster', 'file', 'recruit'].includes(stepKey)) { setViewMode('bunker'); } }} />
                                </div>
                            )}
                        </main>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
