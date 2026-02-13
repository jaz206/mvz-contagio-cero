import React, { useState, useMemo } from "react";
import { translations, Language } from "../translations";
import { Hero, Mission, HeroClass, HeroTemplate } from "../types";
import { getHeroTemplates } from "../services/heroService";
import { RecruitModal } from "./RecruitModal";
import { ConfirmationModal } from "./ConfirmationModal";

interface BunkerInteriorProps {
    heroes: Hero[];
    missions: Mission[];
    completedMissionIds?: Set<string>;
    onAssign: (heroId: string, missionId: string) => boolean;
    onUnassign: (heroId: string) => void;
    onAddHero: (hero: Hero) => void;
    onToggleObjective: (heroId: string, objectiveIndex: number) => void;
    onBack: () => void;
    language: Language;
    playerAlignment?: "ALIVE" | "ZOMBIE" | null;
    isEditorMode?: boolean;
    onTransformHero?: (heroId: string, targetAlignment: 'ALIVE' | 'ZOMBIE') => void;
    onTickerUpdate?: (message: string) => void;
    omegaCylinders?: number;
    onFindCylinder?: () => void;
}

// --- UTILIDADES ---
const normalizeAlias = (alias: string) => {
    return alias.toLowerCase()
        .replace(/\(z\)/g, '')
        .replace(/\(zombie\)/g, '')
        .replace(/\(artist\)/g, '')
        .replace(/\(old man\)/g, '')
        .trim();
};

