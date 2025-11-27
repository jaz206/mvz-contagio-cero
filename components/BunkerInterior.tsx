
import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { Hero, Mission, HeroClass } from '../types';

interface BunkerInteriorProps {
  heroes: Hero[];
  missions: Mission[];
  onAssign: (heroId: string, missionId: string) => boolean;
  onUnassign: (heroId: string) => void;
  onAddHero: (hero: Hero) => void;
  onBack: () => void;
  language: Language;
}

export const BunkerInterior: React.FC<BunkerInteriorProps> = ({ heroes, missions, onAssign, onUnassign, onAddHero, onBack, language }) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string>(heroes[0]?.id || '');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Form State
  const [recruitForm, setRecruitForm] = useState({
      name: '',
      alias: '',
      class: 'BRAWLER' as HeroClass,
      bio: '',
      imageUrl: '',
      str: 5,
      agi: 5,
      int: 5
  });

  const t = translations[language];
  const selectedHero = heroes.find(h => h.id === selectedHeroId);

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

  const renderStatBar = (val: number, color: string) => (
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${(val / 10) * 100}%` }}></div>
      </div>
  );

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

  const handleRecruitSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newHero: Hero = {
          id: `custom_${Date.now()}`,
          name: recruitForm.name || 'UNKNOWN',
          alias: recruitForm.alias || 'AGENT',
          class: recruitForm.class,
          bio: recruitForm.bio,
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
      
      // Reset form
      setRecruitForm({
        name: '',
        alias: '',
        class: 'BRAWLER',
        bio: '',
        imageUrl: '',
        str: 5,
        agi: 5,
        int: 5
      });
  };

  // Helper to find mission name if assigned
  const assignedMissionName = selectedHero?.assignedMissionId 
    ? missions.find(m => m.id === selectedHero.assignedMissionId)?.title 
    : null;

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col font-mono relative overflow-hidden">
         {/* Background Grid Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{backgroundImage: 'linear-gradient(rgba(6,182,212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
        </div>

        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-cyan-800 bg-slate-900/80 z-20">
            <h2 className="text-2xl text-cyan-300 font-bold tracking-widest">{t.bunker.title}</h2>
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

            {/* Right Column: Personnel File */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto relative">
                {selectedHero && heroDisplay ? (
                    <>
                        <div className="flex justify-between items-end border-b border-cyan-800 pb-4">
                             <div>
                                 <h1 className="text-4xl font-bold text-white mb-1">{heroDisplay.alias}</h1>
                                 <h2 className="text-lg text-cyan-600 tracking-widest">{heroDisplay.name}</h2>
                             </div>
                             <div className="text-right">
                                 <div className="text-[10px] text-cyan-600 mb-1">{t.bunker.class}</div>
                                 <div className="text-xl font-bold text-cyan-300">{selectedHero.class}</div>
                             </div>
                        </div>

                        <div className="flex gap-6">
                            {/* "Photo" Container */}
                            <div className="w-48 h-64 border-2 border-cyan-700 bg-slate-900 relative shrink-0 overflow-hidden group">
                                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-500 z-20"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyan-500 z-20"></div>
                                
                                {selectedHero.imageUrl ? (
                                    <img 
                                        src={selectedHero.imageUrl} 
                                        alt={heroDisplay.alias} 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    /* Default SVG Placeholder */
                                    <div className="w-full h-full flex items-center justify-center text-cyan-900">
                                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Overlay scan effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent opacity-30 animate-pulse pointer-events-none"></div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-xs text-cyan-500 font-bold mb-2 uppercase">{t.bunker.bio}</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed bg-slate-900/50 p-4 border border-cyan-900/50">
                                        {heroDisplay.bio}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xs text-cyan-500 font-bold mb-3 uppercase">{t.bunker.stats}</h3>
                                    <div className="space-y-3 max-w-md">
                                        <div className="flex items-center gap-4">
                                            <span className="w-20 text-[10px] text-cyan-400">{t.bunker.str}</span>
                                            {renderStatBar(selectedHero.stats.strength, 'bg-red-500')}
                                            <span className="text-xs w-4 text-right text-gray-400">{selectedHero.stats.strength}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-20 text-[10px] text-cyan-400">{t.bunker.agi}</span>
                                            {renderStatBar(selectedHero.stats.agility, 'bg-yellow-500')}
                                            <span className="text-xs w-4 text-right text-gray-400">{selectedHero.stats.agility}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="w-20 text-[10px] text-cyan-400">{t.bunker.int}</span>
                                            {renderStatBar(selectedHero.stats.intellect, 'bg-blue-500')}
                                            <span className="text-xs w-4 text-right text-gray-400">{selectedHero.stats.intellect}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ASSIGNMENT CONTROLS */}
                                <div className="mt-4 p-4 border border-cyan-800 bg-slate-900 flex justify-between items-center">
                                     <div>
                                         <div className="text-[10px] text-gray-500">{t.bunker.status}</div>
                                         <div className={`text-lg font-bold ${selectedHero.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-yellow-500'}`}>
                                             {selectedHero.status}
                                         </div>
                                         {selectedHero.assignedMissionId && (
                                             <div className="text-[10px] text-cyan-400 mt-1">
                                                {t.bunker.currentMission}: <span className="text-white font-bold">{assignedMissionName || selectedHero.assignedMissionId}</span>
                                             </div>
                                         )}
                                     </div>
                                     
                                     {selectedHero.status === 'DEPLOYED' ? (
                                        <button 
                                            onClick={() => onUnassign(selectedHero.id)}
                                            className="px-6 py-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-xs font-bold border border-red-800 tracking-widest"
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
                                            className={`px-6 py-2 text-xs font-bold border tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]
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
                    </>
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

            {/* RECRUITMENT MODAL */}
            {showRecruitModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center">
                            <h3 className="text-cyan-300 font-bold tracking-widest text-lg">{t.recruit.title}</h3>
                            <button onClick={() => setShowRecruitModal(false)} className="text-cyan-500 hover:text-white font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={handleRecruitSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-cyan-600 font-bold mb-1">{t.recruit.alias}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder={t.recruit.placeholderAlias}
                                        className="w-full bg-slate-950 border border-cyan-800 p-2 text-white focus:border-cyan-400 focus:outline-none"
                                        value={recruitForm.alias}
                                        onChange={(e) => setRecruitForm({...recruitForm, alias: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-cyan-600 font-bold mb-1">{t.recruit.name}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder={t.recruit.placeholderName}
                                        className="w-full bg-slate-950 border border-cyan-800 p-2 text-white focus:border-cyan-400 focus:outline-none"
                                        value={recruitForm.name}
                                        onChange={(e) => setRecruitForm({...recruitForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-cyan-600 font-bold mb-1">{t.recruit.class}</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-cyan-800 p-2 text-white focus:border-cyan-400 focus:outline-none"
                                        value={recruitForm.class}
                                        onChange={(e) => setRecruitForm({...recruitForm, class: e.target.value as HeroClass})}
                                    >
                                        <option value="BRAWLER">BRAWLER</option>
                                        <option value="TACTICIAN">TACTICIAN</option>
                                        <option value="SCOUT">SCOUT</option>
                                        <option value="BLASTER">BLASTER</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-cyan-600 font-bold mb-1">{t.recruit.image}</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://..."
                                        className="w-full bg-slate-950 border border-cyan-800 p-2 text-white focus:border-cyan-400 focus:outline-none"
                                        value={recruitForm.imageUrl}
                                        onChange={(e) => setRecruitForm({...recruitForm, imageUrl: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-cyan-600 font-bold mb-1">{t.recruit.bio}</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-slate-950 border border-cyan-800 p-2 text-white focus:border-cyan-400 focus:outline-none text-sm"
                                        value={recruitForm.bio}
                                        onChange={(e) => setRecruitForm({...recruitForm, bio: e.target.value})}
                                    />
                                </div>
                                
                                <div className="border border-cyan-900 p-3 bg-slate-950/50">
                                    <label className="block text-xs text-cyan-400 font-bold mb-3 border-b border-cyan-900 pb-1">{t.recruit.stats}</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-16 text-[10px] text-gray-400">STR</span>
                                            <input 
                                                type="range" min="1" max="10" 
                                                className="flex-1 accent-red-500"
                                                value={recruitForm.str}
                                                onChange={(e) => setRecruitForm({...recruitForm, str: parseInt(e.target.value)})}
                                            />
                                            <span className="w-6 text-right text-red-500 font-bold">{recruitForm.str}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-16 text-[10px] text-gray-400">AGI</span>
                                            <input 
                                                type="range" min="1" max="10" 
                                                className="flex-1 accent-yellow-500"
                                                value={recruitForm.agi}
                                                onChange={(e) => setRecruitForm({...recruitForm, agi: parseInt(e.target.value)})}
                                            />
                                            <span className="w-6 text-right text-yellow-500 font-bold">{recruitForm.agi}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-16 text-[10px] text-gray-400">INT</span>
                                            <input 
                                                type="range" min="1" max="10" 
                                                className="flex-1 accent-blue-500"
                                                value={recruitForm.int}
                                                onChange={(e) => setRecruitForm({...recruitForm, int: parseInt(e.target.value)})}
                                            />
                                            <span className="w-6 text-right text-blue-500 font-bold">{recruitForm.int}</span>
                                        </div>
                                        <div className="text-right text-[10px] text-gray-500 pt-1">
                                            TOTAL: <span className={`${(recruitForm.str + recruitForm.agi + recruitForm.int) > 25 ? 'text-red-500' : 'text-cyan-500'}`}>{recruitForm.str + recruitForm.agi + recruitForm.int}</span> / 25
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-2 flex justify-end gap-4 mt-2 border-t border-cyan-800 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowRecruitModal(false)}
                                    className="px-6 py-2 border border-red-900 text-red-500 hover:bg-red-900/20"
                                >
                                    {t.bunker.cancel}
                                </button>
                                <button 
                                    type="submit"
                                    disabled={(recruitForm.str + recruitForm.agi + recruitForm.int) > 25}
                                    className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                >
                                    {t.recruit.submit}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
