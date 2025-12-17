import React, { useState, useMemo, useEffect } from 'react';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { Language } from '../translations';
import { Hero } from '../types';

interface ExpansionSelectorProps {
    onConfirm: (selectedHeroes: Hero[]) => void;
    onBack: () => void;
    language: Language;
    playerAlignment: 'ALIVE' | 'ZOMBIE';
    ownedExpansions: Set<string>;
    onToggleExpansion: (id: string) => void;
    onToggleAllExpansions: (select: boolean) => void;
}

export const ExpansionSelector: React.FC<ExpansionSelectorProps> = ({ 
    onConfirm, onBack, language, playerAlignment,
    ownedExpansions, onToggleExpansion, onToggleAllExpansions
}) => {
    const [selectedHeroes, setSelectedHeroes] = useState<Hero[]>([]);
    const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set(['core_box'])); 
    const [searchTerm, setSearchTerm] = useState('');

    const isZombie = playerAlignment === 'ZOMBIE';
    
    const borderColor = isZombie ? 'border-lime-500' : 'border-cyan-500';
    const textColor = isZombie ? 'text-lime-400' : 'text-cyan-400';
    const bgColor = isZombie ? 'bg-lime-600' : 'bg-cyan-600';
    const glowClass = isZombie ? 'shadow-[0_0_15px_rgba(132,204,22,0.5)]' : 'shadow-[0_0_15px_rgba(6,182,212,0.5)]';

    const filteredData = useMemo(() => {
        return GAME_EXPANSIONS.map(exp => {
            const availableHeroes = isZombie ? exp.zombieHeroes : exp.heroes;
            const matchingHeroes = searchTerm 
                ? availableHeroes.filter(h => h.alias.toLowerCase().includes(searchTerm.toLowerCase()) || h.name.toLowerCase().includes(searchTerm.toLowerCase()))
                : availableHeroes;
            return { ...exp, heroesToShow: matchingHeroes };
        }); 
    }, [isZombie, searchTerm]);

    const toggleBox = (id: string) => {
        const newSet = new Set(expandedBoxes);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedBoxes(newSet);
    };

    const toggleHero = (hero: Hero) => {
        const isSelected = selectedHeroes.some(h => h.id === hero.id);
        if (isSelected) {
            setSelectedHeroes(prev => prev.filter(h => h.id !== hero.id));
        } else {
            if (selectedHeroes.length >= 6) return;
            setSelectedHeroes(prev => [...prev, hero]);
        }
    };

    const handleConfirm = () => {
        if (selectedHeroes.length === 0) {
            alert(language === 'es' ? "DEBES SELECCIONAR AL MENOS UN HÉROE." : "YOU MUST SELECT AT LEAST ONE HERO.");
            return;
        }
        onConfirm(selectedHeroes);
    };

    return (
        <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col font-mono h-screen w-screen overflow-hidden">
            
            {/* FONDO */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(0deg,transparent_24%,${isZombie ? '#84cc16' : '#06b6d4'}_25%,${isZombie ? '#84cc16' : '#06b6d4'}_26%,transparent_27%,transparent_74%,${isZombie ? '#84cc16' : '#06b6d4'}_75%,${isZombie ? '#84cc16' : '#06b6d4'}_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,${isZombie ? '#84cc16' : '#06b6d4'}_25%,${isZombie ? '#84cc16' : '#06b6d4'}_26%,transparent_27%,transparent_74%,${isZombie ? '#84cc16' : '#06b6d4'}_75%,${isZombie ? '#84cc16' : '#06b6d4'}_76%,transparent_77%,transparent)] bg-[length:50px_50px]`}></div>

            {/* HEADER (Fijo arriba) */}
            <div className={`flex-none p-4 border-b-2 ${borderColor} bg-slate-900 z-20 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 relative`}>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={onBack} className={`w-10 h-10 flex items-center justify-center border-2 ${borderColor} text-white hover:bg-white/10 transition-colors font-bold text-xl`}>←</button>
                    <div>
                        <h2 className={`text-xl md:text-2xl font-black tracking-[0.2em] uppercase ${textColor} flex items-center gap-3 drop-shadow-md`}>
                            <span className="text-3xl">{isZombie ? '🧟' : '🛡️'}</span>
                            {language === 'es' ? 'RECLUTAMIENTO' : 'RECRUITMENT'}
                        </h2>
                        <p className="text-xs text-white font-bold tracking-widest mt-1">
                            {language === 'es' ? 'SELECCIONA TU EQUIPO Y EXPANSIONES' : 'SELECT YOUR SQUAD AND EXPANSIONS'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onToggleAllExpansions(true)} className="text-[9px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 border border-white/30 rounded uppercase">{language === 'es' ? 'MARCAR TODAS' : 'CHECK ALL'}</button>
                    <button onClick={() => onToggleAllExpansions(false)} className="text-[9px] bg-black/30 hover:bg-black/50 text-gray-400 px-2 py-1 border border-white/10 rounded uppercase">{language === 'es' ? 'DESMARCAR TODAS' : 'UNCHECK ALL'}</button>
                </div>
                <div className="relative w-full md:w-64">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={language === 'es' ? "BUSCAR AGENTE..." : "SEARCH AGENT..."} className={`w-full bg-black border-2 ${borderColor} p-2 pl-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:bg-slate-900 transition-colors uppercase font-bold shadow-inner`} />
                    <span className="absolute left-2 top-2 text-white font-bold text-xs">🔍</span>
                </div>
            </div>

            {/* MAIN CONTENT (Scrollable) */}
            {/* flex-1 hace que ocupe todo el espacio disponible entre el header y el footer */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-600 relative z-10">
                <div className="max-w-5xl mx-auto space-y-6 pb-8">
                    {filteredData.map((exp) => {
                        const isOpen = expandedBoxes.has(exp.id) || searchTerm.length > 0;
                        const isOwned = ownedExpansions.has(exp.id);
                        
                        return (
                            <div key={exp.id} className={`border-2 ${isOwned ? borderColor : 'border-slate-700'} bg-slate-900 shadow-lg transition-all duration-300 ${!isOwned ? 'opacity-70' : ''}`}>
                                <div className={`w-full flex justify-between items-center p-3 transition-colors ${isOpen ? `bg-slate-800 border-b-2 ${isOwned ? borderColor : 'border-slate-700'}` : 'bg-slate-900'}`}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div onClick={(e) => { e.stopPropagation(); onToggleExpansion(exp.id); }} className={`w-6 h-6 border-2 flex items-center justify-center cursor-pointer transition-all ${isOwned ? `${borderColor} bg-black text-white` : 'border-slate-600 bg-slate-800'}`}>
                                            {isOwned && '✓'}
                                        </div>
                                        <button onClick={() => toggleBox(exp.id)} className="flex items-center gap-3 flex-1 text-left">
                                            <span className={`text-sm md:text-lg font-black tracking-widest uppercase ${isOwned ? 'text-white' : 'text-gray-500'} drop-shadow-md`}>{exp.name}</span>
                                            {!isOwned && <span className="text-[9px] bg-slate-700 text-gray-400 px-2 py-0.5 rounded">NOT OWNED</span>}
                                        </button>
                                    </div>
                                    <button onClick={() => toggleBox(exp.id)} className={`text-xs font-bold px-3 py-1.5 rounded border ${isOwned ? `${borderColor} ${textColor}` : 'border-slate-600 text-slate-500'} bg-black shrink-0 ml-2`}>
                                        {isOpen ? '▲' : '▼'} {exp.heroesToShow.length}
                                    </button>
                                </div>

                                {isOpen && (
                                    <div className={`p-4 bg-black/40 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in ${!isOwned ? 'grayscale opacity-50 pointer-events-none' : ''}`}>
                                        {exp.heroesToShow.map(hero => {
                                            const isSelected = selectedHeroes.some(h => h.id === hero.id);
                                            const isDisabled = !isSelected && selectedHeroes.length >= 6;
                                            return (
                                                <div key={hero.id} onClick={() => !isDisabled && toggleHero(hero)} className={`relative group cursor-pointer border-2 transition-all duration-200 overflow-hidden rounded-sm ${isSelected ? `${borderColor} bg-slate-800 ${glowClass} transform scale-105 z-10` : isDisabled ? 'border-slate-700 opacity-30 grayscale cursor-not-allowed' : 'border-slate-600 bg-slate-900 hover:border-white hover:bg-slate-800'}`}>
                                                    {isSelected && <div className={`absolute top-0 right-0 p-1.5 z-20 ${bgColor} shadow-lg border-l border-b border-black`}><svg className="w-4 h-4 text-black font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg></div>}
                                                    <div className="aspect-[4/5] w-full overflow-hidden relative bg-black">
                                                        <img src={hero.imageUrl} alt={hero.alias} className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-white/20 bg-slate-900/95">
                                                        <div className={`text-[10px] md:text-xs font-black truncate uppercase ${isSelected ? textColor : 'text-white'}`}>{hero.alias}</div>
                                                        <div className="text-[9px] text-gray-400 font-mono">{hero.class}</div>
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

            {/* FOOTER (Fijo abajo, pero ocupando espacio real) */}
            <div className={`flex-none h-28 border-t-4 ${borderColor} bg-slate-900 z-50 flex items-center px-4 md:px-8 justify-between shadow-[0_-10px_50px_rgba(0,0,0,1)]`}>
                <div className="flex items-center gap-3 overflow-x-auto flex-1 mr-4 scrollbar-hide py-2">
                    <div className="flex flex-col justify-center mr-4 shrink-0 text-center">
                        <span className={`text-4xl font-black ${selectedHeroes.length === 6 ? 'text-red-500 animate-pulse' : textColor}`}>{selectedHeroes.length}/6</span>
                        <span className="text-[10px] text-white font-bold tracking-[0.2em]">SQUAD</span>
                    </div>
                    {[...Array(6)].map((_, i) => {
                        const hero = selectedHeroes[i];
                        return (
                            <div key={i} onClick={() => hero && toggleHero(hero)} className={`w-16 h-20 border-2 shrink-0 relative flex items-center justify-center transition-all group ${hero ? `${borderColor} cursor-pointer bg-slate-800` : 'border-slate-700 bg-black border-dashed'}`}>
                                {hero ? (
                                    <>
                                        <img src={hero.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                        <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white">✕</div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black text-[8px] text-white text-center py-0.5 truncate px-1 font-bold">{hero.alias}</div>
                                    </>
                                ) : <span className="text-slate-600 text-xl font-bold">{i + 1}</span>}
                            </div>
                        );
                    })}
                </div>
                <button onClick={handleConfirm} disabled={selectedHeroes.length === 0} className={`px-8 py-4 font-black tracking-[0.2em] text-sm transition-all shadow-lg shrink-0 border-2 ${selectedHeroes.length > 0 ? isZombie ? 'bg-lime-600 hover:bg-lime-500 text-black border-lime-400 hover:shadow-[0_0_20px_rgba(132,204,22,0.8)]' : 'bg-cyan-600 hover:bg-cyan-500 text-black border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.8)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-600'}`}>
                    {language === 'es' ? 'DESPLEGAR' : 'DEPLOY'}
                </button>
            </div>
        </div>
    );
};