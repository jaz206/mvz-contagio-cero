import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { translations, Language } from '../translations';
import { getHeroTemplates } from '../services/heroService';
import { getHeroTransformAvailability } from '../services/heroVariantRuleService';
import { getDefaultIntroConfig, getIntroConfig, saveIntroConfig } from '../services/introService';
import { getDefaultStoryConfig, getStoryConfig, saveStoryConfig } from '../services/storyService';
import { getCustomMissions, deleteMissionInDB, syncInitialMissionRepository } from '../services/missionService';
import { getUserCampaignMeta, getUserProfile, resetUserProfiles, saveUserCampaignMeta, saveUserProfile } from '../services/userService';
import { getDefaultZoneControlConfig, getZoneControlConfig, saveZoneControlConfig } from '../services/zoneControlService';
import { logout } from '../services/authService';
import { getLoginAccessConfig } from '../services/accessControlService';
import { ensureAdminStaffAccount, getStaffAccount, getStaffAccountByEmail } from '../services/staffService';
import { Mission, Hero, WorldStage, GlobalEvent, HeroTemplate, StaffAccount, StaffPermissions, IntroConfig, StoryConfig, ZoneControlConfig, MissionCompletionReward, LoginAccessMode } from '../types';
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
const MAX_OMEGA_CYLINDERS = 15;
const LANGUAGE_KEY = 'shield_language';

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

const getSetupDoneKey = (uid?: string | null) => uid ? `shield_setup_done_${uid}` : 'shield_setup_done_guest';
const getFlowStepKey = (uid?: string | null) => uid ? `shield_flow_step_${uid}` : 'shield_flow_step_guest';
const getCampaignCacheKey = (uid?: string | null, alignment?: 'ALIVE' | 'ZOMBIE' | null) => {
    const modeKey = alignment || 'ALIVE';
    return uid ? `shield_campaign_cache_${uid}_${modeKey}` : `shield_campaign_cache_guest_${modeKey}`;
};
const getGalactusPlanKey = (uid?: string | null) => uid ? `shield_galactus_plan_${uid}` : 'shield_galactus_plan_guest';
type FlowStep = 'story' | 'setup' | 'intro' | 'mission0' | 'tutorial' | 'map';
type CampaignCache = { heroes: Hero[]; completedMissionIds: string[]; omegaCylinders: number };
type GalactusEventPlan = {
    anomalyAt: number;
    surferAt: number;
    galactusAt: number;
};
type StoredCampaignProgress = CampaignCache | {
    heroes: Hero[];
    completedMissionIds: string[];
    resources?: { omegaCylinders?: number };
};

const getSavedFlowStep = (uid?: string | null): FlowStep | null => {
    const saved = localStorage.getItem(getFlowStepKey(uid));
    return saved === 'story'
        || saved === 'setup'
        || saved === 'intro'
        || saved === 'mission0'
        || saved === 'tutorial'
        || saved === 'map'
        ? saved
        : null;
};

const saveFlowStep = (step: FlowStep, uid?: string | null) => {
    localStorage.setItem(getFlowStepKey(uid), step);
};

const clearFlowStep = (uid?: string | null) => {
    localStorage.removeItem(getFlowStepKey(uid));
};

const setStoredFlowStep = (step: FlowStep | null, uid?: string | null) => {
    if (step) saveFlowStep(step, uid);
    else clearFlowStep(uid);
};

const readCampaignCache = (uid?: string | null, alignment?: 'ALIVE' | 'ZOMBIE' | null): CampaignCache | null => {
    const raw = localStorage.getItem(getCampaignCacheKey(uid, alignment));
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        return {
            heroes: Array.isArray(parsed?.heroes) ? parsed.heroes : [],
            completedMissionIds: Array.isArray(parsed?.completedMissionIds) ? parsed.completedMissionIds : [],
            omegaCylinders: typeof parsed?.omegaCylinders === 'number' ? parsed.omegaCylinders : 0
        };
    } catch {
        return null;
    }
};

const writeCampaignCache = (
    heroes: Hero[],
    completedMissionIds: Iterable<string>,
    omegaCylinders: number,
    uid?: string | null,
    alignment?: 'ALIVE' | 'ZOMBIE' | null
) => {
    localStorage.setItem(getCampaignCacheKey(uid, alignment), JSON.stringify({
        heroes,
        completedMissionIds: Array.from(completedMissionIds),
        omegaCylinders
    }));
};

const clearCampaignCache = (uid?: string | null) => {
    localStorage.removeItem(getCampaignCacheKey(uid, 'ALIVE'));
    localStorage.removeItem(getCampaignCacheKey(uid, 'ZOMBIE'));
};

