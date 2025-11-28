
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { Hero, Mission, HeroClass, HeroTemplate } from '../types';
import { getHeroTemplates, seedHeroTemplates } from '../services/dbService';

interface BunkerInteriorProps {
  heroes: Hero[];
  missions: Mission[];
  onAssign: (heroId: string, missionId: string) => boolean;
  onUnassign: (heroId: string) => void;
  onAddHero: (hero: Hero) => void;
  onToggleObjective: (heroId: string, objectiveIndex: number) => void;
  onBack: () => void;
  language: Language;
  playerAlignment?: 'ALIVE' | 'ZOMBIE' | null;
}

// Reusable Cerebro Scanner Component
const CerebroScanner = ({ status }: { status: 'SEARCHING' | 'LOCKED' }) => {
    return (
        <div className={`w-full h-24 bg-slate-950 border relative overflow-hidden flex items-center justify-center p-2 transition-all duration-500 ${status === 'LOCKED' ? 'border-emerald-600 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]' : 'border-cyan-900'}`}>
            {/* Background Rings */}
            <div className={`absolute inset-0 border rounded-full m-1 opacity-30 ${status === 'LOCKED' ? 'border-emerald-500' : 'border-cyan-900'}`}></div>
            <div className={`absolute inset-0 border rounded-full m-6 opacity-20 ${status === 'LOCKED' ? 'border-emerald-500' : 'border-cyan-800'}`}></div>
            
            {/* Scanning Line / Target */}
            {status === 'SEARCHING' ? (
                <div className="absolute w-full h-[2px] bg-cyan-500/50 top-1/2 left-0 animate-[spin_3s_linear_infinite] shadow-[0_0_10px_#06b6d4]"></div>
            ) : (
                <>
                    <div className="absolute w-full h-[1px] bg-emerald-500/50 top-1/2 left-0"></div>
                    <div className="absolute h-full w-[1px] bg-emerald-500/50 top-0 left-1/2"></div>
                    <div className="absolute w-12 h-12 border-2 border-emerald-500 rounded-full animate-pulse"></div>
                </>
            )}
            
            {/* Text Overlay */}
            <div className={`text-[8px] font-mono z-10 flex flex-col items-center ${status === 'LOCKED' ? 'text-emerald-400' : 'text-cyan-600'}`}>
                <div className="tracking-widest font-bold">CEREBRO SCANNER</div>
                <div className={`mt-1 ${status === 'SEARCHING' ? 'animate-pulse' : ''}`}>
                    {status === 'SEARCHING' ? 'SEARCHING GLOBAL FEED...' : 'SIGNAL LOCKED // CONFIRMED'}
                </div>
                <div className="text-[6px] mt-1 font-bold opacity-70">
                    LAT: {status === 'LOCKED' ? '40.7128 N' : `${Math.floor(Math.random() * 90)}.${Math.floor(Math.random() * 99)} N`}<br/>
                    LNG: {status === 'LOCKED' ? '74.0060 W' : `${Math.floor(Math.random() * 180)}.${Math.floor(Math.random() * 99)} W`}
                </div>
            </div>
            
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20" 
                style={{backgroundImage: `radial-gradient(circle, ${status === 'LOCKED' ? '#10b981' : '#06b6d4'} 1px, transparent 1px)`, backgroundSize: '10px 10px'}}>
            </div>
        </div>
    );
};

