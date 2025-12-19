import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { translations, Language } from './translations';
import { User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    getUserProfile, 
    saveUserProfile, 
    getCustomMissions, 
    deleteMissionInDB,
    getHeroTemplates
} from './services/dbService';
import { logout } from './services/authService';

import { LoginScreen } from './components/LoginScreen';
import { StoryMode } from './components/StoryMode';
import { IntroSequence } from './components/IntroSequence';
import { TutorialOverlay } from './components/TutorialOverlay';
import { USAMap } from './components/USAMap';
import { BunkerInterior } from './components/BunkerInterior';
import { MissionModal } from './components/MissionModal';
import { EventModal } from './components/EventModal';
import { MissionEditor } from './components/MissionEditor';
import { CharacterEditor } from './components/CharacterEditor';
import { NewsTicker } from './components/NewsTicker';
import { ExpansionSelector } from './components/ExpansionSelector';
import { ExpansionConfigModal } from './components/ExpansionConfigModal';
import { DatabaseManager } from './components/DatabaseManager';

import { Mission, Hero, WorldStage, GlobalEvent, HeroTemplate } from './types';
import { GAME_EXPANSIONS } from './data/gameContent';
import { getInitialMissions } from './data/initialMissions';

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

const App: React.FC = () => {
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
    const [showStory, setShowStory] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['kingpin', 'magneto', 'hulk', 'doom', 'neutral']));
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [ownedExpansions, setOwnedExpansions] = useState<Set<string>>(new Set(['core_box']));
    const [showExpansionConfig, setShowExpansionConfig] = useState(false);

    const t = translations[lang];

    useEffect(() => {
        const savedExp = localStorage.getItem('shield_owned_expansions');
        if (savedExp) {
            try { setOwnedExpansions(new Set(JSON.parse(savedExp))); } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        if (!auth) { setLoadingAuth(false); setLoading(false); return; }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
            if (currentUser) {
                const hasSeenIntro = localStorage.getItem(`shield_intro_seen_${currentUser.uid}`);
                if (!hasSeenIntro) { setShowStory(true); setStartStoryAtChoice(false); setViewMode('story'); } 
                else { setViewMode('map'); }
            } else if (!isGuest) { setViewMode('login'); }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isGuest]);

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
        if(user) localStorage.setItem(`shield_intro_seen_${user.uid}`, 'true');
        setViewMode('intro');
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
        const core = GAME_EXPANSIONS.find(e => e.id === 'core_box');
        if (core) setHeroes(newAlignment === 'ZOMBIE' ? core.zombieHeroes : core.heroes);
        setViewMode('map');
    };

    const handleTickerUpdate = (message: string) => setTickerMessage(message);

    useEffect(() => {
        const loadMissions = async () => {
            const loaded = await getCustomMissions();
            setCustomMissions(loaded);
        };
        loadMissions();
    }, [isEditorMode]);

    // --- LÓGICA DE MISIONES ---
    const allMissions: Mission[] = useMemo(() => {
        const sourceMissions = customMissions.length > 0 ? customMissions : getInitialMissions(t);
        return sourceMissions.map(m => {
            let [x, y] = m.location.coordinates;
            if (x === 0 && y === 0) {
                return { ...m, location: { ...m.location, coordinates: [-82.5, 40.2] } };
            }
            if (x > 0 && y < 0) {
                return { ...m, location: { ...m.location, coordinates: [y, x] } };
            }
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
        const loaded = await getCustomMissions();
        setCustomMissions(loaded);
    };

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

    useEffect(() => {
        if (!playerAlignment) return;
        if (showStory) return;
        if (isEditorMode) return;
        const tutorialKey = user ? `shield_tutorial_seen_${user.uid}` : 'shield_tutorial_seen_guest';
        const hasSeenTutorial = localStorage.getItem(tutorialKey);
        if (!hasSeenTutorial && viewMode === 'map') { setTimeout(() => setShowTutorial(true), 500); }
    }, [playerAlignment, showStory, user, viewMode, isEditorMode]);

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

    const handleMissionSelectWrapper = (m: Mission) => {
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

        const cleanString = (str: string) => {
            return str.toLowerCase()
                .replace(/\(z\)/g, '')       
                .replace(/\(artist\)/g, '')  
                .replace(/\(old man\)/g, '') 
                .replace(/[^a-z0-9]/g, '')   
                .trim();
        };

        const currentAliasClean = cleanString(currentHero.alias);
        const currentNameClean = cleanString(currentHero.name);

        const findMatch = (list: HeroTemplate[] | Hero[]) => {
            return list.find(h => {
                const hAliasClean = cleanString(h.alias);
                const hNameClean = cleanString(h.name || (h as HeroTemplate).defaultName);
                
                if (hAliasClean === currentAliasClean) return true;
                if (hNameClean === currentNameClean) return true;
                if (hAliasClean.includes(currentAliasClean) || currentAliasClean.includes(hAliasClean)) return true;

                return false;
            });
        };

        let targetTemplate: HeroTemplate | null = null;

        for (const exp of GAME_EXPANSIONS) {
            const list = targetAlignment === 'ALIVE' ? exp.heroes : exp.zombieHeroes;
            const found = findMatch(list);
            
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
                    currentStory: found.currentStory
                };
                break;
            }
        }

        if (!targetTemplate) {
            const allTemplates = await getHeroTemplates();
            const candidates = allTemplates.filter(t => t.defaultAlignment === targetAlignment);
            const found = findMatch(candidates);
            if (found) targetTemplate = found;
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
                currentStory: targetTemplate.currentStory || ''
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

    const totalMissions = useMemo(() => customMissions.length + 7, [customMissions]);
    const progressPercentage = Math.min(100, Math.round((completedMissionIds.size / Math.max(1, totalMissions)) * 100));
    const circumference = 2 * Math.PI * 18; 
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    if (loading || loadingAuth) return <div className="bg-slate-950 text-cyan-500 h-screen flex items-center justify-center font-mono">LOADING SHIELD OS...</div>;

    return (
        <div className={`flex flex-col h-screen w-full bg-slate-950 text-cyan-400 font-mono overflow-hidden relative ${playerAlignment === 'ZOMBIE' ? 'hue-rotate-15 saturate-50' : ''}`}>
            <CharacterEditor isOpen={showCharacterEditor} onClose={() => setShowCharacterEditor(false)} language={lang} />
            <MissionEditor isOpen={showMissionEditor} onClose={() => { setShowMissionEditor(false); setMissionToEdit(null); }} onSave={async (newMission) => { const loaded = await getCustomMissions(); setCustomMissions(loaded); }} language={lang} initialData={missionToEdit} existingMissions={allMissions} />
            {activeGlobalEvent && <EventModal event={activeGlobalEvent} isOpen={!!activeGlobalEvent} onAcknowledge={handleEventAcknowledge} language={lang} playerAlignment={playerAlignment} />}
            {selectedMission && <MissionModal mission={selectedMission} isOpen={!!selectedMission} onClose={() => setSelectedMission(null)} onComplete={handleMissionComplete} onReactivate={handleMissionReactivate} language={lang} isCompleted={completedMissionIds.has(selectedMission.id)} isEditorMode={isEditorMode} onEdit={(m) => { setMissionToEdit(m); setShowMissionEditor(true); setSelectedMission(null); }} onDelete={handleDeleteMission} />}
            <DatabaseManager isOpen={showDbManager} onClose={() => setShowDbManager(false)} language={lang} />
            <ExpansionConfigModal isOpen={showExpansionConfig} onClose={() => setShowExpansionConfig(false)} ownedExpansions={ownedExpansions} onToggle={toggleExpansion} onToggleAll={toggleAllExpansions} language={lang} />

            {viewMode === 'login' && (<LoginScreen onLogin={handleGuestLogin} onGoogleLogin={() => {}} onEditorLogin={handleEditorLogin} language={lang} setLanguage={setLang} />)}
            {viewMode === 'story' && (<StoryMode language={lang} onComplete={(choice) => { setPlayerAlignment(choice); setViewMode('setup'); }} onSkip={() => { setPlayerAlignment('ALIVE'); const core = GAME_EXPANSIONS.find(e => e.id === 'core_box'); if (core) setHeroes(core.heroes); setViewMode('map'); }} startAtChoice={startStoryAtChoice} />)}
            {viewMode === 'setup' && playerAlignment && (<ExpansionSelector language={lang} playerAlignment={playerAlignment} onConfirm={handleExpansionConfirm} onBack={() => { setPlayerAlignment(null); setStartStoryAtChoice(true); setViewMode('story'); }} ownedExpansions={ownedExpansions} onToggleExpansion={toggleExpansion} onToggleAllExpansions={toggleAllExpansions} />)}
            
            {viewMode === 'intro' && playerAlignment && (
                <IntroSequence 
                    language={lang} 
                    playerAlignment={playerAlignment} 
                    onComplete={() => {
                        if (introMission) {
                            setViewMode('mission0');
                        } else {
                            setViewMode('tutorial');
                        }
                    }} 
                />
            )}
            
            {viewMode === 'mission0' && introMission ? (
                <MissionModal mission={introMission} isOpen={true} onClose={() => setViewMode('tutorial')} onComplete={() => { handleMissionComplete(introMission.id); setViewMode('tutorial'); }} language={lang} isCompleted={false} />
            ) : viewMode === 'mission0' && !introMission ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-red-500 font-bold z-50 flex-col gap-4">
                    <div>ERROR: NO SE ENCONTRÓ MISIÓN INTRODUCTORIA</div>
                    <button onClick={() => setViewMode('map')} className="border border-red-500 px-4 py-2 hover:bg-red-900/20">SALTAR AL MAPA</button>
                </div>
            ) : null}

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
                            <button onClick={() => setShowExpansionConfig(true)} className="hidden md:flex items-center gap-2 px-3 py-1 border border-cyan-700 bg-slate-900/50 text-cyan-400 hover:bg-cyan-900/80 rounded transition-colors" title="Configurar Expansiones"><span className="text-lg">📦</span></button>
                            <div className="text-right hidden lg:block"><div className="text-[10px] text-cyan-600 font-bold">{t.header.biohazard}</div><div className="text-xs text-cyan-300 tracking-widest">{t.header.clearance}</div></div>
                            <div className="flex items-center gap-3 border-l border-cyan-900 pl-6">
                                <div className="flex flex-col items-end mr-2">{isSaving ? <div className="text-[9px] font-bold tracking-widest text-yellow-500 animate-pulse">{t.header.saving}</div> : <div className="text-[9px] font-bold tracking-widest text-emerald-500/80">{t.header.saved}</div>}</div>
                                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50 transition-colors">{lang.toUpperCase()}</button>
                                <button onClick={handleLogout} className="text-xs bg-red-900/20 text-red-400 border border-red-900 px-3 py-1 hover:bg-red-900/40 transition-colors">{t.header.logout}</button>
                            </div>
                        </div>
                    </header>
                    
                    <div className="flex-1 flex overflow-hidden relative">
                        <aside className={`flex-none bg-slate-900 border-r border-cyan-900 flex flex-col z-20 shadow-xl overflow-hidden relative transition-all duration-300 ${isSidebarCollapsed ? 'w-12' : 'w-80'}`}>
                            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute top-1/2 -right-3 w-6 h-12 bg-cyan-900 border border-cyan-600 rounded-l flex items-center justify-center z-50 hover:bg-cyan-800 transition-colors" style={{ transform: 'translateY(-50%)' }}><span className="text-xs text-cyan-200">{isSidebarCollapsed ? '›' : '‹'}</span></button>
                            {!isSidebarCollapsed ? (
                                <>
                                    <div className="p-4 border-b border-cyan-900 bg-red-950/20 flex justify-between items-center">
                                        <div className="flex flex-col"><span className="text-[9px] font-bold text-red-500 tracking-widest">AMENAZA</span><span className="text-sm font-black text-red-600 tracking-tighter">CRÍTICO</span></div>
                                        <div className="relative w-14 h-14 flex items-center justify-center"><svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#1e293b" strokeWidth="4" fill="transparent" /><circle cx="22" cy="22" r="18" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" /></svg><span className="absolute text-[10px] font-bold text-emerald-400">{progressPercentage}%</span></div>
                                    </div>
                                    <div className="p-3 border-b border-cyan-900">
                                        <button id="tutorial-bunker-btn" onClick={() => setViewMode('bunker')} className={`w-full py-3 border-2 flex items-center justify-center gap-2 transition-all duration-300 group relative overflow-hidden ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/10 hover:bg-lime-900/30 text-lime-400' : 'border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/30 text-cyan-300'}`}>
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${playerAlignment === 'ZOMBIE' ? 'bg-[linear-gradient(45deg,transparent_25%,rgba(132,204,22,0.1)_50%,transparent_75%)]' : 'bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)]'} bg-[length:250%_250%] animate-[shimmer_2s_linear_infinite]`}></div>
                                            <span className="text-xl group-hover:scale-110 transition-transform">{playerAlignment === 'ZOMBIE' ? '☣' : '🛡'}</span><span className="font-bold tracking-widest text-[10px]">{playerAlignment === 'ZOMBIE' ? t.sidebar.hiveBtn : t.sidebar.bunkerBtn}</span>
                                        </button>
                                    </div>
                                    <div id="tutorial-sidebar-missions" className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-cyan-900">
                                        <h4 className="text-[10px] font-bold text-cyan-600 uppercase mb-2 tracking-widest border-b border-cyan-900 pb-1">{t.sidebar.activeMissions}</h4>
                                        <div className="space-y-1">
                                            {groupedMissions.galactus.length > 0 && (<div className="mb-2 border border-purple-600 bg-purple-900/20 animate-pulse"><div className="p-1 bg-purple-900/80 text-white text-[9px] font-black tracking-widest uppercase text-center">⚠ OMEGA ⚠</div><div className="p-1">{groupedMissions.galactus.map(m => (<div key={m.id} onClick={() => setSelectedMission(m)} className="p-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer text-center shadow-sm border border-purple-400 mb-1">{m.title}</div>))}</div></div>)}
                                            {Object.entries(groupedMissions).map(([zoneKey, missions]) => {
                                                if (zoneKey === 'galactus' || missions.length === 0) return null;
                                                const isExpanded = expandedZones.has(zoneKey);
                                                const factionLabel = (() => { if (zoneKey.startsWith('shield_')) { const baseFaction = zoneKey.replace('shield_', ''); const baseName = t.factions[baseFaction as keyof typeof t.factions]?.name || baseFaction.toUpperCase(); return `S.H.I.E.L.D. (${baseName})`; } return t.factions[zoneKey as keyof typeof t.factions]?.name || zoneKey.toUpperCase(); })();
                                                const isBlocked = worldStage === 'GALACTUS';
                                                return (
                                                    <div key={zoneKey} className={`mb-1 border border-cyan-900/30 bg-slate-900/30 ${isBlocked ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                        <button type="button" onClick={() => toggleZone(zoneKey)} className="w-full flex justify-between items-center p-2 bg-slate-800/80 hover:bg-cyan-900/30 transition-colors border-b border-cyan-900/30"><span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest truncate max-w-[140px]">{factionLabel}</span><div className="flex items-center gap-1"><span className="text-[9px] bg-cyan-900/50 text-cyan-200 px-1 py-0.5 rounded font-mono border border-cyan-700">{missions.length}</span><span className={`text-[8px] text-cyan-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span></div></button>
                                                        {isExpanded && (<div className="p-1 space-y-1 animate-fade-in bg-slate-950/20">{missions.map(m => { const isShield = m.type === 'SHIELD_BASE'; const isIntro = m.type === 'INTRODUCTORY'; const isBoss = m.type && m.type.startsWith('BOSS'); let borderClass = 'border-yellow-500/30 bg-yellow-900/5 hover:bg-yellow-900/20'; let barClass = 'bg-yellow-500'; let textClass = 'text-yellow-200'; if (isBoss) { borderClass = 'border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40 animate-pulse'; barClass = 'bg-purple-500'; textClass = 'text-purple-200'; } else if (isShield) { borderClass = 'border-cyan-500/30 bg-cyan-900/5 hover:bg-cyan-900/20'; barClass = 'bg-cyan-500'; textClass = 'text-cyan-200'; } else if (isIntro) { borderClass = 'border-emerald-500/30 bg-emerald-900/5 hover:bg-emerald-900/20'; barClass = 'bg-emerald-500'; textClass = 'text-emerald-200'; } return (<div key={m.id} onClick={() => handleMissionSelectWrapper(m)} className={`p-2 border cursor-pointer transition-all group relative overflow-hidden ${borderClass}`}><div className={`absolute left-0 top-0 bottom-0 w-1 ${barClass} group-hover:w-1.5 transition-all`}></div><div className={`text-xs font-bold ${textClass} group-hover:text-white uppercase tracking-wider pl-2 truncate`}>{m.title || 'UNKNOWN MISSION'}</div></div>); })}</div>)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center py-4 gap-4 h-full"><div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center bg-red-900/20 animate-pulse" title="Nivel de Amenaza: CRÍTICO"><span className="text-xs">⚠</span></div><button onClick={() => setViewMode('bunker')} className="w-8 h-8 rounded border border-cyan-500 flex items-center justify-center hover:bg-cyan-900/50 text-cyan-300" title="Búnker"><span className="text-xs">🛡</span></button><div className="flex-1 w-full flex flex-col items-center justify-end pb-4"><div className="relative w-8 h-8 flex items-center justify-center" title={`Progreso: ${progressPercentage}%`}><svg className="w-full h-full transform -rotate-90"><circle cx="16" cy="16" r="14" stroke="#1e293b" strokeWidth="3" fill="transparent" /><circle cx="16" cy="16" r="14" stroke="#10b981" strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 - (progressPercentage / 100) * 2 * Math.PI * 14} /></svg></div></div></div>
                            )}
                        </aside>

                        <main className="flex-1 relative bg-slate-950 overflow-hidden">
                            {viewMode === 'map' && (
                                <>
                                    <USAMap language={lang} missions={visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={handleMissionComplete} onMissionSelect={handleMissionSelectWrapper} onBunkerClick={() => setViewMode('bunker')} factionStates={FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} surferTurnCount={surferTurnCount} />
                                    
                                    {isEditorMode && (
                                        <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 bg-slate-900/95 p-4 border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-sm min-w-[200px] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
                                            <h3 className="text-xs font-bold text-cyan-400 border-b border-cyan-800 pb-1 mb-2 tracking-widest uppercase">EDITOR TOOLS</h3>
                                            <button onClick={() => setShowMissionEditor(true)} className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 text-[10px] font-bold py-2 px-3 border border-cyan-700 uppercase tracking-wider transition-colors">+ CREAR MISIÓN</button>
                                            <button onClick={() => setShowCharacterEditor(true)} className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-[10px] font-bold py-2 px-3 border border-blue-700 uppercase tracking-wider transition-colors">+ CREAR PERSONAJE</button>
                                            <button onClick={() => setShowDbManager(true)} className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[10px] font-bold py-2 px-3 border border-purple-700 uppercase tracking-wider transition-colors">⚙ GESTOR BBDD (ADMIN)</button>
                                            <div className="h-px bg-cyan-900 my-1"></div>
                                            <button onClick={() => handleSimulateProgress(5)} className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold py-2 px-3 border border-emerald-700 uppercase tracking-wider transition-colors">+5 MISIONES (SIM)</button>
                                            <button onClick={handleResetProgress} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 border border-red-700 uppercase tracking-wider transition-colors">RESET PROGRESO</button>
                                            <div className="mt-2 text-[9px] text-gray-500 font-mono text-center border-t border-gray-800 pt-2">SURFER TURN: <span className="text-white font-bold">{surferTurnCount}</span></div>
                                        </div>
                                    )}
                                </>
                            )}
                            {viewMode === 'bunker' && (<BunkerInterior heroes={heroes} missions={visibleMissions.filter(m => m && !completedMissionIds.has(m.id))} onAssign={(heroId, missionId) => { const hIndex = heroes.findIndex(h => h.id === heroId); if(hIndex >= 0) { const newHeroes = [...heroes]; newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'DEPLOYED', assignedMissionId: missionId }; setHeroes(newHeroes); return true; } return false; }} onUnassign={(heroId) => { const hIndex = heroes.findIndex(h => h.id === heroId); if(hIndex >= 0) { const newHeroes = [...heroes]; newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'AVAILABLE', assignedMissionId: null }; setHeroes(newHeroes); } }} onAddHero={(hero) => setHeroes([...heroes, hero])} onToggleObjective={handleToggleHeroObjective} onBack={() => setViewMode('map')} language={lang} playerAlignment={playerAlignment} isEditorMode={isEditorMode} onTransformHero={handleTransformHero} onTickerUpdate={handleTickerUpdate} omegaCylinders={omegaCylinders} onFindCylinder={() => setOmegaCylinders(prev => prev + 1)} />)}
                            {viewMode === 'tutorial' && (<div className="absolute inset-0 z-40"><USAMap language={lang} missions={visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={() => {}} onMissionSelect={() => {}} onBunkerClick={() => {}} factionStates={FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} /><TutorialOverlay language={lang} onComplete={() => { if(user) localStorage.setItem(`shield_tutorial_seen_${user.uid}`, 'true'); setViewMode('map'); }} onStepChange={(stepKey) => { if (['roster', 'file', 'recruit'].includes(stepKey)) { setViewMode('bunker'); } }} /></div>)}
                            <NewsTicker alignment={playerAlignment || 'ALIVE'} worldStage={worldStage} urgentMessage={tickerMessage} />
                        </main>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;