const readGalactusEventPlan = (uid?: string | null): GalactusEventPlan | null => {
    const raw = localStorage.getItem(getGalactusPlanKey(uid));
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.anomalyAt === 'number'
            && typeof parsed?.surferAt === 'number'
            && typeof parsed?.galactusAt === 'number'
        ) {
            return {
                anomalyAt: parsed.anomalyAt,
                surferAt: parsed.surferAt,
                galactusAt: parsed.galactusAt
            };
        }
        return null;
    } catch {
        return null;
    }
};

const writeGalactusEventPlan = (plan: GalactusEventPlan, uid?: string | null) => {
    localStorage.setItem(getGalactusPlanKey(uid), JSON.stringify(plan));
};

const clearGalactusEventPlan = (uid?: string | null) => {
    localStorage.removeItem(getGalactusPlanKey(uid));
};

const createGalactusEventPlan = (): GalactusEventPlan => {
    const pickInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const anomalyAt = pickInt(3, 5);
    const surferAt = pickInt(Math.max(anomalyAt + 3, 7), Math.max(anomalyAt + 4, 10));
    const galactusAt = pickInt(Math.max(surferAt + 3, 11), 15);

    return {
        anomalyAt,
        surferAt,
        galactusAt: Math.max(galactusAt, surferAt + 3)
    };
};

const getStoredOmegaCylinders = (progress: StoredCampaignProgress) => {
    if ('omegaCylinders' in progress) {
        return Math.max(0, Math.min(MAX_OMEGA_CYLINDERS, progress.omegaCylinders));
    }

    return Math.max(0, Math.min(MAX_OMEGA_CYLINDERS, progress.resources?.omegaCylinders || 0));
};

