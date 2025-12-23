import React, { useState, useMemo } from "react";
import { translations, Language } from "../translations";
import { Hero, Mission, HeroClass, HeroTemplate } from "../types";
import { getHeroTemplates } from "../services/dbService";

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

// --- HELPER: NORMALIZAR NOMBRES PARA EVITAR DUPLICADOS ---
const normalizeName = (name: string) => {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/\(z\)/g, '')       
        .replace(/\(zombie\)/g, '')  
        .replace(/\(artist\)/g, '')  
        .replace(/[^a-z0-9]/g, '')   
        .trim();
};

// --- COMPONENTE: BARRA DE PODER (TUG OF WAR) ---
const TugOfWarBar = ({ label, shieldVal, enemyVal, enemyColor }: { label: string, shieldVal: number, enemyVal: number, enemyColor: string }) => {
    const total = shieldVal + enemyVal;
    const shieldPct = total === 0 ? 50 : (shieldVal / total) * 100;
    const enemyPct = total === 0 ? 50 : (enemyVal / total) * 100;

    return (
        <div className="mb-3 group">
            <div className="flex justify-between text-[9px] font-bold mb-1 uppercase tracking-wider">
                <span className="text-cyan-500">S.H.I.E.L.D. ({shieldVal})</span>
                <span className={enemyColor}>{label} ({enemyVal})</span>
            </div>
            <div className="h-3 w-full bg-slate-900 border border-slate-700 flex relative overflow-hidden">
                <div className="h-full bg-cyan-600 transition-all duration-1000 ease-out relative" style={{ width: `${shieldPct}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white shadow-[0_0_10px_white] z-10"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                </div>
                <div className={`h-full ${enemyColor.replace('text-', 'bg-')} transition-all duration-1000 ease-out opacity-80`} style={{ width: `${enemyPct}%` }}></div>
            </div>
        </div>
    );
};

// --- COMPONENTE: TARJETA DE HÉROE CINEMÁTICA ---
const HeroCinematicCard = ({ hero, onClick, actionIcon, onAction }: { hero: Hero, onClick: () => void, actionIcon?: string, onAction?: () => void }) => (
    <div 
        onClick={onClick} 
        className={`group relative h-24 w-full cursor-pointer overflow-hidden border-b border-slate-800 transition-all hover:border-cyan-500 ${hero.status === 'CAPTURED' ? 'grayscale' : ''}`}
    >
        <div className="absolute inset-0">
            <img 
                src={hero.imageUrl} 
                alt={hero.alias} 
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>

        <div className="absolute inset-0 p-4 flex flex-col justify-center z-10">
            <h3 className={`text-lg font-black uppercase tracking-wider truncate ${hero.status === 'INJURED' || hero.status === 'CAPTURED' ? 'text-red-500' : 'text-white group-hover:text-cyan-400'}`}>
                {hero.alias}
            </h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold bg-slate-950/80 px-2 py-0.5 border border-slate-700 text-gray-400">
                    {hero.class}
                </span>
                {hero.status === 'CAPTURED' && <span className="text-[9px] font-bold bg-red-900/80 px-2 py-0.5 text-white border border-red-500">PRISONER</span>}
            </div>
        </div>

        {actionIcon && onAction && (
            <button 
                onClick={(e) => { e.stopPropagation(); onAction(); }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-900/80 border border-slate-600 hover:border-red-500 hover:text-red-500 hover:bg-slate-900 text-gray-400 transition-all z-20 rounded-full"
            >
                {actionIcon}
            </button>
        )}
        
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${hero.status === 'AVAILABLE' ? 'bg-emerald-500' : hero.status === 'DEPLOYED' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export const BunkerInterior: React.FC<BunkerInteriorProps> = ({
  heroes, missions, completedMissionIds = new Set(), onAssign, onUnassign, onAddHero, onToggleObjective, onBack, language, playerAlignment, isEditorMode, onTransformHero, onTickerUpdate, omegaCylinders = 0, onFindCylinder
}) => {
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'MEDBAY'>('ROSTER');
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [dossierTab, setDossierTab] = useState<'DATA' | 'STORY' | 'OBJECTIVES'>('DATA');

  const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recruitMode, setRecruitMode] = useState<'ALLY' | 'CAPTURE'>('ALLY');
  const [recruitForm, setRecruitForm] = useState({ templateId: "", name: "", alias: "", class: "BRAWLER" as HeroClass, bio: "", currentStory: "", objectives: [] as string[], imageUrl: "", characterSheetUrl: "", str: 5, agi: 5, int: 5, alignment: "ALIVE" as "ALIVE" | "ZOMBIE" });

  const t = translations[language];
  const selectedHero = heroes.find(h => h.id === selectedHeroId);

  const availableHeroes = heroes.filter(h => h.status === 'AVAILABLE');
  const deployedHeroes = heroes.filter(h => h.status === 'DEPLOYED');
  const injuredHeroes = heroes.filter(h => h.status === 'INJURED' || h.status === 'CAPTURED');
  
  const threatAnalysis = useMemo(() => {
      const zones = {
          magneto: { shield: 0, enemy: 0, color: 'text-red-500' },
          kingpin: { shield: 0, enemy: 0, color: 'text-purple-500' },
          hulk: { shield: 0, enemy: 0, color: 'text-lime-500' },
          doom: { shield: 0, enemy: 0, color: 'text-blue-500' }
      };
      missions.forEach(m => {
          if (['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii'].includes(m.location.state)) zones.magneto.enemy++;
          else if (['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia'].includes(m.location.state)) zones.kingpin.enemy++;
          else if (['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio'].includes(m.location.state)) zones.hulk.enemy++;
          else if (['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'].includes(m.location.state)) zones.doom.enemy++;
      });
      const baseProgress = Math.floor(completedMissionIds.size / 4); 
      zones.magneto.shield = baseProgress;
      zones.kingpin.shield = baseProgress;
      zones.hulk.shield = baseProgress;
      zones.doom.shield = baseProgress;
      return zones;
  }, [missions, completedMissionIds]);

  const handleOpenRecruit = async () => {
      const templates = await getHeroTemplates();
      setDbTemplates(templates);
      setRecruitForm({ templateId: "", name: "", alias: "", class: "BRAWLER", bio: "", currentStory: "", objectives: [], imageUrl: "", characterSheetUrl: "", str: 5, agi: 5, int: 5, alignment: "ALIVE" });
      setRecruitMode('ALLY');
      setShowRecruitModal(true);
  };

  const handleRecruitSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const newHero: Hero = { 
          id: `custom_${Date.now()}`, 
          templateId: recruitForm.templateId || undefined, 
          name: recruitForm.name || "UNKNOWN", 
          alias: recruitForm.alias || "AGENT", 
          class: recruitForm.class, 
          bio: recruitForm.bio, 
          currentStory: recruitForm.currentStory, 
          objectives: recruitForm.objectives, 
          completedObjectiveIndices: [], 
          imageUrl: recruitForm.imageUrl, 
          characterSheetUrl: recruitForm.characterSheetUrl, 
          status: recruitMode === 'CAPTURE' ? 'CAPTURED' : 'AVAILABLE', 
          stats: { strength: recruitForm.str, agility: recruitForm.agi, intellect: recruitForm.int }, 
          assignedMissionId: null 
      };
      onAddHero(newHero);
      const msg = recruitMode === 'CAPTURE' ? `SUJETO HOSTIL CAPTURADO: ${newHero.alias}` : `NUEVO AGENTE RECLUTADO: ${newHero.alias}`;
      if (onTickerUpdate) onTickerUpdate(msg);
      setShowRecruitModal(false);
  };

  const handleCure = (heroId: string) => {
      if (omegaCylinders > 0 && onTransformHero) {
          onTransformHero(heroId, playerAlignment === 'ZOMBIE' ? 'ZOMBIE' : 'ALIVE');
      }
  };

  const getFilteredTemplates = () => {
      return dbTemplates.filter(t => {
          const matchesSearch = (t.alias || t.defaultName).toLowerCase().includes(searchTerm.toLowerCase());
          let matchesAlignment = false;
          const templateAlign = t.defaultAlignment || 'ALIVE';

          if (recruitMode === 'ALLY') {
              matchesAlignment = templateAlign === playerAlignment;
          } else {
              matchesAlignment = templateAlign !== playerAlignment;
          }

          const templateNameClean = normalizeName(t.alias || t.defaultName);
          const isAlreadyOwned = heroes.some(h => {
              const heroNameClean = normalizeName(h.alias);
              return heroNameClean === templateNameClean;
          });

          return matchesSearch && matchesAlignment && !isAlreadyOwned;
      });
  };

  const getPlaceholderText = () => {
      if (recruitMode === 'ALLY') {
          return playerAlignment === 'ALIVE' ? "BUSCAR HÉROE (ALIADO)..." : "BUSCAR ZOMBIE (ALIADO)...";
      } else {
          return playerAlignment === 'ALIVE' ? "BUSCAR ZOMBIE (ENEMIGO)..." : "BUSCAR HÉROE (ENEMIGO)...";
      }
  };

  return (
    <div className="w-full h-full bg-slate-950 text-cyan-400 font-mono flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <div className="h-14 border-b border-cyan-900 bg-slate-900 flex items-center justify-between px-4 shrink-0 z-20 shadow-lg">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-xs font-bold border border-cyan-700 px-3 py-1 hover:bg-cyan-900/50 transition-colors">← MAPA</button>
                <div className="h-6 w-px bg-cyan-800"></div>
                <h1 className="text-lg font-black tracking-[0.2em] text-white uppercase">CENTRO DE MANDO // {playerAlignment}</h1>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest">
                <div className="flex flex-col items-end">
                    <span className="text-gray-500">FECHA</span>
                    <span className="text-white">OCT 31, 2025</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-500">ESTADO</span>
                    <span className="text-emerald-400 animate-pulse">OPERATIVO</span>
                </div>
            </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
            
            {/* COLUMNA 1: PERSONAL */}
            <div className="col-span-3 border-r border-cyan-900 bg-slate-900/50 flex flex-col min-w-[280px]">
                <div className="flex border-b border-cyan-900">
                    <button onClick={() => setActiveTab('ROSTER')} className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'ROSTER' ? 'bg-cyan-900/30 text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-300'}`}>
                        ACTIVOS ({availableHeroes.length + deployedHeroes.length})
                    </button>
                    <button onClick={() => setActiveTab('MEDBAY')} className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'MEDBAY' ? 'bg-red-900/20 text-red-300 border-b-2 border-red-500' : 'text-gray-500 hover:text-red-400'}`}>
                        PRISIONEROS ({injuredHeroes.length})
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 bg-slate-950">
                    {activeTab === 'ROSTER' ? (
                        <>
                            {availableHeroes.length === 0 && deployedHeroes.length === 0 && <div className="text-center text-[10px] text-gray-600 py-10">SIN PERSONAL</div>}
                            {availableHeroes.map(h => <HeroCinematicCard key={h.id} hero={h} onClick={() => setSelectedHeroId(h.id)} />)}
                            {deployedHeroes.length > 0 && <div className="text-[9px] font-bold text-yellow-500 uppercase mt-4 mb-1 px-2 border-b border-yellow-900/30 pb-1">DESPLEGADOS EN MISIÓN</div>}
                            {deployedHeroes.map(h => <HeroCinematicCard key={h.id} hero={h} onClick={() => setSelectedHeroId(h.id)} actionIcon="✕" onAction={() => onUnassign(h.id)} />)}
                        </>
                    ) : (
                        <>
                            {injuredHeroes.length === 0 && <div className="text-center text-[10px] text-gray-600 py-10">ALA MÉDICA VACÍA</div>}
                            {injuredHeroes.map(h => (
                                <HeroCinematicCard 
                                    key={h.id} 
                                    hero={h} 
                                    onClick={() => setSelectedHeroId(h.id)} 
                                    actionIcon={h.status === 'CAPTURED' ? '💉' : undefined}
                                    onAction={h.status === 'CAPTURED' ? () => handleCure(h.id) : undefined}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* COLUMNA 2: INTELIGENCIA */}
            <div className="col-span-6 flex flex-col bg-slate-950 relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.2)_50%,transparent_75%)] bg-[length:20px_20px]"></div>

                {/* Panel Superior: Gráficas Tug of War */}
                <div className="h-1/3 border-b border-cyan-900 p-4 flex gap-4">
                    <div className="flex-1 bg-slate-900/80 border border-cyan-800 p-3 relative overflow-hidden flex flex-col justify-center">
                        <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 border-b border-cyan-900 pb-1">CONTROL TERRITORIAL</h3>
                        <TugOfWarBar label="MAGNETO" shieldVal={threatAnalysis.magneto.shield} enemyVal={threatAnalysis.magneto.enemy} enemyColor={threatAnalysis.magneto.color} />
                        <TugOfWarBar label="KINGPIN" shieldVal={threatAnalysis.kingpin.shield} enemyVal={threatAnalysis.kingpin.enemy} enemyColor={threatAnalysis.kingpin.color} />
                        <TugOfWarBar label="HULK" shieldVal={threatAnalysis.hulk.shield} enemyVal={threatAnalysis.hulk.enemy} enemyColor={threatAnalysis.hulk.color} />
                        <TugOfWarBar label="DOOM" shieldVal={threatAnalysis.doom.shield} enemyVal={threatAnalysis.doom.enemy} enemyColor={threatAnalysis.doom.color} />
                    </div>
                    <div className="w-1/3 bg-slate-900/80 border border-cyan-800 p-3 flex flex-col items-center justify-center text-center">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">MISIONES ACTIVAS</div>
                        <div className="text-4xl font-black text-white">{missions.length}</div>
                        <div className="text-[9px] text-cyan-600 mt-2">PRIORIDAD ALTA</div>
                    </div>
                </div>

                {/* Panel Inferior: Lista de Misiones */}
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
                    <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">REGISTRO DE OPERACIONES</h3>
                    <div className="space-y-2">
                        {missions.map(m => (
                            <div key={m.id} className="bg-slate-900/80 border border-cyan-900/50 p-3 hover:border-cyan-500 transition-colors group cursor-pointer relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 group-hover:bg-cyan-400 transition-colors"></div>
                                <div className="flex justify-between items-start pl-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">{m.title}</h4>
                                        <div className="text-[10px] text-gray-400 mt-0.5">{m.location.state} // {m.threatLevel}</div>
                                    </div>
                                    <div className="text-[9px] font-mono border border-cyan-900 px-2 py-1 text-cyan-600 group-hover:text-cyan-400">
                                        {heroes.filter(h => h.assignedMissionId === m.id).length} AGENTES
                                    </div>
                                </div>
                            </div>
                        ))}
                        {missions.length === 0 && <div className="text-center text-xs text-gray-600 italic mt-10">NO HAY MISIONES ACTIVAS</div>}
                    </div>
                </div>
            </div>

            {/* COLUMNA 3: LOGÍSTICA */}
            <div className="col-span-3 border-l border-cyan-900 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-cyan-900">
                    <button onClick={handleOpenRecruit} className="w-full py-4 border-2 border-dashed border-cyan-800 hover:border-cyan-500 hover:bg-cyan-900/10 transition-all group flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-950 border border-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-2xl text-cyan-500">+</span>
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">ACCESO CEREBRO</span>
                    </button>
                </div>

                <div className="p-4 border-b border-cyan-900 bg-slate-900/80">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">RECURSOS OMEGA</h3>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-3 h-8 rounded-sm border border-slate-700 ${i < omegaCylinders ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-800'}`}></div>
                            ))}
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white leading-none">{omegaCylinders}</div>
                            <div className="text-[8px] text-gray-500">UNIDADES</div>
                        </div>
                    </div>
                    {onFindCylinder && (
                        <button onClick={onFindCylinder} className="w-full py-2 bg-blue-900/30 border border-blue-800 text-blue-300 text-[9px] font-bold hover:bg-blue-900/50 transition-colors">
                            BUSCAR SUMINISTROS
                        </button>
                    )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">HISTORIAL DE EVENTOS</h3>
                    <div className="space-y-2 text-[9px] font-mono text-gray-400">
                        <div className="border-l-2 border-emerald-500 pl-2 py-1">
                            <div className="text-emerald-400 font-bold">MISIÓN COMPLETADA</div>
                            <div>Base Alpha asegurada.</div>
                        </div>
                        <div className="border-l-2 border-red-500 pl-2 py-1">
                            <div className="text-red-400 font-bold">BAJA CONFIRMADA</div>
                            <div>Agente Coulson perdido en acción.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* MODAL DE DOSSIER DE HÉROE */}
        {selectedHero && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedHeroId(null)}>
                <div className="bg-slate-900 border-2 border-cyan-500 w-full max-w-4xl h-[80vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden" onClick={e => e.stopPropagation()}>
                    
                    <div className="bg-cyan-950/50 p-4 border-b border-cyan-800 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-widest uppercase">{selectedHero.alias}</h2>
                            <div className="text-xs text-cyan-400 font-mono tracking-wider">EXPEDIENTE #{selectedHero.id.toUpperCase()}</div>
                        </div>
                        <div className={`px-3 py-1 border text-xs font-bold uppercase ${selectedHero.status === 'CAPTURED' ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-emerald-500 text-emerald-500 bg-emerald-900/20'}`}>
                            {selectedHero.status}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-1/3 bg-slate-950 border-r border-cyan-900 flex flex-col">
                            <div className="aspect-[3/4] relative overflow-hidden border-b border-cyan-900">
                                <img src={selectedHero.imageUrl} className={`w-full h-full object-cover ${selectedHero.status === 'CAPTURED' ? 'grayscale contrast-125' : ''}`} />
                                {selectedHero.status === 'CAPTURED' && <div className="absolute inset-0 flex items-center justify-center bg-red-900/40 backdrop-blur-[2px]"><span className="text-red-500 font-black text-2xl -rotate-12 border-4 border-red-500 p-2">PRISONER</span></div>}
                            </div>
                            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center"><div className="text-[9px] text-gray-500">STR</div><div className="text-xl font-bold text-red-400">{selectedHero.stats.strength}</div></div>
                                    <div className="text-center"><div className="text-[9px] text-gray-500">AGI</div><div className="text-xl font-bold text-green-400">{selectedHero.stats.agility}</div></div>
                                    <div className="text-center"><div className="text-[9px] text-gray-500">INT</div><div className="text-xl font-bold text-blue-400">{selectedHero.stats.intellect}</div></div>
                                </div>
                                <div className="pt-2 border-t border-slate-800">
                                    <div className="text-[9px] text-gray-500 uppercase mb-1">CLASE</div>
                                    <div className="text-xs text-white font-bold bg-slate-800 px-2 py-1 inline-block border border-slate-700">{selectedHero.class}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col bg-slate-900">
                            <div className="flex border-b border-cyan-900">
                                <button onClick={() => setDossierTab('DATA')} className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase ${dossierTab === 'DATA' ? 'bg-cyan-900/30 text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-300'}`}>DATOS</button>
                                <button onClick={() => setDossierTab('STORY')} className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase ${dossierTab === 'STORY' ? 'bg-cyan-900/30 text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-300'}`}>HISTORIA</button>
                                <button onClick={() => setDossierTab('OBJECTIVES')} className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase ${dossierTab === 'OBJECTIVES' ? 'bg-cyan-900/30 text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-300'}`}>OBJETIVOS</button>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto">
                                {dossierTab === 'DATA' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <h4 className="text-xs font-bold text-cyan-600 uppercase mb-1">NOMBRE REAL</h4>
                                            <p className="text-sm text-white font-mono">{selectedHero.name}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-cyan-600 uppercase mb-1">BIOGRAFÍA</h4>
                                            <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-cyan-800 pl-3">"{selectedHero.bio}"</p>
                                        </div>
                                    </div>
                                )}

                                {dossierTab === 'STORY' && (
                                    <div className="space-y-4 animate-fade-in h-full flex flex-col">
                                        <h4 className="text-xs font-bold text-yellow-600 uppercase mb-1">REGISTRO DE CAMPAÑA</h4>
                                        <textarea 
                                            className="flex-1 w-full bg-slate-950 border border-yellow-900/50 p-3 text-sm text-yellow-100/80 font-mono resize-none focus:border-yellow-600 outline-none"
                                            placeholder="Escribe aquí las notas sobre el estado actual del personaje en la campaña..."
                                            defaultValue={selectedHero.currentStory}
                                        ></textarea>
                                        <div className="text-[9px] text-gray-500 text-right">* Los cambios se guardan automáticamente al cerrar.</div>
                                    </div>
                                )}

                                {dossierTab === 'OBJECTIVES' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <h4 className="text-xs font-bold text-emerald-600 uppercase mb-1">OBJETIVOS PERSONALES</h4>
                                        {selectedHero.objectives && selectedHero.objectives.length > 0 ? (
                                            <ul className="space-y-3">
                                                {selectedHero.objectives.map((obj, i) => (
                                                    <li key={i} className="flex gap-3 items-start bg-slate-950 p-3 border border-slate-800">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedHero.completedObjectiveIndices?.includes(i)} 
                                                            onChange={() => onToggleObjective(selectedHero.id, i)} 
                                                            className="mt-1 h-4 w-4 accent-emerald-500 cursor-pointer shrink-0" 
                                                        />
                                                        <span className={`text-sm ${selectedHero.completedObjectiveIndices?.includes(i) ? "text-emerald-500 line-through opacity-50" : "text-emerald-100"}`}>{obj}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-800 text-center">SIN OBJETIVOS ASIGNADOS</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-4 border-t border-cyan-900 flex justify-end gap-3 shrink-0">
                        {selectedHero.status === 'CAPTURED' ? (
                            <button onClick={() => { handleCure(selectedHero.id); setSelectedHeroId(null); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                {playerAlignment === 'ZOMBIE' ? 'INFECTAR SUJETO' : 'ADMINISTRAR CURA (1 CILINDRO)'}
                            </button>
                        ) : (
                            <button className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
                                EDITAR DATOS
                            </button>
                        )}
                        <button onClick={() => setSelectedHeroId(null)} className="px-6 py-2 border border-red-900 text-red-500 hover:bg-red-900/20 text-xs font-bold uppercase tracking-widest">
                            CERRAR EXPEDIENTE
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL DE RECLUTAMIENTO */}
        {showRecruitModal && (
            <div className="absolute inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4">
                <div className={`w-full max-w-lg bg-slate-900 border-2 ${recruitMode === 'CAPTURE' ? 'border-red-600' : 'border-cyan-500'} p-6 shadow-2xl transition-colors duration-500`}>
                    
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-black tracking-widest uppercase ${recruitMode === 'CAPTURE' ? 'text-red-500' : 'text-cyan-400'}`}>
                            {recruitMode === 'CAPTURE' ? 'PROTOCOLO DE CONTENCIÓN' : 'BASE DE DATOS CEREBRO'}
                        </h3>
                        <div className="flex bg-slate-950 border border-slate-700 rounded p-1">
                            <button 
                                onClick={() => setRecruitMode('ALLY')} 
                                className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${recruitMode === 'ALLY' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                RECLUTAR
                            </button>
                            <button 
                                onClick={() => setRecruitMode('CAPTURE')} 
                                className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${recruitMode === 'CAPTURE' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                CAPTURAR
                            </button>
                        </div>
                    </div>

                    <input 
                        type="text" 
                        placeholder={getPlaceholderText()}
                        className={`w-full bg-slate-950 border p-3 text-white mb-4 outline-none font-mono text-sm ${recruitMode === 'CAPTURE' ? 'border-red-800 focus:border-red-500 placeholder-red-900' : 'border-cyan-800 focus:border-cyan-500 placeholder-cyan-900'}`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    
                    <div className="h-64 overflow-y-auto border border-slate-800 mb-6 scrollbar-thin scrollbar-thumb-slate-700">
                        {getFilteredTemplates().map(t => {
                            const isSelected = recruitForm.templateId === t.id;
                            const activeColor = recruitMode === 'CAPTURE' ? 'bg-red-900/40 border-red-500' : 'bg-cyan-900/40 border-cyan-500';
                            const hoverColor = recruitMode === 'CAPTURE' ? 'hover:bg-red-900/20' : 'hover:bg-cyan-900/20';
                            const borderColor = recruitMode === 'CAPTURE' ? 'border-red-700' : 'border-cyan-700';

                            return (
                                <div 
                                    key={t.id} 
                                    onClick={() => { setRecruitForm({...recruitForm, templateId: t.id, name: t.defaultName, alias: t.alias || t.defaultName, imageUrl: t.imageUrl, class: t.defaultClass}); }} 
                                    className={`flex items-center gap-3 p-2 border-b border-slate-800 cursor-pointer transition-all ${isSelected ? activeColor : `bg-slate-900 ${hoverColor}`}`}
                                >
                                    <div className={`w-12 h-12 shrink-0 border ${isSelected ? borderColor : 'border-slate-700'} relative overflow-hidden`}>
                                        <img src={t.imageUrl} alt={t.alias} className="w-full h-full object-cover" />
                                        {isSelected && <div className={`absolute inset-0 opacity-20 ${recruitMode === 'CAPTURE' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {t.alias || t.defaultName}
                                        </div>
                                        <div className="text-[9px] text-gray-500 truncate">{t.defaultName}</div>
                                    </div>
                                    <div className={`text-[8px] font-mono px-1.5 py-0.5 border ${isSelected ? borderColor + ' text-white' : 'border-slate-700 text-gray-500'}`}>
                                        {t.defaultClass}
                                    </div>
                                </div>
                            );
                        })}
                        {getFilteredTemplates().length === 0 && (
                            <div className="text-center text-xs text-gray-600 py-10 italic">
                                NO SE ENCONTRARON SUJETOS COMPATIBLES
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button onClick={() => setShowRecruitModal(false)} className="px-6 py-2 text-xs font-bold text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500 uppercase tracking-widest">CANCELAR</button>
                        <button 
                            onClick={handleRecruitSubmit} 
                            disabled={!recruitForm.templateId}
                            className={`px-6 py-2 text-xs font-bold text-white uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${recruitMode === 'CAPTURE' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20'}`}
                        >
                            {recruitMode === 'CAPTURE' ? 'CONFIRMAR CAPTURA' : 'CONFIRMAR RECLUTAMIENTO'}
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};