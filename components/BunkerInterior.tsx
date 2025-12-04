import React, { useState, useEffect } from "react";
import { translations, Language } from "../translations";
import { Hero, Mission, HeroClass, HeroTemplate } from "../types";
import { getHeroTemplates, seedHeroTemplates, updateHeroTemplate } from "../services/dbService";

interface BunkerInteriorProps {
  heroes: Hero[];
  missions: Mission[];
  onAssign: (heroId: string, missionId: string) => boolean;
  onUnassign: (heroId: string) => void;
  onAddHero: (hero: Hero) => void;
  onToggleObjective: (heroId: string, objectiveIndex: number) => void;
  onBack: () => void;
  language: Language;
  playerAlignment?: "ALIVE" | "ZOMBIE" | null;
  isEditorMode?: boolean;
  onTransformHero?: (heroId: string, targetAlignment: 'ALIVE' | 'ZOMBIE') => void;
}

// --- SUB-COMPONENTS ---

const StatBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
  <div className="flex items-center gap-2 text-[9px]">
    <span className="w-8 text-right opacity-70">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass}`} 
        style={{ width: `${(value / 10) * 100}%` }}
      />
    </div>
    <span className="w-4 font-bold">{value}</span>
  </div>
);

const HeroListCard: React.FC<{ hero: Hero; onClick: () => void; compact?: boolean; onAction?: () => void; actionLabel?: string }> = ({ hero, onClick, compact, onAction, actionLabel }) => (
  <div 
    onClick={onClick}
    className="group relative flex items-center gap-3 p-2 bg-slate-900/80 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition-all cursor-pointer overflow-hidden"
  >
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
      hero.status === 'AVAILABLE' ? 'bg-emerald-500' : 
      hero.status === 'INJURED' ? 'bg-red-500' : 
      hero.status === 'CAPTURED' ? 'bg-orange-500' : 'bg-yellow-500'
    }`} />

    <div className="w-10 h-10 shrink-0 border border-slate-600 bg-slate-800 relative overflow-hidden">
      {hero.imageUrl ? (
        <img src={hero.imageUrl} alt={hero.alias} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">?</div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline">
        <h4 className="text-xs font-bold text-cyan-100 truncate">{hero.alias}</h4>
        <span className="text-[9px] text-cyan-600 font-mono">{hero.class}</span>
      </div>
      {!compact && (
        <div className="mt-1 space-y-0.5">
           <StatBar label="STR" value={hero.stats.strength} colorClass="bg-red-500" />
           <StatBar label="AGI" value={hero.stats.agility} colorClass="bg-green-500" />
           <StatBar label="INT" value={hero.stats.intellect} colorClass="bg-blue-500" />
        </div>
      )}
    </div>

    {onAction && actionLabel && (
        <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                onAction(); 
            }}
            className="ml-2 px-2 py-1 bg-emerald-900/50 border border-emerald-600 text-[9px] font-bold text-emerald-400 hover:bg-emerald-800 hover:text-white transition-colors z-10 relative"
        >
            {actionLabel}
        </button>
    )}
  </div>
);

const MissionListCard: React.FC<{ mission: Mission; onClick: () => void; assignedCount: number }> = ({ mission, onClick, assignedCount }) => (
    <div 
      onClick={onClick}
      className="group relative flex items-center gap-3 p-2 bg-slate-900/80 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer overflow-hidden mb-1"
    >
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
                <h4 className="text-xs font-bold text-blue-100 truncate group-hover:text-blue-300">{mission.title}</h4>
                <span className="text-[9px] px-1.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">{assignedCount} AGENTS</span>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400">
                <span>{mission.location.state}</span>
                <span className={`font-bold ${mission.threatLevel === 'HIGH' ? 'text-orange-500' : mission.threatLevel === 'EXTREME' || mission.threatLevel.includes('OMEGA') ? 'text-red-500' : 'text-yellow-500'}`}>
                    {mission.threatLevel}
                </span>
            </div>
        </div>
    </div>
);