export const BunkerInterior: React.FC<BunkerInteriorProps> = ({ heroes, missions, onAssign, onUnassign, onAddHero, onToggleObjective, onBack, language, playerAlignment }) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string>(heroes[0]?.id || '');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  
  // Image Zoom State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Database State
  const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [recruitForm, setRecruitForm] = useState({
      templateId: '', // Added for tracking DB templates
      name: '',
      alias: '',
      class: 'BRAWLER' as HeroClass,
      bio: '',
      currentStory: '', // NEW
      objectives: [] as string[], // NEW
      imageUrl: '',
      str: 5,
      agi: 5,
      int: 5
  });
  
  const t = translations[language];
  const selectedHero = heroes.find(h => h.id === selectedHeroId);

  // Load Templates from Firestore on mount
  useEffect(() => {
      const fetchTemplates = async () => {
          setIsLoadingDb(true);
          const templates = await getHeroTemplates();
          setDbTemplates(templates);
          setIsLoadingDb(false);
      };
      fetchTemplates();
  }, []);

  // Handler for Seeding Database
  const handleSeedDatabase = async () => {
      try {
          setSeedStatus('idle');
          await seedHeroTemplates();
          setSeedStatus('success');
          // Refresh list
          const templates = await getHeroTemplates();
          setDbTemplates(templates);
      } catch (e) {
          console.error(e);
          setSeedStatus('error');
      }
  };

  // Helper to get translated hero text
  const getHeroText = (hero: Hero) => {
      if (hero.templateId) {
          // Look up in translations
          const tHero = t.heroes[hero.templateId as keyof typeof t.heroes];
          if (tHero) {
              return {
                  name: hero.name, // Usually kept as is, but could be translated
                  alias: tHero.alias,
                  bio: tHero.bio
              };
          }
      }
      // Fallback to hero object data (for custom heroes)
      return {
          name: hero.name,
          alias: hero.alias,
          bio: hero.bio
      };
  };

  const heroDisplay = selectedHero ? getHeroText(selectedHero) : null;

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'AVAILABLE': return 'text-emerald-400 bg-emerald-900/30 border-emerald-600';
          case 'DEPLOYED': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
          case 'INJURED': return 'text-red-400 bg-red-900/30 border-red-600';
          case 'MIA': return 'text-gray-400 bg-gray-800 border-gray-600';
          default: return 'text-cyan-400';
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

  const handleSelectTemplate = (templateId: string) => {
      const template = dbTemplates.find(h => h.id === templateId);
      if (template) {
          // Find translation for bio alias if available
          const tHero = t.heroes[templateId as keyof typeof t.heroes];
          
          setRecruitForm({
              templateId: templateId,
              name: template.defaultName,
              alias: tHero ? tHero.alias : (template.alias || template.defaultName.toUpperCase()),
              class: template.defaultClass,
              bio: tHero ? tHero.bio : (template.bio || 'No bio available'),
              currentStory: template.currentStory || '', // Load from template
              objectives: template.objectives || [],     // Load from template
              imageUrl: template.imageUrl,
              str: template.defaultStats.strength,
              agi: template.defaultStats.agility,
              int: template.defaultStats.intellect
          });
      } else {
          // Reset if empty selection
          setRecruitForm({
            templateId: '',
            name: '',
            alias: '',
            class: 'BRAWLER',
            bio: '',
            currentStory: '',
            objectives: [],
            imageUrl: '',
            str: 5,
            agi: 5,
            int: 5
          });
      }
  };

  const handleRecruitSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newHero: Hero = {
          id: `custom_${Date.now()}`,
          templateId: recruitForm.templateId || undefined, 
          name: recruitForm.name || 'UNKNOWN',
          alias: recruitForm.alias || 'AGENT',
          class: recruitForm.class,
          bio: recruitForm.bio,
          currentStory: recruitForm.currentStory, // SAVE
          objectives: recruitForm.objectives,     // SAVE
          completedObjectiveIndices: [],
          imageUrl: recruitForm.imageUrl,
          status: 'AVAILABLE',
          stats: {
              strength: recruitForm.str,
              agility: recruitForm.agi,
              intellect: recruitForm.int
          },
          assignedMissionId: null
      };

      onAddHero(newHero);
      setShowRecruitModal(false);
      setSelectedHeroId(newHero.id);
      
      setRecruitForm({
        templateId: '',
        name: '',
        alias: '',
        class: 'BRAWLER',
        bio: '',
        currentStory: '',
        objectives: [],
        imageUrl: '',
        str: 5,
        agi: 5,
        int: 5
      });
      setSearchTerm('');
  };

  const assignedMissionName = selectedHero?.assignedMissionId 
    ? missions.find(m => m.id === selectedHero.assignedMissionId)?.title 
    : null;

  const title = playerAlignment === 'ZOMBIE' ? t.bunker.hiveTitle : t.bunker.title;

  const availableTemplates = dbTemplates.filter(template => {
      const templateAlias = t.heroes[template.id as keyof typeof t.heroes]?.alias || template.alias || template.defaultName;
      // Filter out existing
      const exists = heroes.some(existingHero => {
          if (existingHero.templateId === template.id) return true;
          if (existingHero.alias.toUpperCase() === templateAlias.toUpperCase()) return true;
          return false;
      });
      if (exists) return false;

      // Filter by search term
      if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return templateAlias.toLowerCase().includes(term) || template.defaultName.toLowerCase().includes(term);
      }
      
      return true;
  });

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col font-mono relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{backgroundImage: 'linear-gradient(rgba(6,182,212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
        </div>

        <header className="flex justify-between items-center p-6 border-b border-cyan-800 bg-slate-900/80 z-20">
            <h2 className="text-2xl text-cyan-300 font-bold tracking-widest">{title}</h2>
            <button 
                onClick={onBack}
                className="px-4 py-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-200 transition-colors text-xs font-bold tracking-widest"
            >
                {t.bunker.return}
            </button>
        </header>

        <div className="flex flex-1 overflow-hidden p-6 gap-6 relative z-10">
            
            {/* Left Column: Roster List */}
            <div className="w-1/3 flex flex-col gap-4 border-r border-cyan-900 pr-6 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-800">
                <div className="flex justify-between items-center border-b border-cyan-800 pb-2 mb-2">
                    <h3 className="text-sm text-cyan-600 font-bold">{t.bunker.roster}</h3>
                    <button 
                        onClick={() => setShowRecruitModal(true)}
                        className="text-xs bg-cyan-900/50 hover:bg-cyan-800 border border-cyan-500 text-cyan-300 px-2 py-1 flex items-center gap-1"
                    >
                        <span>+</span> {t.bunker.recruit}
                    </button>
                </div>
                
                <div className="space-y-3">
                    {heroes.map(hero => {
                        const hText = getHeroText(hero);
                        return (
                            <div 
                                key={hero.id}
                                onClick={() => setSelectedHeroId(hero.id)}
                                className={`p-3 border cursor-pointer transition-all flex items-center justify-between group
                                    ${selectedHeroId === hero.id 
                                        ? 'bg-cyan-900/30 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                        : 'bg-slate-900 border-cyan-900 hover:border-cyan-600'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {hero.imageUrl ? (
                                        <img src={hero.imageUrl} alt={hText.alias} className="w-8 h-8 rounded-full border border-cyan-600 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border border-cyan-800 bg-slate-900 flex items-center justify-center text-xs text-cyan-700">?</div>
                                    )}
                                    <div>
                                        <div className={`font-bold text-lg ${selectedHeroId === hero.id ? 'text-white' : 'text-gray-400 group-hover:text-cyan-200'}`}>
                                            {hText.alias}
                                        </div>
                                        <div className="text-[10px] text-cyan-700">{hText.name}</div>
                                    </div>
                                </div>
                                <div className={`text-[10px] px-2 py-0.5 border rounded ${getStatusColor(hero.status)}`}>
                                    {hero.status}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Personnel File - NEW DASHBOARD DESIGN */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto relative">
                {selectedHero && heroDisplay ? (
                    <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                        {/* LEFT COL: Photo & Scanner */}
                        <div className="w-full md:w-[200px] flex flex-col gap-3 shrink-0">
                            <div 
                                className="w-full aspect-[3/4] bg-slate-950 border-2 border-cyan-700 relative group cursor-pointer overflow-hidden shadow-inner" 
                                onClick={() => setZoomedImage(selectedHero.imageUrl || '')}
                            >
                                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500 z-10"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500 z-10"></div>
                                
                                {selectedHero.imageUrl ? (
                                    <img 
                                        src={selectedHero.imageUrl} 
                                        alt={heroDisplay.alias} 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-cyan-900">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-white tracking-widest border border-white px-2 py-1">ZOOM</span>
                                </div>
                            </div>

                            {/* CEREBRO SCANNER VISUAL (LOCKED STATE) */}
                            <CerebroScanner status="LOCKED" />
                        </div>

                        {/* RIGHT COL: Data */}
                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                            {/* Identity Header */}
                            <div className="flex gap-4 border-b border-cyan-900 pb-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.alias}</label>
                                    <div className="text-2xl text-white font-bold tracking-tight leading-none">{heroDisplay.alias}</div>
                                </div>
                                <div className="flex-1 text-right">
                                    <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.name}</label>
                                    <div className="text-lg text-cyan-500 leading-none">{heroDisplay.name}</div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="bg-slate-950/50 p-3 border border-cyan-900/50 flex-none h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {heroDisplay.bio}
                                </p>
                            </div>

                            {/* Story & Objectives Split */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                                {/* Current Story */}
                                <div className="bg-yellow-900/5 border border-yellow-900/30 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-900">
                                    <h4 className="text-[10px] text-yellow-600 font-bold uppercase mb-1 border-b border-yellow-900/30 pb-1">{t.bunker.currentStory}</h4>
                                    <p className="text-[10px] text-yellow-100/70 leading-relaxed">
                                        {selectedHero.currentStory || 'CLASSIFIED'}
                                    </p>
                                </div>

                                {/* Objectives - CHECKLIST */}
                                <div className="bg-emerald-900/5 border border-emerald-900/30 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900">
                                    <h4 className="text-[10px] text-emerald-600 font-bold uppercase mb-1 border-b border-emerald-900/30 pb-1">{t.bunker.objectives}</h4>
                                    {(selectedHero.objectives && selectedHero.objectives.length > 0) ? (
                                        <ul className="space-y-1">
                                            {selectedHero.objectives.map((obj, i) => {
                                                const isCompleted = selectedHero.completedObjectiveIndices?.includes(i);
                                                return (
                                                    <li key={i} className="flex gap-2 items-start">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isCompleted}
                                                            onChange={() => onToggleObjective(selectedHero.id, i)}
                                                            className="mt-0.5 h-3 w-3 appearance-none border border-emerald-500 bg-slate-900 checked:bg-emerald-500 cursor-pointer shrink-0"
                                                        />
                                                        <span className={`text-[10px] ${isCompleted ? 'text-emerald-400 line-through decoration-emerald-500/50' : 'text-emerald-100/90'}`}>
                                                            {obj}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="text-[10px] text-emerald-900/50 italic">NO OBJECTIVES ASSIGNED</div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Controls (Assignment) */}
                            <div className="mt-auto p-2 border-t border-cyan-900 flex justify-between items-center bg-slate-900/50">
                                <div>
                                    <div className="text-[9px] text-gray-500">{t.bunker.status}</div>
                                    <div className={`text-sm font-bold ${selectedHero.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-yellow-500'}`}>
                                        {selectedHero.status}
                                    </div>
                                    {selectedHero.assignedMissionId && (
                                        <div className="text-[9px] text-cyan-400">
                                        TO: <span className="text-white">{assignedMissionName || selectedHero.assignedMissionId}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedHero.status === 'DEPLOYED' ? (
                                <button 
                                    onClick={() => onUnassign(selectedHero.id)}
                                    className="px-4 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-[10px] font-bold border border-red-800 tracking-widest"
                                >
                                    {t.bunker.unassign}
                                </button>
                                ) : (
                                <button 
                                    disabled={selectedHero.status === 'INJURED' || selectedHero.status === 'MIA'}
                                    onClick={() => {
                                        setAssignError(null);
                                        setShowAssignModal(true);
                                    }}
                                    className={`px-4 py-1 text-[10px] font-bold border tracking-widest shadow-sm
                                        ${selectedHero.status === 'INJURED' 
                                            ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                                            : 'bg-cyan-900 hover:bg-cyan-800 text-cyan-300 border-cyan-600'}
                                    `}
                                >
                                    {t.bunker.assign}
                                </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-cyan-800">
                        SELECT PERSONNEL TO VIEW FILE
                    </div>
                )}
            </div>

            {/* ASSIGNMENT MODAL */}
            {showAssignModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
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
                                missions.map(mission => (
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
                            <button 
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                            >
                                {t.bunker.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECRUITMENT MODAL - COMPACT DASHBOARD STYLE WITH LIVE SEARCH */}
            {showRecruitModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-5xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col">
                        
                        {/* Header */}
                        <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center shrink-0">
                            <h3 className="text-cyan-300 font-bold tracking-widest text-lg">{t.recruit.title}</h3>
                            <button onClick={() => setShowRecruitModal(false)} className="text-cyan-500 hover:text-white font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={handleRecruitSubmit} className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
                            
                            {/* DB Selector Row WITH SEARCH - CUSTOM LIST IMPLEMENTATION */}
                            <div className="w-full pb-4 border-b border-cyan-900 shrink-0 space-y-2">
                                <label className="block text-[10px] text-cyan-400 font-bold tracking-widest">{t.recruit.selectDb}</label>
                                
                                {/* Search Input */}
                                <input 
                                    type="text" 
                                    placeholder="SEARCH DATABASE (TYPE NAME OR ALIAS)..." 
                                    className="w-full bg-slate-950 border border-cyan-700 p-2 text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none mb-2 placeholder-cyan-800 uppercase"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {/* Custom List Result Area */}
                                <div className="w-full max-h-40 bg-slate-950 border border-cyan-800 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
                                    {isLoadingDb ? (
                                        <div className="p-2 text-xs text-cyan-700 animate-pulse">{t.recruit.loadingDb}</div>
                                    ) : availableTemplates.length === 0 ? (
                                        <div className="p-2 text-xs text-gray-600 italic">NO MATCHES FOUND</div>
                                    ) : (
                                        availableTemplates.map(h => {
                                            const translation = t.heroes[h.id as keyof typeof t.heroes];
                                            const displayName = translation?.alias || h.alias || h.defaultName;
                                            const realName = h.defaultName;
                                            const isSelected = recruitForm.templateId === h.id;

                                            return (
                                                <div 
                                                    key={h.id}
                                                    onClick={() => handleSelectTemplate(h.id)}
                                                    className={`p-2 text-xs cursor-pointer flex justify-between items-center border-b border-cyan-900/30 last:border-0 hover:bg-cyan-900/30 transition-colors ${isSelected ? 'bg-cyan-900/50 text-white' : 'text-cyan-400'}`}
                                                >
                                                    <span className="font-bold tracking-wide uppercase">{displayName}</span>
                                                    <span className="text-[10px] opacity-70">{realName}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* MAIN DASHBOARD CONTENT */}
                            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                                
                                {/* LEFT COL: Photo & Stats (Compact) */}
                                <div className="w-full md:w-[200px] flex flex-col gap-3 shrink-0">
                                    {/* Photo */}
                                    <div 
                                        className="w-full aspect-[3/4] bg-slate-950 border-2 border-cyan-800 relative group cursor-zoom-in overflow-hidden shadow-inner"
                                        onClick={() => recruitForm.imageUrl && setZoomedImage(recruitForm.imageUrl)}
                                    >
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500 z-10"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500 z-10"></div>
                                        
                                        {recruitForm.imageUrl ? (
                                            <img 
                                                src={recruitForm.imageUrl} 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" 
                                                alt="Preview" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-cyan-900 flex-col gap-2">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* CEREBRO SCANNER VISUAL (SEARCHING STATE) */}
                                    <CerebroScanner status="SEARCHING" />
                                    
                                </div>

                                {/* RIGHT COL: Dossier Data */}
                                <div className="flex-1 flex flex-col gap-4 min-h-0">
                                    
                                    {/* Identity Row */}
                                    <div className="flex gap-4 border-b border-cyan-900 pb-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.alias}</label>
                                            <div className="text-2xl text-white font-bold tracking-tight leading-none">{recruitForm.alias || '---'}</div>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.name}</label>
                                            <div className="text-lg text-cyan-500 leading-none">{recruitForm.name || '---'}</div>
                                        </div>
                                    </div>

                                    {/* Biography (Scrollable if needed) */}
                                    <div className="bg-slate-950/50 p-3 border border-cyan-900/50 flex-none h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {recruitForm.bio || 'NO DATA AVAILABLE'}
                                        </p>
                                    </div>

                                    {/* Split Row: Story & Objectives */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                                        {/* Current Story */}
                                        <div className="bg-yellow-900/5 border border-yellow-900/30 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-900">
                                            <h4 className="text-[10px] text-yellow-600 font-bold uppercase mb-1 border-b border-yellow-900/30 pb-1">{t.bunker.currentStory}</h4>
                                            <p className="text-[10px] text-yellow-100/70 leading-relaxed">
                                                {recruitForm.currentStory || 'PENDING UPDATE...'}
                                            </p>
                                        </div>

                                        {/* Objectives */}
                                        <div className="bg-emerald-900/5 border border-emerald-900/30 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900">
                                            <h4 className="text-[10px] text-emerald-600 font-bold uppercase mb-1 border-b border-emerald-900/30 pb-1">{t.bunker.objectives}</h4>
                                            {recruitForm.objectives.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {recruitForm.objectives.map((obj, i) => (
                                                        <li key={i} className="text-[10px] text-emerald-100/70 flex gap-1 items-start">
                                                            <span className="text-emerald-500/50">›</span> {obj}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-[10px] text-emerald-900/50 italic">NO OBJECTIVES ASSIGNED</div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                            
                            {/* Footer Buttons */}
                            <div className="flex justify-between items-center border-t border-cyan-800 pt-4 shrink-0">
                                <button 
                                    type="button"
                                    onClick={handleSeedDatabase}
                                    className="text-[9px] text-cyan-900 hover:text-cyan-600 uppercase transition-colors"
                                >
                                    {seedStatus === 'idle' ? t.recruit.adminSeed : (seedStatus === 'success' ? t.recruit.seedSuccess : 'ERROR')}
                                </button>

                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowRecruitModal(false)}
                                        className="px-4 py-2 border border-red-900 text-red-500 hover:bg-red-900/20 text-xs font-bold tracking-widest"
                                    >
                                        {t.bunker.cancel}
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={!recruitForm.name || !recruitForm.alias}
                                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {t.recruit.submit}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL */}
            {zoomedImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
                    onClick={() => setZoomedImage(null)}
                >
                    <img 
                        src={zoomedImage} 
                        alt="Zoomed Asset" 
                        className="max-h-[90vh] max-w-[90vw] border-4 border-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.5)] object-contain"
                    />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-500 text-xs tracking-[0.5em] animate-pulse">CLICK TO CLOSE</div>
                </div>
            )}
        </div>
    </div>
  );
};
