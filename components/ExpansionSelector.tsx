import React, { useState, useMemo, useEffect } from 'react';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { getHeroTemplates } from '../services/dbService';
import { Language } from '../translations';
import { Hero, HeroTemplate } from '../types';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingSheet, setViewingSheet] = useState<string | null>(null);
    
    const [dbHeroes, setDbHeroes] = useState<HeroTemplate[]>([]);
    const [loadingDb, setLoadingDb] = useState(true);

    const isZombie = playerAlignment === 'ZOMBIE';
    
    const borderColor = isZombie ? 'border-lime-500' : 'border-cyan-500';
    const textColor = isZombie ? 'text-lime-400' : 'text-cyan-400';
    const bgColor = isZombie ? 'bg-lime-600' : 'bg-cyan-600';

    useEffect(() => {
        const fetchFromDb = async () => {
            try {
                const templates = await getHeroTemplates();
                setDbHeroes(templates);
            } catch (e) {
                console.error("Error cargando héroes de DB", e);
            } finally {
                setLoadingDb(false);
            }
        };
        fetchFromDb();
    }, []);

    const availableHeroes = useMemo(() => {
        if (loadingDb) return [];

        let allHeroes: Hero[] = [];
        const processedIds = new Set<string>();

        for (const exp of GAME_EXPANSIONS) {
            if (!ownedExpansions.has(exp.id)) continue;

            const baseList = isZombie ? exp.zombieHeroes : exp.heroes;

            const heroesInBox = baseList.map(localHero => {
                const dbVersion = dbHeroes.find(h => h.id === localHero.id);
                processedIds.add(localHero.id);

                if (dbVersion) {
                    return {
                        ...localHero,
                        name: dbVersion.defaultName,
                        alias: dbVersion.alias,
                        class: dbVersion.defaultClass,
                        stats: dbVersion.defaultStats,
                        imageUrl: dbVersion.imageUrl,
                        bio: dbVersion.bio || localHero.bio,
                        imageParams: dbVersion.imageParams,
                        characterSheetUrl: dbVersion.characterSheetUrl
                    };
                }
                return localHero;
            });
            allHeroes = [...allHeroes, ...heroesInBox];
        }

        const customHeroes = dbHeroes.filter(h => {
            const notProcessed = !processedIds.has(h.id);
            const matchesAlignment = h.defaultAlignment === playerAlignment;
            const isCustomBox = !h.expansionId || h.expansionId === 'custom_database';
            return notProcessed && matchesAlignment && isCustomBox;
        });

        if (customHeroes.length > 0) {
            const formattedCustomHeroes: Hero[] = customHeroes.map(h => ({
                id: h.id,
                templateId: h.id,
                name: h.defaultName,
                alias: h.alias,
                class: h.defaultClass,
                bio: h.bio || '',
                status: 'AVAILABLE',
                imageUrl: h.imageUrl,
                stats: h.defaultStats,
                assignedMissionId: null,
                objectives: h.objectives || [],
                completedObjectiveIndices: [],
                currentStory: h.currentStory || '',
                imageParams: h.imageParams,
                characterSheetUrl: h.characterSheetUrl
            }));
            allHeroes = [...allHeroes, ...formattedCustomHeroes];
        }

        if (searchTerm) {
            allHeroes = allHeroes.filter(h => 
                h.alias.toLowerCase().includes(searchTerm.toLowerCase()) || 
                h.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return allHeroes;

    }, [isZombie, searchTerm, dbHeroes, loadingDb, playerAlignment, ownedExpansions]);

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
            
            {/* --- VISOR DE FICHA (OVERLAY) --- */}
            {viewingSheet && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setViewingSheet(null)}>
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        {/* IMAGEN AJUSTADA PARA TAMAÑO UNIFORME */}
                        <img 
                            src={viewingSheet} 
                            alt="Tactical Sheet" 
                            className="h-[85vh] w-auto max-w-[95vw] object-contain border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] rounded-xl bg-black" 
                            onClick={(e) => e.stopPropagation()} 
                        />
                        <button 
                            onClick={() => setViewingSheet(null)} 
                            className="mt-4 px-8 py-2 bg-red-900/80 text-white font-bold tracking-widest border border-red-600 hover:bg-red-800 uppercase text-xs shadow-lg rounded"
                        >
                            CERRAR
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className={`flex-none h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 z-20 shadow-lg`}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white text-xl font-bold">←</button>
                    <h2 className={`text-xl font-black tracking-[0.2em] uppercase ${textColor}`}>
                        {language === 'es' ? 'RECLUTAMIENTO TÁCTICO' : 'TACTICAL RECRUITMENT'}
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            placeholder={language === 'es' ? "BUSCAR AGENTE..." : "SEARCH AGENT..."} 
                            className="w-full bg-slate-950 border border-slate-700 p-2 pl-8 text-xs text-white focus:border-cyan-500 outline-none rounded-sm" 
                        />
                        <span className="absolute left-2 top-2 text-gray-500 text-xs">🔍</span>
                    </div>
                    <button 
                        onClick={handleConfirm} 
                        disabled={selectedHeroes.length === 0} 
                        className={`px-6 py-2 font-bold text-xs tracking-widest uppercase transition-all ${selectedHeroes.length > 0 ? `${bgColor} text-white hover:brightness-110 shadow-lg` : 'bg-slate-800 text-gray-500 cursor-not-allowed'}`}
                    >
                        {language === 'es' ? 'DESPLEGAR EQUIPO' : 'DEPLOY SQUAD'}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* COLUMNA 1: EXPANSIONES */}
                <div className="w-1/5 bg-slate-900 border-r border-slate-800 flex flex-col min-w-[250px]">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">ARSENAL (EXPANSIONES)</h3>
                        <div className="flex gap-1">
                            <button onClick={() => onToggleAllExpansions(true)} className="text-[9px] text-cyan-500 hover:text-white px-1">ALL</button>
                            <span className="text-gray-600">|</span>
                            <button onClick={() => onToggleAllExpansions(false)} className="text-[9px] text-gray-500 hover:text-white px-1">NONE</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                        {GAME_EXPANSIONS.map(exp => {
                            const isOwned = ownedExpansions.has(exp.id);
                            return (
                                <div 
                                    key={exp.id} 
                                    onClick={() => onToggleExpansion(exp.id)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all border-l-2 ${isOwned ? `bg-slate-800 ${isZombie ? 'border-lime-500' : 'border-cyan-500'}` : 'bg-transparent border-transparent hover:bg-slate-800/50'}`}
                                >
                                    <div className={`w-4 h-4 border flex items-center justify-center ${isOwned ? `${isZombie ? 'bg-lime-600 border-lime-500' : 'bg-cyan-600 border-cyan-500'} text-black` : 'border-slate-600'}`}>
                                        {isOwned && <span className="text-[10px] font-bold">✓</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isOwned ? 'text-white' : 'text-gray-500'}`}>{exp.name}</span>
                                </div>
                            );
                        })}
                        <div className="flex items-center gap-3 p-3 bg-slate-800/30 border-l-2 border-purple-500 cursor-default opacity-80">
                            <div className="w-4 h-4 bg-purple-600 flex items-center justify-center text-black text-[10px] font-bold">✓</div>
                            <span className="text-[10px] font-bold uppercase text-purple-300">CUSTOM DATABASE</span>
                        </div>
                    </div>
                </div>

                {/* COLUMNA 2: POOL DE HÉROES */}
                <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>AGENTES DISPONIBLES ({availableHeroes.length})</h3>
                        <div className="text-[10px] text-gray-500">SELECCIONA PARA AÑADIR AL ESCUADRÓN</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700">
                        {loadingDb ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
                                <div className="text-2xl mb-2">✇</div>
                                <div className="text-xs tracking-widest">ACCEDIENDO A LA BASE DE DATOS...</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {availableHeroes.map(hero => {
                                    const isSelected = selectedHeroes.some(h => h.id === hero.id);
                                    const isDisabled = !isSelected && selectedHeroes.length >= 6;

                                    const imgStyle = hero.imageParams ? {
                                        transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
                                    } : {};

                                    return (
                                        <div 
                                            key={hero.id} 
                                            onClick={() => !isDisabled && toggleHero(hero)}
                                            className={`
                                                relative group cursor-pointer border transition-all duration-200 overflow-hidden aspect-[3/4]
                                                ${isSelected 
                                                    ? `${borderColor} ring-2 ring-offset-2 ring-offset-slate-950 ${isZombie ? 'ring-lime-500/50' : 'ring-cyan-500/50'}` 
                                                    : isDisabled 
                                                        ? 'border-slate-800 opacity-30 grayscale cursor-not-allowed' 
                                                        : 'border-slate-700 hover:border-white hover:scale-[1.02] hover:shadow-xl hover:z-10'
                                                }
                                            `}
                                        >
                                            <div className="absolute inset-0 overflow-hidden">
                                                <img 
                                                    src={hero.imageUrl} 
                                                    alt={hero.alias} 
                                                    className="w-full h-full object-cover" 
                                                    style={imgStyle}
                                                />
                                            </div>
                                            
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none"></div>

                                            {/* BOTÓN VER FICHA (SOLO SI EXISTE URL) */}
                                            {hero.characterSheetUrl && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setViewingSheet(hero.characterSheetUrl!); }}
                                                    className="absolute top-2 left-2 w-6 h-6 bg-yellow-600 hover:bg-yellow-400 text-black flex items-center justify-center rounded-sm shadow-lg z-20 transition-transform hover:scale-110 border border-yellow-300"
                                                    title="Ver Ficha de Juego"
                                                >
                                                    🗃
                                                </button>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
                                                <div className={`text-[10px] font-black uppercase truncate ${isSelected ? textColor : 'text-white'}`}>{hero.alias}</div>
                                                <div className="text-[8px] text-gray-400 font-mono">{hero.class}</div>
                                            </div>

                                            {isSelected && (
                                                <div className={`absolute top-2 right-2 w-6 h-6 ${bgColor} flex items-center justify-center text-black font-bold shadow-lg`}>
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA 3: ESCUADRÓN */}
                <div className="w-1/5 bg-slate-900 border-l border-slate-800 flex flex-col min-w-[200px]">
                    <div className={`p-4 border-b border-slate-800 ${selectedHeroes.length === 6 ? 'bg-red-900/20' : 'bg-slate-950'}`}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ESCUADRÓN ACTIVO</h3>
                        <div className={`text-2xl font-black ${selectedHeroes.length === 6 ? 'text-red-500 animate-pulse' : textColor}`}>
                            {selectedHeroes.length} / 6
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {[...Array(6)].map((_, i) => {
                            const hero = selectedHeroes[i];
                            const imgStyle = hero?.imageParams ? {
                                transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
                            } : {};

                            return (
                                <div 
                                    key={i} 
                                    className={`
                                        relative h-20 border flex items-center justify-center transition-all
                                        ${hero 
                                            ? `${borderColor} bg-slate-800 cursor-pointer group` 
                                            : 'border-slate-800 border-dashed bg-slate-950/50'
                                        }
                                    `}
                                    onClick={() => hero && toggleHero(hero)}
                                >
                                    {hero ? (
                                        <>
                                            <div className="absolute inset-0 flex">
                                                <div className="w-20 h-full shrink-0 relative overflow-hidden">
                                                    <img 
                                                        src={hero.imageUrl} 
                                                        className="w-full h-full object-cover" 
                                                        alt="" 
                                                        style={imgStyle}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-800 pointer-events-none"></div>
                                                </div>
                                                <div className="flex-1 p-2 flex flex-col justify-center min-w-0">
                                                    <div className={`text-[10px] font-bold truncate ${textColor}`}>{hero.alias}</div>
                                                    <div className="text-[8px] text-gray-500">{hero.class}</div>
                                                </div>
                                            </div>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-6 h-6 bg-red-600 text-white flex items-center justify-center rounded-full text-[10px] font-bold shadow-md">✕</div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-slate-700 font-black text-2xl select-none">{i + 1}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950">
                        <button 
                            onClick={handleConfirm} 
                            disabled={selectedHeroes.length === 0}
                            className={`w-full py-3 font-bold text-xs tracking-widest uppercase transition-all ${selectedHeroes.length > 0 ? `${bgColor} text-white hover:brightness-110` : 'bg-slate-800 text-gray-600 cursor-not-allowed'}`}
                        >
                            CONFIRMAR
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};