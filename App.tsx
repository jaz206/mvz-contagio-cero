import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { translations } from './translations';
import { LoginScreen } from './components/LoginScreen';
import { StoryMode } from './components/StoryMode';
import { IntroSequence } from './components/IntroSequence';
import { TutorialOverlay } from './components/TutorialOverlay';
import { USAMap } from './components/USAMap';
import { BunkerInterior } from './components/BunkerInterior';
import { MissionModal } from './components/MissionModal';
import { EventModal } from './components/EventModal';
import { MissionEditor } from './components/MissionEditor';
import { NewsTicker } from './components/NewsTicker';
import { ExpansionSelector } from './components/ExpansionSelector';
import { ExpansionConfigModal } from './components/ExpansionConfigModal';
import { AdminStaffPanel } from './components/AdminStaffPanel';
import { MissionControlPanel } from './components/MissionControlPanel';
import { NotFound } from './components/NotFound';
import { Mission } from './types';
import { GAME_EXPANSIONS } from './data/gameContent';

const LOGO_SHIELD = 'https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg';
const LOGO_ZOMBIE = 'https://i.pinimg.com/736x/7f/31/38/7f31382d4a5c35daa4ba1768a366a917.jpg';

const buildGroupedMissions = (
    missions: Mission[],
    completedMissionIds: Set<string>,
    factionStates: Record<string, Set<string>>
) => {
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

    const activeMissions = missions.filter((mission) => !completedMissionIds.has(mission.id));
    const getFactionForState = (stateName: string) => {
        if (factionStates.magneto?.has(stateName)) return 'magneto';
        if (factionStates.kingpin?.has(stateName)) return 'kingpin';
        if (factionStates.hulk?.has(stateName)) return 'hulk';
        if (factionStates.doom?.has(stateName)) return 'doom';
        return 'neutral';
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

    Object.keys(groups).forEach((key) => {
        groups[key].sort((a, b) => {
            const roleA = a.missionRole || 'PRIMARY';
            const roleB = b.missionRole || 'PRIMARY';
            if (roleA !== roleB) return roleA === 'PRIMARY' ? -1 : 1;
            return a.title.localeCompare(b.title, 'es');
        });
    });

    return groups;
};

const GameLayout: React.FC<{ children: React.ReactNode; publishedPreviewMode?: boolean; sidebarGroupedMissions?: Record<string, Mission[]> }> = ({ children, publishedPreviewMode = false, sidebarGroupedMissions }) => {
    const { state, actions } = useGame();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const { lang, playerAlignment, completedMissionIds, isSaving, tickerMessage, worldStage, staffPermissions, isFullAdmin } = state;
    const currentUserLabel = state.staffAccount?.displayName
        || state.staffAccount?.email
        || state.user?.displayName
        || state.user?.email
        || (state.isGuest ? 'MODO LOCAL' : 'SIN SESION');
    const groupedMissions = sidebarGroupedMissions || state.groupedMissions;

    const t = translations[lang];
    const totalMissions = state.allMissions.length;
    const progressPercentage = Math.min(100, Math.round((completedMissionIds.size / Math.max(1, totalMissions)) * 100));
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
    const canEditMissions = staffPermissions.missions.edit;
    const canDeleteMissions = staffPermissions.missions.delete;

    React.useEffect(() => {
        document.body.setAttribute('data-alignment', playerAlignment || 'ALIVE');
    }, [playerAlignment]);

    React.useEffect(() => {
        setShowUserMenu(false);
    }, [state.selectedMission]);

    return (
        <div className="flex flex-col h-screen w-full font-sans overflow-hidden relative transition-colors duration-500">
            <MissionEditor
                isOpen={state.showMissionEditor}
                onClose={() => {
                    actions.setShowMissionEditor(false);
                    actions.setMissionToEdit(null);
                }}
                onSave={async () => {
                    actions.setCustomMissions(await import('./services/missionService').then((m) => m.getCustomMissions()));
                }}
                language={lang}
                initialData={state.missionToEdit}
                existingMissions={state.allMissions}
            />

            <AdminStaffPanel
                isOpen={state.showAdminPanel}
                onClose={() => actions.setShowAdminPanel(false)}
                currentAdminUid={state.staffAccount?.uid}
                introConfig={state.introConfig}
                onSaveIntroConfig={actions.handleSaveIntroConfig}
                storyConfig={state.storyConfig}
                onSaveStoryConfig={actions.handleSaveStoryConfig}
                missions={state.allMissions}
                zoneControlConfig={state.zoneControlConfig}
                onSaveZoneControlConfig={actions.handleSaveZoneControlConfig}
                omegaCylinders={state.omegaCylinders}
                onSetOmegaCylinders={(value) => actions.setOmegaCylinders(Math.max(0, Math.min(10, value)))}
            />

            <MissionControlPanel
                isOpen={state.showMissionControlPanel}
                onClose={() => actions.setShowMissionControlPanel(false)}
                language={lang}
                canCreate={staffPermissions.missions.create}
                canEdit={staffPermissions.missions.edit}
                canDelete={staffPermissions.missions.delete}
                isFullAdmin={isFullAdmin}
                onRepositoryUpdated={actions.setCustomMissions}
            />

            {state.activeGlobalEvent && (
                <EventModal
                    event={state.activeGlobalEvent}
                    isOpen={!!state.activeGlobalEvent}
                    onAcknowledge={actions.handleEventAcknowledge}
                    language={lang}
                    playerAlignment={playerAlignment}
                />
            )}

            {state.selectedMission && (
                <MissionModal
                    mission={state.selectedMission}
                    isOpen={!!state.selectedMission}
                    onClose={() => actions.setSelectedMission(null)}
                    onComplete={actions.handleMissionComplete}
                    onReactivate={actions.handleMissionReactivate}
                    language={lang}
                    isCompleted={completedMissionIds.has(state.selectedMission.id)}
                    isEditorMode={state.isEditorMode && !publishedPreviewMode}
                    onEdit={canEditMissions ? (mission) => {
                        actions.setMissionToEdit(mission);
                        actions.setShowMissionEditor(true);
                        actions.setSelectedMission(null);
                    } : undefined}
                    onDelete={canDeleteMissions ? actions.handleDeleteMission : undefined}
                />
            )}

            <ExpansionConfigModal
                isOpen={state.showExpansionConfig}
                onClose={() => actions.setShowExpansionConfig(false)}
                ownedExpansions={state.ownedExpansions}
                onToggle={actions.toggleExpansion}
                onToggleAll={actions.toggleAllExpansions}
                language={lang}
            />

            <header className="flex-none h-16 border-b border-cyan-900/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 z-30 relative overflow-visible">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/20 animate-scanline" />

                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 border-2 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600' : 'border-cyan-500'} rounded-full flex items-center justify-center overflow-hidden bg-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] relative`}>
                        <img
                            src={playerAlignment === 'ZOMBIE' ? LOGO_ZOMBIE : LOGO_SHIELD}
                            alt="Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-scan opacity-20 pointer-events-none" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black tracking-[0.25em] text-white leading-none drop-shadow-md">{t.header.project}</h1>
                        <div className="flex items-center gap-2">
                            <div className="text-[9px] text-red-500 font-black tracking-widest animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" /> {t.header.failure}
                            </div>
                            <span className="text-[8px] text-cyan-700 font-mono">SIGNAL_STRENGTH: 88%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={actions.toggleDimension} className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded transition-all duration-500 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/20 text-lime-400 hover:bg-lime-900/40' : 'border-cyan-500 bg-cyan-900/20 text-cyan-300 hover:bg-cyan-900/40'}`}>
                        <span className="text-lg">{playerAlignment === 'ZOMBIE' ? 'ZB' : 'AL'}</span>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[8px] font-bold tracking-widest opacity-70">DIMENSION</span>
                            <span className="text-[10px] font-bold">{playerAlignment === 'ZOMBIE' ? 'EARTH-Z' : 'EARTH-616'}</span>
                        </div>
                    </button>
                    <div className="text-right hidden lg:block">
                        <div className="text-[10px] text-cyan-600 font-bold">{t.header.biohazard}</div>
                        <div className="text-xs text-cyan-300 tracking-widest">{t.header.clearance}</div>
                    </div>
                    <div className="flex items-center gap-3 border-l border-cyan-900 pl-6">
                        <div className="flex flex-col items-end mr-2">
                            {isSaving ? (
                                <div className="text-[9px] font-bold tracking-widest text-yellow-500 animate-pulse">{t.header.saving}</div>
                            ) : (
                                <div className="text-[9px] font-bold tracking-widest text-emerald-500/80">{t.header.saved}</div>
                            )}
                        </div>
                        <button onClick={() => actions.setLang(lang === 'es' ? 'en' : 'es')} className="text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50 transition-colors">
                            {lang.toUpperCase()}
                        </button>
                        <div className="hidden xl:flex flex-col items-end mr-1">
                            <span className="text-[8px] font-bold tracking-[0.3em] text-cyan-700 uppercase">
                                {lang === 'es' ? 'Sesión' : 'Session'}
                            </span>
                            <span className="max-w-[220px] truncate text-[10px] font-mono text-cyan-200">
                                {currentUserLabel}
                            </span>
                        </div>
                        {isFullAdmin && (
                            <button onClick={() => actions.setShowAdminPanel(true)} className="text-xs bg-cyan-900/30 text-cyan-300 border border-cyan-700 px-3 py-1 hover:bg-cyan-900/50 transition-colors">
                                ADMIN
                            </button>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu((prev) => !prev)}
                                className="text-xs bg-slate-900/60 text-cyan-200 border border-cyan-900 px-3 py-1 hover:bg-slate-800 transition-colors"
                            >
                                {lang === 'es' ? 'USUARIO' : 'USER'}
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 top-10 z-50 w-64 border border-cyan-900 bg-slate-950/95 shadow-2xl p-2 flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            actions.setShowExpansionConfig(true);
                                        }}
                                        className="w-full text-left text-[11px] bg-cyan-900/20 text-cyan-300 border border-cyan-800 px-3 py-2 hover:bg-cyan-900/40 transition-colors"
                                    >
                                        {lang === 'es' ? 'Seleccionar expansiones' : 'Select expansions'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            const confirmed = window.confirm(lang === 'es'
                                                ? 'Esto borrara tu avance guardado y volveras a empezar desde la intro. Quieres seguir?'
                                                : 'This will erase your saved progress and restart from the intro. Continue?');
                                            if (confirmed) {
                                                actions.handleRestartCampaign();
                                            }
                                        }}
                                        className="w-full text-left text-[11px] bg-amber-900/20 text-amber-300 border border-amber-800 px-3 py-2 hover:bg-amber-900/40 transition-colors"
                                    >
                                        {lang === 'es' ? 'Reiniciar partida' : 'Restart campaign'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            actions.handleLogout();
                                        }}
                                        className="w-full text-left text-[11px] bg-red-900/20 text-red-400 border border-red-900 px-3 py-2 hover:bg-red-900/40 transition-colors"
                                    >
                                        {t.header.logout}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <aside className={`flex-none glass-panel border-r border-cyan-900/50 flex flex-col z-20 shadow-2xl overflow-hidden relative transition-all duration-300 ${state.isSidebarCollapsed ? 'w-12' : 'w-80'}`}>
                    <button onClick={() => actions.setIsSidebarCollapsed(!state.isSidebarCollapsed)} className="absolute top-1/2 -right-3 w-6 h-12 bg-cyan-900 border border-cyan-600 rounded-l flex items-center justify-center z-50 hover:bg-cyan-800 transition-colors" style={{ transform: 'translateY(-50%)' }}>
                        <span className="text-xs text-cyan-200">{state.isSidebarCollapsed ? '>' : '<'}</span>
                    </button>
                    {!state.isSidebarCollapsed ? (
                        <>
                            <div className="p-4 border-b border-cyan-900/50 bg-red-950/20 flex justify-between items-center font-sans">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-red-500 tracking-widest">AMENAZA</span>
                                    <span className="text-sm font-black text-red-600 tracking-tighter">CRÍTICO</span>
                                </div>
                                <div className="relative w-14 h-14 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                                        <circle cx="22" cy="22" r="18" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                                        <circle cx="22" cy="22" r="18" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-emerald-400">{progressPercentage}%</span>
                                </div>
                            </div>
                            <div className="p-3 border-b border-cyan-900">
                                <button id="tutorial-bunker-btn" onClick={() => navigate('/bunker')} aria-label={playerAlignment === 'ZOMBIE' ? 'NEXO COLMENA' : 'ACCESO BÚNKER'} className={`w-full py-3 border-2 flex items-center justify-center gap-3 transition-all duration-300 group relative overflow-hidden ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/10 hover:bg-lime-900/30 text-lime-400' : 'border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/30 text-cyan-300'}`}>
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${playerAlignment === 'ZOMBIE' ? 'bg-[linear-gradient(45deg,transparent_25%,rgba(132,204,22,0.1)_50%,transparent_75%)]' : 'bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)]'} bg-[length:250%_250%] animate-[shimmer_2s_linear_infinite]`} />
                                    <img
                                        src="/shield-logo.png"
                                        alt="SHIELD"
                                        className={`w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.65)] ${playerAlignment === 'ZOMBIE' ? 'opacity-80' : 'opacity-100'}`}
                                    />
                                    <span className="sr-only">{playerAlignment === 'ZOMBIE' ? t.sidebar.hiveBtn : t.sidebar.bunkerBtn}</span>
                                </button>
                            </div>
                            <div id="tutorial-sidebar-missions" className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-cyan-900">
                                <h4 className="text-[10px] font-bold text-cyan-600 uppercase mb-2 tracking-widest border-b border-cyan-900 pb-1">{t.sidebar.activeMissions}</h4>
                                <div className="space-y-1">
                                    {groupedMissions.galactus.length > 0 && (
                                        <div className="mb-2 border border-purple-600 bg-purple-900/20 animate-pulse">
                                            <div className="p-1 bg-purple-900/80 text-white text-[9px] font-black tracking-widest uppercase text-center">OMEGA</div>
                                            <div className="p-1">
                                                {groupedMissions.galactus.map((mission) => (
                                                    <div key={mission.id} onClick={() => actions.setSelectedMission(mission)} className="p-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer text-center shadow-sm border border-purple-400 mb-1">
                                                        {mission.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {Object.entries(groupedMissions).map(([zoneKey, missions]) => {
                                        if (zoneKey === 'galactus' || missions.length === 0) return null;
                                        const isExpanded = state.expandedZones.has(zoneKey);
                                        const factionLabel = (() => {
                                            if (zoneKey.startsWith('shield_')) {
                                                const baseFaction = zoneKey.replace('shield_', '');
                                                const baseName = t.factions[baseFaction as keyof typeof t.factions]?.name || baseFaction.toUpperCase();
                                                return `S.H.I.E.L.D. (${baseName})`;
                                            }
                                            return t.factions[zoneKey as keyof typeof t.factions]?.name || zoneKey.toUpperCase();
                                        })();
                                        const isBlocked = worldStage === 'GALACTUS';

                                        return (
                                            <div key={zoneKey} className={`mb-1 border border-cyan-900/30 bg-slate-900/30 ${isBlocked ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                <button type="button" onClick={() => actions.toggleZone(zoneKey)} className="w-full flex justify-between items-center p-2 bg-slate-800/80 hover:bg-cyan-900/30 transition-colors border-b border-cyan-900/30">
                                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest truncate max-w-[140px]">{factionLabel}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] bg-cyan-900/50 text-cyan-200 px-1 py-0.5 rounded font-mono border border-cyan-700">{missions.length}</span>
                                                        <span className={`text-[8px] text-cyan-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>v</span>
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="p-1 space-y-1 animate-fade-in bg-slate-950/20">
                                                        {missions.map((mission) => {
                                                            const isShield = mission.type === 'SHIELD_BASE';
                                                            const isIntro = mission.type === 'INTRODUCTORY';
                                                            const isBoss = mission.type && mission.type.startsWith('BOSS');
                                                            const isOptional = (mission.missionRole || 'PRIMARY') === 'OPTIONAL';
                                                            let borderClass = 'border-yellow-500/30 bg-yellow-900/5 hover:bg-yellow-900/20';
                                                            let barClass = 'bg-yellow-500';
                                                            let textClass = 'text-yellow-200';

                                                            if (isBoss) {
                                                                borderClass = 'border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40 animate-pulse';
                                                                barClass = 'bg-purple-500';
                                                                textClass = 'text-purple-200';
                                                            } else if (isShield) {
                                                                borderClass = 'border-cyan-500/30 bg-cyan-900/5 hover:bg-cyan-900/20';
                                                                barClass = 'bg-cyan-500';
                                                                textClass = 'text-cyan-200';
                                                            } else if (isIntro) {
                                                                borderClass = 'border-emerald-500/30 bg-emerald-900/5 hover:bg-emerald-900/20';
                                                                barClass = 'bg-emerald-500';
                                                                textClass = 'text-emerald-200';
                                                            }

                                                            return (
                                                                <div key={mission.id} onClick={() => actions.handleMissionSelect(mission)} className={`p-2 border cursor-pointer transition-all group relative overflow-hidden ${borderClass}`}>
                                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${barClass} group-hover:w-1.5 transition-all`} />
                                                                    <div className="flex items-center gap-2 pl-2">
                                                                        <div className={`flex-1 text-xs font-bold ${textClass} group-hover:text-white uppercase tracking-wider truncate`}>{mission.title || 'UNKNOWN MISSION'}</div>
                                                                        <span className={`text-[8px] font-black uppercase border px-1.5 py-0.5 ${isOptional ? 'border-amber-700 text-amber-300' : 'border-sky-700 text-sky-300'}`}>
                                                                            {isOptional ? 'OP' : 'PR'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-4 gap-4 h-full">
                            <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center bg-red-900/20 animate-pulse" title="Nivel de amenaza: CRÍTICO">
                                <span className="text-xs">!</span>
                            </div>
                            <button onClick={() => navigate('/bunker')} className="w-8 h-8 rounded border border-cyan-500 flex items-center justify-center hover:bg-cyan-900/50 text-cyan-300" title="Bunker">
                                <span className="text-xs">B</span>
                            </button>
                        </div>
                    )}
                </aside>

                <main className="flex-1 relative bg-slate-950 overflow-hidden">{children}</main>
            </div>

            <NewsTicker alignment={playerAlignment || 'ALIVE'} worldStage={worldStage} urgentMessage={tickerMessage} />
        </div>
    );
};

