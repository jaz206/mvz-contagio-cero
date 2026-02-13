import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { CharacterEditor } from './components/CharacterEditor';
import { NewsTicker } from './components/NewsTicker';
import { ExpansionSelector } from './components/ExpansionSelector';
import { ExpansionConfigModal } from './components/ExpansionConfigModal';
import { DatabaseManager } from './components/DatabaseManager';
import { GAME_EXPANSIONS } from './data/gameContent';

// URLs de los logos
const LOGO_SHIELD = "https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg";
const LOGO_ZOMBIE = "https://i.pinimg.com/736x/7f/31/38/7f31382d4a5c35daa4ba1768a366a917.jpg";

const GameLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state, actions } = useGame();
    const navigate = useNavigate();
    const {
        lang, playerAlignment, completedMissionIds,
        isSaving, tickerMessage, worldStage
    } = state;

    const t = translations[lang];
    const totalMissions = state.customMissions.length + 7;
    const progressPercentage = Math.min(100, Math.round((completedMissionIds.size / Math.max(1, totalMissions)) * 100));
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className={`flex flex-col h-screen w-full bg-slate-950 text-cyan-400 font-sans overflow-hidden relative ${playerAlignment === 'ZOMBIE' ? 'animate-pulse-slow grayscale-[0.3] sepia-[0.2] contrast-125' : ''}`}>
            <CharacterEditor isOpen={state.showCharacterEditor} onClose={() => actions.setShowCharacterEditor(false)} language={lang} />
            <MissionEditor
                isOpen={state.showMissionEditor}
                onClose={() => { actions.setShowMissionEditor(false); actions.setMissionToEdit(null); }}
                onSave={async () => {
                    actions.setCustomMissions(await import('./services/missionService').then(m => m.getCustomMissions()));
                }}
                language={lang}
                initialData={state.missionToEdit}
                existingMissions={state.allMissions}
            />

            {state.activeGlobalEvent && <EventModal event={state.activeGlobalEvent} isOpen={!!state.activeGlobalEvent} onAcknowledge={actions.handleEventAcknowledge} language={lang} playerAlignment={playerAlignment} />}

            {state.selectedMission && <MissionModal
                mission={state.selectedMission}
                isOpen={!!state.selectedMission}
                onClose={() => actions.setSelectedMission(null)}
                onComplete={actions.handleMissionComplete}
                onReactivate={actions.handleMissionReactivate}
                language={lang}
                isCompleted={completedMissionIds.has(state.selectedMission.id)}
                isEditorMode={state.isEditorMode}
                onEdit={(m) => { actions.setMissionToEdit(m); actions.setShowMissionEditor(true); actions.setSelectedMission(null); }}
                onDelete={actions.handleDeleteMission}
            />}

            <DatabaseManager isOpen={state.showDbManager} onClose={() => actions.setShowDbManager(false)} language={lang} />
            <ExpansionConfigModal
                isOpen={state.showExpansionConfig}
                onClose={() => actions.setShowExpansionConfig(false)}
                ownedExpansions={state.ownedExpansions}
                onToggle={actions.toggleExpansion}
                onToggleAll={actions.toggleAllExpansions}
                language={lang}
            />

            <header className="flex-none h-16 border-b border-cyan-900 bg-slate-900/90 flex items-center justify-between px-6 z-30 relative">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 border-2 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600' : 'border-cyan-500'} rounded-full flex items-center justify-center overflow-hidden bg-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]`}>
                        <img
                            src={playerAlignment === 'ZOMBIE' ? LOGO_ZOMBIE : LOGO_SHIELD}
                            alt="Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div><h1 className="text-xl font-bold tracking-[0.2em] text-cyan-100 leading-none">{t.header.project}</h1><div className="text-[10px] text-red-500 font-bold tracking-widest animate-pulse">{t.header.failure}</div></div>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={actions.toggleDimension} className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded transition-all duration-500 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/20 text-lime-400 hover:bg-lime-900/40' : 'border-cyan-500 bg-cyan-900/20 text-cyan-300 hover:bg-cyan-900/40'}`}>
                        <span className="text-lg">{playerAlignment === 'ZOMBIE' ? '🧟' : '🛡️'}</span>
                        <div className="flex flex-col items-start leading-none"><span className="text-[8px] font-bold tracking-widest opacity-70">DIMENSION</span><span className="text-[10px] font-bold">{playerAlignment === 'ZOMBIE' ? 'EARTH-Z' : 'EARTH-616'}</span></div>
                    </button>
                    <button onClick={() => actions.setShowExpansionConfig(true)} className="hidden md:flex items-center gap-2 px-3 py-1 border border-cyan-700 bg-slate-900/50 text-cyan-400 hover:bg-cyan-900/80 rounded transition-colors" title="Configurar Expansiones"><span className="text-lg">📦</span></button>
                    <div className="text-right hidden lg:block"><div className="text-[10px] text-cyan-600 font-bold">{t.header.biohazard}</div><div className="text-xs text-cyan-300 tracking-widest">{t.header.clearance}</div></div>
                    <div className="flex items-center gap-3 border-l border-cyan-900 pl-6">
                        <div className="flex flex-col items-end mr-2">{isSaving ? <div className="text-[9px] font-bold tracking-widest text-yellow-500 animate-pulse">{t.header.saving}</div> : <div className="text-[9px] font-bold tracking-widest text-emerald-500/80">{t.header.saved}</div>}</div>
                        <button onClick={() => actions.setLang(lang === 'es' ? 'en' : 'es')} className="text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50 transition-colors">{lang.toUpperCase()}</button>
                        <button onClick={actions.handleLogout} className="text-xs bg-red-900/20 text-red-400 border border-red-900 px-3 py-1 hover:bg-red-900/40 transition-colors">{t.header.logout}</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <aside className={`flex-none glass-panel border-r border-cyan-900/50 flex flex-col z-20 shadow-2xl overflow-hidden relative transition-all duration-300 ${state.isSidebarCollapsed ? 'w-12' : 'w-80'}`}>
                    <button onClick={() => actions.setIsSidebarCollapsed(!state.isSidebarCollapsed)} className="absolute top-1/2 -right-3 w-6 h-12 bg-cyan-900 border border-cyan-600 rounded-l flex items-center justify-center z-50 hover:bg-cyan-800 transition-colors" style={{ transform: 'translateY(-50%)' }}><span className="text-xs text-cyan-200">{state.isSidebarCollapsed ? '›' : '‹'}</span></button>
                    {!state.isSidebarCollapsed ? (
                        <>
                            <div className="p-4 border-b border-cyan-900/50 bg-red-950/20 flex justify-between items-center font-sans">
                                <div className="flex flex-col"><span className="text-[9px] font-bold text-red-500 tracking-widest">AMENAZA</span><span className="text-sm font-black text-red-600 tracking-tighter">CRÍTICO</span></div>
                                <div className="relative w-14 h-14 flex items-center justify-center"><svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#1e293b" strokeWidth="4" fill="transparent" /><circle cx="22" cy="22" r="18" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" /></svg><span className="absolute text-[10px] font-bold text-emerald-400">{progressPercentage}%</span></div>
                            </div>
                            <div className="p-3 border-b border-cyan-900">
                                <button id="tutorial-bunker-btn" onClick={() => navigate('/bunker')} className={`w-full py-3 border-2 flex items-center justify-center gap-2 transition-all duration-300 group relative overflow-hidden ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 bg-lime-900/10 hover:bg-lime-900/30 text-lime-400' : 'border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/30 text-cyan-300'}`}>
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${playerAlignment === 'ZOMBIE' ? 'bg-[linear-gradient(45deg,transparent_25%,rgba(132,204,22,0.1)_50%,transparent_75%)]' : 'bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)]'} bg-[length:250%_250%] animate-[shimmer_2s_linear_infinite]`}></div>
                                    <span className="text-xl group-hover:scale-110 transition-transform">{playerAlignment === 'ZOMBIE' ? '☣' : '🛡'}</span><span className="font-bold tracking-widest text-[10px]">{playerAlignment === 'ZOMBIE' ? t.sidebar.hiveBtn : t.sidebar.bunkerBtn}</span>
                                </button>
                            </div>
                            <div id="tutorial-sidebar-missions" className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-cyan-900">
                                <h4 className="text-[10px] font-bold text-cyan-600 uppercase mb-2 tracking-widest border-b border-cyan-900 pb-1">{t.sidebar.activeMissions}</h4>
                                <div className="space-y-1">
                                    {state.groupedMissions.galactus.length > 0 && (<div className="mb-2 border border-purple-600 bg-purple-900/20 animate-pulse"><div className="p-1 bg-purple-900/80 text-white text-[9px] font-black tracking-widest uppercase text-center">⚠ OMEGA ⚠</div><div className="p-1">{state.groupedMissions.galactus.map(m => (<div key={m.id} onClick={() => actions.setSelectedMission(m)} className="p-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer text-center shadow-sm border border-purple-400 mb-1">{m.title}</div>))}</div></div>)}
                                    {Object.entries(state.groupedMissions).map(([zoneKey, missions]) => {
                                        if (zoneKey === 'galactus' || missions.length === 0) return null;
                                        const isExpanded = state.expandedZones.has(zoneKey);
                                        const factionLabel = (() => { if (zoneKey.startsWith('shield_')) { const baseFaction = zoneKey.replace('shield_', ''); const baseName = t.factions[baseFaction as keyof typeof t.factions]?.name || baseFaction.toUpperCase(); return `S.H.I.E.L.D. (${baseName})`; } return t.factions[zoneKey as keyof typeof t.factions]?.name || zoneKey.toUpperCase(); })();
                                        const isBlocked = worldStage === 'GALACTUS';
                                        return (
                                            <div key={zoneKey} className={`mb-1 border border-cyan-900/30 bg-slate-900/30 ${isBlocked ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                                <button type="button" onClick={() => actions.toggleZone(zoneKey)} className="w-full flex justify-between items-center p-2 bg-slate-800/80 hover:bg-cyan-900/30 transition-colors border-b border-cyan-900/30"><span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest truncate max-w-[140px]">{factionLabel}</span><div className="flex items-center gap-1"><span className="text-[9px] bg-cyan-900/50 text-cyan-200 px-1 py-0.5 rounded font-mono border border-cyan-700">{missions.length}</span><span className={`text-[8px] text-cyan-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span></div></button>
                                                {isExpanded && (<div className="p-1 space-y-1 animate-fade-in bg-slate-950/20">{missions.map(m => { const isShield = m.type === 'SHIELD_BASE'; const isIntro = m.type === 'INTRODUCTORY'; const isBoss = m.type && m.type.startsWith('BOSS'); let borderClass = 'border-yellow-500/30 bg-yellow-900/5 hover:bg-yellow-900/20'; let barClass = 'bg-yellow-500'; let textClass = 'text-yellow-200'; if (isBoss) { borderClass = 'border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40 animate-pulse'; barClass = 'bg-purple-500'; textClass = 'text-purple-200'; } else if (isShield) { borderClass = 'border-cyan-500/30 bg-cyan-900/5 hover:bg-cyan-900/20'; barClass = 'bg-cyan-500'; textClass = 'text-cyan-200'; } else if (isIntro) { borderClass = 'border-emerald-500/30 bg-emerald-900/5 hover:bg-emerald-900/20'; barClass = 'bg-emerald-500'; textClass = 'text-emerald-200'; } return (<div key={m.id} onClick={() => actions.handleMissionSelect(m)} className={`p-2 border cursor-pointer transition-all group relative overflow-hidden ${borderClass}`}><div className={`absolute left-0 top-0 bottom-0 w-1 ${barClass} group-hover:w-1.5 transition-all`}></div><div className={`text-xs font-bold ${textClass} group-hover:text-white uppercase tracking-wider pl-2 truncate`}>{m.title || 'UNKNOWN MISSION'}</div></div>); })}</div>)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-4 gap-4 h-full"><div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center bg-red-900/20 animate-pulse" title="Nivel de Amenaza: CRÍTICO"><span className="text-xs">⚠</span></div><button onClick={() => navigate('/bunker')} className="w-8 h-8 rounded border border-cyan-500 flex items-center justify-center hover:bg-cyan-900/50 text-cyan-300" title="Búnker"><span className="text-xs">🛡</span></button><div className="flex-1 w-full flex flex-col items-center justify-end pb-4"><div className="relative w-8 h-8 flex items-center justify-center" title={`Progreso: ${progressPercentage}%`}><svg className="w-full h-full transform -rotate-90"><circle cx="16" cy="16" r="14" stroke="#1e293b" strokeWidth="3" fill="transparent" /><circle cx="16" cy="16" r="14" stroke="#10b981" strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 - (progressPercentage / 100) * 2 * Math.PI * 14} /></svg></div></div></div>
                    )}
                </aside>

                <main className="flex-1 relative bg-slate-950 overflow-hidden">
                    {children}
                </main>
            </div>

            <NewsTicker alignment={playerAlignment || 'ALIVE'} worldStage={worldStage} urgentMessage={tickerMessage} />
        </div>
    );
};