// --- COMPONENTE: BARRA TÁCTICA ---
const TacticalBar = ({ label, shieldVal, enemyVal, enemyColor }: { label: string, shieldVal: number, enemyVal: number, enemyColor: string }) => {
    const total = shieldVal + enemyVal;
    const shieldPct = total === 0 ? 50 : (shieldVal / total) * 100;
    const enemyBg = enemyColor.replace('text-', 'bg-');
    return (
        <div className="mb-4 group">
            <div className="flex justify-between text-[9px] font-black mb-1 uppercase tracking-wider px-1">
                <span className="text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.8)]">S.H.I.E.L.D. <span className="text-xs">[{shieldVal}]</span></span>
                <span className={`${enemyColor} drop-shadow-[0_0_3px_currentColor]`}>{label} <span className="text-xs">[{enemyVal}]</span></span>
            </div>
            <div className="h-4 w-full bg-slate-950 border border-slate-700 relative overflow-hidden flex skew-x-[-10deg]">
                <div className="h-full bg-gradient-to-r from-cyan-900 to-cyan-500 transition-all duration-1000 ease-out relative border-r-2 border-white" style={{ width: `${shieldPct}%` }}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                </div>
                <div className={`flex-1 h-full bg-gradient-to-l from-slate-900 to-${enemyBg.split('-')[1]}-600 opacity-80 relative`}>
                    <div className={`absolute inset-0 ${enemyBg} opacity-40`}></div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: CARTA DE HÉROE ---
const HeroCard = ({ hero, onClick, actionIcon, onAction }: { hero: Hero, onClick: () => void, actionIcon?: string, onAction?: () => void }) => {
    const statusColors = {
        AVAILABLE: 'border-emerald-500 shadow-emerald-500/20',
        DEPLOYED: 'border-yellow-500 shadow-yellow-500/20',
        INJURED: 'border-red-500 shadow-red-500/20',
        CAPTURED: 'border-red-900 shadow-red-900/20 grayscale'
    };
    const colorClass = statusColors[hero.status] || 'border-slate-600';

    // Estilo dinámico para la imagen
    const imgStyle = hero.imageParams ? {
        transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
    } : {};

    return (
        <div onClick={onClick} className={`group relative h-28 w-full cursor-pointer overflow-hidden border-l-4 bg-slate-900/50 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.02] hover:z-10 ${colorClass} border-b border-slate-800`}>
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={hero.imageUrl}
                    alt={hero.alias}
                    className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-80 transition-all duration-500"
                    style={imgStyle}
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>
            </div>
            <div className="absolute inset-0 p-4 flex flex-col justify-center z-10 pl-6 pointer-events-none">
                <h3 className="text-lg font-black uppercase tracking-wider truncate text-white group-hover:text-cyan-400 drop-shadow-md" style={{ fontFamily: 'Impact, sans-serif' }}>{hero.alias}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-bold bg-black/80 px-2 py-0.5 border border-slate-700 text-cyan-500 tracking-widest uppercase">{hero.class}</span>
                    {hero.status !== 'AVAILABLE' && (<span className={`text-[8px] font-bold px-2 py-0.5 border uppercase tracking-widest ${hero.status === 'DEPLOYED' ? 'bg-yellow-900/50 text-yellow-500 border-yellow-700' : 'bg-red-900/50 text-red-500 border-red-700'}`}>{hero.status}</span>)}
                </div>
            </div>
            {actionIcon && onAction && (<button onClick={(e) => { e.stopPropagation(); onAction(); }} className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center bg-black/50 border border-white/20 hover:bg-red-600 hover:border-red-500 text-white transition-all rounded-sm z-20 backdrop-blur-sm pointer-events-auto">{actionIcon}</button>)}
            <div className="absolute inset-0 bg-scan opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
        </div>
    );
};

export const BunkerInterior: React.FC<BunkerInteriorProps> = ({
    heroes, missions, completedMissionIds = new Set(), onAssign, onUnassign, onAddHero, onToggleObjective, onBack, language, playerAlignment, onTransformHero, onTickerUpdate, omegaCylinders = 0, onFindCylinder
}) => {
    const [activeTab, setActiveTab] = useState<'ROSTER' | 'MEDBAY'>('ROSTER');
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
    const [showRecruitModal, setShowRecruitModal] = useState(false);
    const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([]);
    const [viewingSheet, setViewingSheet] = useState<string | null>(null);

    // ESTADO PARA EL MODAL DE CONFIRMACIÓN
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        type: 'CURE' | 'INFECT' | 'WARNING';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', confirmText: '', type: 'WARNING', onConfirm: () => { } });

    const t = translations[language];
    const selectedHero = heroes.find(h => h.id === selectedHeroId);

    const availableHeroes = heroes.filter(h => h.status === 'AVAILABLE');
    const deployedHeroes = heroes.filter(h => h.status === 'DEPLOYED');
    const injuredHeroes = heroes.filter(h => h.status === 'INJURED' || h.status === 'CAPTURED');

    const existingAliases = useMemo(() => {
        const aliases = new Set<string>();
        heroes.forEach(h => {
            aliases.add(normalizeAlias(h.alias));
        });
        return aliases;
    }, [heroes]);

    const threatAnalysis = {
        magneto: { shield: 2, enemy: 5, color: 'text-red-500' },
        kingpin: { shield: 4, enemy: 3, color: 'text-purple-500' },
        hulk: { shield: 1, enemy: 8, color: 'text-lime-500' },
        doom: { shield: 3, enemy: 4, color: 'text-cyan-500' }
    };

    const handleOpenRecruit = async () => {
        const templates = await getHeroTemplates();
        setDbTemplates(templates);
        setShowRecruitModal(true);
    };

    const openConfirm = (config: typeof confirmModal) => {
        setConfirmModal(config);
    };

    return (
        <div className="w-full h-full bg-slate-950 text-cyan-400 font-mono flex flex-col overflow-hidden relative">

            {/* TOP BAR */}
            <div className="h-16 border-b border-cyan-900 bg-slate-900/95 flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold border border-cyan-700 px-4 py-2 hover:bg-cyan-500 hover:text-black transition-all clip-tactical">
                        <span>←</span> MAPA
                    </button>
                    <div className="h-8 w-px bg-cyan-800/50"></div>
                    <h1 className="text-xl font-black tracking-[0.2em] text-white uppercase text-shadow-neon">
                        CENTRO DE MANDO // <span className={playerAlignment === 'ZOMBIE' ? 'text-lime-500' : 'text-cyan-400'}>{playerAlignment}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-8 text-[10px] font-bold tracking-widest">
                    <div className="text-right">
                        <div className="text-gray-500">FECHA</div>
                        <div className="text-white">OCT 31, 2025</div>
                    </div>
                    <div className="text-right">
                        <div className="text-gray-500">ESTADO</div>
                        <div className="text-emerald-400 animate-pulse">OPERATIVO</div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-full">

                {/* LEFT COLUMN: ROSTER */}
                <div className="col-span-3 border-r border-cyan-900 bg-slate-900/30 flex flex-col min-w-[300px] h-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

                    <div className="flex border-b border-cyan-900 shrink-0 bg-slate-900">
                        <button onClick={() => setActiveTab('ROSTER')} className={`flex-1 py-4 text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'ROSTER' ? 'bg-cyan-900/40 text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-300'}`}>
                            ACTIVOS ({availableHeroes.length + deployedHeroes.length})
                        </button>
                        <button onClick={() => setActiveTab('MEDBAY')} className={`flex-1 py-4 text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'MEDBAY' ? 'bg-red-900/20 text-red-300 border-b-2 border-red-500' : 'text-gray-500 hover:text-red-400'}`}>
                            PRISIONEROS ({injuredHeroes.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 pb-24">
                        {activeTab === 'ROSTER' ? (
                            <>
                                {availableHeroes.map(h => <HeroCard key={h.id} hero={h} onClick={() => setSelectedHeroId(h.id)} />)}
                                {deployedHeroes.length > 0 && <div className="text-[9px] font-black text-yellow-500 uppercase mt-6 mb-2 px-4 tracking-widest border-b border-yellow-900/30 pb-1">DESPLEGADOS</div>}
                                {deployedHeroes.map(h => <HeroCard key={h.id} hero={h} onClick={() => setSelectedHeroId(h.id)} actionIcon="✕" onAction={() => onUnassign(h.id)} />)}
                            </>
                        ) : (
                            injuredHeroes.map(h => {
                                const isAlivePlayer = playerAlignment === 'ALIVE';
                                const actionIcon = isAlivePlayer ? "💉" : "🧟";

                                const handleAction = () => {
                                    if (!onTransformHero) return;

                                    // --- LÓGICA DE BLOQUEO POR "SIN VARIANTE" ---
                                    if (h.relatedHeroId === 'NO_VARIANT') {
                                        if (isAlivePlayer) {
                                            openConfirm({
                                                isOpen: true,
                                                title: "ERROR GENÉTICO",
                                                message: `SUJETO IRRECUPERABLE.\n\nEl tejido de ${h.alias} ha sufrido una degradación celular total. No queda ADN humano viable para la reestructuración.\n\nLA CURA ES INEFICAZ.`,
                                                confirmText: "ENTENDIDO",
                                                type: "WARNING",
                                                onConfirm: () => { }
                                            });
                                        } else {
                                            openConfirm({
                                                isOpen: true,
                                                title: "ANOMALÍA DETECTADA",
                                                message: `SUJETO INMUNE.\n\nLa fisiología de ${h.alias} rechaza el Evangelio del Hambre. Estructura molecular incompatible o sintética.\n\nNO SE PUEDE CONSUMIR.`,
                                                confirmText: "ENTENDIDO",
                                                type: "WARNING",
                                                onConfirm: () => { }
                                            });
                                        }
                                        return;
                                    }

                                    if (isAlivePlayer) {
                                        // MODO HÉROE: CURAR
                                        if (omegaCylinders > 0) {
                                            openConfirm({
                                                isOpen: true,
                                                title: "PROTOCOLO DE CURA",
                                                message: `¿INICIAR SECUENCIA DE REESTRUCTURACIÓN DE ADN PARA ${h.alias}?\n\nCOSTE: 1 CILINDRO OMEGA`,
                                                confirmText: "ADMINISTRAR CURA",
                                                type: "CURE",
                                                onConfirm: () => onTransformHero(h.id, 'ALIVE')
                                            });
                                        } else {
                                            openConfirm({
                                                isOpen: true,
                                                title: "RECURSOS INSUFICIENTES",
                                                message: "NO HAY CILINDROS OMEGA DISPONIBLES.\n\nBUSCA SUMINISTROS EN EL MAPA.",
                                                confirmText: "ENTENDIDO",
                                                type: "WARNING",
                                                onConfirm: () => { }
                                            });
                                        }
                                    } else {
                                        // MODO ZOMBIE: INFECTAR
                                        openConfirm({
                                            isOpen: true,
                                            title: "EXPANDIR EL HAMBRE",
                                            message: `¿INFECTAR A ${h.alias}?\n\nEL SUJETO SE UNIRÁ A LA HORDA.`,
                                            confirmText: "DEVORAR / INFECTAR",
                                            type: "INFECT",
                                            onConfirm: () => onTransformHero(h.id, 'ZOMBIE')
                                        });
                                    }
                                };

                                return (
                                    <HeroCard
                                        key={h.id}
                                        hero={h}
                                        onClick={() => setSelectedHeroId(h.id)}
                                        actionIcon={actionIcon}
                                        onAction={handleAction}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>

                {/* CENTER COLUMN: INTEL */}
                <div className="col-span-6 flex flex-col bg-slate-950 relative h-full overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:30px_30px]"></div>

                    {/* THREAT MONITOR */}
                    <div className="h-2/5 border-b border-cyan-900 p-6 flex gap-6 shrink-0 bg-slate-900/20">
                        <div className="flex-1 border border-cyan-800/50 bg-slate-900/50 p-4 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] clip-tactical">
                            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 border-b border-cyan-900/50 pb-2">CONTROL TERRITORIAL GLOBAL</h3>
                            <TacticalBar label="MAGNETO" shieldVal={threatAnalysis.magneto.shield} enemyVal={threatAnalysis.magneto.enemy} enemyColor={threatAnalysis.magneto.color} />
                            <TacticalBar label="KINGPIN" shieldVal={threatAnalysis.kingpin.shield} enemyVal={threatAnalysis.kingpin.enemy} enemyColor={threatAnalysis.kingpin.color} />
                            <TacticalBar label="HULK" shieldVal={threatAnalysis.hulk.shield} enemyVal={threatAnalysis.hulk.enemy} enemyColor={threatAnalysis.hulk.color} />
                            <TacticalBar label="DOOM" shieldVal={threatAnalysis.doom.shield} enemyVal={threatAnalysis.doom.enemy} enemyColor={threatAnalysis.doom.color} />
                        </div>

                        <div className="w-1/3 flex flex-col gap-4">
                            <div className="flex-1 bg-slate-900/50 border border-cyan-800/50 p-4 flex flex-col items-center justify-center text-center clip-tactical">
                                <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">MISIONES ACTIVAS</div>
                                <div className="text-5xl font-black text-white text-shadow-neon">{missions.length}</div>
                                <div className="text-[9px] text-cyan-400 mt-2 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-800">PRIORIDAD ALTA</div>
                            </div>
                        </div>
                    </div>

                    {/* MISSION LOG */}
                    <div className="flex-1 p-6 overflow-y-auto pb-24">
                        <h3 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-4">REGISTRO DE OPERACIONES</h3>
                        <div className="space-y-3">
                            {missions.map(m => (
                                <div key={m.id} className="bg-slate-900/80 border-l-4 border-cyan-500 p-4 hover:bg-cyan-900/20 transition-all group cursor-pointer relative overflow-hidden shadow-lg">
                                    <div className="flex justify-between items-center relative z-10">
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 uppercase tracking-wider">{m.title}</h4>
                                            <div className="text-[10px] text-gray-400 mt-1 font-mono">{m.location.state} // {m.threatLevel}</div>
                                        </div>
                                        <div className="text-[9px] font-bold border border-cyan-700 px-3 py-1 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                            {heroes.filter(h => h.assignedMissionId === m.id).length} AGENTES
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/0 via-cyan-900/10 to-cyan-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: RESOURCES */}
                <div className="col-span-3 border-l border-cyan-900 bg-slate-900/30 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-cyan-900 shrink-0">
                        <button onClick={handleOpenRecruit} className="w-full aspect-square border-2 border-dashed border-cyan-800 hover:border-cyan-400 hover:bg-cyan-900/20 transition-all group flex flex-col items-center justify-center gap-4 rounded-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                            <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)] z-10">
                                <span className="text-3xl text-cyan-400 font-light">+</span>
                            </div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase z-10">ACCESO CEREBRO</span>
                        </button>
                    </div>

                    <div className="p-6 border-b border-cyan-900 bg-slate-900/50 shrink-0">
                        <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">RECURSOS OMEGA</h3>
                        <div className="flex items-center justify-between mb-6 bg-black/40 p-3 rounded border border-blue-900/30">
                            <div className="flex gap-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-3 h-10 skew-x-[-10deg] border border-slate-700 ${i < omegaCylinders ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-800/50'}`}></div>
                                ))}
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-white leading-none">{omegaCylinders}</div>
                                <div className="text-[8px] text-gray-500 uppercase">UNIDADES</div>
                            </div>
                        </div>
                        {onFindCylinder && (
                            <button onClick={onFindCylinder} className="w-full py-3 bg-blue-900/30 border border-blue-600 text-blue-300 text-[9px] font-bold hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest clip-tactical-inv">
                                BUSCAR SUMINISTROS
                            </button>
                        )}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto pb-24">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">HISTORIAL DE EVENTOS</h3>
                        <div className="space-y-4">
                            <div className="border-l-2 border-emerald-500 pl-3 py-1 relative">
                                <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_#10b981]"></div>
                                <div className="text-[9px] text-emerald-400 font-bold uppercase mb-1">MISIÓN COMPLETADA</div>
                                <div className="text-xs text-gray-400">Base Alpha asegurada.</div>
                            </div>
                            <div className="border-l-2 border-red-500 pl-3 py-1 relative">
                                <div className="absolute w-2 h-2 bg-red-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_#ef4444]"></div>
                                <div className="text-[9px] text-red-400 font-bold uppercase mb-1">BAJA CONFIRMADA</div>
                                <div className="text-xs text-gray-400">Agente Coulson perdido en acción.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALES Y OVERLAYS */}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
            />

            {showRecruitModal && (
                <RecruitModal
                    isOpen={showRecruitModal}
                    onClose={() => setShowRecruitModal(false)}
                    onRecruit={onAddHero}
                    templates={dbTemplates}
                    existingAliases={existingAliases}
                    language={language}
                    playerAlignment={playerAlignment || 'ALIVE'}
                />
            )}

            {/* --- VISOR DE FICHA DE JUEGO (NUEVO) --- */}
            {viewingSheet && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setViewingSheet(null)}>
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        {/* IMAGEN AJUSTADA PARA TAMAÑO UNIFORME */}
                        <img
                            src={viewingSheet}
                            alt="Tactical Sheet"
                            className="h-[85vh] w-auto max-w-[95vw] object-contain border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] rounded-xl bg-black"
                            onClick={(e) => e.stopPropagation()}
                            referrerPolicy="no-referrer"
                        />

                        {/* Botón cerrar */}
                        <button
                            onClick={() => setViewingSheet(null)}
                            className="mt-4 px-8 py-2 bg-red-900/80 text-white font-bold tracking-widest border border-red-600 hover:bg-red-800 uppercase text-xs shadow-lg rounded"
                        >
                            CERRAR
                        </button>
                    </div>
                </div>
            )}

            {selectedHero && (
                <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-12" onClick={() => setSelectedHeroId(null)}>
                    <div className="bg-slate-900 border-2 border-cyan-500 w-full max-w-5xl h-[70vh] shadow-[0_0_100px_rgba(6,182,212,0.2)] flex clip-tactical" onClick={e => e.stopPropagation()}>
                        <div className="w-1/3 h-full relative">
                            <img src={selectedHero.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedHero.alias}</h2>
                                <p className="text-cyan-400 font-mono text-sm">{selectedHero.name}</p>
                            </div>
                        </div>
                        <div className="flex-1 p-8 bg-slate-900/95 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={() => setSelectedHeroId(null)} className="text-cyan-500 hover:text-white font-bold text-xl">✕</button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-950 p-4 border border-red-900/50 text-center">
                                    <div className="text-[9px] text-gray-500 uppercase">FUERZA</div>
                                    <div className="text-2xl font-black text-red-500">{selectedHero.stats.strength}</div>
                                </div>
                                <div className="bg-slate-950 p-4 border border-green-900/50 text-center">
                                    <div className="text-[9px] text-gray-500 uppercase">AGILIDAD</div>
                                    <div className="text-2xl font-black text-green-500">{selectedHero.stats.agility}</div>
                                </div>
                                <div className="bg-slate-950 p-4 border border-blue-900/50 text-center">
                                    <div className="text-[9px] text-gray-500 uppercase">INTELECTO</div>
                                    <div className="text-2xl font-black text-blue-500">{selectedHero.stats.intellect}</div>
                                </div>
                            </div>
                            <div className="prose prose-invert flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900">
                                <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-cyan-800 pl-4 italic">"{selectedHero.bio}"</p>
                            </div>

                            <div className="mt-8 flex gap-4 justify-end items-center border-t border-cyan-900/50 pt-6">

                                {/* BOTÓN FICHA DE JUEGO (Solo si existe URL) */}
                                {selectedHero.characterSheetUrl && (
                                    <button
                                        onClick={() => setViewingSheet(selectedHero.characterSheetUrl!)}
                                        className="px-6 py-3 bg-yellow-900/20 border border-yellow-600 text-yellow-500 hover:bg-yellow-900/40 hover:text-yellow-200 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 group"
                                    >
                                        <span className="text-lg group-hover:scale-110 transition-transform">🗃</span>
                                        FICHA TÁCTICA
                                    </button>
                                )}

                                <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest clip-tactical shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
                                    ASIGNAR MISIÓN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};