export const useGameLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [lang, setLangState] = useState<Language>(() => {
        const savedLang = localStorage.getItem(LANGUAGE_KEY);
        return savedLang === 'en' ? 'en' : 'es';
    });

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
    const currentPathRef = useRef(location.pathname);
    const guestSessionRef = useRef(isGuest);

    useEffect(() => {
        currentPathRef.current = location.pathname;
    }, [location.pathname]);

    useEffect(() => {
        guestSessionRef.current = isGuest;
    }, [isGuest]);

    const persistCampaignMeta = useCallback(async (alignment: 'ALIVE' | 'ZOMBIE' | null, flowStep: FlowStep | null) => {
        const uid = user?.uid;

        if (uid) {
            if (alignment) {
                saveStoredAlignment(uid, alignment);
            } else {
                localStorage.removeItem(`shield_alignment_${uid}`);
            }

            setStoredFlowStep(flowStep, uid);

            try {
                await saveUserCampaignMeta(uid, { alignment, flowStep });
            } catch (error) {
                console.error('Error saving campaign meta', error);
            }
            return;
        }

        if (alignment) {
            localStorage.setItem('shield_alignment_guest', alignment);
        } else {
            localStorage.removeItem('shield_alignment_guest');
        }
        setStoredFlowStep(flowStep, undefined);
    }, [user?.uid]);

    const findStaffAccount = async (email: string, uid: string) => {
        try {
            const byEmail = await getStaffAccountByEmail(email);
            if (byEmail) return byEmail;
        } catch (error) {
            console.warn('No se pudo leer la cuenta por correo, pruebo por identificador.');
        }

        return getStaffAccount(uid);
    };

    const [isEditorMode, setIsEditorMode] = useState(false);
    const [isFullAdmin, setIsFullAdmin] = useState(false);
    const [staffAccount, setStaffAccount] = useState<StaffAccount | null>(null);
    const [staffPermissions, setStaffPermissions] = useState<StaffPermissions>(EMPTY_PERMISSIONS);
    const [loginAccessMode, setLoginAccessMode] = useState<LoginAccessMode>('DEVELOPMENT');
    const [loginAccessLoaded, setLoginAccessLoaded] = useState(false);

    const [showMissionEditor, setShowMissionEditor] = useState(false);
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
    const [showCharacterEditor, setShowCharacterEditor] = useState(false);
    const [showDbManager, setShowDbManager] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showMissionControlPanel, setShowMissionControlPanel] = useState(false);

    const [customMissions, setCustomMissions] = useState<Mission[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    const [showStory, setShowStory] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isStartingCampaign, setIsStartingCampaign] = useState(false);
    const [introConfig, setIntroConfig] = useState<IntroConfig>(getDefaultIntroConfig());
    const [storyConfig, setStoryConfig] = useState<StoryConfig>(getDefaultStoryConfig());
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['kingpin', 'magneto', 'hulk', 'doom', 'neutral']));
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [ownedExpansions, setOwnedExpansions] = useState<Set<string>>(new Set(['core_box']));
    const [showExpansionConfig, setShowExpansionConfig] = useState(false);
    const previousControlledZonesRef = useRef<Record<'magneto' | 'kingpin' | 'hulk' | 'doom', boolean>>({
        magneto: false,
        kingpin: false,
        hulk: false,
        doom: false
    });
    const [zoneControlConfig, setZoneControlConfig] = useState<ZoneControlConfig | null>(null);

    const t = translations[lang];
    const setLang = useCallback((nextLang: Language) => {
        const normalized = nextLang === 'en' ? 'en' : 'es';
        localStorage.setItem(LANGUAGE_KEY, normalized);
        setLangState(normalized);
    }, []);
    const preserveBunkerRoute = () => {
        if (currentPathRef.current === '/bunker') {
            navigate('/bunker');
            return true;
        }
        return false;
    };

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
        const loadIntroConfig = async () => {
            const loadedIntroConfig = await getIntroConfig();
            setIntroConfig(loadedIntroConfig);
        };

        loadIntroConfig();
    }, []);

    useEffect(() => {
        const loadStoryConfig = async () => {
            const loadedStoryConfig = await getStoryConfig();
            setStoryConfig(loadedStoryConfig);
        };

        loadStoryConfig();
    }, []);

    useEffect(() => {
        const loadZoneConfig = async () => {
            try {
                const loaded = await getZoneControlConfig();
                setZoneControlConfig(loaded);
            } catch (error) {
                console.error(error);
                setZoneControlConfig(null);
            }
        };

        loadZoneConfig();
    }, []);

    useEffect(() => {
        const loadAccessMode = async () => {
            try {
                const config = await getLoginAccessConfig();
                setLoginAccessMode(config.mode);
            } catch (error) {
                console.error(error);
                setLoginAccessMode('DEVELOPMENT');
            } finally {
                setLoginAccessLoaded(true);
            }
        };

        loadAccessMode();
    }, []);

    useEffect(() => {
        if (!loginAccessLoaded) {
            return;
        }

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
                if (!guestSessionRef.current) {
                    navigate('/');
                }
                setLoading(false);
                return;
            }

            isDataLoadedRef.current = false;
            setPlayerAlignment(null);
            setHeroes([]);
            setCompletedMissionIds(new Set());
            setOmegaCylinders(0);
            setWorldStage('NORMAL');
            setActiveGlobalEvent(null);

            const coreExpansion = GAME_EXPANSIONS.find((item) => item.id === 'core_box');
            const coreHeroes = coreExpansion ? coreExpansion.heroes : [];
            const [heroTemplates, remoteCampaignMeta, remoteAliveProfile, remoteZombieProfile] = await Promise.all([
                getHeroTemplates(),
                getUserCampaignMeta(currentUser.uid),
                getUserProfile(currentUser.uid, 'ALIVE'),
                getUserProfile(currentUser.uid, 'ZOMBIE')
            ]);
            const savedAlignment = getStoredAlignment(currentUser.uid) || remoteCampaignMeta?.alignment || null;
            const savedFlowStep = getSavedFlowStep(currentUser.uid) || (remoteCampaignMeta?.flowStep as FlowStep | null) || null;
            const remoteProfile = savedAlignment === 'ZOMBIE'
                ? remoteZombieProfile
                : savedAlignment === 'ALIVE'
                    ? remoteAliveProfile
                    : remoteAliveProfile || remoteZombieProfile || null;
            const resolvedAlignment = savedAlignment
                || (remoteProfile === remoteZombieProfile ? 'ZOMBIE' : remoteProfile === remoteAliveProfile ? 'ALIVE' : null)
                || remoteCampaignMeta?.alignment
                || null;
            const preferredAlignment = resolvedAlignment || 'ALIVE';
            const cachedCampaign = remoteProfile ? null : readCampaignCache(currentUser.uid, preferredAlignment);
            const hydrateHeroFromTemplate = (hero: Hero): Hero => {
                const template = heroTemplates.find((item) => item.id === hero.id);
                if (!template) return hero;

                return {
                    ...hero,
                    name: template.defaultName,
                    alias: template.alias,
                    class: template.defaultClass,
                    stats: template.defaultStats,
                    imageUrl: template.imageUrl || hero.imageUrl,
                    bio: template.bio || hero.bio,
                    origin: template.origin || hero.origin,
                    currentStory: template.currentStory || hero.currentStory,
                    objectives: template.objectives || hero.objectives,
                    imageParams: template.imageParams || hero.imageParams,
                    characterSheetUrl: template.characterSheetUrl || hero.characterSheetUrl,
                    relatedHeroId: template.relatedHeroId || hero.relatedHeroId,
                    expansionId: template.expansionId || hero.expansionId,
                    playableSheets: template.playableSheets || hero.playableSheets,
                    isSelectable: template.isSelectable ?? hero.isSelectable
                };
            };
            const hydratedCoreHeroes = coreHeroes.map(hydrateHeroFromTemplate);
            const loadedCampaign = remoteProfile || cachedCampaign;
            const loadedHeroes = (loadedCampaign?.heroes || []).map(hydrateHeroFromTemplate);
            const hasLoadedCampaign = loadedHeroes.length > 0
                || (loadedCampaign?.completedMissionIds?.length || 0) > 0
                || (loadedCampaign?.omegaCylinders || 0) > 0;
            const campaignHeroes = hasLoadedCampaign ? loadedHeroes : hydratedCoreHeroes;
            const campaignCompletedMissions = hasLoadedCampaign ? new Set(loadedCampaign?.completedMissionIds || []) : new Set<string>();
            const campaignOmega = hasLoadedCampaign ? Math.max(0, Math.min(MAX_OMEGA_CYLINDERS, loadedCampaign?.omegaCylinders || 0)) : 0;
            const applyCampaignState = (options: {
                staff?: StaffAccount | null;
                editorMode: boolean;
                fullAdmin: boolean;
            }) => {
                setStaffAccount(options.staff || null);
                setStaffPermissions(options.staff && options.staff.role === 'tester' ? EMPTY_PERMISSIONS : (options.staff?.permissions || EMPTY_PERMISSIONS));
                setIsEditorMode(options.editorMode);
                setIsFullAdmin(options.fullAdmin);
                setIsGuest(false);
                setIsStartingCampaign(false);
                setPlayerAlignment(preferredAlignment);
                setShowStory(false);
                setShowTutorial(false);
                setHeroes(campaignHeroes);
                setCompletedMissionIds(campaignCompletedMissions);
                setOmegaCylinders(campaignOmega);
                setWorldStage('NORMAL');
                isDataLoadedRef.current = true;
            };

            const currentEmail = (currentUser.email || '').toLowerCase();
            const isAdminUser = currentUser.uid === ADMIN_UID || currentEmail === ADMIN_EMAIL;
            const hasSavedCampaignProgress = !!savedFlowStep || !!loadedCampaign || !!savedAlignment;

            if (savedAlignment) {
                saveStoredAlignment(currentUser.uid, savedAlignment);
            }
            if (savedFlowStep) {
                saveFlowStep(savedFlowStep, currentUser.uid);
            }

            if (isAdminUser) {
                const adminAccount = await ensureAdminStaffAccount(
                    currentUser.uid,
                    currentUser.email || '',
                    currentUser.displayName || undefined
                );

                applyCampaignState({
                    staff: adminAccount,
                    editorMode: true,
                    fullAdmin: true
                });
                if (hasLoadedCampaign) {
                    writeCampaignCache(campaignHeroes, campaignCompletedMissions, campaignOmega, currentUser.uid, preferredAlignment);
                }
                if (!preserveBunkerRoute()) navigate('/map');
                setLoading(false);
                return;
            }

            const linkedStaffAccount = await findStaffAccount(currentEmail, currentUser.uid);
            if (linkedStaffAccount && !linkedStaffAccount.isActive) {
                await logout();
                setLoading(false);
                return;
            }

            if (loginAccessMode === 'DEVELOPMENT' && !linkedStaffAccount) {
                await logout();
                setStaffAccount(null);
                setStaffPermissions(EMPTY_PERMISSIONS);
                setIsEditorMode(false);
                setIsFullAdmin(false);
                setIsStartingCampaign(false);
                setPlayerAlignment(null);
                setLoading(false);
                navigate('/');
                return;
            }

            if (linkedStaffAccount) {
                if (linkedStaffAccount.role === 'tester') {
                    setStaffAccount(linkedStaffAccount);
                    setStaffPermissions(EMPTY_PERMISSIONS);
                    setIsEditorMode(false);
                    setIsFullAdmin(false);
                    setIsGuest(false);
                    setIsStartingCampaign(false);
                    if (!hasSavedCampaignProgress || savedFlowStep === 'story') {
                        setPlayerAlignment(null);
                        setShowStory(true);
                        setShowTutorial(false);
                        setHeroes([]);
                        setCompletedMissionIds(new Set());
                        setOmegaCylinders(0);
                        setWorldStage('NORMAL');
                        setStartStoryAtChoice(false);
                        isDataLoadedRef.current = true;
                        localStorage.removeItem(`shield_intro_seen_${currentUser.uid}`);
                        localStorage.removeItem(getSetupDoneKey(currentUser.uid));
                        saveFlowStep('story', currentUser.uid);
                        await saveUserCampaignMeta(currentUser.uid, { alignment: null, flowStep: 'story' });
                        if (!preserveBunkerRoute()) navigate('/story');
                        setLoading(false);
                        return;
                    }

                    applyCampaignState({
                        staff: linkedStaffAccount,
                        editorMode: false,
                        fullAdmin: false
                    });
                    if (hasLoadedCampaign) {
                        writeCampaignCache(campaignHeroes, campaignCompletedMissions, campaignOmega, currentUser.uid, preferredAlignment);
                    }
                    if (!preserveBunkerRoute()) {
                        const testerRoute = savedFlowStep === 'setup'
                            ? '/setup'
                            : savedFlowStep === 'intro'
                                ? '/intro'
                                : savedFlowStep === 'mission0'
                                    ? '/mission0'
                                    : savedFlowStep === 'tutorial'
                                        ? '/tutorial'
                                        : '/map';
                        navigate(testerRoute);
                    }
                    setLoading(false);
                    return;
                }

                applyCampaignState({
                    staff: linkedStaffAccount,
                    editorMode: true,
                    fullAdmin: linkedStaffAccount.role === 'admin'
                });
                if (hasLoadedCampaign) {
                    writeCampaignCache(campaignHeroes, campaignCompletedMissions, campaignOmega, currentUser.uid, preferredAlignment);
                }
                if (!preserveBunkerRoute()) navigate('/map');
                setLoading(false);
                return;
            }

            setStaffAccount(null);
            setStaffPermissions(EMPTY_PERMISSIONS);
            setIsEditorMode(false);
            setIsFullAdmin(false);
            setIsGuest(false);
            setIsStartingCampaign(false);
            setPlayerAlignment(preferredAlignment);
            setShowStory(false);
            setShowTutorial(false);
            setHeroes(campaignHeroes);
            setCompletedMissionIds(campaignCompletedMissions);
            setOmegaCylinders(campaignOmega);
            setWorldStage('NORMAL');
            if (hasLoadedCampaign) {
                writeCampaignCache(campaignHeroes, campaignCompletedMissions, campaignOmega, currentUser.uid, preferredAlignment);
            }
            if (!hasSavedCampaignProgress) {
                setShowStory(true);
                setStartStoryAtChoice(false);
                setPlayerAlignment(null);
                await saveUserCampaignMeta(currentUser.uid, { alignment: null, flowStep: 'story' });
                if (!preserveBunkerRoute()) navigate('/story');
                setLoading(false);
                return;
            }
            isDataLoadedRef.current = true;
            if (!preserveBunkerRoute()) {
                const playerRoute = savedFlowStep === 'setup'
                    ? '/setup'
                    : savedFlowStep === 'intro'
                        ? '/intro'
                        : savedFlowStep === 'mission0'
                            ? '/mission0'
                            : savedFlowStep === 'tutorial'
                                ? '/tutorial'
                                : '/map';
                navigate(playerRoute);
            }
            setLoading(false);
            return;
        });

        return () => unsubscribe();
    }, [navigate, loginAccessLoaded, loginAccessMode]);

    useEffect(() => {
        const loadMissions = async () => {
            const loaded = await syncInitialMissionRepository();
            setCustomMissions(loaded);
        };

        loadMissions();
    }, []);

    const saveData = useCallback(async (currentHeroes: Hero[], currentMissions: Set<string>, currentCylinders: number) => {
        if (!playerAlignment || !isDataLoadedRef.current) return;

        setIsSaving(true);
        writeCampaignCache(currentHeroes, currentMissions, currentCylinders, user?.uid, playerAlignment || 'ALIVE');
        try {
            if (user) {
                await saveUserProfile(
                    user.uid,
                    playerAlignment,
                    currentHeroes,
                    Array.from(currentMissions),
                    { omegaCylinders: currentCylinders },
                    { alignment: playerAlignment, flowStep: getSavedFlowStep(user.uid) }
                );
            }
        } catch (error) {
            console.error('Auto-save failed', error);
        } finally {
            setTimeout(() => setIsSaving(false), 1000);
        }
    }, [user, playerAlignment]);

    useEffect(() => {
        if (user || isDataLoadedRef.current || playerAlignment === null) return;

        const cached = readCampaignCache(undefined, playerAlignment || 'ALIVE');
        if (!cached || cached.heroes.length === 0) return;

        setHeroes(cached.heroes);
        setCompletedMissionIds(new Set(cached.completedMissionIds));
        setOmegaCylinders(cached.omegaCylinders);
        isDataLoadedRef.current = true;
    }, [user, playerAlignment]);

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

    const handleGuestLogin = () => {
        setIsGuest(true);
        setIsStartingCampaign(false);
        clearFlowStep();
        localStorage.removeItem(getSetupDoneKey());
        setPlayerAlignment('ALIVE');
        setShowStory(true);
        setStartStoryAtChoice(false);
        saveFlowStep('story');
        navigate('/story');
    };

    const handleStoryChoice = (choice: 'ALIVE' | 'ZOMBIE') => {
        setIsStartingCampaign(false);
        setShowStory(false);
        setStartStoryAtChoice(false);
        setPlayerAlignment(choice);

        if (user) {
            persistCampaignMeta(choice, 'setup');
            localStorage.removeItem(getSetupDoneKey(user.uid));
        } else {
            persistCampaignMeta(choice, 'setup');
            localStorage.removeItem(getSetupDoneKey());
        }

        navigate('/setup', { replace: true });
    };

    const handleExpansionConfirm = async (selectedHeroes: Hero[]) => {
        if (!playerAlignment) return;
        setHeroes([...selectedHeroes]);
        setShowStory(false);
        setStartStoryAtChoice(false);
        setIsStartingCampaign(true);
        if (user) {
            localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true');
            localStorage.setItem(getSetupDoneKey(user.uid), 'true');
            await persistCampaignMeta(playerAlignment, 'intro');
            if (ownedExpansions.has('galactus')) {
                writeGalactusEventPlan(createGalactusEventPlan(), user.uid);
            } else {
                clearGalactusEventPlan(user.uid);
            }
            writeCampaignCache(selectedHeroes, [], omegaCylinders, user.uid, playerAlignment || 'ALIVE');
            await saveUserProfile(user.uid, playerAlignment, selectedHeroes, [], { omegaCylinders }, { alignment: playerAlignment, flowStep: 'intro' });
        } else {
            localStorage.setItem(getSetupDoneKey(), 'true');
            await persistCampaignMeta(playerAlignment, 'intro');
            if (ownedExpansions.has('galactus')) {
                writeGalactusEventPlan(createGalactusEventPlan());
            } else {
                clearGalactusEventPlan();
            }
            writeCampaignCache(selectedHeroes, [], omegaCylinders, undefined, playerAlignment || 'ALIVE');
        }
        isDataLoadedRef.current = true;
        navigate('/intro', { replace: true });
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
        setIsStartingCampaign(false);
        isDataLoadedRef.current = false;
        setPlayerAlignment(null);
        clearFlowStep(user?.uid);
        clearCampaignCache(user?.uid);
        clearGalactusEventPlan(user?.uid);
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
                setOmegaCylinders(Math.max(0, Math.min(MAX_OMEGA_CYLINDERS, profile.resources.omegaCylinders)));
            });
        }
    };

    const handleTickerUpdate = (message: string) => setTickerMessage(message);

    const allMissions: Mission[] = useMemo(() => {
        const fallbackMissions = getInitialMissions(t);
        const sourceMissions = customMissions.length > 0 ? customMissions : fallbackMissions;
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

        const findZombieIntro = () => allMissions.find((mission) => {
            const title = (mission.title || '').toLowerCase();
            return (mission.alignment === 'ZOMBIE' || mission.alignment === 'BOTH')
                && (
                    title.includes('mz0')
                    || (mission.type === 'INTRODUCTORY' && mission.isIntroMission === true && mission.alignment === 'ZOMBIE')
                );
        });

        if (playerAlignment === 'ZOMBIE') {
            const zombieIntro = findZombieIntro();
            if (zombieIntro) return zombieIntro;
        }

        const canonicalIntro = allMissions.find((mission) =>
            mission.id === 'm_intro_0'
            && (mission.alignment === playerAlignment || mission.alignment === 'BOTH' || !mission.alignment)
        );

        if (canonicalIntro) return canonicalIntro;

        const flaggedIntro = allMissions.find((mission) =>
            mission.isIntroMission === true &&
            (mission.alignment === playerAlignment || mission.alignment === 'BOTH')
        );

        if (flaggedIntro) return flaggedIntro;
        return allMissions.find((mission) => mission.id === 'm_intro_0') || null;
    }, [allMissions, playerAlignment]);

    const visibleMissions = useMemo(() => {
        const sortByCampaignRole = (missions: Mission[]) => (
            [...missions].sort((a, b) => {
                const roleA = a.missionRole || 'PRIMARY';
                const roleB = b.missionRole || 'PRIMARY';
                if (roleA !== roleB) return roleA === 'PRIMARY' ? -1 : 1;
                return a.title.localeCompare(b.title, 'es');
            })
        );

        const alignmentFiltered = allMissions.filter((mission) => {
            if (!isEditorMode && (mission.status || 'PUBLISHED') === 'DRAFT') return false;
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

        if (isEditorMode) return sortByCampaignRole(expansionFiltered);

        return sortByCampaignRole(expansionFiltered.filter((mission) => {
            const isCompleted = completedMissionIds.has(mission.id);
            if (isCompleted) return true;

            let prereqMet = true;
            if (mission.prereqs && mission.prereqs.length > 0) {
                prereqMet = mission.prereqs.every((item) => completedMissionIds.has(item));
            } else if (mission.prereq) {
                prereqMet = completedMissionIds.has(mission.prereq);
            }

            if (introMission && mission.id === introMission.id && !isCompleted) return true;

            if (mission.type === 'GALACTUS' && !ownedExpansions.has('galactus')) {
                return false;
            }

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
        }));
    }, [allMissions, completedMissionIds, isEditorMode, worldStage, playerAlignment, ownedExpansions, introMission]);

    const checkGlobalEvents = (missionSet: Set<string>) => {
        if (missionSet.has('boss-galactus')) return;

        if (!ownedExpansions.has('galactus')) {
            if (worldStage !== 'NORMAL' || activeGlobalEvent) {
                setWorldStage('NORMAL');
                setActiveGlobalEvent(null);
            }
            return;
        }

        const count = missionSet.size;
        const plan = readGalactusEventPlan(user?.uid) || createGalactusEventPlan();
        if (!readGalactusEventPlan(user?.uid)) {
            writeGalactusEventPlan(plan, user?.uid);
        }

        if (count >= plan.galactusAt && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'GALACTUS', title: '', description: '' });
            setWorldStage('GALACTUS');
            handleTickerUpdate('ALERTA OMEGA. GALACTUS HA LLEGADO.');
        } else if (count >= plan.surferAt && count < plan.galactusAt && worldStage !== 'SURFER' && worldStage !== 'GALACTUS') {
            setActiveGlobalEvent({ stage: 'SURFER', title: '', description: '' });
            setWorldStage('SURFER');
            setSurferTurnCount(0);
            handleTickerUpdate('OBJETO PLATEADO ENTRANDO EN LA ATMOSFERA.');
        } else if (count >= plan.anomalyAt && count < plan.surferAt && worldStage === 'NORMAL') {
            setActiveGlobalEvent({ stage: 'ANOMALY', title: '', description: '' });
            setWorldStage('ANOMALY');
            handleTickerUpdate('LECTURAS DE ENERGIA ANOMALAS EN EL ESPACIO PROFUNDO.');
        }
    };

    const handleMissionComplete = async (id: string, reward?: MissionCompletionReward) => {
        const nextSet = new Set(completedMissionIds);
        nextSet.add(id);
        setCompletedMissionIds(nextSet);

        if (!reward?.keepModalOpen) {
            setSelectedMission(null);
        }

        if (worldStage === 'SURFER') {
            setSurferTurnCount((prev) => prev + 1);
        }

        const foundCureVial = reward?.foundCureVial === true;
        const nextCylinders = foundCureVial
            ? Math.min(MAX_OMEGA_CYLINDERS, omegaCylinders + 1)
            : omegaCylinders;

        if (foundCureVial) {
            setOmegaCylinders(nextCylinders);
            handleTickerUpdate(
                lang === 'es'
                    ? 'HABEIS ENCONTRADO UN VIAL DE CURA.'
                    : 'YOU HAVE FOUND A CURE VIAL.'
            );
        }

        if (user && playerAlignment) {
            await saveData(heroes, nextSet, nextCylinders);
        }

        if (id === 'boss-galactus') {
            setWorldStage('NORMAL');
            setActiveGlobalEvent(null);
            clearGalactusEventPlan(user?.uid);
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

        if (id === 'm_intro_0' && !isFullAdmin) {
            alert('La MH0 solo la puede borrar el admin.');
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
        clearGalactusEventPlan(user?.uid);
    };

    const handleSaveIntroConfig = async (nextIntroConfig: IntroConfig) => {
        await saveIntroConfig(nextIntroConfig);
        setIntroConfig(nextIntroConfig);
    };

    const handleSaveStoryConfig = async (nextStoryConfig: StoryConfig) => {
        await saveStoryConfig(nextStoryConfig);
        setStoryConfig(nextStoryConfig);
    };

    const handleSaveZoneControlConfig = async (nextZoneControlConfig: ZoneControlConfig) => {
        await saveZoneControlConfig(nextZoneControlConfig);
        setZoneControlConfig(nextZoneControlConfig);
    };

    const handleRestartCampaign = async () => {
        const currentUid = user?.uid;

        if (currentUid) {
            localStorage.removeItem(`shield_intro_seen_${currentUid}`);
            localStorage.removeItem(`shield_tutorial_seen_${currentUid}`);
            localStorage.removeItem(`shield_alignment_${currentUid}`);
            localStorage.removeItem(getSetupDoneKey(currentUid));
            await saveUserCampaignMeta(currentUid, { alignment: null, flowStep: 'story' });
            clearFlowStep(currentUid);
            clearCampaignCache(currentUid);
            clearGalactusEventPlan(currentUid);
        } else {
            localStorage.removeItem('shield_tutorial_seen_guest');
            localStorage.removeItem(getSetupDoneKey());
            clearFlowStep();
            clearCampaignCache();
            clearGalactusEventPlan();
        }

        setCompletedMissionIds(new Set());
        setWorldStage('NORMAL');
        setActiveGlobalEvent(null);
        setOmegaCylinders(0);
        setSurferTurnCount(0);
        setHeroes([]);
        setSelectedMission(null);
        setPlayerAlignment(null);
        setShowStory(true);
        setShowTutorial(false);
        setIsStartingCampaign(false);
        setStartStoryAtChoice(false);
        isDataLoadedRef.current = false;
        navigate('/story', { replace: true });

        if (currentUid) {
            await resetUserProfiles(currentUid);
        }
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
        const transformAvailability = getHeroTransformAvailability(currentHero, targetAlignment, allTemplates, ownedExpansions);
        const targetTemplate = transformAvailability.targetTemplate;

        if (!transformAvailability.allowed || !targetTemplate) {
            if (targetAlignment === 'ALIVE' && (transformAvailability.reason === 'NO_COUNTERPART' || transformAvailability.reason === 'NO_VARIANT')) {
                alert(
                    lang === 'es'
                        ? `SUJETO IRRECUPERABLE.\n\nEl tejido de ${currentHero.alias.toUpperCase()} (Z) ha sufrido una degradacion celular total. No queda ADN humano viable para la reestructuracion.\n\nLA CURA ES INEFICAZ.`
                        : `UNRECOVERABLE SUBJECT.\n\nThe tissue of ${currentHero.alias.toUpperCase()} (Z) has suffered total cellular degradation. No viable human DNA remains for reconstitution.\n\nTHE CURE IS INEFFECTIVE.`
                );
                return;
            }

            if (transformAvailability.reason === 'MISSING_EXPANSION') {
                alert(targetAlignment === 'ALIVE'
                    ? `No puedes curar a ${currentHero.alias} con las expansiones activas.`
                    : `No puedes infectar a ${currentHero.alias} con las expansiones activas.`);
            } else {
                alert(lang === 'es'
                    ? `No se encontro una version compatible de ${currentHero.alias}.`
                    : `No compatible version found for ${currentHero.alias}.`);
            }
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
            imageParams: targetTemplate.imageParams,
            playableSheets: targetTemplate.playableSheets,
            isSelectable: targetTemplate.isSelectable
        };

        const nextHeroes = [...heroes];
        nextHeroes[heroIndex] = transformedHero;
        setHeroes(nextHeroes);

        if (targetAlignment === 'ALIVE') {
            handleTickerUpdate(`SUJETO ${transformedHero.alias} CURADO.`);
            setOmegaCylinders((prev) => Math.max(0, Math.min(MAX_OMEGA_CYLINDERS, prev - 1)));
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

    const controlledZones = useMemo(() => {
        const sourceConfig = zoneControlConfig || getDefaultZoneControlConfig(allMissions);
        const zones: Record<'magneto' | 'kingpin' | 'hulk' | 'doom', boolean> = {
            magneto: false,
            kingpin: false,
            hulk: false,
            doom: false
        };

        (['magneto', 'kingpin', 'hulk', 'doom'] as const).forEach((zone) => {
            const zoneMissions = sourceConfig.zones[zone] || [];
            zones[zone] = zoneMissions.length > 0 && zoneMissions.every((missionId) => completedMissionIds.has(missionId));
        });

        return zones;
    }, [allMissions, completedMissionIds, zoneControlConfig]);

    useEffect(() => {
        (['magneto', 'kingpin', 'hulk', 'doom'] as const).forEach((zone) => {
            if (controlledZones[zone] && !previousControlledZonesRef.current[zone]) {
                handleTickerUpdate(`ZONA CONTROLADA: ${zone.toUpperCase()}.`);
            }
        });

        previousControlledZonesRef.current = controlledZones;
    }, [controlledZones]);

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
            showMissionControlPanel,
            customMissions,
            selectedMission,
            showStory,
            showTutorial,
            isStartingCampaign,
            introConfig,
            storyConfig,
            expandedZones,
            isSidebarCollapsed,
            ownedExpansions,
            showExpansionConfig,
            startStoryAtChoice,
            introMission,
            allMissions,
            visibleMissions,
            groupedMissions,
            controlledZones,
            zoneControlConfig,
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
            setShowMissionControlPanel,
            setCustomMissions,
            setSelectedMission,
            setShowStory,
            setShowTutorial,
            setIsStartingCampaign,
            setIntroConfig,
            setExpandedZones,
            setIsSidebarCollapsed,
            setOwnedExpansions,
            setShowExpansionConfig,
            updateOwnedExpansions,
            toggleExpansion,
            toggleAllExpansions,
            handleGuestLogin,
            handleStoryChoice,
            handleExpansionConfirm,
            handleLogout,
            syncCampaignMeta: persistCampaignMeta,
            toggleDimension,
            handleTickerUpdate,
            handleMissionComplete,
            handleMissionSelect,
            handleMissionReactivate,
            handleDeleteMission,
            handleSimulateProgress,
            handleResetProgress,
            handleRestartCampaign,
            handleSaveIntroConfig,
            handleSaveStoryConfig,
            handleSaveZoneControlConfig,
            handleEventAcknowledge,
            handleToggleHeroObjective,
            handleTransformHero,
            toggleZone,
            setSurferTurnCount
        }
    };
};
