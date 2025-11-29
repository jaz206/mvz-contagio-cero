
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { USATopoJSON } from './types'; 
import { USAMap } from './components/USAMap';
import { LoginScreen } from './components/LoginScreen';
import { translations, Language } from './translations';
import { Mission, Hero } from './types';
import { MissionModal } from './components/MissionModal';
import { BunkerInterior } from './components/BunkerInterior';
import { StoryMode } from './components/StoryMode';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { logout } from './services/authService';
import { getUserProfile, saveUserProfile } from './services/dbService';

// Centralized Faction Definitions
const FACTION_STATES = {
  magneto: new Set([
    "Washington", "Oregon", "California", "Arizona", "Colorado", 
    "Wyoming", "Montana", "Alaska", "Hawaii", "Nevada", "Utah", "Idaho"
  ]),
  kingpin: new Set([
    "Virginia", "West Virginia", "Pennsylvania", "New York", "Vermont", 
    "New Hampshire", "Maine", "Massachusetts", "Rhode Island", "Connecticut", 
    "New Jersey", "Delaware", "Maryland", "District of Columbia"
  ]),
  hulk: new Set([
    "North Dakota", "South Dakota", "Nebraska", "Kansas", "Oklahoma", 
    "New Mexico", "Texas", "Missouri", "Illinois", "Indiana", 
    "Ohio", "Michigan", "Wisconsin", "Minnesota", "Iowa"
  ])
  // Doom: All others (Checked via else logic)
};

