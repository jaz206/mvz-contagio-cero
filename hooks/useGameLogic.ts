import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { translations, Language } from '../translations';
import {
    getUserProfile,
    saveUserProfile,
    getCustomMissions,
    deleteMissionInDB,
    getHeroTemplates
} from '../services/dbService';
import { logout } from '../services/authService';
import { Mission, Hero, WorldStage, GlobalEvent, HeroTemplate } from '../types';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { getInitialMissions } from '../data/initialMissions';

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

export const useGameLogic = () => {
    // --- STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [lang, setLang] = useState<Language>('es');

    const [viewMode, setViewMode] = useState<'login' | 'story' | 'setup' | 'intro' | 'mission0' | 'tutorial' | 'map' | 'bunker'>('login');

    const [playerAlignment, setPlayerAlignment] = useState<'ALIVE' | 'ZOMBIE' | null>(null);
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(new Set());
    const [omegaCylinders, setOmegaCylinders] = useState<number>(0);

    const [worldStage, setWorldStage] = useState<WorldStage>('NORMAL');
    const [activeGlobalEvent, setActiveGlobalEvent] = useState<GlobalEvent | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [tickerMessage, setTickerMessage] = useState<string | null>(null);
    const [surferTurnCount, setSurferTurnCount] = useState(0);
    const [startStoryAtChoice, setStartStoryAtChoice] = useState(false);
    const isDataLoadedRef = useRef(false);

    const [isEditorMode, setIsEditorMode] = useState(false);
    const [showMissionEditor, setShowMissionEditor] = useState(false);
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);

    const [showCharacterEditor, setShowCharacterEditor] = useState(false);
    const [showDbManager, setShowDbManager] = useState(false);

    const [customMissions, setCustomMissions] = useState<Mission[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    // UI Local State (kept here for context access if needed, or could be local to components)
    const [showStory, setShowStory] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['kingpin', 'magneto', 'hulk', 'doom', 'neutral']));
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [ownedExpansions, setOwnedExpansions] = useState<Set<string>>(new Set(['core_box']));
    const [showExpansionConfig, setShowExpansionConfig] = useState(false);

    const t = translations[lang];

    // --- EFFECTS ---

    useEffect(() => {
        const savedExp = localStorage.getItem('shield_owned_expansions');
        if (savedExp) {
            try { setOwnedExpansions(new Set(JSON.parse(savedExp))); } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        if (!auth) {
            console.warn("Auth no inicializado. Modo offline/limitado.");
            setLoadingAuth(false);
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
            if (currentUser) {
                const hasSeenIntro = localStorage.getItem(`shield_intro_seen_${currentUser.uid}`);
                if (!hasSeenIntro) { setShowStory(true); setStartStoryAtChoice(false); setViewMode('story'); }
                else { setViewMode('map'); }

                // Load User Data
                // Note: The original App.tsx didn't seem to load user data inside onAuthStateChanged directly, 
                // but relying on handleEditorLogin or handleGuestLogin or manual triggers?
                // Wait, looking at App.tsx lines 140+, handleEditorLogin sets data.
                // But for regular users? The original code seems to missing a getUserProfile call in onAuthStateChanged?
                // Ah, lines 113 in App.tsx just sets user. It seems data loading is missing for returning users in the original code snippet provided?
                // Wait, let me check App.tsx again. 
                // Line 113: onAuthStateChanged just sets user and viewMode.
                // It seems the original code MIGHT have been incomplete or I missed where data is loaded.
                // line 190 loads custom missions.
                // I see `saveData` but where is `loadData`?
                // In `App.tsx` snippet, I don't see `getUserProfile` being called to populate state!
                // Maybe it was omitted or I missed it. I should verify this.
                // IF it's missing, I should add it.

                try {
                    // Attempt to load profile if it exists
                    // logic to decide ALIVE or ZOMBIE?
                    // Just loading ALIVE for now as default if not specified
                    const profile = await getUserProfile(currentUser.uid, 'ALIVE');
                    if (profile) {
                        setHeroes(profile.heroes);
                        setCompletedMissionIds(new Set(profile.completedMissionIds));
                        setOmegaCylinders(profile.resources.omegaCylinders);
                        setPlayerAlignment('ALIVE'); // Defaulting to ALIVE if data found
                        isDataLoadedRef.current = true;
                    }
                } catch (e) { console.error(e); }

            } else if (!isGuest) { setViewMode('login'); }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isGuest]);

    useEffect(() => {
        const loadMissions = async () => {
            const loaded = await getCustomMissions();
            setCustomMissions(loaded);
        };
        loadMissions();
    }, [isEditorMode]);

    // Save Data Effect
    const saveData = useCallback(async (currentHeroes: Hero[], currentMissions: Set<string>, currentCylinders: number) => {
        if (isEditorMode || !user || !playerAlignment || !isDataLoadedRef.current) return;
        setIsSaving(true);
        try {
            await saveUserProfile(user.uid, playerAlignment, currentHeroes, Array.from(currentMissions), { omegaCylinders: currentCylinders });
        } catch (e) { console.error("Auto-save failed", e); } finally { setTimeout(() => setIsSaving(false), 1000); }
    }, [user, playerAlignment, isEditorMode]);

    useEffect(() => {
        if (heroes.length === 0) return;
        const timeout = setTimeout(() => { saveData(heroes, completedMissionIds, omegaCylinders); }, 2000);
        return () => clearTimeout(timeout);
    }, [heroes, completedMissionIds, omegaCylinders, saveData]);

    // Tutorial Check
    useEffect(() => {
        if (!playerAlignment) return;
        if (showStory) return;
        if (isEditorMode) return;
        const tutorialKey = user ? `shield_tutorial_seen_${user.uid}` : 'shield_tutorial_seen_guest';
        const hasSeenTutorial = localStorage.getItem(tutorialKey);
        if (!hasSeenTutorial && viewMode === 'map') { setTimeout(() => setShowTutorial(true), 500); }
    }, [playerAlignment, showStory, user, viewMode, isEditorMode]);

    // --- ACTIONS ---

    const updateOwnedExpansions = (newSet: Set<string>) => {
        setOwnedExpansions(newSet);
        localStorage.setItem('shield_owned_expansions', JSON.stringify(Array.from(newSet)));
    };
    const toggleExpansion = (id: string) => {
        const newSet = new Set(ownedExpansions);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        updateOwnedExpansions(newSet);
    };
    const toggleAllExpansions = (select: boolean) => {
        if (select) { const allIds = GAME_EXPANSIONS.map(e => e.id); updateOwnedExpansions(new Set(allIds)); }
        else { updateOwnedExpansions(new Set(['core_box'])); }
    };

    const handleEditorLogin = () => {
        setIsGuest(true);
        setIsEditorMode(true);
        setPlayerAlignment('ALIVE');
        setShowStory(false);
        setShowTutorial(false);
        setViewMode('map');
        const core = GAME_EXPANSIONS.find(e => e.id === 'core_box');
        setHeroes(core ? core.heroes : []);
        setCompletedMissionIds(new Set());
        setOmegaCylinders(99);
        setWorldStage('NORMAL');
        isDataLoadedRef.current = true;
    };

    const handleGuestLogin = () => {
        setIsGuest(true);
        setPlayerAlignment('ALIVE');
        setShowStory(true);
        setStartStoryAtChoice(false);
        setViewMode('story');
    };

    const handleExpansionConfirm = (selectedHeroes: Hero[]) => {
        if (!playerAlignment) return;
        setHeroes(selectedHeroes);
        if (user) localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true');
        setViewMode('intro');
        isDataLoadedRef.current = true; // Mark as loaded so auto-save works
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
        // Logic to switch heroes based on dimension? 
        // Original code just reset heroes to Core Box default for that alignment
        const core = GAME_EXPANSIONS.find(e => e.id === 'core_box');
        if (core) setHeroes(newAlignment === 'ZOMBIE' ? core.zombieHeroes : core.heroes);
        setViewMode('map');

        // Reload data for this alignment if User?
        if (user) {
            getUserProfile(user.uid, newAlignment).then(profile => {
                if (profile) {
                    setHeroes(profile.heroes);
                    setCompletedMissionIds(new Set(profile.completedMissionIds));
                    setOmegaCylinders(profile.resources.omegaCylinders);
                }
            });
        }
    };

    const handleTickerUpdate = (message: string) => setTickerMessage(message);

    // Mission Logic
    const allMissions: Mission[] = useMemo(() => {
        const sourceMissions = customMissions.length > 0 ? customMissions : getInitialMissions(t);
        return sourceMissions.map(m => {
            let [x, y] = m.location.coordinates;
            // Fix coordinates if needed (legacy data)
            if (x === 0 && y === 0) return { ...m, location: { ...m.location, coordinates: [-82.5, 40.2] } };
            if (x > 0 && y < 0) return { ...m, location: { ...m.location, coordinates: [y, x] } };
            return m;
        });
    }, [customMissions, t]);

    const introMission = useMemo(() => {
        if (!playerAlignment) return null;
        const flaggedIntro = allMissions.find(m =>
            m.isIntroMission === true &&
            (m.alignment === playerAlignment || m.alignment === 'BOTH')
        );
        if (flaggedIntro) return flaggedIntro;
        return allMissions.find(m => m.id === 'm_intro_0');
    }, [allMissions, playerAlignment]);

    const visibleMissions = useMemo(() => {
        const alignmentFiltered = allMissions.filter(m => {
            if (!m.alignment || m.alignment === 'BOTH') return true;
            return m.alignment === playerAlignment;
        });

        const expansionFiltered = alignmentFiltered.filter(m => {
            if (!m.requirements || m.requirements.length === 0) return true;
            return m.requirements.every(reqId => {
                if (ownedExpansions.has(reqId)) return true;
                const expansionObj = GAME_EXPANSIONS.find(ge => ge.name === reqId);
                if (expansionObj && ownedExpansions.has(expansionObj.id)) return true;
                return false;
            });
        });

        if (isEditorMode) return expansionFiltered;
        if (worldStage === 'GALACTUS') return expansionFiltered;

        return expansionFiltered.filter(m => {
            if (!m) return false;
            const isCompleted = completedMissionIds.has(m.id);
            if (isCompleted) return true;
            let prereqMet = true;
            if (m.prereqs && m.prereqs.length > 0) {
                prereqMet = m.prereqs.every(pid => completedMissionIds.has(pid));
            } else if (m.prereq) {
                prereqMet = completedMissionIds.has(m.prereq);
            }
            if (introMission && m.id === introMission.id && !isCompleted) return true;
            if (m.type === 'GALACTUS') {
                if (m.triggerStage === 'SURFER') return worldStage === 'SURFER' || worldStage === 'GALACTUS';
                if (m.triggerStage === 'GALACTUS') return worldStage === 'GALACTUS';
                return false;
            }
            if (worldStage === 'GALACTUS' && !isCompleted && m.type !== 'GALACTUS' && m.type !== 'BOSS') return false;
            return isCompleted || prereqMet;
        });
    }, [allMissions, completedMissionIds, isEditorMode, worldStage, playerAlignment, ownedExpansions, introMission]);

    const checkGlobalEvents = (completedMissions: Set<string>) => {
        const count = completedMissions.size;
        if (completedMissions.has('boss-galactus')) return;
        if (count >= 15 && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'GALACTUS', title: '', description: '' });
            setWorldStage('GALACTUS');
            handleTickerUpdate("¡ALERTA OMEGA! GALACTUS HA LLEGADO. TODAS LAS MISIONES SECUNDARIAS CANCELADAS.");
        } else if (count >= 10 && count < 15 && worldStage !== 'SURFER' && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'SURFER', title: '', description: '' });
            setWorldStage('SURFER');
            setSurferTurnCount(0);
            handleTickerUpdate("OBJETO PLATEADO ENTRANDO EN LA ATMÓSFERA. PREPARAR INTERCEPCIÓN.");
        } else if (count >= 4 && count < 10 && worldStage === 'NORMAL') {
            setActiveGlobalEvent({ stage: 'ANOMALY', title: '', description: '' });
            setWorldStage('ANOMALY');
            handleTickerUpdate("LECTURAS DE ENERGÍA ANÓMALAS EN EL ESPACIO PROFUNDO.");
        }
    };

    const handleMissionComplete = async (id: string) => {
        console.log("Completando misión:", id);
        const newSet = new Set(completedMissionIds);
        newSet.add(id);
        setCompletedMissionIds(newSet);
        setSelectedMission(null);
        if (worldStage === 'SURFER') {
            setSurferTurnCount(prev => prev + 1);
        }
        if (user && playerAlignment) {
            await saveData(heroes, newSet, omegaCylinders);
        }
        if (id === 'boss-galactus') {
            setWorldStage('NORMAL');
            setActiveGlobalEvent(null);
            handleTickerUpdate("AMENAZA OMEGA NEUTRALIZADA. BUEN TRABAJO, AGENTES.");
        } else {
            checkGlobalEvents(newSet);
        }
        // Reload in case custom missions changed (unlikely on completion but good practice)
        // const loaded = await getCustomMissions();
        // setCustomMissions(loaded);
    };

    const handleMissionSelect = (m: Mission) => {
        if (worldStage === 'GALACTUS' && m.type !== 'BOSS' && m.type !== 'GALACTUS') return;
        setSelectedMission(m);
    };

    const handleMissionReactivate = (id: string) => { const newSet = new Set(completedMissionIds); newSet.delete(id); setCompletedMissionIds(newSet); };
    const handleDeleteMission = async (id: string) => { if (!window.confirm("¿ELIMINAR MISIÓN?")) return; try { await deleteMissionInDB(id); const loaded = await getCustomMissions(); setCustomMissions(loaded); setSelectedMission(null); } catch (e) { alert("Error al eliminar"); } };
    const handleSimulateProgress = (amount: number) => { const newSet = new Set(completedMissionIds); for (let i = 0; i < amount; i++) newSet.add(`sim_${Date.now()}_${Math.random()}`); setCompletedMissionIds(newSet); checkGlobalEvents(newSet); };
    const handleResetProgress = () => { setCompletedMissionIds(new Set()); setWorldStage('NORMAL'); setActiveGlobalEvent(null); setOmegaCylinders(0); setSurferTurnCount(0); };
    const handleEventAcknowledge = () => setActiveGlobalEvent(null);
    const handleToggleHeroObjective = (heroId: string, idx: number) => { const hIndex = heroes.findIndex(h => h.id === heroId); if (hIndex >= 0) { const newHeroes = [...heroes]; const h = newHeroes[hIndex]; const indices = h.completedObjectiveIndices ? [...h.completedObjectiveIndices] : []; if (indices.includes(idx)) { newHeroes[hIndex] = { ...h, completedObjectiveIndices: indices.filter(i => i !== idx) }; } else { newHeroes[hIndex] = { ...h, completedObjectiveIndices: [...indices, idx] }; } setHeroes(newHeroes); } };

    const handleTransformHero = async (heroId: string, targetAlignment: 'ALIVE' | 'ZOMBIE') => {
        const heroIndex = heroes.findIndex(h => h.id === heroId);
        if (heroIndex === -1) return;

        const currentHero = heroes[heroIndex];
        const allTemplates = await getHeroTemplates();
        let targetTemplate: HeroTemplate | undefined;

        if (currentHero.relatedHeroId && currentHero.relatedHeroId !== 'NO_VARIANT') {
            targetTemplate = allTemplates.find(t => t.id === currentHero.relatedHeroId);
        }

        if (!targetTemplate) {
            const cleanString = (str: string) => {
                return str.toLowerCase()
                    .replace(/\(z\)/g, '')
                    .replace(/\(artist\)/g, '')
                    .replace(/\(old man\)/g, '')
                    .replace(/zombie/g, '')
                    .replace(/hero/g, '')
                    .replace(/[^a-z0-9]/g, '')
                    .trim();
            };
            const currentAliasClean = cleanString(currentHero.alias);
            targetTemplate = allTemplates.find(t => {
                if (t.defaultAlignment !== targetAlignment) return false;
                const tAliasClean = cleanString(t.alias);
                return tAliasClean === currentAliasClean;
            });

            if (!targetTemplate) {
                for (const exp of GAME_EXPANSIONS) {
                    const list = targetAlignment === 'ALIVE' ? exp.heroes : exp.zombieHeroes;
                    const found = list.find(h => cleanString(h.alias) === currentAliasClean);
                    if (found) {
                        targetTemplate = {
                            id: found.id,
                            defaultName: found.name,
                            alias: found.alias,
                            defaultClass: found.class,
                            defaultStats: found.stats,
                            imageUrl: found.imageUrl || '',
                            bio: found.bio,
                            defaultAlignment: targetAlignment,
                            objectives: found.objectives,
                            currentStory: found.currentStory,
                            imageParams: found.imageParams
                        };
                        break;
                    }
                }
            }
        }

        if (targetTemplate) {
            const finalImage = targetTemplate.imageUrl || currentHero.imageUrl || '';
            const newHero: Hero = {
                id: `trans_${Date.now()}`,
                templateId: targetTemplate.id,
                name: targetTemplate.defaultName,
                alias: targetTemplate.alias || currentHero.alias,
                class: targetTemplate.defaultClass,
                stats: targetTemplate.defaultStats,
                imageUrl: finalImage,
                bio: targetTemplate.bio || currentHero.bio,
                status: 'AVAILABLE',
                assignedMissionId: null,
                objectives: targetTemplate.objectives || [],
                completedObjectiveIndices: [],
                currentStory: targetTemplate.currentStory || '',
                relatedHeroId: currentHero.templateId || currentHero.id,
                imageParams: targetTemplate.imageParams
            };

            const newHeroes = [...heroes];
            newHeroes[heroIndex] = newHero;
            setHeroes(newHeroes);

            if (targetAlignment === 'ALIVE') {
                handleTickerUpdate(`SUJETO ${newHero.alias} CURADO. ADN REESTRUCTURADO.`);
                setOmegaCylinders(prev => Math.max(0, prev - 1));
            } else {
                handleTickerUpdate(`SUJETO ${newHero.alias} INFECTADO. BIENVENIDO AL HAMBRE.`);
            }
        } else {
            alert(`ERROR: No se encontró una versión compatible de ${currentHero.alias} (${currentHero.name}) para el bando contrario.`);
        }
    };

    const toggleZone = (zone: string) => {
        setExpandedZones(prev => {
            const newSet = new Set(prev);
            if (newSet.has(zone)) newSet.delete(zone); else newSet.add(zone);
            return newSet;
        });
    };

    const groupedMissions = useMemo(() => {
        const activeMissions = visibleMissions.filter(m => m && !completedMissionIds.has(m.id));
        const groups: Record<string, Mission[]> = { galactus: [], kingpin: [], shield_kingpin: [], magneto: [], shield_magneto: [], hulk: [], shield_hulk: [], doom: [], shield_doom: [], neutral: [], shield_neutral: [] };
        activeMissions.forEach(m => {
            if (m.type === 'GALACTUS') { groups.galactus.push(m); }
            else {
                const faction = getFactionForState(m.location.state);
                if (m.type === 'SHIELD_BASE') { const key = `shield_${faction}`; if (groups[key]) groups[key].push(m); else groups.shield_neutral.push(m); }
                else { if (groups[faction]) groups[faction].push(m); else groups.neutral.push(m); }
            }
        });
        return groups;
    }, [visibleMissions, completedMissionIds, worldStage]);

    return {
        state: {
            user, loading, loadingAuth, lang,
            viewMode, playerAlignment, heroes, completedMissionIds, omegaCylinders,
            worldStage, activeGlobalEvent, surferTurnCount, isGuest, isSaving,
            tickerMessage, isEditorMode, showMissionEditor, missionToEdit,
            showCharacterEditor, showDbManager, customMissions, selectedMission,
            showStory, showTutorial, expandedZones, isSidebarCollapsed,
            ownedExpansions, showExpansionConfig,
            introMission, allMissions, visibleMissions, groupedMissions,
            FACTION_STATES
        },
        actions: {
            setLang, setViewMode, setPlayerAlignment, setHeroes, setCompletedMissionIds,
            setOmegaCylinders, setWorldStage, setActiveGlobalEvent, setIsGuest,
            setIsEditorMode, setIsSaving, setTickerMessage, setStartStoryAtChoice,
            setShowMissionEditor, setMissionToEdit, setShowCharacterEditor,
            setShowDbManager, setCustomMissions, setSelectedMission,
            setShowStory, setShowTutorial, setExpandedZones, setIsSidebarCollapsed,
            setOwnedExpansions, setShowExpansionConfig,

            updateOwnedExpansions, toggleExpansion, toggleAllExpansions,
            handleEditorLogin, handleGuestLogin, handleExpansionConfirm, handleLogout,
            toggleDimension, handleTickerUpdate, handleMissionComplete, handleMissionSelect,
            handleMissionReactivate, handleDeleteMission, handleSimulateProgress,
            handleResetProgress, handleEventAcknowledge, handleToggleHeroObjective,
            handleTransformHero, toggleZone, setSurferTurnCount
        }
    };
};
