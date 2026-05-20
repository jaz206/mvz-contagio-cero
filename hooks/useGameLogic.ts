import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { translations, Language } from '../translations';
import { getHeroTemplates } from '../services/heroService';
import { getCustomMissions, deleteMissionInDB } from '../services/missionService';
import { getUserProfile, saveUserProfile } from '../services/userService';
import { logout, signInEditor } from '../services/authService';
import { ensureAdminStaffAccount, getStaffAccount } from '../services/staffService';
import { Mission, Hero, WorldStage, GlobalEvent, HeroTemplate, StaffAccount, StaffPermissions } from '../types';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { getInitialMissions } from '../data/initialMissions';

const FACTION_STATES = {
    magneto: new Set(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii']),
    kingpin: new Set(['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia']),
    hulk: new Set(['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio']),
    doom: new Set(['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'])
};

const ADMIN_UID = (import.meta as any).env.VITE_ADMIN_UID || '60mH4M1SClV793Nq1WjQ3CExkLp1';
const ADMIN_EMAIL = ((import.meta as any).env.VITE_ADMIN_EMAIL || 'jorgeaz206@gmail.com').toLowerCase();

const EMPTY_PERMISSIONS: StaffPermissions = {
    missions: { view: false, create: false, edit: false, delete: false },
    characters: { view: false, create: false, edit: false, delete: false }
};

const getFactionForState = (state: string) => {
    if (FACTION_STATES.magneto.has(state)) return 'magneto';
    if (FACTION_STATES.kingpin.has(state)) return 'kingpin';
    if (FACTION_STATES.hulk.has(state)) return 'hulk';
    if (FACTION_STATES.doom.has(state)) return 'doom';
    return 'neutral';
};

const getStoredAlignment = (uid: string): 'ALIVE' | 'ZOMBIE' | null => {
    const saved = localStorage.getItem(`shield_alignment_${uid}`);
    return saved === 'ALIVE' || saved === 'ZOMBIE' ? saved : null;
};

const saveStoredAlignment = (uid: string, alignment: 'ALIVE' | 'ZOMBIE') => {
    localStorage.setItem(`shield_alignment_${uid}`, alignment);
};

export const useGameLogic = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [lang, setLang] = useState<Language>('es');

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
    const [isFullAdmin, setIsFullAdmin] = useState(false);
    const [staffAccount, setStaffAccount] = useState<StaffAccount | null>(null);
    const [staffPermissions, setStaffPermissions] = useState<StaffPermissions>(EMPTY_PERMISSIONS);

    const [showMissionEditor, setShowMissionEditor] = useState(false);
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
    const [showCharacterEditor, setShowCharacterEditor] = useState(false);
    const [showDbManager, setShowDbManager] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    const [customMissions, setCustomMissions] = useState<Mission[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    const [showStory, setShowStory] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['kingpin', 'magneto', 'hulk', 'doom', 'neutral']));
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [ownedExpansions, setOwnedExpansions] = useState<Set<string>>(new Set(['core_box']));
    const [showExpansionConfig, setShowExpansionConfig] = useState(false);

    const t = translations[lang];

    useEffect(() => {
        const savedExpansions = localStorage.getItem('shield_owned_expansions');
        if (!savedExpansions) return;

        try {
            setOwnedExpansions(new Set(JSON.parse(savedExpansions)));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (!auth) {
            console.warn('Auth no inicializado. Modo offline/limitado.');
            setLoadingAuth(false);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);

            if (!currentUser) {
                setStaffAccount(null);
                setStaffPermissions(EMPTY_PERMISSIONS);
                setIsEditorMode(false);
                setIsFullAdmin(false);
                if (!isGuest) {
                    navigate('/');
                }
                setLoading(false);
                return;
            }

            const coreExpansion = GAME_EXPANSIONS.find((item) => item.id === 'core_box');
            const coreHeroes = coreExpansion ? coreExpansion.heroes : [];

            const currentEmail = (currentUser.email || '').toLowerCase();
            const isAdminUser = currentUser.uid === ADMIN_UID || currentEmail === ADMIN_EMAIL;

            if (isAdminUser) {
                const adminAccount = await ensureAdminStaffAccount(
                    currentUser.uid,
                    currentUser.email || '',
                    currentUser.displayName || undefined
                );

                setStaffAccount(adminAccount);
                setStaffPermissions(adminAccount.permissions);
                setIsEditorMode(true);
                setIsFullAdmin(true);
                setIsGuest(false);
                setPlayerAlignment('ALIVE');
                setShowStory(false);
                setShowTutorial(false);
                setHeroes(coreHeroes);
                setCompletedMissionIds(new Set());
                setOmegaCylinders(99);
                setWorldStage('NORMAL');
                isDataLoadedRef.current = true;
                navigate('/map');
                setLoading(false);
                return;
            }

            const linkedStaffAccount = await getStaffAccount(currentUser.uid);
            if (linkedStaffAccount) {
                if (!linkedStaffAccount.isActive) {
                    await logout();
                    setLoading(false);
                    return;
                }

                setStaffAccount(linkedStaffAccount);
                setStaffPermissions(linkedStaffAccount.permissions);
                setIsEditorMode(true);
                setIsFullAdmin(linkedStaffAccount.role === 'admin');
                setIsGuest(false);
                setPlayerAlignment('ALIVE');
                setShowStory(false);
                setShowTutorial(false);
                setHeroes(coreHeroes);
                setCompletedMissionIds(new Set());
                setOmegaCylinders(99);
                setWorldStage('NORMAL');
                isDataLoadedRef.current = true;
                navigate('/map');
                setLoading(false);
                return;
            }

            setStaffAccount(null);
            setStaffPermissions(EMPTY_PERMISSIONS);
            setIsEditorMode(false);
            setIsFullAdmin(false);

            try {
                const hasSeenIntro = !!localStorage.getItem(`shield_intro_seen_${currentUser.uid}`);
                const storedAlignment = getStoredAlignment(currentUser.uid);
                const [aliveProfile, zombieProfile] = await Promise.all([
                    getUserProfile(currentUser.uid, 'ALIVE'),
                    getUserProfile(currentUser.uid, 'ZOMBIE')
                ]);

                const resolvedAlignment = storedAlignment
                    || (aliveProfile && !zombieProfile ? 'ALIVE' : null)
                    || (!aliveProfile && zombieProfile ? 'ZOMBIE' : null)
                    || (aliveProfile ? 'ALIVE' : null)
                    || (zombieProfile ? 'ZOMBIE' : null);

                const resolvedProfile = resolvedAlignment === 'ZOMBIE' ? zombieProfile : aliveProfile;

                if (resolvedAlignment && resolvedProfile) {
                    setPlayerAlignment(resolvedAlignment);
                    setHeroes(resolvedProfile.heroes);
                    setCompletedMissionIds(new Set(resolvedProfile.completedMissionIds));
                    setOmegaCylinders(resolvedProfile.resources.omegaCylinders);
                    setShowStory(false);
                    setShowTutorial(false);
                    saveStoredAlignment(currentUser.uid, resolvedAlignment);
                    isDataLoadedRef.current = true;
                    navigate('/map');
                } else if (!hasSeenIntro) {
                    setShowStory(true);
                    setStartStoryAtChoice(false);
                    navigate('/story');
                } else if (resolvedAlignment) {
                    setPlayerAlignment(resolvedAlignment);
                    setHeroes(resolvedAlignment === 'ZOMBIE' ? coreExpansion?.zombieHeroes || [] : coreHeroes);
                    setShowStory(false);
                    setStartStoryAtChoice(false);
                    navigate('/setup');
                } else {
                    setShowStory(true);
                    setStartStoryAtChoice(true);
                    navigate('/story');
                }
            } catch (error) {
                console.error(error);
                setShowStory(true);
                setStartStoryAtChoice(false);
                navigate('/story');
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [isGuest, navigate]);

    useEffect(() => {
        const loadMissions = async () => {
            const loaded = await getCustomMissions();
            setCustomMissions(loaded);
        };

        loadMissions();
    }, [isEditorMode]);

    const saveData = useCallback(async (currentHeroes: Hero[], currentMissions: Set<string>, currentCylinders: number) => {
        if (isEditorMode || !user || !playerAlignment || !isDataLoadedRef.current) return;

        setIsSaving(true);
        try {
            await saveUserProfile(user.uid, playerAlignment, currentHeroes, Array.from(currentMissions), { omegaCylinders: currentCylinders });
        } catch (error) {
            console.error('Auto-save failed', error);
        } finally {
            setTimeout(() => setIsSaving(false), 1000);
        }
    }, [user, playerAlignment, isEditorMode]);

    useEffect(() => {
        if (heroes.length === 0) return;
        const timeout = setTimeout(() => {
            saveData(heroes, completedMissionIds, omegaCylinders);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [heroes, completedMissionIds, omegaCylinders, saveData]);

    useEffect(() => {
        if (!playerAlignment || showStory || isEditorMode) return;
        const tutorialKey = user ? `shield_tutorial_seen_${user.uid}` : 'shield_tutorial_seen_guest';
        localStorage.getItem(tutorialKey);
    }, [playerAlignment, showStory, user, isEditorMode]);

    const updateOwnedExpansions = (newSet: Set<string>) => {
        setOwnedExpansions(newSet);
        localStorage.setItem('shield_owned_expansions', JSON.stringify(Array.from(newSet)));
    };

    const toggleExpansion = (id: string) => {
        const nextSet = new Set(ownedExpansions);
        if (nextSet.has(id)) nextSet.delete(id);
        else nextSet.add(id);
        updateOwnedExpansions(nextSet);
    };

    const toggleAllExpansions = (select: boolean) => {
        if (select) {
            updateOwnedExpansions(new Set(GAME_EXPANSIONS.map((item) => item.id)));
        } else {
            updateOwnedExpansions(new Set(['core_box']));
        }
    };

    const handleEditorLogin = async (email: string, password: string) => {
        await signInEditor(email, password);
    };

    const handleGuestLogin = () => {
        setIsGuest(true);
        setPlayerAlignment('ALIVE');
        setShowStory(true);
        setStartStoryAtChoice(false);
        navigate('/story');
    };

    const handleExpansionConfirm = (selectedHeroes: Hero[]) => {
        if (!playerAlignment) return;
        setHeroes(selectedHeroes);
        if (user) {
            localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true');
            saveStoredAlignment(user.uid, playerAlignment);
        }
        navigate('/intro');
        isDataLoadedRef.current = true;
    };

    const handleLogout = async () => {
        if (auth) {
            await logout();
        }
        setIsGuest(false);
        setIsEditorMode(false);
        setIsFullAdmin(false);
        setStaffAccount(null);
        setStaffPermissions(EMPTY_PERMISSIONS);
        setShowAdminPanel(false);
        isDataLoadedRef.current = false;
        setPlayerAlignment(null);
        navigate('/');
    };

    const toggleDimension = () => {
        const newAlignment = playerAlignment === 'ALIVE' ? 'ZOMBIE' : 'ALIVE';
        setPlayerAlignment(newAlignment);
        if (user) {
            saveStoredAlignment(user.uid, newAlignment);
        }

        const core = GAME_EXPANSIONS.find((item) => item.id === 'core_box');
        if (core) {
            setHeroes(newAlignment === 'ZOMBIE' ? core.zombieHeroes : core.heroes);
        }
        navigate('/map');

        if (user) {
            getUserProfile(user.uid, newAlignment).then((profile) => {
                if (!profile) return;
                setHeroes(profile.heroes);
                setCompletedMissionIds(new Set(profile.completedMissionIds));
                setOmegaCylinders(profile.resources.omegaCylinders);
            });
        }
    };

    const handleTickerUpdate = (message: string) => setTickerMessage(message);

    const allMissions: Mission[] = useMemo(() => {
        const sourceMissions = customMissions.length > 0 ? customMissions : getInitialMissions(t);
        return sourceMissions.map((mission) => {
            const [x, y] = mission.location.coordinates;
            if (x === 0 && y === 0) {
                return { ...mission, location: { ...mission.location, coordinates: [-82.5, 40.2] } };
            }
            if (x > 0 && y < 0) {
                return { ...mission, location: { ...mission.location, coordinates: [y, x] } };
            }
            return mission;
        });
    }, [customMissions, t]);

    const introMission = useMemo(() => {
        if (!playerAlignment) return null;

        const flaggedIntro = allMissions.find((mission) =>
            mission.isIntroMission === true &&
            (mission.alignment === playerAlignment || mission.alignment === 'BOTH')
        );

        if (flaggedIntro) return flaggedIntro;
        return allMissions.find((mission) => mission.id === 'm_intro_0') || null;
    }, [allMissions, playerAlignment]);

    const visibleMissions = useMemo(() => {
        const alignmentFiltered = allMissions.filter((mission) => {
            if (!mission.alignment || mission.alignment === 'BOTH') return true;
            return mission.alignment === playerAlignment;
        });

        const expansionFiltered = alignmentFiltered.filter((mission) => {
            if (!mission.requirements || mission.requirements.length === 0) return true;
            return mission.requirements.every((requirementId) => {
                if (ownedExpansions.has(requirementId)) return true;
                const expansionObj = GAME_EXPANSIONS.find((item) => item.name === requirementId);
                return !!(expansionObj && ownedExpansions.has(expansionObj.id));
            });
        });

        if (isEditorMode) return expansionFiltered;

        return expansionFiltered.filter((mission) => {
            const isCompleted = completedMissionIds.has(mission.id);
            if (isCompleted) return true;

            let prereqMet = true;
            if (mission.prereqs && mission.prereqs.length > 0) {
                prereqMet = mission.prereqs.every((item) => completedMissionIds.has(item));
            } else if (mission.prereq) {
                prereqMet = completedMissionIds.has(mission.prereq);
            }

            if (introMission && mission.id === introMission.id && !isCompleted) return true;

            const isGalactusType = mission.type === 'GALACTUS';
            const isBossType = mission.type === 'BOSS' || (mission.type && mission.type.startsWith('BOSS_'));

            if (isGalactusType) {
                if (mission.triggerStage === 'SURFER') {
                    return worldStage === 'SURFER' || worldStage === 'GALACTUS';
                }
                if (mission.triggerStage === 'GALACTUS') {
                    return worldStage === 'GALACTUS';
                }
                return false;
            }

            if (worldStage === 'GALACTUS') {
                return isCompleted || !!isBossType;
            }

            return isCompleted || prereqMet;
        });
    }, [allMissions, completedMissionIds, isEditorMode, worldStage, playerAlignment, ownedExpansions, introMission]);

    const checkGlobalEvents = (missionSet: Set<string>) => {
        const count = missionSet.size;
        if (missionSet.has('boss-galactus')) return;

        if (count >= 15 && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'GALACTUS', title: '', description: '' });
            setWorldStage('GALACTUS');
            handleTickerUpdate('ALERTA OMEGA. GALACTUS HA LLEGADO.');
        } else if (count >= 10 && count < 15 && worldStage !== 'SURFER' && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'SURFER', title: '', description: '' });
            setWorldStage('SURFER');
            setSurferTurnCount(0);
            handleTickerUpdate('OBJETO PLATEADO ENTRANDO EN LA ATMOSFERA.');
        } else if (count >= 4 && count < 10 && worldStage === 'NORMAL') {
            setActiveGlobalEvent({ stage: 'ANOMALY', title: '', description: '' });
            setWorldStage('ANOMALY');
            handleTickerUpdate('LECTURAS DE ENERGIA ANOMALAS EN EL ESPACIO PROFUNDO.');
        }
    };

    const handleMissionComplete = async (id: string) => {
        const nextSet = new Set(completedMissionIds);
        nextSet.add(id);
        setCompletedMissionIds(nextSet);
        setSelectedMission(null);

        if (worldStage === 'SURFER') {
            setSurferTurnCount((prev) => prev + 1);
        }

        if (user && playerAlignment) {
            await saveData(heroes, nextSet, omegaCylinders);
        }

        if (id === 'boss-galactus') {
            setWorldStage('NORMAL');
            setActiveGlobalEvent(null);
            handleTickerUpdate('AMENAZA OMEGA NEUTRALIZADA.');
        } else {
            checkGlobalEvents(nextSet);
        }
    };

    const handleMissionSelect = (mission: Mission) => {
        if (worldStage === 'GALACTUS' && mission.type !== 'BOSS' && mission.type !== 'GALACTUS') return;
        setSelectedMission(mission);
    };

    const handleMissionReactivate = (id: string) => {
        const nextSet = new Set(completedMissionIds);
        nextSet.delete(id);
        setCompletedMissionIds(nextSet);
    };

    const handleDeleteMission = async (id: string) => {
        if (!staffPermissions.missions.delete) {
            alert('Tu cuenta no puede borrar misiones.');
            return;
        }

        if (!window.confirm('Eliminar mision?')) return;

        try {
            await deleteMissionInDB(id);
            const loaded = await getCustomMissions();
            setCustomMissions(loaded);
            setSelectedMission(null);
        } catch (error) {
            alert('Error al eliminar.');
        }
    };

    const handleSimulateProgress = (amount: number) => {
        const nextSet = new Set(completedMissionIds);
        for (let index = 0; index < amount; index += 1) {
            nextSet.add(`sim_${Date.now()}_${Math.random()}`);
        }
        setCompletedMissionIds(nextSet);
        checkGlobalEvents(nextSet);
    };

    const handleResetProgress = () => {
        setCompletedMissionIds(new Set());
        setWorldStage('NORMAL');
        setActiveGlobalEvent(null);
        setOmegaCylinders(0);
        setSurferTurnCount(0);
    };

    const handleEventAcknowledge = () => setActiveGlobalEvent(null);

    const handleToggleHeroObjective = (heroId: string, index: number) => {
        const heroIndex = heroes.findIndex((hero) => hero.id === heroId);
        if (heroIndex < 0) return;

        const nextHeroes = [...heroes];
        const hero = nextHeroes[heroIndex];
        const indices = hero.completedObjectiveIndices ? [...hero.completedObjectiveIndices] : [];

        nextHeroes[heroIndex] = {
            ...hero,
            completedObjectiveIndices: indices.includes(index)
                ? indices.filter((item) => item !== index)
                : [...indices, index]
        };

        setHeroes(nextHeroes);
    };

    const handleTransformHero = async (heroId: string, targetAlignment: 'ALIVE' | 'ZOMBIE') => {
        const heroIndex = heroes.findIndex((hero) => hero.id === heroId);
        if (heroIndex === -1) return;

        const currentHero = heroes[heroIndex];
        const allTemplates = await getHeroTemplates();
        let targetTemplate: HeroTemplate | undefined;

        if (currentHero.relatedHeroId && currentHero.relatedHeroId !== 'NO_VARIANT') {
            targetTemplate = allTemplates.find((item) => item.id === currentHero.relatedHeroId);
        }

        if (!targetTemplate) {
            const cleanString = (value: string) => value.toLowerCase()
                .replace(/\(z\)/g, '')
                .replace(/\(artist\)/g, '')
                .replace(/\(old man\)/g, '')
                .replace(/zombie/g, '')
                .replace(/hero/g, '')
                .replace(/[^a-z0-9]/g, '')
                .trim();

            const currentAliasClean = cleanString(currentHero.alias);

            targetTemplate = allTemplates.find((item) => {
                if (item.defaultAlignment !== targetAlignment) return false;
                return cleanString(item.alias) === currentAliasClean;
            });

            if (!targetTemplate) {
                for (const expansion of GAME_EXPANSIONS) {
                    const list = targetAlignment === 'ALIVE' ? expansion.heroes : expansion.zombieHeroes;
                    const found = list.find((item) => cleanString(item.alias) === currentAliasClean);
                    if (!found) continue;

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

        if (!targetTemplate) {
            alert(`No se encontro una version compatible de ${currentHero.alias}.`);
            return;
        }

        const transformedHero: Hero = {
            id: `trans_${Date.now()}`,
            templateId: targetTemplate.id,
            name: targetTemplate.defaultName,
            alias: targetTemplate.alias || currentHero.alias,
            class: targetTemplate.defaultClass,
            stats: targetTemplate.defaultStats,
            imageUrl: targetTemplate.imageUrl || currentHero.imageUrl || '',
            bio: targetTemplate.bio || currentHero.bio,
            status: 'AVAILABLE',
            assignedMissionId: null,
            objectives: targetTemplate.objectives || [],
            completedObjectiveIndices: [],
            currentStory: targetTemplate.currentStory || '',
            relatedHeroId: currentHero.templateId || currentHero.id,
            imageParams: targetTemplate.imageParams
        };

        const nextHeroes = [...heroes];
        nextHeroes[heroIndex] = transformedHero;
        setHeroes(nextHeroes);

        if (targetAlignment === 'ALIVE') {
            handleTickerUpdate(`SUJETO ${transformedHero.alias} CURADO.`);
            setOmegaCylinders((prev) => Math.max(0, prev - 1));
        } else {
            handleTickerUpdate(`SUJETO ${transformedHero.alias} INFECTADO.`);
        }
    };

    const toggleZone = (zone: string) => {
        setExpandedZones((prev) => {
            const next = new Set(prev);
            if (next.has(zone)) next.delete(zone);
            else next.add(zone);
            return next;
        });
    };

    const groupedMissions = useMemo(() => {
        const activeMissions = visibleMissions.filter((mission) => !completedMissionIds.has(mission.id));
        const groups: Record<string, Mission[]> = {
            galactus: [],
            kingpin: [],
            shield_kingpin: [],
            magneto: [],
            shield_magneto: [],
            hulk: [],
            shield_hulk: [],
            doom: [],
            shield_doom: [],
            neutral: [],
            shield_neutral: []
        };

        activeMissions.forEach((mission) => {
            if (mission.type === 'GALACTUS') {
                groups.galactus.push(mission);
                return;
            }

            const faction = getFactionForState(mission.location.state);
            if (mission.type === 'SHIELD_BASE') {
                const key = `shield_${faction}`;
                if (groups[key]) groups[key].push(mission);
                else groups.shield_neutral.push(mission);
                return;
            }

            if (groups[faction]) groups[faction].push(mission);
            else groups.neutral.push(mission);
        });

        return groups;
    }, [visibleMissions, completedMissionIds]);

    return {
        state: {
            user,
            loading,
            loadingAuth,
            lang,
            playerAlignment,
            heroes,
            completedMissionIds,
            omegaCylinders,
            worldStage,
            activeGlobalEvent,
            surferTurnCount,
            isGuest,
            isSaving,
            tickerMessage,
            isEditorMode,
            isFullAdmin,
            staffAccount,
            staffPermissions,
            showMissionEditor,
            missionToEdit,
            showCharacterEditor,
            showDbManager,
            showAdminPanel,
            customMissions,
            selectedMission,
            showStory,
            showTutorial,
            expandedZones,
            isSidebarCollapsed,
            ownedExpansions,
            showExpansionConfig,
            startStoryAtChoice,
            introMission,
            allMissions,
            visibleMissions,
            groupedMissions,
            FACTION_STATES
        },
        actions: {
            setLang,
            setPlayerAlignment,
            setHeroes,
            setCompletedMissionIds,
            setOmegaCylinders,
            setWorldStage,
            setActiveGlobalEvent,
            setIsGuest,
            setIsEditorMode,
            setIsFullAdmin,
            setIsSaving,
            setTickerMessage,
            setStartStoryAtChoice,
            setStaffAccount,
            setStaffPermissions,
            setShowMissionEditor,
            setMissionToEdit,
            setShowCharacterEditor,
            setShowDbManager,
            setShowAdminPanel,
            setCustomMissions,
            setSelectedMission,
            setShowStory,
            setShowTutorial,
            setExpandedZones,
            setIsSidebarCollapsed,
            setOwnedExpansions,
            setShowExpansionConfig,
            updateOwnedExpansions,
            toggleExpansion,
            toggleAllExpansions,
            handleEditorLogin,
            handleGuestLogin,
            handleExpansionConfirm,
            handleLogout,
            toggleDimension,
            handleTickerUpdate,
            handleMissionComplete,
            handleMissionSelect,
            handleMissionReactivate,
            handleDeleteMission,
            handleSimulateProgress,
            handleResetProgress,
            handleEventAcknowledge,
            handleToggleHeroObjective,
            handleTransformHero,
            toggleZone,
            setSurferTurnCount
        }
    };
};