// Initial Living Heroes
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
            "El Fantasma de Queens: Peter debe volver a su casa. Debe entrar, enfrentarse a lo que queda de Tía May, matarla definitivamente para darle descanso y recuperar el álbum de fotos familiar que ella protegía.",
            "Rastro Fantasma: Triangular la señal del reloj Stark en los túneles de la Zona Roja. Confirmar estado de MJ: Superviviente o Hostil."
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/97/f1/96/97f1965bf162c5eb2f7aa8cb4be4bf97.jpg',
        stats: { strength: 8, agility: 10, intellect: 9 },
        assignedMissionId: null
    },
    {
        id: 'h2',
        templateId: 'blackwidow',
        name: 'Natasha Romanoff',
        alias: 'BLACK WIDOW',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'Expert spy and assassin. Her skills are crucial for infiltration missions in Fisk\'s territory. Keeps the team focused on the objective.',
        currentStory: 'Natasha no es una víctima. Ella fue quien colocó los explosivos en la carretera para volcar el transporte de la Tríada. Esa figura que emergió de las sombras en la Misión 0 era ella. Ha pasado meses rastreando prisioneros útiles para formar la Iniciativa Lázaro. S.H.I.E.L.D. cayó, Fury murió gritando, pero Natasha sobrevivió porque sabe ser invisible. Su frialdad es una armadura; sacrifica peones para salvar reyes. Sin embargo, su armadura tiene una grieta: ha interceptado una señal analógica, un código Morse antiguo que solo dos personas conocen. Clint Barton (Hawkeye) está vivo, retenido por Kingpin como trofeo o cebo. Natasha quemará la ciudad entera y usará a este nuevo equipo de "zombies renegados" como carne de cañón si eso le permite llegar hasta él.',
        objectives: [
            'Ojo de Halcón: Localizar y extraer a Clint Barton de la fortaleza de Kingpin.',
            'Sacrificio Calculado: Usar activos prescindibles para asegurar objetivos de alto valor.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/a5/8f/e9/a58fe99516a31f494c1d4dcb22231c46.jpg',
        stats: { strength: 6, agility: 9, intellect: 9 },
        assignedMissionId: null
    },
    {
        id: 'h3',
        templateId: 'loki',
        name: 'Loki Laufeyson',
        alias: 'LOKI',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'God of Mischief. Exiled on Earth when Asgard closed the Bifrost. Driven by a twisted mix of arrogance, survival instinct, and a grudge against Doom.',
        currentStory: 'Loki estaba en la Tierra para conquistar, como siempre. Cuando Thor cayó infectado en la primera oleada, Loki se rio. Pensó que era el final perfecto para su arrogante hermano: convertido en un animal babeante. Se acercó para burlarse de él... y Thor, con la mente podrida, lo miró y lloró sangre. En ese momento, Loki se dio cuenta de que sin Thor, él no es nada. Intentó usar su magia para curarlo, pero el virus de la Tríada (Ciencia + Magia de Doom) rechazó sus hechizos. Loki tuvo que huir de su propio hermano. Asgard cerró el Bifrost, dejándolo exiliado en este infierno. Ahora, Loki camina entre los muertos usando ilusiones para parecer uno de ellos. Se ha unido a la Iniciativa Lázaro por puro rencor: Doom usó magia asgardiana robada para crear el virus. Loki va a recuperar esa magia, va a despellejar a Doom y luego va a buscar a Thor para concederle la misericordia que le negó el primer día.',
        objectives: [
            'Venganza Divina: Recuperar la magia asgardiana robada de los laboratorios de Doom.',
            'Misericordia Fraternal: Localizar a Thor Zombie y concederle el descanso final.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/98/50/d0/9850d063395efd498cce84be09da69fd.jpg',
        stats: { strength: 7, agility: 8, intellect: 10 },
        assignedMissionId: null
    },
    {
        id: 'h4',
        templateId: 'sabretooth',
        name: 'Victor Creed',
        alias: 'SABRETOOTH',
        status: 'DEPLOYED',
        class: 'BRAWLER',
        bio: 'Driven by pure predatory instinct. S.H.I.E.L.D. keeps him on a tight leash. He tracks the infected not to save them, but for the sport.',
        currentStory: 'Víctor Creed fue el primer experimento. Antes de capturar a Banner, la Tríada necesitaba probar la resistencia del tejido al virus. Capturaron a Creed y lo ataron en el "Laboratorio X". No buscaban un arma; buscaban una granja. Lo infectaban, esperaban a que la carne se pudriera, y luego cortaban los trozos podridos mientras su factor de curación regeneraba tejido nuevo. Un ciclo infinito de infección y vivisección. Creed era carne infinita para alimentar sus pruebas. Escapó el día que Hulk estalló, aprovechando el fallo de seguridad para arrancar la garganta de su torturador con los dientes. Ahora, su factor de curación está sobrecargado, luchando perpetuamente contra residuos del virus en su sangre. Se une a Lázaro porque sabe dónde están los laboratorios secretos y quiere quemarlos hasta los cimientos... con los científicos dentro.',
        objectives: [
            'Tierra Quemada: Localizar y destruir el "Laboratorio X" y todas las instalaciones de prueba.',
            'Cacería de Batas Blancas: Eliminar a cualquier científico asociado con el proyecto del virus.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/31/eb/4c/31eb4c0f0dba5c96c80da093a4d83a50.jpg',
        stats: { strength: 10, agility: 7, intellect: 4 },
        assignedMissionId: 'kraven-ny' 
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
            'Cero Absoluto: El sistema de refrigeración del búnker falla. Recuperar núcleos de criogenización de un laboratorio de SHIELD para que los niños no se descongelen.',
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
        bio: 'A lawyer who can bench press a tank. Retains her intelligence while transformed, making her a deadly combination of brains and brawn on the battlefield.',
        currentStory: 'Jennifer intentó detenerlos legalmente, pero la Tríada secuestró a Bruce bajo "Leyes de Emergencia". Mentira. Lo querían como cobaya para el Pulso Nulificador. Jennifer asaltó el laboratorio rompiendo paredes, pero llegó segundos tarde. Vio a Bruce atado como un animal de matadero. Vio el momento exacto en que le inyectaron el virus y cómo la sangre Gamma reaccionó, convirtiéndolo en una bomba biológica que reventó el mundo. Ella sobrevivió a la explosión gracias a su piel; Bruce se convirtió en el Monstruo Infinito. Ahora Jennifer sabe que el Apocalipsis tiene nombres y apellidos: Doom, Magneto, Fisk. No descansará hasta romperles la columna a los tres y darle a su primo la eutanasia que merece.',
        objectives: [
            'Juicio Final: Desmantelar el liderazgo de la Tríada (Doom, Magneto, Fisk).',
            'Paz Gamma: Localizar a Hulk y neutralizarlo permanentemente.'
        ],
        completedObjectiveIndices: [],
        imageUrl: 'https://i.pinimg.com/736x/bb/2a/f6/bb2af63dbdbf782daf9af337915489c0.jpg',
        stats: { strength: 10, agility: 6, intellect: 8 },
        assignedMissionId: null
    }
];

// Initial Zombie Heroes
const INITIAL_ZOMBIE_HEROES: Hero[] = [
    {
        id: 'z1',
        templateId: 'colonel',
        name: 'Steve Rogers',
        alias: 'COLONEL AMERICA',
        status: 'AVAILABLE',
        class: 'TACTICIAN',
        bio: 'Tactical genius preserved in a rotting brain. Leads the horde.',
        currentStory: 'Organizing the horde for a strike on the Western Front.',
        objectives: ['Devour 10 Humans', 'Breach Defenses'],
        completedObjectiveIndices: [],
        imageUrl: '',
        stats: { strength: 8, agility: 6, intellect: 8 },
        assignedMissionId: null
    },
    {
        id: 'z2',
        templateId: 'ironman_z',
        name: 'Tony Stark',
        alias: 'IRON MAN (Z)',
        status: 'AVAILABLE',
        class: 'BLASTER',
        bio: 'Tech-enhanced hunger. Repulsors fueled by flesh.',
        currentStory: 'Suit power critical. Seeking bio-fuel source.',
        objectives: ['Consume Energy Core', 'Upgrade Armor'],
        completedObjectiveIndices: [],
        imageUrl: '',
        stats: { strength: 7, agility: 6, intellect: 10 },
        assignedMissionId: null
    },
    {
        id: 'z3',
        templateId: 'wolverine_z',
        name: 'Logan',
        alias: 'WOLVERINE (Z)',
        status: 'AVAILABLE',
        class: 'BRAWLER',
        bio: 'Regenerating rot. The ultimate predator.',
        currentStory: 'Tracking scent of fresh meat in the sewers.',
        objectives: ['Hunt Resistance Leader', 'Survive Explosion'],
        completedObjectiveIndices: [],
        imageUrl: '',
        stats: { strength: 9, agility: 9, intellect: 5 },
        assignedMissionId: null
    },
    {
        id: 'z4',
        templateId: 'phoenix_z',
        name: 'Jean Grey',
        alias: 'DARK PHOENIX (Z)',
        status: 'AVAILABLE',
        class: 'BLASTER',
        bio: 'Cosmic hunger. Devourer of worlds.',
        currentStory: 'The Hunger is growing. A planet is not enough.',
        objectives: ['Consume Solar Flare', 'Destroy S.H.I.E.L.D. Base'],
        completedObjectiveIndices: [],
        imageUrl: '',
        stats: { strength: 10, agility: 8, intellect: 9 },
        assignedMissionId: null
    }
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isGuest, setIsGuest] = useState(false); 
  
  const [viewMode, setViewMode] = useState<'map' | 'bunker'>('map');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showStory, setShowStory] = useState(false);
  const t = translations[lang];

  // -- STATE PERSISTENCE --
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(new Set());
  const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
  const [playerAlignment, setPlayerAlignment] = useState<'ALIVE' | 'ZOMBIE' | null>(null);
  
  // Cloud Save State
  const [savingStatus, setSavingStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to get storage keys based on current user and alignment
  const getStorageKeys = useCallback((alignment: 'ALIVE' | 'ZOMBIE' | null, currentUser: User | null, guestMode: boolean) => {
      const uid = currentUser ? currentUser.uid : (guestMode ? 'guest' : null);
      if (!uid || !alignment) return null;
      
      return {
          missions: `shield_missions_${uid}_${alignment}`,
          heroes: `shield_heroes_${uid}_${alignment}`,
          legacyMissions: `shield_missions_${uid}`, // For migration
          legacyHeroes: `shield_heroes_${uid}` // For migration
      };
  }, []);

  // FORCE UPDATE HELPER: Merges saved data with latest code definitions
  const mergeWithLatestContent = useCallback((savedHeroes: Hero[], alignment: 'ALIVE' | 'ZOMBIE'): Hero[] => {
      const initialList = alignment === 'ALIVE' ? INITIAL_HEROES : INITIAL_ZOMBIE_HEROES;
      
      // 1. Update existing heroes with latest content from code
      const updatedHeroes = savedHeroes.map(savedHero => {
          const latestDef = initialList.find(h => h.id === savedHero.id);
          if (latestDef) {
              return {
                  ...savedHero,
                  // Overwrite content fields with latest from code
                  bio: latestDef.bio,
                  currentStory: latestDef.currentStory,
                  objectives: latestDef.objectives,
                  imageUrl: latestDef.imageUrl,
                  alias: latestDef.alias,
                  name: latestDef.name
                  // Keep status, assignedMissionId, completedObjectiveIndices from savedHero
              };
          }
          return savedHero;
      });

      // 2. Add any NEW heroes that might have been added to code but aren't in save
      // (Optional, usually we just update content of existing ones for now)
      
      return updatedHeroes;
  }, []);

  // 1. Auth Listener
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoadingAuth(false);
          
          if (currentUser) {
            setIsGuest(false);
            // Check if user has seen intro and get LAST PLAYED alignment
            const hasSeen = localStorage.getItem(`shield_intro_seen_${currentUser.uid}`);
            const savedAlignment = localStorage.getItem(`shield_alignment_${currentUser.uid}`);
            
            if (!hasSeen) {
                setShowStory(true);
            }
            if (savedAlignment) {
                setPlayerAlignment(savedAlignment as 'ALIVE' | 'ZOMBIE');
            }
          }
      });
      return () => unsubscribe();
  }, []);

  // 2. Load Data Strategy (Cloud Priority -> Local Fallback)
  useEffect(() => {
      if (loadingAuth || (!user && !isGuest)) return;
      if (!playerAlignment) return;

      const loadData = async () => {
          let loadedFromCloud = false;

          // Try Cloud First if Authenticated
          if (user) {
              setSavingStatus('SAVING'); // Reusing saving status for loading indication mostly
              const cloudProfile = await getUserProfile(user.uid, playerAlignment);
              if (cloudProfile) {
                  // MERGE LOGIC: Combine Cloud Save Data with Latest Code Content
                  const mergedHeroes = mergeWithLatestContent(cloudProfile.heroes, playerAlignment);
                  setHeroes(mergedHeroes);
                  setCompletedMissionIds(new Set(cloudProfile.completedMissionIds));
                  loadedFromCloud = true;
                  setSavingStatus('SAVED');
              } else {
                  setSavingStatus('IDLE');
              }
          }

          // Fallback to LocalStorage if cloud failed or empty (or guest)
          if (!loadedFromCloud) {
              const keys = getStorageKeys(playerAlignment, user, isGuest);
              if (keys) {
                  // Load Missions
                  try {
                      const savedMissions = localStorage.getItem(keys.missions);
                      if (savedMissions) {
                          setCompletedMissionIds(new Set(JSON.parse(savedMissions)));
                      } else if (playerAlignment === 'ALIVE') {
                          // Migration Logic
                          const legacyMissions = localStorage.getItem(keys.legacyMissions);
                          if (legacyMissions) setCompletedMissionIds(new Set(JSON.parse(legacyMissions)));
                          else setCompletedMissionIds(new Set());
                      } else {
                          setCompletedMissionIds(new Set());
                      }
                  } catch (e) { setCompletedMissionIds(new Set()); }

                  // Load Heroes
                  try {
                      const savedHeroes = localStorage.getItem(keys.heroes);
                      if (savedHeroes) {
                          // MERGE LOGIC: Combine Local Save Data with Latest Code Content
                          const localHeroes = JSON.parse(savedHeroes);
                          const mergedHeroes = mergeWithLatestContent(localHeroes, playerAlignment);
                          setHeroes(mergedHeroes);
                      } else if (playerAlignment === 'ALIVE') {
                          // Migration Logic
                          const legacyHeroes = localStorage.getItem(keys.legacyHeroes);
                          if (legacyHeroes) {
                              const localLegacyHeroes = JSON.parse(legacyHeroes);
                              const mergedHeroes = mergeWithLatestContent(localLegacyHeroes, playerAlignment);
                              setHeroes(mergedHeroes);
                          }
                          else setHeroes(INITIAL_HEROES);
                      } else {
                          setHeroes(INITIAL_ZOMBIE_HEROES);
                      }
                  } catch (e) {
                      setHeroes(playerAlignment === 'ZOMBIE' ? INITIAL_ZOMBIE_HEROES : INITIAL_HEROES);
                  }
              }
          }
      };

      loadData();
  }, [user, isGuest, playerAlignment, loadingAuth, getStorageKeys, mergeWithLatestContent]);


  // 3. Save Data Logic (Local + Cloud Auto-Save)
  useEffect(() => {
      if (loadingAuth || !playerAlignment) return;
      
      const keys = getStorageKeys(playerAlignment, user, isGuest);
      if (!keys) return;

      // IMMEDIATE LOCAL SAVE
      localStorage.setItem(keys.missions, JSON.stringify([...completedMissionIds]));
      localStorage.setItem(keys.heroes, JSON.stringify(heroes));

      // DEBOUNCED CLOUD SAVE (Only for authenticated users)
      if (user) {
          if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
          }

          setSavingStatus('SAVING');
          
          saveTimeoutRef.current = setTimeout(async () => {
              try {
                  await saveUserProfile(user.uid, playerAlignment, heroes, [...completedMissionIds]);
                  setSavingStatus('SAVED');
                  // Revert status to idle after a few seconds
                  setTimeout(() => setSavingStatus('IDLE'), 3000);
              } catch (e) {
                  console.error("Cloud save failed", e);
                  setSavingStatus('ERROR');
              }
          }, 2000); // 2 second debounce
      }

  }, [heroes, completedMissionIds, user, loadingAuth, isGuest, playerAlignment, getStorageKeys]);

  // Persist the alignment preference
  useEffect(() => {
      if (loadingAuth) return;
      if (playerAlignment) {
        const storageKeyAlignment = user ? `shield_alignment_${user.uid}` : 'shield_alignment_guest';
        localStorage.setItem(storageKeyAlignment, playerAlignment);
      }
  }, [playerAlignment, user, loadingAuth, isGuest]);

  // Guest Login Handler
  const handleGuestLogin = () => {
      setIsGuest(true);
      const savedAlignment = localStorage.getItem('shield_alignment_guest');
      if (!savedAlignment) {
          setShowStory(true);
      } else {
          setPlayerAlignment(savedAlignment as 'ALIVE' | 'ZOMBIE');
      }
  };

  // Story Completion Handler
  const handleStoryComplete = (choice: 'ALIVE' | 'ZOMBIE') => {
      setPlayerAlignment(choice);
      setShowStory(false);
      
      if (user) {
          localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true');
      }
  };

  const handleCampaignSwitch = (newAlignment: 'ALIVE' | 'ZOMBIE') => {
      if (playerAlignment === newAlignment) return;
      setPlayerAlignment(newAlignment);
      setViewMode('map');
  };

  // --- MISSION DEFINITIONS ---
  const allMissions: Mission[] = useMemo(() => {
      
      if (playerAlignment === 'ZOMBIE') {
          // ZOMBIE CAMPAIGN
          return [
              {
                id: 'fresh-meat-tx',
                title: t.missions.freshMeat.title,
                description: t.missions.freshMeat.description,
                objectives: t.missions.freshMeat.objectives,
                location: {
                    state: 'Texas',
                    coordinates: [-99.0, 31.0] 
                },
                threatLevel: 'HUNGER'
              },
              {
                id: 'break-siege-ca',
                prereq: 'fresh-meat-tx',
                title: t.missions.breakSiege.title,
                description: t.missions.breakSiege.description,
                objectives: t.missions.breakSiege.objectives,
                location: {
                    state: 'California',
                    coordinates: [-119.0, 36.0]
                },
                threatLevel: 'APOCALYPTIC'
              }
          ];
      } else {
          // ALIVE / HERO CAMPAIGN (Default)
          const baseMissions: Mission[] = [
            {
                id: 'kraven-ny',
                title: t.missions.kraven.title,
                description: t.missions.kraven.description,
                objectives: t.missions.kraven.objectives,
                location: {
                    state: 'New York',
                    coordinates: [-75.5, 43.0] 
                },
                threatLevel: 'CRITICAL',
                type: 'STANDARD'
            },
            {
                id: 'flesh-sleeps',
                prereq: 'kraven-ny',
                title: t.missions.fleshSleeps.title,
                description: t.missions.fleshSleeps.description,
                objectives: t.missions.fleshSleeps.objectives,
                location: {
                    state: 'New Jersey',
                    coordinates: [-74.4, 40.0] 
                },
                threatLevel: 'EXTREME',
                type: 'STANDARD'
            }
          ];

          // HIDDEN SHIELD BASES (KINGPIN TERRITORY)
          const shieldBases: Mission[] = [
              {
                  id: 'base-alpha',
                  title: t.missions.bases.alpha,
                  description: [t.missions.bases.desc],
                  objectives: [{ title: 'SECURE', desc: t.missions.bases.objSecure }, { title: 'RETRIEVE', desc: t.missions.bases.objRetrieve }],
                  location: { state: 'New York', coordinates: [-74.0, 44.0] },
                  threatLevel: 'UNKNOWN',
                  type: 'SHIELD_BASE'
              },
              {
                  id: 'base-beta',
                  title: t.missions.bases.beta,
                  description: [t.missions.bases.desc],
                  objectives: [{ title: 'SECURE', desc: t.missions.bases.objSecure }, { title: 'RETRIEVE', desc: t.missions.bases.objRetrieve }],
                  location: { state: 'Pennsylvania', coordinates: [-77.5, 40.8] },
                  threatLevel: 'UNKNOWN',
                  type: 'SHIELD_BASE'
              },
              {
                  id: 'base-gamma',
                  title: t.missions.bases.gamma,
                  description: [t.missions.bases.desc],
                  objectives: [{ title: 'SECURE', desc: t.missions.bases.objSecure }, { title: 'RETRIEVE', desc: t.missions.bases.objRetrieve }],
                  location: { state: 'Massachusetts', coordinates: [-72.0, 42.3] },
                  threatLevel: 'UNKNOWN',
                  type: 'SHIELD_BASE'
              },
              {
                  id: 'base-delta',
                  title: t.missions.bases.delta,
                  description: [t.missions.bases.desc],
                  objectives: [{ title: 'SECURE', desc: t.missions.bases.objSecure }, { title: 'RETRIEVE', desc: t.missions.bases.objRetrieve }],
                  location: { state: 'Maryland', coordinates: [-76.8, 39.0] },
                  threatLevel: 'UNKNOWN',
                  type: 'SHIELD_BASE'
              },
              {
                  id: 'base-epsilon',
                  title: t.missions.bases.epsilon,
                  description: [t.missions.bases.desc],
                  objectives: [{ title: 'SECURE', desc: t.missions.bases.objSecure }, { title: 'RETRIEVE', desc: t.missions.bases.objRetrieve }],
                  location: { state: 'New Jersey', coordinates: [-74.8, 39.8] },
                  threatLevel: 'UNKNOWN',
                  type: 'SHIELD_BASE'
              },
              {
                  id: 'base-zeta',
                  title: t.missions.bases.zeta,
                  description: [t.missions.bases.desc],
                  objectives: [{ title: 'SECURE', desc: t.missions.bases.objSecure }, { title: 'RETRIEVE', desc: t.missions.bases.objRetrieve }],
                  location: { state: 'Connecticut', coordinates: [-72.7, 41.6] },
                  threatLevel: 'UNKNOWN',
                  type: 'SHIELD_BASE'
              }
          ];

          return [...baseMissions, ...shieldBases];
      }
  }, [t, playerAlignment]);

  // Filter missions
  const visibleMissions = useMemo(() => {
    return allMissions.filter(m => {
        const isCompleted = completedMissionIds.has(m.id);
        const prereqMet = !m.prereq || completedMissionIds.has(m.prereq);
        return isCompleted || prereqMet;
    });
  }, [allMissions, completedMissionIds]);

  const assignableMissions = useMemo(() => {
      return visibleMissions.filter(m => !completedMissionIds.has(m.id));
  }, [visibleMissions, completedMissionIds]);

  const handleMissionComplete = (id: string) => {
    setCompletedMissionIds(prev => new Set(prev).add(id));
  };

  const handleMissionReactivate = (id: string) => {
    setCompletedMissionIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
    });
  };

  const handleAssignHero = (heroId: string, missionId: string) => {
      const heroesOnMission = heroes.filter(h => h.assignedMissionId === missionId);
      if (heroesOnMission.length >= 6) return false;

      setHeroes(prev => prev.map(h => {
          if (h.id === heroId) {
              return { ...h, status: 'DEPLOYED', assignedMissionId: missionId };
          }
          return h;
      }));
      return true;
  };

  const handleUnassignHero = (heroId: string) => {
      setHeroes(prev => prev.map(h => {
          if (h.id === heroId) {
              return { ...h, status: 'AVAILABLE', assignedMissionId: null };
          }
          return h;
      }));
  };
  
  const handleAddHero = (newHero: Hero) => {
      setHeroes(prev => [...prev, newHero]);
  };

  const handleToggleHeroObjective = (heroId: string, objectiveIndex: number) => {
      setHeroes(prev => prev.map(h => {
          if (h.id === heroId) {
              const currentIndices = h.completedObjectiveIndices || [];
              let newIndices;
              if (currentIndices.includes(objectiveIndex)) {
                  newIndices = currentIndices.filter(i => i !== objectiveIndex);
              } else {
                  newIndices = [...currentIndices, objectiveIndex];
              }
              return { ...h, completedObjectiveIndices: newIndices };
          }
          return h;
      }));
  };

  const handleLogout = async () => {
      await logout();
      setIsGuest(false);
      setViewMode('map');
  };

  const getMissionsForFaction = (factionKey: 'magneto' | 'kingpin' | 'hulk' | 'doom') => {
      return visibleMissions.filter(m => {
          const state = m.location.state;
          if (factionKey === 'magneto') return FACTION_STATES.magneto.has(state);
          if (factionKey === 'kingpin') return FACTION_STATES.kingpin.has(state);
          if (factionKey === 'hulk') return FACTION_STATES.hulk.has(state);
          return !FACTION_STATES.magneto.has(state) && !FACTION_STATES.kingpin.has(state) && !FACTION_STATES.hulk.has(state);
      });
  };

  const renderMissionList = (factionKey: 'magneto' | 'kingpin' | 'hulk' | 'doom') => {
      const missions = getMissionsForFaction(factionKey);
      if (missions.length === 0) return null;

      return (
          <div className="mt-2 pl-2 border-l border-dashed border-cyan-800">
              <div className="text-[10px] text-cyan-600 mb-1">{t.sidebar.activeMissions}:</div>
              {missions.map(m => {
                  const isCompleted = completedMissionIds.has(m.id);
                  const isBase = m.type === 'SHIELD_BASE';
                  return (
                    <div 
                        key={m.id} 
                        onClick={() => setSelectedMission(m)}
                        className={`text-xs border p-1 mb-1 transition-all cursor-pointer hover:brightness-110 ${
                            isCompleted 
                            ? 'text-emerald-300 bg-emerald-900/20 border-emerald-500/50 opacity-80' 
                            : isBase
                                ? 'text-cyan-100 bg-cyan-900/40 border-cyan-500/50 animate-pulse'
                                : 'text-yellow-100 bg-yellow-900/40 border-yellow-500/50 animate-pulse'
                        }`}
                    >
                        {isCompleted ? '✓' : (isBase ? '⌖' : '⚠')} {m.title}
                    </div>
                  );
              })}
          </div>
      );
  };

  if (!loadingAuth && !user && !isGuest) {
    return <LoginScreen onLogin={handleGuestLogin} onGoogleLogin={() => {}} language={lang} setLanguage={setLang} />;
  }

  if (loadingAuth) {
      return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-cyan-500 font-mono">INITIALIZING UPLINK...</div>;
  }

  return (
    <div className={`flex flex-col h-screen w-full bg-slate-950 text-cyan-400 font-mono overflow-hidden relative ${playerAlignment === 'ZOMBIE' ? 'hue-rotate-15 saturate-50' : ''}`}>
      
      {showStory && (
          <StoryMode 
            language={lang} 
            onComplete={handleStoryComplete} 
            onSkip={() => handleStoryComplete('ALIVE')} 
          />
      )}

      {viewMode === 'bunker' ? (
        <BunkerInterior 
          heroes={heroes} 
          missions={assignableMissions}
          onAssign={handleAssignHero}
          onUnassign={handleUnassignHero}
          onAddHero={handleAddHero}
          onToggleObjective={handleToggleHeroObjective}
          onBack={() => setViewMode('map')} 
          language={lang} 
          playerAlignment={playerAlignment}
        />
      ) : (
        <>
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                style={{backgroundImage: 'linear-gradient(rgba(6,182,212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>

            <header className="flex justify-between items-center p-4 border-b border-cyan-800 bg-slate-900/80 z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-2 border-cyan-400 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-900/20"></div>
                    <span className="text-2xl font-bold">S.H.I.E.L.D.</span>
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                    {t.header.project}
                    </h1>
                    <p className="text-[10px] md:text-xs text-red-500 tracking-widest font-bold">{t.header.failure}</p>
                </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                <div className="flex gap-2 mb-1 items-center">
                    {(user || isGuest) && (
                         <div className="flex items-center gap-2 mr-2">
                            {user && user.photoURL && <img src={user.photoURL} className="w-4 h-4 rounded-full border border-cyan-500" alt="Agent" />}
                            <span className="text-[10px] text-cyan-600 hidden md:inline">{user ? (user.displayName || 'AGENT') : 'GUEST COMMANDER'}</span>
                            {/* SAVING STATUS INDICATOR */}
                            {savingStatus !== 'IDLE' && (
                                <span className={`text-[10px] font-bold ${
                                    savingStatus === 'SAVING' ? 'text-yellow-500 animate-pulse' : 
                                    savingStatus === 'SAVED' ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                    {savingStatus === 'SAVING' ? t.header.saving : savingStatus === 'SAVED' ? t.header.saved : 'SYNC ERROR'}
                                </span>
                            )}
                            <button onClick={handleLogout} className="text-[10px] text-red-400 border border-red-900 px-2 hover:bg-red-900/50">{t.header.logout}</button>
                         </div>
                    )}
                    <div className="flex gap-1">
                        <button 
                        onClick={() => setLang('es')} 
                        className={`text-[10px] px-2 py-0.5 border transition-all ${lang === 'es' ? 'bg-cyan-900/80 border-cyan-400 text-white shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'border-cyan-900 text-cyan-700 hover:text-cyan-400'}`}
                        >
                        ES
                        </button>
                        <button 
                        onClick={() => setLang('en')} 
                        className={`text-[10px] px-2 py-0.5 border transition-all ${lang === 'en' ? 'bg-cyan-900/80 border-cyan-400 text-white shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'border-cyan-900 text-cyan-700 hover:text-cyan-400'}`}
                        >
                        EN
                        </button>
                    </div>
                </div>
                <div className="text-[10px] md:text-xs text-red-500 font-bold animate-pulse hidden md:block">{t.header.biohazard}</div>
                <div className="text-[10px] md:text-xs text-cyan-700 hidden md:block">{t.header.clearance}</div>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden relative p-4 gap-4">
                
                <aside className="hidden lg:flex flex-col w-80 border border-cyan-900 bg-slate-900/80 p-4 gap-6 z-10 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-800">
                
                <button
                    onClick={() => setViewMode('bunker')}
                    className={`w-full py-3 border font-bold text-xs tracking-widest hover:text-white transition-all flex items-center justify-center gap-3 shadow-[0_0_10px_rgba(6,182,212,0.1)] group ${
                        playerAlignment === 'ZOMBIE' 
                        ? 'bg-lime-900/30 border-lime-500 text-lime-300 hover:bg-lime-800/50' 
                        : 'bg-cyan-900/30 border-cyan-500 text-cyan-300 hover:bg-cyan-800/50'
                    }`}
                >
                    <div className={`w-5 h-5 border rounded-sm flex items-center justify-center ${playerAlignment === 'ZOMBIE' ? 'border-lime-400 group-hover:bg-lime-400/20' : 'border-cyan-400 group-hover:bg-cyan-400/20'}`}>
                        <div className={`w-2 h-2 rotate-45 ${playerAlignment === 'ZOMBIE' ? 'bg-lime-400' : 'bg-cyan-400'}`}></div>
                    </div>
                    {playerAlignment === 'ZOMBIE' ? t.sidebar.hiveBtn : t.sidebar.bunkerBtn}
                </button>
                
                <div className="w-full">
                    <h3 className="text-[10px] text-cyan-600 mb-2 uppercase font-bold tracking-widest border-b border-cyan-900 pb-1">{t.sidebar.campaignMode}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleCampaignSwitch('ALIVE')}
                            className={`flex-1 py-2 text-[8px] font-bold border transition-all ${
                                playerAlignment === 'ALIVE' 
                                ? 'bg-cyan-800 text-white border-cyan-400' 
                                : 'text-gray-500 border-gray-700 hover:text-cyan-400 hover:border-cyan-600'
                            }`}
                        >
                            {playerAlignment === 'ALIVE' ? 'ACTIVE' : t.sidebar.switchHero}
                        </button>
                        <button
                            onClick={() => handleCampaignSwitch('ZOMBIE')}
                            className={`flex-1 py-2 text-[8px] font-bold border transition-all ${
                                playerAlignment === 'ZOMBIE' 
                                ? 'bg-lime-900 text-white border-lime-500' 
                                : 'text-gray-500 border-gray-700 hover:text-lime-400 hover:border-lime-600'
                            }`}
                        >
                            {playerAlignment === 'ZOMBIE' ? 'ACTIVE' : t.sidebar.switchZombie}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setShowStory(true)}
                    className="w-full py-2 bg-slate-900 border border-cyan-800 text-cyan-600 font-bold text-[10px] tracking-widest hover:bg-cyan-900/30 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
                >
                    {t.sidebar.replayStory}
                </button>

                <div className="border-l-4 border-red-600 pl-3">
                    <h3 className="text-xs text-red-400 mb-1 font-bold">{t.sidebar.threatLevelTitle}</h3>
                    <div className="text-2xl font-bold text-white animate-pulse">{t.sidebar.threatLevelValue}</div>
                    <div className="text-[10px] text-red-400">{t.sidebar.infectionRate}</div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-xs text-cyan-400 border-b border-cyan-800 pb-1 tracking-widest">{t.sidebar.factionIntel}</h3>
                    
                    <div className="bg-slate-800/50 p-2 border-l-2 border-red-600">
                    <div className="flex justify-between text-sm font-bold text-red-400">
                        <span>{t.factions.magneto.name}</span>
                        <span className="text-[10px] bg-red-900/50 px-1 rounded text-white">{t.factions.magneto.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.leader}: MAGNETO</p>
                    <p className="text-[10px] text-cyan-700">{t.sidebar.status}: {t.factions.magneto.status}</p>
                    {renderMissionList('magneto')}
                    </div>

                    <div className="bg-slate-800/50 p-2 border-l-2 border-purple-500">
                    <div className="flex justify-between text-sm font-bold text-purple-400">
                        <span>{t.factions.kingpin.name}</span>
                        <span className="text-[10px] bg-purple-900/50 px-1 rounded text-white">{t.factions.kingpin.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.leader}: KINGPIN</p>
                    <p className="text-[10px] text-cyan-700">{t.sidebar.status}: {t.factions.kingpin.status}</p>
                    {renderMissionList('kingpin')}
                    </div>

                    <div className="bg-slate-800/50 p-2 border-l-2 border-emerald-700">
                    <div className="flex justify-between text-sm font-bold text-emerald-500">
                        <span>{t.factions.doom.name}</span>
                        <span className="text-[10px] bg-emerald-900/50 px-1 rounded text-white">{t.factions.doom.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.leader}: V. VON DOOM</p>
                    <p className="text-[10px] text-cyan-700">{t.sidebar.status}: {t.factions.doom.status}</p>
                    {renderMissionList('doom')}
                    </div>

                    <div className="bg-slate-800/50 p-2 border-l-2 border-lime-600">
                    <div className="flex justify-between text-sm font-bold text-lime-400">
                        <span>{t.factions.hulk.name}</span>
                        <span className="text-[10px] bg-lime-900/50 px-1 rounded text-white">{t.factions.hulk.region}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.sidebar.threat}: HULK</p>
                    <p className="text-[10px] text-red-500 animate-pulse">{t.sidebar.status}: {t.factions.hulk.status}</p>
                    {renderMissionList('hulk')}
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <div className="h-px w-full bg-cyan-900"></div>
                    <p className="text-[10px] text-cyan-600 italic">
                    {t.sidebar.quote}
                    </p>
                    <div className="border border-red-900 bg-red-900/20 p-2 text-center text-xs text-red-500 font-bold">
                    {t.sidebar.uplink}
                    </div>
                </div>
                </aside>

                <div className="flex-1 relative border border-cyan-700/50 bg-slate-900/40 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden group">
                
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 z-20"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 z-20"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 z-20"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 z-20"></div>

                <div className="scanline"></div>

                <USAMap 
                    language={lang} 
                    missions={visibleMissions}
                    completedMissionIds={completedMissionIds}
                    onMissionComplete={handleMissionComplete}
                    onMissionSelect={setSelectedMission}
                    onBunkerClick={() => setViewMode('bunker')}
                    factionStates={FACTION_STATES}
                    playerAlignment={playerAlignment}
                />

                <div className="absolute bottom-4 left-4 z-20 text-[10px] md:text-xs text-cyan-600 bg-slate-900/80 p-2 border border-cyan-900 pointer-events-none">
                    <div>{t.map.satellite}</div>
                    <div>{t.map.zoom}</div>
                    <div className="text-red-500">{t.map.scanners}</div>
                </div>
                </div>

            </main>

            {selectedMission && (
                <MissionModal 
                    mission={selectedMission} 
                    isOpen={!!selectedMission} 
                    onClose={() => setSelectedMission(null)}
                    onComplete={handleMissionComplete}
                    onReactivate={handleMissionReactivate}
                    language={lang}
                    isCompleted={completedMissionIds.has(selectedMission.id)}
                />
            )}
        </>
      )}
    </div>
  );
};

export default App;