const GameContent: React.FC = () => {
    const { state, actions } = useGame();
    const navigate = useNavigate();
    const {
        loading, loadingAuth, lang, playerAlignment, heroes, completedMissionIds,
        omegaCylinders, worldStage, isEditorMode, surferTurnCount
    } = state;

    if (loading || loadingAuth) return <div className="bg-slate-950 text-cyan-500 h-screen flex items-center justify-center font-mono">LOADING SHIELD OS...</div>;

    return (
        <Routes>
            <Route path="/" element={<LoginScreen onLogin={actions.handleGuestLogin} onGoogleLogin={() => { }} onEditorLogin={actions.handleEditorLogin} language={lang} setLanguage={actions.setLang} />} />

            <Route path="/story" element={<StoryMode language={lang} onComplete={(choice) => { actions.setPlayerAlignment(choice); navigate('/setup'); }} onSkip={() => { actions.setPlayerAlignment('ALIVE'); const core = GAME_EXPANSIONS.find(e => e.id === 'core_box'); if (core) actions.setHeroes(core.heroes); navigate('/map'); }} startAtChoice={state.startStoryAtChoice} />} />

            <Route path="/setup" element={playerAlignment ? <ExpansionSelector language={lang} playerAlignment={playerAlignment} onConfirm={actions.handleExpansionConfirm} onBack={() => { actions.setPlayerAlignment(null); navigate('/story'); }} ownedExpansions={state.ownedExpansions} onToggleExpansion={actions.toggleExpansion} onToggleAllExpansions={actions.toggleAllExpansions} /> : <Navigate to="/" />} />

            <Route path="/intro" element={playerAlignment ? <IntroSequence language={lang} playerAlignment={playerAlignment} onComplete={() => { if (state.introMission) { navigate('/mission0'); } else { navigate('/tutorial'); } }} /> : <Navigate to="/" />} />

            <Route path="/mission0" element={(playerAlignment && state.introMission) ? <MissionModal mission={state.introMission} isOpen={true} onClose={() => navigate('/tutorial')} onComplete={() => { actions.handleMissionComplete(state.introMission!.id); navigate('/tutorial'); }} language={lang} isCompleted={false} /> : <Navigate to="/map" />} />

            <Route path="/map" element={
                <GameLayout>
                    <USAMap language={lang} missions={state.visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={actions.handleMissionComplete} onMissionSelect={actions.handleMissionSelect} onBunkerClick={() => navigate('/bunker')} factionStates={state.FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} surferTurnCount={surferTurnCount} />
                    {isEditorMode && (
                        <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 bg-slate-900/95 p-4 border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-sm min-w-[200px] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
                            <h3 className="text-xs font-bold text-cyan-400 border-b border-cyan-800 pb-1 mb-2 tracking-widest uppercase">EDITOR TOOLS</h3>
                            <button onClick={() => actions.setShowMissionEditor(true)} className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 text-[10px] font-bold py-2 px-3 border border-cyan-700 uppercase tracking-wider transition-colors">+ CREAR MISIÓN</button>
                            <button onClick={() => actions.setShowCharacterEditor(true)} className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-[10px] font-bold py-2 px-3 border border-blue-700 uppercase tracking-wider transition-colors">+ CREAR PERSONAJE</button>
                            <button onClick={() => actions.setShowDbManager(true)} className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[10px] font-bold py-2 px-3 border border-purple-700 uppercase tracking-wider transition-colors">⚙ GESTOR BBDD (ADMIN)</button>
                            <div className="h-px bg-cyan-900 my-1"></div>
                            <button onClick={() => actions.handleSimulateProgress(5)} className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold py-2 px-3 border border-emerald-700 uppercase tracking-wider transition-colors">+5 MISIONES (SIM)</button>
                            <button onClick={actions.handleResetProgress} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 border border-red-700 uppercase tracking-wider transition-colors">RESET PROGRESO</button>
                            <div className="mt-2 text-[9px] text-gray-500 font-mono text-center border-t border-gray-800 pt-2">SURFER TURN: <span className="text-white font-bold">{surferTurnCount}</span></div>
                        </div>
                    )}
                </GameLayout>
            } />

            <Route path="/bunker" element={
                <GameLayout>
                    <BunkerInterior heroes={heroes} missions={state.visibleMissions.filter(m => m && !completedMissionIds.has(m.id))} onAssign={(heroId, missionId) => { const hIndex = heroes.findIndex(h => h.id === heroId); if (hIndex >= 0) { const newHeroes = [...heroes]; newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'DEPLOYED', assignedMissionId: missionId }; actions.setHeroes(newHeroes); return true; } return false; }} onUnassign={(heroId) => { const hIndex = heroes.findIndex(h => h.id === heroId); if (hIndex >= 0) { const newHeroes = [...heroes]; newHeroes[hIndex] = { ...newHeroes[hIndex], status: 'AVAILABLE', assignedMissionId: null }; actions.setHeroes(newHeroes); } }} onAddHero={(hero) => actions.setHeroes([...heroes, hero])} onToggleObjective={actions.handleToggleHeroObjective} onBack={() => navigate('/map')} language={lang} playerAlignment={playerAlignment} isEditorMode={isEditorMode} onTransformHero={actions.handleTransformHero} onTickerUpdate={actions.handleTickerUpdate} omegaCylinders={omegaCylinders} onFindCylinder={() => actions.setOmegaCylinders(prev => prev + 1)} />
                </GameLayout>
            } />

            <Route path="/tutorial" element={
                <div className="absolute inset-0 z-40">
                    <USAMap language={lang} missions={state.visibleMissions} completedMissionIds={completedMissionIds} onMissionComplete={() => { }} onMissionSelect={() => { }} onBunkerClick={() => { }} factionStates={state.FACTION_STATES} playerAlignment={playerAlignment} worldStage={worldStage} />
                    <TutorialOverlay language={lang} onComplete={() => { if (state.user) localStorage.setItem(`shield_tutorial_seen_${state.user.uid}`, 'true'); navigate('/map'); }} onStepChange={(stepKey) => { if (['roster', 'file', 'recruit'].includes(stepKey)) { navigate('/bunker'); } }} />
                </div>
            } />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <GameProvider>
                <GameContent />
            </GameProvider>
        </BrowserRouter>
    );
};

export default App;