const CerebroScanner = ({ status }: { status: "SEARCHING" | "LOCKED" }) => {
    const isLocked = status === "LOCKED";
    return (
      <div className={`w-full h-32 bg-slate-950 border relative overflow-hidden flex items-center justify-center p-2 transition-all duration-500 ${isLocked ? "border-emerald-600 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]" : "border-cyan-900"}`}>
        <div className={`absolute inset-0 border rounded-full m-1 opacity-30 ${isLocked ? "border-emerald-500" : "border-cyan-900"}`} />
        <div className={`absolute inset-0 border rounded-full m-6 opacity-20 ${isLocked ? "border-emerald-500" : "border-cyan-800"}`} />
        
        {status === "SEARCHING" ? (
          <div className="absolute w-full h-[2px] bg-cyan-500/50 top-1/2 left-0 animate-[spin_3s_linear_infinite] shadow-[0_0_10px_#06b6d4]" />
        ) : (
          <>
            <div className="absolute w-full h-[1px] bg-emerald-500/50 top-1/2 left-0" />
            <div className="absolute h-full w-[1px] bg-emerald-500/50 top-0 left-1/2" />
            <div className="absolute w-12 h-12 border-2 border-emerald-500 rounded-full animate-pulse" />
          </>
        )}
  
        <div className={`text-[8px] font-mono z-10 flex flex-col items-center ${isLocked ? "text-emerald-400" : "text-cyan-600"}`}>
          <div className="tracking-widest font-bold">CEREBRO SCANNER</div>
          <div className={`mt-1 ${status === "SEARCHING" ? "animate-pulse" : ""}`}>
            {status === "SEARCHING" ? "SEARCHING GLOBAL FEED..." : "SIGNAL LOCKED // CONFIRMED"}
          </div>
        </div>
        
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(circle, ${isLocked ? "#10b981" : "#06b6d4"} 1px, transparent 1px)`, backgroundSize: "10px 10px" }} />
      </div>
    );
  };

// --- COMPONENTE: MODAL DE TRANSFORMACIÓN ---
const TransformationModal: React.FC<{ 
    isOpen: boolean; 
    type: 'CURING' | 'INFECTING'; 
    heroName: string; 
    onComplete: () => void; 
}> = ({ isOpen, type, heroName, onComplete }) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        if (!isOpen) {
            setProgress(0);
            return;
        }
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);
        
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    const isCuring = type === 'CURING';
    const colorClass = isCuring ? 'text-blue-400 border-blue-500' : 'text-green-500 border-green-500';
    const barColor = isCuring ? 'bg-blue-500' : 'bg-green-500';
    const title = isCuring ? 'ADMINISTRANDO ANTÍDOTO' : 'INYECTANDO CEPA ZOMBIE';
    const subtitle = isCuring ? 'REESTRUCTURANDO ADN...' : 'CORROMPIENDO TEJIDOS...';

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center flex-col font-mono">
            <div className={`w-full max-w-md p-8 border-2 ${colorClass} bg-slate-900/50 relative overflow-hidden`}>
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
                
                <h2 className={`text-2xl font-black tracking-widest mb-2 animate-pulse ${isCuring ? 'text-blue-400' : 'text-green-500'}`}>
                    {title}
                </h2>
                <div className="text-xs text-white mb-8 tracking-[0.2em]">SUJETO: {heroName}</div>

                <div className="w-full h-4 bg-slate-800 border border-slate-600 mb-2 relative">
                    <div 
                        className={`h-full ${barColor} transition-all duration-75 ease-linear`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{subtitle}</span>
                    <span>{progress}%</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const BunkerInterior: React.FC<BunkerInteriorProps> = ({
  heroes,
  missions,
  onAssign,
  onUnassign,
  onAddHero,
  onToggleObjective,
  onBack,
  language,
  playerAlignment,
  isEditorMode,
  onTransformHero
}) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [selectedMissionIdForSquad, setSelectedMissionIdForSquad] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [recruitMode, setRecruitMode] = useState<'DIRECT' | 'CAPTURE'>('DIRECT');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [viewingSheetUrl, setViewingSheetUrl] = useState<string | null>(null);

  // Estados para la transformación
  const [processingHero, setProcessingHero] = useState<{ id: string, name: string, type: 'CURING' | 'INFECTING' } | null>(null);
  const [transformationResult, setTransformationResult] = useState<'CURED' | 'INFECTED' | null>(null);

  const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "success" | "error">("idle");
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [recruitForm, setRecruitForm] = useState({
    templateId: "",
    name: "",
    alias: "",
    class: "BRAWLER" as HeroClass,
    bio: "",
    currentStory: "",
    objectives: [] as string[],
    imageUrl: "",
    characterSheetUrl: "",
    str: 5,
    agi: 5,
    int: 5,
    alignment: "ALIVE" as "ALIVE" | "ZOMBIE"
  });

  const t = translations[language];
  const selectedHero = heroes.find((h) => h.id === selectedHeroId);

  const availableHeroes = heroes.filter(h => h.status === 'AVAILABLE');
  const capturedHeroes = heroes.filter(h => h.status === 'CAPTURED');

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingDb(true);
      try {
        const templates = await getHeroTemplates();
        setDbTemplates(templates);
      } catch (err) {
        console.error("Error fetching templates", err);
      } finally {
        setIsLoadingDb(false);
      }
    };
    fetchTemplates();
  }, []);

  // --- FUNCIÓN PARA LIMPIAR EL FORMULARIO ---
  const resetRecruitForm = () => {
      setRecruitForm({
        templateId: "",
        name: "",
        alias: "",
        class: "BRAWLER",
        bio: "",
        currentStory: "",
        objectives: [],
        imageUrl: "",
        characterSheetUrl: "",
        str: 5, agi: 5, int: 5,
        alignment: "ALIVE"
      });
      setSearchTerm("");
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = dbTemplates.find((h) => h.id === templateId);
    if (template) {
      const tHero = t.heroes[templateId as keyof typeof t.heroes];
      setRecruitForm({
        templateId: templateId,
        name: template.defaultName,
        alias: tHero ? tHero.alias : template.alias || template.defaultName.toUpperCase(),
        class: template.defaultClass,
        bio: tHero ? tHero.bio : template.bio || "No bio available",
        currentStory: template.currentStory || "",
        objectives: template.objectives || [],
        imageUrl: template.imageUrl,
        characterSheetUrl: template.characterSheetUrl || "",
        str: template.defaultStats.strength,
        agi: template.defaultStats.agility,
        int: template.defaultStats.intellect,
        alignment: template.defaultAlignment || "ALIVE"
      });
    }
  };

  const handleEditClick = () => {
    if (!selectedHero) return;
    const originalTemplate = dbTemplates.find(t => t.id === selectedHero.templateId);
    
    setRecruitForm({
      templateId: selectedHero.templateId || "",
      name: selectedHero.name,
      alias: selectedHero.alias,
      class: selectedHero.class,
      bio: selectedHero.bio,
      currentStory: selectedHero.currentStory || "",
      objectives: selectedHero.objectives || [],
      imageUrl: selectedHero.imageUrl || "",
      characterSheetUrl: selectedHero.characterSheetUrl || "",
      str: selectedHero.stats.strength,
      agi: selectedHero.stats.agility,
      int: selectedHero.stats.intellect,
      alignment: originalTemplate?.defaultAlignment || "ALIVE"
    });
    setIsEditingExisting(true);
    setShowRecruitModal(true);
    setSelectedHeroId(null);
  };

  const handleRecruitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingExisting && recruitForm.templateId) {
      const updateData: Partial<HeroTemplate> = {
        defaultName: recruitForm.name,
        alias: recruitForm.alias,
        defaultClass: recruitForm.class,
        bio: recruitForm.bio,
        currentStory: recruitForm.currentStory,
        objectives: recruitForm.objectives,
        imageUrl: recruitForm.imageUrl,
        characterSheetUrl: recruitForm.characterSheetUrl,
        defaultStats: { strength: recruitForm.str, agility: recruitForm.agi, intellect: recruitForm.int },
        defaultAlignment: recruitForm.alignment
      };
      await updateHeroTemplate(recruitForm.templateId, updateData);
      alert("DATABASE UPDATED.");
      const temps = await getHeroTemplates();
      setDbTemplates(temps);
    } else {
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
        assignedMissionId: null,
      };
      onAddHero(newHero);
    }
    setShowRecruitModal(false);
    setIsEditingExisting(false);
    resetRecruitForm();
  };

  // --- LÓGICA DE CURA/INFECCIÓN ---
  const handleCureHero = (heroId: string) => {
      const hero = heroes.find(h => h.id === heroId);
      if (!hero) return;
      const actionType = playerAlignment === 'ZOMBIE' ? 'INFECTING' : 'CURING';
      setProcessingHero({
          id: heroId,
          name: hero.alias,
          type: actionType
      });
  };

  const handleTransformationComplete = () => {
      if (processingHero && onTransformHero) {
          const targetAlignment = processingHero.type === 'CURING' ? 'ALIVE' : 'ZOMBIE';
          onTransformHero(processingHero.id, targetAlignment);
          
          // 1. Abrir la ficha del héroe (ahora transformado)
          setSelectedHeroId(processingHero.id);
          
          // 2. Activar el sello visual
          setTransformationResult(processingHero.type === 'CURING' ? 'CURED' : 'INFECTED');
          
          // 3. Quitar el sello después de unos segundos
          setTimeout(() => setTransformationResult(null), 4000);
      }
      setProcessingHero(null);
  };

  const handleSeedDatabase = async () => {
    try {
      setSeedStatus("idle");
      await seedHeroTemplates();
      setSeedStatus("success");
      const templates = await getHeroTemplates();
      setDbTemplates(templates);
    } catch (e) {
      console.error(e);
      setSeedStatus("error");
    }
  };

  const handleAssignClick = (missionId: string) => {
    if (!selectedHero) return;
    const success = onAssign(selectedHero.id, missionId);
    if (success) {
      setShowAssignModal(false);
      setAssignError(null);
    } else {
      setAssignError(t.bunker.maxHeroes);
    }
  };

  const availableTemplates = dbTemplates.filter((template) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!(template.alias || template.defaultName).toLowerCase().includes(term)) {
          return false;
      }
    }
    if (isEditingExisting) return true;

    const normalize = (str: string) => str ? str.replace(/['"]/g, '').trim().toLowerCase() : '';
    
    const characterAlreadyInRoster = heroes.some(h => {
        if (h.templateId === template.id) return true;
        const hAlias = normalize(h.alias);
        const tAlias = normalize(template.alias);
        if (hAlias && tAlias && hAlias === tAlias) return true;
        const hName = normalize(h.name);
        const tName = normalize(template.defaultName);
        if (hName && tName && hName === tName) return true;
        return false;
    });

    if (characterAlreadyInRoster) return false;

    const templateAlign = template.defaultAlignment || 'ALIVE';
    if (recruitMode === 'DIRECT') {
        return templateAlign === playerAlignment;
    } else {
        return templateAlign !== playerAlignment;
    }
  });

  return (
    <div className="w-full h-full bg-slate-950 font-mono relative overflow-hidden select-none flex flex-col">
      
        {/* ESTILOS PARA LA ANIMACIÓN DEL SELLO */}
        <style>{`
            @keyframes stamp {
                0% { opacity: 0; transform: scale(3); }
                50% { opacity: 1; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1) rotate(-15deg); }
            }
        `}</style>

        {/* MODAL DE PROCESO VISUAL */}
        <TransformationModal 
            isOpen={!!processingHero} 
            type={processingHero?.type || 'CURING'} 
            heroName={processingHero?.name || ''} 
            onComplete={handleTransformationComplete} 
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-cyan-900 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors uppercase text-xs font-bold tracking-widest border border-cyan-800 px-3 py-1 bg-cyan-950/30">
                    ← {t.bunker.return}
                </button>
                <div className="h-6 w-[1px] bg-cyan-900"></div>
                <h1 className="text-lg md:text-xl font-bold text-cyan-200 tracking-[0.2em] uppercase">
                    {playerAlignment === 'ZOMBIE' ? t.bunker.hiveTitle : t.bunker.title}
                </h1>
            </div>
            <div className="flex items-center gap-4 text-[10px] md:text-xs">
                 <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700">
                     <span className="text-gray-400">TOTAL:</span> <span className="text-white font-bold">{heroes.length}</span>
                 </div>
                 <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700">
                     <span className="text-gray-400">AVAILABLE:</span> <span className="text-emerald-400 font-bold">{availableHeroes.length}</span>
                 </div>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 p-4 overflow-y-auto z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full min-h-[600px]">
                
                {/* 1. COMMAND DECK */}
                <div id="tutorial-bunker-file" className="bg-slate-900/40 border border-blue-900/50 flex flex-col relative overflow-hidden group">
                    <div className="p-3 bg-slate-900/80 border-b border-blue-900 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-blue-300 tracking-widest uppercase">{t.bunker.rooms.command}</h3>
                            <div className="text-[9px] text-blue-500/70">{t.bunker.rooms.commandDesc}</div>
                        </div>
                        <div className="text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900">{missions.length}</div>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-900">
                        {missions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-blue-900/50 italic text-xs">NO ACTIVE MISSIONS</div>
                        ) : (
                            missions.map(m => {
                                const count = heroes.filter(h => h.assignedMissionId === m.id).length;
                                return <MissionListCard key={m.id} mission={m} assignedCount={count} onClick={() => setSelectedMissionIdForSquad(m.id)} />;
                            })
                        )}
                    </div>
                </div>

                {/* 2. BARRACKS */}
                <div id="tutorial-bunker-roster" className="bg-slate-900/40 border border-emerald-900/50 flex flex-col relative overflow-hidden group lg:row-span-2">
                    <div className="p-3 bg-slate-900/80 border-b border-emerald-900 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-emerald-300 tracking-widest uppercase">{t.bunker.rooms.barracks}</h3>
                            <div className="text-[9px] text-emerald-500/70">{t.bunker.rooms.barracksDesc}</div>
                        </div>
                        <div className="text-xs font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-900">{availableHeroes.length}</div>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900">
                        {availableHeroes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-emerald-900/50 italic text-xs">BARRACKS EMPTY</div>
                        ) : (
                            availableHeroes.map(h => <HeroListCard key={h.id} hero={h} onClick={() => setSelectedHeroId(h.id)} />)
                        )}
                    </div>
                </div>

                {/* 3. CEREBRO */}
                <div id="tutorial-recruit-btn" className="bg-slate-900/40 border border-purple-900/50 flex flex-col relative overflow-hidden group">
                     <div className="p-3 bg-slate-900/80 border-b border-purple-900">
                        <h3 className="text-sm font-bold text-purple-300 tracking-widest uppercase">{t.bunker.rooms.cerebro}</h3>
                        <div className="text-[9px] text-purple-500/70">{t.bunker.rooms.cerebroDesc}</div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent animate-pulse"></div>
                         <button 
                            onClick={() => { setIsEditingExisting(false); setRecruitMode('DIRECT'); resetRecruitForm(); setShowRecruitModal(true); }}
                            className="relative z-10 group/btn w-full h-full border-2 border-dashed border-purple-500/30 hover:border-purple-500 rounded-lg flex flex-col items-center justify-center gap-4 transition-all hover:bg-purple-900/10"
                        >
                            <div className="w-16 h-16 rounded-full border border-purple-500 flex items-center justify-center bg-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover/btn:scale-110 transition-transform">
                                <span className="text-3xl text-purple-400">+</span>
                            </div>
                            <span className="text-xs font-bold text-purple-300 tracking-[0.2em]">{t.bunker.recruit}</span>
                         </button>
                    </div>
                </div>

                {/* 4. MEDBAY / CONTENCIÓN */}
                <div className="bg-slate-900/40 border border-red-900/50 flex flex-col relative overflow-hidden group md:col-span-2 lg:col-span-1">
                    <div className="p-3 bg-slate-900/80 border-b border-red-900 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-red-300 tracking-widest uppercase">{t.bunker.rooms.medbay}</h3>
                            <div className="text-[9px] text-red-500/70">{t.bunker.rooms.medbayDesc}</div>
                        </div>
                         <div className="text-xs font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-900">{capturedHeroes.length}</div>
                    </div>
                    <div className="flex-1 p-3 flex flex-col gap-2">
                        {capturedHeroes.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-red-900/50 italic text-xs min-h-[50px]">CONTAINMENT EMPTY</div>
                        ) : (
                            <div className="space-y-2 overflow-y-auto max-h-[120px] scrollbar-thin scrollbar-thumb-red-900">
                                {capturedHeroes.map(h => (
                                    <HeroListCard 
                                        key={h.id} 
                                        hero={h} 
                                        onClick={() => setSelectedHeroId(h.id)} 
                                        onAction={() => handleCureHero(h.id)}
                                        actionLabel={playerAlignment === 'ZOMBIE' ? 'INFECTAR' : 'CURAR'}
                                    />
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => { setIsEditingExisting(false); setRecruitMode('CAPTURE'); resetRecruitForm(); setShowRecruitModal(true); }}
                            className="mt-auto w-full py-2 border border-red-800 bg-red-900/20 text-red-400 hover:text-white hover:bg-red-900/50 text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">⊕</span> CAPTURAR SUJETO
                        </button>
                    </div>
                </div>
            </div>
        </div>

      {/* MODAL DETALLE HÉROE */}
      {selectedHeroId && selectedHero && (
        <div
          className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-fade-in"
          onClick={() => setSelectedHeroId(null)}
        >
          <div
            className="w-full max-w-4xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col max-h-full overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- SELLO DE CURADO/INFECTADO (CORREGIDO CON STYLE INLINE) --- */}
            {transformationResult && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div 
                        className={`
                            border-8 p-6 text-7xl font-black tracking-widest uppercase
                            ${transformationResult === 'CURED' 
                                ? 'border-emerald-500 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' 
                                : 'border-red-600 text-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]'}
                        `}
                        style={{ 
                            maskImage: 'url(https://www.transparenttextures.com/patterns/grunge-wall.png)',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            animation: 'stamp 0.4s ease-out forwards' // ANIMACIÓN INLINE PARA ASEGURAR QUE FUNCIONE
                        }}
                    >
                        {transformationResult}
                    </div>
                </div>
            )}

            {/* Header Modal */}
            <div className="p-4 border-b border-cyan-800 bg-cyan-900/20 flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-[0.2em] text-cyan-200 uppercase">
                {t.tutorial.file.title} // {selectedHero.alias}
              </h2>
              <button onClick={() => setSelectedHeroId(null)} className="text-cyan-500 hover:text-white px-2">✕</button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Columna Izquierda */}
                <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
                  <div
                    className="w-full aspect-[3/4] bg-slate-950 border-2 border-cyan-700 relative group overflow-hidden shadow-inner cursor-zoom-in"
                    onClick={() => setZoomedImage(selectedHero.imageUrl || "")}
                  >
                    {selectedHero.imageUrl ? (
                      <img src={selectedHero.imageUrl || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-900 flex-col gap-2">
                        <span className="text-4xl opacity-50">?</span>
                      </div>
                    )}
                  </div>
                  <CerebroScanner status="LOCKED" />
                  
                  {selectedHero.characterSheetUrl && (
                      <button
                          onClick={() => setViewingSheetUrl(selectedHero.characterSheetUrl || null)}
                          className="mt-2 w-full py-3 border-2 border-red-600/50 bg-red-950/20 hover:bg-red-900/40 hover:border-red-500 transition-all group relative overflow-hidden flex items-center justify-center gap-2"
                      >
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(220,38,38,0.1)_5px,rgba(220,38,38,0.1)_10px)] opacity-50"></div>
                          <span className="text-red-500 text-xs">🔒</span>
                          <span className="text-red-400 font-bold tracking-[0.2em] text-[10px] uppercase group-hover:text-red-200 relative z-10">
                              INFO SECRET // GAME DATA
                          </span>
                      </button>
                  )}

                  {isEditorMode && selectedHero.templateId && (
                    <button
                      onClick={handleEditClick}
                      className="w-full py-2 bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-xs font-bold border border-blue-700 uppercase tracking-wider transition-colors"
                    >
                      EDIT DATA (DB)
                    </button>
                  )}
                </div>

                {/* Columna Derecha */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex justify-between items-end border-b border-cyan-900 pb-2">
                    <div>
                      <div className="text-xs text-cyan-600 font-bold uppercase">{t.recruit.name}</div>
                      <div className="text-2xl text-white font-bold tracking-tight leading-none">{selectedHero.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-cyan-600 font-bold uppercase">{t.bunker.status}</div>
                      <div className={`text-lg font-bold ${selectedHero.status === "AVAILABLE" ? "text-emerald-400" : selectedHero.status === "INJURED" ? "text-red-500" : selectedHero.status === "CAPTURED" ? "text-orange-500" : "text-yellow-400"}`}>
                        {selectedHero.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/50 p-4 border border-cyan-900 overflow-y-auto max-h-32 scrollbar-thin scrollbar-thumb-cyan-800">
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{selectedHero.bio}"</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 overflow-y-auto">
                      <h4 className="text-xs font-bold text-yellow-500 mb-2 border-b border-yellow-900/30 pb-1">{t.bunker.currentStory}</h4>
                      <p className="text-xs text-yellow-100/80 leading-relaxed">{selectedHero.currentStory || "CLASSIFIED"}</p>
                    </div>
                    <div className="bg-emerald-900/10 border border-emerald-900/30 p-3 overflow-y-auto">
                      <h4 className="text-xs font-bold text-emerald-500 mb-2 border-b border-emerald-900/30 pb-1">{t.bunker.objectives}</h4>
                      {selectedHero.objectives && selectedHero.objectives.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedHero.objectives.map((obj, i) => (
                            <li key={i} className="flex gap-2 items-start">
                              <input
                                type="checkbox"
                                checked={selectedHero.completedObjectiveIndices?.includes(i)}
                                onChange={() => onToggleObjective(selectedHero.id, i)}
                                className="mt-0.5 h-3 w-3 appearance-none border border-emerald-500 bg-slate-900 checked:bg-emerald-500 cursor-pointer shrink-0"
                              />
                              <span className={`text-xs ${selectedHero.completedObjectiveIndices?.includes(i) ? "text-emerald-500 line-through" : "text-emerald-100/90"}`}>
                                {obj}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-gray-500 italic">NONE</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 p-4 border-t border-cyan-800 bg-cyan-900/20 flex justify-between items-center">
                <div className="text-xs text-cyan-600">ID: {selectedHero.id}</div>
                <div>
                  {selectedHero.status === "DEPLOYED" ? (
                    <button
                      onClick={() => onUnassign(selectedHero.id)}
                      className="px-6 py-2 bg-red-900/50 border border-red-900 text-red-500 hover:bg-red-900/20 text-xs font-bold tracking-widest transition-colors"
                    >
                      {t.bunker.unassign}
                    </button>
                  ) : selectedHero.status === "CAPTURED" ? (
                      <button
                          onClick={() => handleCureHero(selectedHero.id)}
                          className="px-6 py-2 bg-emerald-900/50 border border-emerald-600 text-emerald-400 hover:bg-emerald-800 text-xs font-bold tracking-widest transition-colors"
                      >
                          {playerAlignment === 'ZOMBIE' ? 'INFECTAR' : 'CURAR'}
                      </button>
                  ) : (
                    <button
                      disabled={selectedHero.status === "INJURED"}
                      onClick={() => {
                        setAssignError(null);
                        setShowAssignModal(true);
                      }}
                      className={`px-6 py-2 font-bold text-xs tracking-widest border transition-all ${
                        selectedHero.status === "INJURED"
                          ? "bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed"
                          : "bg-cyan-700 border-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      }`}
                    >
                      {t.bunker.assign}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... (Resto de modales: Assign, Squad, Recruit, Zoom, Sheet) ... */}
      {/* ... (Mantener el resto del código igual) ... */}
      {showAssignModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="bg-cyan-900/30 p-4 border-b border-cyan-700 flex justify-between items-center">
              <h3 className="text-cyan-300 font-bold tracking-widest">{t.bunker.assignModalTitle}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-cyan-500 hover:text-white">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {assignError && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 text-xs p-2 text-center mb-2 font-bold animate-pulse">
                  {assignError}
                </div>
              )}
              {missions.length === 0 ? (
                <div className="text-center text-gray-500 py-8 italic">{t.bunker.noMissions}</div>
              ) : (
                missions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => handleAssignClick(mission.id)}
                    className="border border-cyan-900/50 bg-slate-950/50 hover:bg-cyan-900/20 hover:border-cyan-500 cursor-pointer p-3 group transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-cyan-200 group-hover:text-white text-sm">{mission.title}</div>
                      <div className="text-[10px] text-red-500 border border-red-900 px-1">{mission.threatLevel}</div>
                    </div>
                    <div className="text-[10px] text-gray-400">LOC: {mission.location.state}</div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-cyan-900 bg-slate-900 flex justify-end">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">
                {t.bunker.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMissionIdForSquad && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl bg-slate-900 border border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col max-h-[90vh]">
                  <div className="bg-blue-900/30 p-4 border-b border-blue-700 flex justify-between items-center shrink-0">
                      <div>
                          <h3 className="text-blue-300 font-bold tracking-widest uppercase">{t.bunker.squadModalTitle}</h3>
                          <p className="text-[10px] text-blue-400">{missions.find(m => m.id === selectedMissionIdForSquad)?.title}</p>
                      </div>
                      <button onClick={() => setSelectedMissionIdForSquad(null)} className="text-blue-500 hover:text-white text-xl">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">
                       <div className="flex-1 bg-blue-900/10 border border-blue-800 p-2">
                           <h4 className="text-[10px] text-blue-400 font-bold mb-2 uppercase border-b border-blue-800 pb-1">ASSIGNED SQUAD</h4>
                           <div className="space-y-2">
                               {heroes.filter(h => h.assignedMissionId === selectedMissionIdForSquad).length === 0 && (
                                   <div className="text-[10px] text-gray-500 italic text-center py-4">NO AGENTS ASSIGNED</div>
                               )}
                               {heroes.filter(h => h.assignedMissionId === selectedMissionIdForSquad).map(h => (
                                   <div key={h.id} className="flex justify-between items-center bg-slate-900 p-2 border border-blue-800">
                                       <span className="text-xs font-bold text-white">{h.alias}</span>
                                       <button 
                                            onClick={() => onUnassign(h.id)}
                                            className="text-[9px] text-red-400 hover:text-red-200 border border-red-900 px-2 py-0.5"
                                       >
                                           {t.bunker.removeFromMission}
                                       </button>
                                   </div>
                               ))}
                           </div>
                       </div>
                       
                       <div className="flex-1 bg-emerald-900/10 border border-emerald-800 p-2">
                           <h4 className="text-[10px] text-emerald-400 font-bold mb-2 uppercase border-b border-emerald-800 pb-1">AVAILABLE AGENTS</h4>
                           <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-800">
                               {availableHeroes.length === 0 && (
                                   <div className="text-[10px] text-gray-500 italic text-center py-4">NO AGENTS AVAILABLE</div>
                               )}
                               {availableHeroes.map(h => (
                                   <div key={h.id} className="flex justify-between items-center bg-slate-900 p-2 border border-emerald-800/50">
                                       <div>
                                           <div className="text-xs font-bold text-emerald-100">{h.alias}</div>
                                           <div className="text-[9px] text-emerald-600">{h.class}</div>
                                       </div>
                                       <button 
                                            onClick={() => {
                                                if(selectedMissionIdForSquad) onAssign(h.id, selectedMissionIdForSquad);
                                            }}
                                            className="text-[9px] text-emerald-400 hover:text-emerald-200 border border-emerald-900 bg-emerald-900/20 px-2 py-1"
                                       >
                                           {t.bunker.addToMission} +
                                       </button>
                                   </div>
                               ))}
                           </div>
                       </div>
                  </div>
              </div>
          </div>
      )}

      {showRecruitModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col max-h-[90vh]">
            <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center shrink-0">
              <h3 className="text-cyan-300 font-bold tracking-widest text-lg">
                {isEditingExisting ? "EDITING DATABASE ENTRY" : recruitMode === 'CAPTURE' ? "CONTAINMENT PROTOCOL" : t.recruit.title}
              </h3>
              <button onClick={() => setShowRecruitModal(false)} className="text-cyan-500 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleRecruitSubmit} className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
              {!isEditingExisting && (
                <div className="w-full pb-4 border-b border-cyan-900 shrink-0 space-y-2">
                  <div className="flex justify-between items-end">
                      <label className="block text-[10px] text-cyan-400 font-bold tracking-widest">
                          {recruitMode === 'CAPTURE' ? 'BUSCAR ENEMIGOS (BANDO CONTRARIO)' : 'BUSCAR ALIADOS (MISMO BANDO)'}
                      </label>
                  </div>
                  <input
                    type="text"
                    placeholder="SEARCH DATABASE..."
                    className="w-full bg-slate-950 border border-cyan-700 p-2 text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none mb-2 placeholder-cyan-800 uppercase"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="w-full max-h-32 bg-slate-950 border border-cyan-800 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
                    {isLoadingDb ? (
                      <div className="p-2 text-xs text-cyan-700 animate-pulse">{t.recruit.loadingDb}</div>
                    ) : availableTemplates.length === 0 ? (
                      <div className="p-2 text-xs text-gray-600 italic">NO MATCHES FOUND</div>
                    ) : (
                      availableTemplates.map((h) => (
                        <div
                          key={h.id}
                          onClick={() => handleSelectTemplate(h.id)}
                          className={`p-2 text-xs cursor-pointer flex justify-between items-center border-b border-cyan-900/30 last:border-0 hover:bg-cyan-900/30 transition-colors ${recruitForm.templateId === h.id ? "bg-cyan-900/50 text-white" : "text-cyan-400"}`}
                        >
                          <span className="font-bold tracking-wide uppercase">{t.heroes[h.id as keyof typeof t.heroes]?.alias || h.alias || h.defaultName}</span>
                          <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-1 rounded border ${h.defaultAlignment === 'ZOMBIE' ? 'border-lime-600 text-lime-400' : 'border-cyan-600 text-cyan-400'}`}>
                                  {h.defaultAlignment || 'ALIVE'}
                              </span>
                              <span className="text-[10px] opacity-70">{h.defaultName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
                <div className="w-full md:w-[200px] flex flex-col gap-3 shrink-0">
                  <div className="w-full aspect-[3/4] bg-slate-950 border-2 border-cyan-800 relative group cursor-zoom-in overflow-hidden shadow-inner" onClick={() => recruitForm.imageUrl && setZoomedImage(recruitForm.imageUrl)}>
                    {recruitForm.imageUrl ? <img src={recruitForm.imageUrl || "/placeholder.svg"} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" alt="Preview" /> : <div className="w-full h-full flex items-center justify-center text-cyan-900 flex-col gap-2"><span className="text-4xl opacity-50">?</span></div>}
                  </div>
                  
                  {/* SELECTOR DE ALINEAMIENTO (Solo visible en modo edición) */}
                  {isEditingExisting && (
                      <div className="mt-2">
                          <label className="text-[9px] text-cyan-600 font-bold block mb-1">ESTADO BASE</label>
                          <select 
                              value={recruitForm.alignment} 
                              onChange={(e) => setRecruitForm({...recruitForm, alignment: e.target.value as any})}
                              className="w-full bg-slate-900 border border-cyan-700 text-xs text-white p-1"
                          >
                              <option value="ALIVE">HERO (ALIVE)</option>
                              <option value="ZOMBIE">ZOMBIE (UNDEAD)</option>
                          </select>
                      </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-4 min-h-0">
                  {/* CORRECCIÓN: Si no hay template seleccionado, mostramos mensaje vacío */}
                  {!recruitForm.templateId && !isEditingExisting ? (
                      <div className="h-full flex flex-col items-center justify-center text-cyan-900/50 border-2 border-dashed border-cyan-900/30 rounded p-8">
                          <div className="text-4xl mb-4">⌖</div>
                          <div className="text-sm font-bold tracking-widest">SELECCIONE UN OBJETIVO</div>
                          <div className="text-[10px] mt-2">ESPERANDO DATOS DE CEREBRO...</div>
                      </div>
                  ) : (
                      <>
                          <div className="flex gap-4 border-b border-cyan-900 pb-2">
                            <div className="flex-1">
                              <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.alias}</label>
                              <div className="text-2xl text-white font-bold tracking-tight leading-none">{recruitForm.alias || "---"}</div>
                            </div>
                            <div className="flex-1 text-right">
                              <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.name}</label>
                              <div className="text-lg text-cyan-500 leading-none">{recruitForm.name || "---"}</div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-950/50 p-3 border border-cyan-900/50 flex-none h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
                            <p className="text-xs text-gray-400 leading-relaxed">{recruitForm.bio || "NO DATA AVAILABLE"}</p>
                          </div>

                          <div>
                              <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.fileUrl}</label>
                              <input type="text" placeholder="https://... (PDF/JPG)" className="w-full bg-slate-950 border border-cyan-800 p-2 text-xs text-cyan-200 focus:border-cyan-400 outline-none" value={recruitForm.characterSheetUrl} onChange={(e) => setRecruitForm({...recruitForm, characterSheetUrl: e.target.value})} />
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                            <div className="bg-yellow-900/5 border border-yellow-900/30 p-2 overflow-y-auto">
                              <h4 className="text-[10px] text-yellow-600 font-bold uppercase mb-1">{t.bunker.currentStory}</h4>
                              <p className="text-[10px] text-yellow-100/70">{recruitForm.currentStory || "PENDING UPDATE..."}</p>
                            </div>
                            <div className="bg-emerald-900/5 border border-emerald-900/30 p-2 overflow-y-auto">
                               <h4 className="text-[10px] text-emerald-600 font-bold uppercase mb-1">{t.bunker.objectives}</h4>
                               <ul className="space-y-1">
                                  {recruitForm.objectives.length > 0 ? recruitForm.objectives.map((obj, i) => <li key={i} className="text-[10px] text-emerald-100/70">› {obj}</li>) : <li className="text-[10px] italic opacity-50">NONE</li>}
                               </ul>
                            </div>
                          </div>
                      </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-cyan-800 pt-4 shrink-0">
                <button type="button" onClick={handleSeedDatabase} className="text-[9px] text-cyan-900 hover:text-cyan-600 uppercase transition-colors">
                  {seedStatus === "idle" ? t.recruit.adminSeed : seedStatus === "success" ? t.recruit.seedSuccess : "ERROR"}
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowRecruitModal(false)} className="px-4 py-2 border border-red-900 text-red-500 hover:bg-red-900/20 text-xs font-bold tracking-widest">
                    {t.bunker.cancel}
                  </button>
                  <button
                    type="submit"
                    // CORRECCIÓN: Deshabilitar si no hay template seleccionado
                    disabled={!recruitForm.templateId && !isEditingExisting}
                    className={`px-6 py-2 text-white font-bold tracking-widest text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all ${recruitMode === 'CAPTURE' ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                  >
                    {isEditingExisting ? "UPDATE DB" : recruitMode === 'CAPTURE' ? "CAPTURAR" : t.recruit.submit}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage || "/placeholder.svg"} alt="Zoomed Asset" className="max-h-[90vh] max-w-[90vw] border-4 border-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.5)] object-contain" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-500 text-xs tracking-[0.5em] animate-pulse">CLICK TO CLOSE</div>
        </div>
      )}

      {viewingSheetUrl && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                <div className="flex justify-between items-center p-4 bg-red-950/30 border-b border-red-800 shrink-0">
                    <h3 className="text-red-500 font-bold tracking-[0.3em] animate-pulse">TOP SECRET // EYES ONLY</h3>
                    <button onClick={() => setViewingSheetUrl(null)} className="text-red-500 hover:text-white text-xl font-bold">✕</button>
                </div>
                <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-950 scrollbar-thin scrollbar-thumb-red-900">
                    <img src={viewingSheetUrl} className="max-w-full h-auto object-contain" alt="Game Sheet" />
                </div>
            </div>
        </div>
      )}

    </div>
  );
};