const GameContent: React.FC = () => {
    const { state, actions } = useGame();
    const navigate = useNavigate();
    const location = useLocation();
    const [previewPublishedMode, setPreviewPublishedMode] = React.useState(false);
    const { loading, loadingAuth, lang, playerAlignment, heroes, completedMissionIds, omegaCylinders, worldStage, isEditorMode, surferTurnCount, isFullAdmin, staffPermissions } = state;
    const routeAlignment = (location.state as { alignment?: 'ALIVE' | 'ZOMBIE' } | null)?.alignment || null;
    const effectiveAlignment = playerAlignment || routeAlignment;

    const canCreateMissions = staffPermissions.missions.create;
    const canManageMissions = staffPermissions.missions.view || staffPermissions.missions.create || staffPermissions.missions.edit || staffPermissions.missions.delete;
    const tutorialKey = state.user ? `shield_tutorial_seen_${state.user.uid}` : 'shield_tutorial_seen_guest';
    const hasSeenTutorial = !!localStorage.getItem(tutorialKey);
    const hasCompletedIntroMission = !!(state.introMission && completedMissionIds.has(state.introMission.id));
    const currentFlowStep = state.user
        ? localStorage.getItem(`shield_flow_step_${state.user.uid}`)
        : localStorage.getItem('shield_flow_step_guest');
    const setupExitRoute = currentFlowStep === 'mission0'
        ? '/mission0'
        : currentFlowStep === 'tutorial'
            ? '/tutorial'
            : currentFlowStep === 'map'
                ? '/map'
                : '/intro';
    const shouldSkipSetup = !!effectiveAlignment
        && heroes.length > 0
        && (state.isStartingCampaign
            || currentFlowStep === 'intro'
            || currentFlowStep === 'mission0'
            || currentFlowStep === 'tutorial'
            || currentFlowStep === 'map');
    const isPublishedPreviewActive = isEditorMode && previewPublishedMode;
    const publishedViewMissions = React.useMemo(
        () => state.visibleMissions.filter((mission) => (mission.status || 'PUBLISHED') === 'PUBLISHED'),
        [state.visibleMissions]
    );
    const mapMissions = isPublishedPreviewActive ? publishedViewMissions : state.visibleMissions;
    const bunkerMissions = mapMissions.filter((mission) => mission && !completedMissionIds.has(mission.id));
    const sidebarGroupedMissions = React.useMemo(
        () => buildGroupedMissions(mapMissions, completedMissionIds, state.FACTION_STATES),
        [mapMissions, completedMissionIds, state.FACTION_STATES]
    );

    React.useEffect(() => {
        if (location.pathname === '/setup' && routeAlignment && playerAlignment !== routeAlignment) {
            actions.setPlayerAlignment(routeAlignment);
        }
    }, [actions, location.pathname, playerAlignment, routeAlignment]);

    React.useEffect(() => {
        if (!isEditorMode) {
            setPreviewPublishedMode(false);
        }
    }, [isEditorMode]);

    React.useEffect(() => {
        if (
            isPublishedPreviewActive
            && state.selectedMission
            && (state.selectedMission.status || 'PUBLISHED') !== 'PUBLISHED'
        ) {
            actions.setSelectedMission(null);
        }
    }, [actions, isPublishedPreviewActive, state.selectedMission]);

    if (loading || loadingAuth) {
        return <div className="bg-slate-950 text-cyan-500 h-screen flex items-center justify-center font-mono">LOADING SHIELD OS...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<LoginScreen onLocalAccess={actions.handleGuestLogin} language={lang} setLanguage={actions.setLang} />} />

            <Route path="/story" element={<StoryMode language={lang} slides={state.storyConfig.slides} onComplete={actions.handleStoryChoice} onSkip={() => { actions.setStartStoryAtChoice(true); if (state.user) { localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'story'); } else { localStorage.setItem('shield_flow_step_guest', 'story'); } navigate('/story', { replace: true }); }} startAtChoice={state.startStoryAtChoice} />} />

            <Route path="/setup" element={effectiveAlignment ? (shouldSkipSetup ? <Navigate to={setupExitRoute} replace /> : <ExpansionSelector language={lang} playerAlignment={effectiveAlignment} onConfirm={actions.handleExpansionConfirm} onBack={() => { actions.setPlayerAlignment(null); actions.setStartStoryAtChoice(true); if (state.user) { localStorage.removeItem(`shield_alignment_${state.user.uid}`); localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'story'); } else { localStorage.setItem('shield_flow_step_guest', 'story'); } navigate('/story'); }} ownedExpansions={state.ownedExpansions} onToggleExpansion={actions.toggleExpansion} onToggleAllExpansions={actions.toggleAllExpansions} />) : <Navigate to="/" />} />

            <Route path="/intro" element={effectiveAlignment ? <IntroSequence language={lang} playerAlignment={effectiveAlignment} slides={effectiveAlignment === 'ZOMBIE' ? state.introConfig.zombie : state.introConfig.alive} onComplete={() => { actions.setIsStartingCampaign(false); if (state.introMission && !hasCompletedIntroMission) { if (state.user) { localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'mission0'); } else { localStorage.setItem('shield_flow_step_guest', 'mission0'); } navigate('/mission0'); } else if (!hasSeenTutorial) { if (state.user) { localStorage.removeItem(`shield_setup_done_${state.user.uid}`); localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'tutorial'); } else { localStorage.removeItem('shield_setup_done_guest'); localStorage.setItem('shield_flow_step_guest', 'tutorial'); } navigate('/tutorial'); } else { if (state.user) { localStorage.removeItem(`shield_setup_done_${state.user.uid}`); localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'map'); } else { localStorage.removeItem('shield_setup_done_guest'); localStorage.setItem('shield_flow_step_guest', 'map'); } navigate('/map'); } }} /> : <Navigate to="/" />} />

            <Route path="/mission0" element={(effectiveAlignment && state.introMission) ? <MissionModal mission={state.introMission} isOpen={true} onClose={() => { if (state.user) { localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'map'); } else { localStorage.setItem('shield_flow_step_guest', 'map'); } navigate('/map'); }} onComplete={async () => { await actions.handleMissionComplete(state.introMission!.id); if (state.user) { localStorage.removeItem(`shield_setup_done_${state.user.uid}`); localStorage.setItem(`shield_flow_step_${state.user.uid}`, hasSeenTutorial ? 'map' : 'tutorial'); } else { localStorage.removeItem('shield_setup_done_guest'); localStorage.setItem('shield_flow_step_guest', hasSeenTutorial ? 'map' : 'tutorial'); } navigate(hasSeenTutorial ? '/map' : '/tutorial'); }} language={lang} isCompleted={hasCompletedIntroMission} /> : <Navigate to="/map" />} />

            <Route
                path="/map"
                element={
                    <GameLayout publishedPreviewMode={isPublishedPreviewActive} sidebarGroupedMissions={sidebarGroupedMissions}>
                        <USAMap language={lang} missions={mapMissions} completedMissionIds={completedMissionIds} onMissionComplete={actions.handleMissionComplete} onMissionSelect={actions.handleMissionSelect} onBunkerClick={() => navigate('/bunker')} factionStates={state.FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} surferTurnCount={surferTurnCount} controlledZones={state.controlledZones} />
                        {isEditorMode && canManageMissions && (
                            <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 bg-slate-900/95 p-4 border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-sm min-w-[220px] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
                                <h3 className="text-xs font-bold text-cyan-400 border-b border-cyan-800 pb-1 mb-2 tracking-widest uppercase">
                                    {isFullAdmin ? 'Admin' : 'Editor'} Misiones
                                </h3>
                                <button
                                    onClick={() => setPreviewPublishedMode((prev) => !prev)}
                                    className={`${isPublishedPreviewActive ? 'bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border-emerald-700' : 'bg-slate-900/60 hover:bg-slate-800 text-slate-100 border-slate-700'} text-[10px] font-bold py-2 px-3 border uppercase tracking-wider transition-colors`}
                                >
                                    {isPublishedPreviewActive ? 'Volver a admin' : 'Modo publicado'}
                                </button>
                                {canCreateMissions && (
                                    <button onClick={() => actions.setShowMissionEditor(true)} className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 text-[10px] font-bold py-2 px-3 border border-cyan-700 uppercase tracking-wider transition-colors">
                                        + Crear Mision
                                    </button>
                                )}
                                <button onClick={() => actions.setShowMissionControlPanel(true)} className="bg-slate-900/60 hover:bg-slate-800 text-slate-100 text-[10px] font-bold py-2 px-3 border border-slate-700 uppercase tracking-wider transition-colors">
                                    Panel Misiones
                                </button>
                                {isFullAdmin && (
                                    <button onClick={() => actions.setShowAdminPanel(true)} className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[10px] font-bold py-2 px-3 border border-purple-700 uppercase tracking-wider transition-colors">
                                        Gestionar Editores
                                    </button>
                                )}
                                <div className="h-px bg-cyan-900 my-1" />
                                <div className={`text-[9px] font-mono text-center border px-2 py-2 ${isPublishedPreviewActive ? 'border-emerald-700 text-emerald-300 bg-emerald-950/20' : 'border-cyan-900 text-cyan-400 bg-black/20'}`}>
                                    {isPublishedPreviewActive ? 'Viendo modo publicado' : 'Viendo modo admin/editor'}
                                </div>
                                <div className="text-[9px] text-cyan-400 font-mono text-center">
                                    Borrado: {staffPermissions.missions.delete ? 'ACTIVO' : 'SOLO ADMIN'}
                                </div>
                                {isFullAdmin && (
                                    <>
                                        <button onClick={() => actions.handleSimulateProgress(5)} className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold py-2 px-3 border border-emerald-700 uppercase tracking-wider transition-colors">
                                            +5 Misiones
                                        </button>
                                        <button onClick={actions.handleResetProgress} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 border border-red-700 uppercase tracking-wider transition-colors">
                                            Reset Progreso
                                        </button>
                                    </>
                                )}
                                <div className="mt-2 text-[9px] text-gray-500 font-mono text-center border-t border-gray-800 pt-2">
                                    SURFER TURN: <span className="text-white font-bold">{surferTurnCount}</span>
                                </div>
                            </div>
                        )}
                    </GameLayout>
                }
            />

            <Route path="/bunker" element={<GameLayout publishedPreviewMode={isPublishedPreviewActive} sidebarGroupedMissions={sidebarGroupedMissions}><BunkerInterior heroes={heroes} missions={bunkerMissions} completedMissions={mapMissions.filter((mission) => completedMissionIds.has(mission.id))} onAssign={(heroId, missionId) => { const heroIndex = heroes.findIndex((hero) => hero.id === heroId); if (heroIndex >= 0) { const nextHeroes = [...heroes]; nextHeroes[heroIndex] = { ...nextHeroes[heroIndex], status: 'DEPLOYED', assignedMissionId: missionId }; actions.setHeroes(nextHeroes); return true; } return false; }} onUnassign={(heroId) => { const heroIndex = heroes.findIndex((hero) => hero.id === heroId); if (heroIndex >= 0) { const nextHeroes = [...heroes]; nextHeroes[heroIndex] = { ...nextHeroes[heroIndex], status: 'AVAILABLE', assignedMissionId: null }; actions.setHeroes(nextHeroes); } }} onAddHero={(hero) => actions.setHeroes([...heroes, hero])} onToggleObjective={actions.handleToggleHeroObjective} onBack={() => navigate(currentFlowStep === 'tutorial' ? '/tutorial' : '/map')} language={lang} playerAlignment={playerAlignment} isEditorMode={!isPublishedPreviewActive && isEditorMode} onTransformHero={actions.handleTransformHero} onTickerUpdate={actions.handleTickerUpdate} omegaCylinders={omegaCylinders} onSearchAllies={() => actions.setOmegaCylinders((prev) => Math.max(0, prev - 1))} ownedExpansions={state.ownedExpansions} /></GameLayout>} />

            <Route path="/tutorial" element={<div className="absolute inset-0 z-40"><USAMap language={lang} missions={state.visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={() => { }} onMissionSelect={() => { }} onBunkerClick={() => navigate('/bunker')} factionStates={state.FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} controlledZones={state.controlledZones} /><TutorialOverlay language={lang} onComplete={() => { localStorage.setItem(tutorialKey, 'true'); if (state.user) { localStorage.setItem(`shield_flow_step_${state.user.uid}`, 'map'); } else { localStorage.setItem('shield_flow_step_guest', 'map'); } navigate('/map'); }} onStepChange={(stepKey) => { if (['roster', 'file', 'recruit'].includes(stepKey)) { navigate('/bunker'); } }} /></div>} />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
    );
};

const App: React.FC = () => (
    <BrowserRouter>
        <GameProvider>
            <GameContent />
        </GameProvider>
    </BrowserRouter>
);

export default App;
