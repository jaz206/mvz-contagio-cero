import React, { useState, useMemo, useEffect } from 'react';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { getHeroTemplates } from '../services/heroService';
import { getHeroTransformAvailability, hasAnyHeroWithTransformRule } from '../services/heroVariantRuleService';
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
    const blockedAliases = ['MAGNETO', 'KINGPIN', 'DOCTOR DOOM'];
    const transformTargetAlignment = isZombie ? 'ALIVE' : 'ZOMBIE';

    useEffect(() => {
        const fetchFromDb = async () => {
            try {
                const templates = await getHeroTemplates();
                setDbHeroes(templates);
            } catch (e) {
                console.error('Error cargando heroes de la base de datos', e);
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
                        characterSheetUrl: dbVersion.characterSheetUrl,
                        expansionId: dbVersion.expansionId || exp.id,
                        relatedHeroId: dbVersion.relatedHeroId
                    };
                }

                return {
                    ...localHero,
                    expansionId: exp.id
                };
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
                expansionId: h.expansionId,
                relatedHeroId: h.relatedHeroId,
                objectives: h.objectives || [],
                completedObjectiveIndices: [],
                currentStory: h.currentStory || '',
                imageParams: h.imageParams,
                characterSheetUrl: h.characterSheetUrl
            }));

            allHeroes = [...allHeroes, ...formattedCustomHeroes];
        }

        if (searchTerm) {
            const loweredSearchTerm = searchTerm.toLowerCase();
            allHeroes = allHeroes.filter(h =>
                h.alias.toLowerCase().includes(loweredSearchTerm) ||
                h.name.toLowerCase().includes(loweredSearchTerm)
            );
        }

        return allHeroes;
    }, [dbHeroes, isZombie, loadingDb, ownedExpansions, playerAlignment, searchTerm]);

    const hasTransformRuleAvailable = useMemo(() => (
        hasAnyHeroWithTransformRule(selectedHeroes, transformTargetAlignment, dbHeroes, ownedExpansions)
    ), [dbHeroes, ownedExpansions, selectedHeroes, transformTargetAlignment]);

    const transformAvailabilityByHeroId = useMemo(() => {
        const availability = new Map<string, ReturnType<typeof getHeroTransformAvailability>>();
        availableHeroes.forEach((hero) => {
            availability.set(
                hero.id,
                getHeroTransformAvailability(hero, transformTargetAlignment, dbHeroes, ownedExpansions)
            );
        });
        return availability;
    }, [availableHeroes, dbHeroes, ownedExpansions, transformTargetAlignment]);

    const isBlockedHero = (hero: Hero) => blockedAliases.some((alias) => hero.alias.toUpperCase().startsWith(alias));

    const toggleHero = (hero: Hero) => {
        if (isBlockedHero(hero)) return;

        const isSelected = selectedHeroes.some(h => h.id === hero.id);
        if (isSelected) {
            setSelectedHeroes(prev => prev.filter(h => h.id !== hero.id));
            return;
        }

        if (selectedHeroes.length >= 6) return;
        setSelectedHeroes(prev => [...prev, hero]);
    };

    const handleConfirm = () => {
        if (selectedHeroes.length === 0) {
            alert(language === 'es' ? 'Debes elegir al menos un agente.' : 'You must choose at least one agent.');
            return;
        }

        if (!hasTransformRuleAvailable) {
            alert(
                language === 'es'
                    ? 'Con las expansiones elegidas no tienes ninguna pareja valida para la regla de cura / infeccion. Puedes seguir jugando, pero esa regla quedara desactivada.'
                    : 'With the selected expansions you have no valid cure / infection pair. You can keep playing, but that rule will stay disabled.'
            );
        }

        onConfirm([...selectedHeroes]);
    };

    return (
        <div className="fixed inset-0 z-[80] flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-mono">
            {viewingSheet && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-fade-in"
                    onClick={() => setViewingSheet(null)}
                >
                    <div className="relative flex h-full w-full flex-col items-center justify-center">
                        <img
                            src={viewingSheet}
                            alt="Tactical Sheet"
                            className="h-[85vh] w-auto max-w-[95vw] rounded-xl border-4 border-yellow-500 bg-black object-contain shadow-[0_0_50px_rgba(234,179,8,0.5)]"
                            onClick={(e) => e.stopPropagation()}
                            referrerPolicy="no-referrer"
                        />
                        <button
                            onClick={() => setViewingSheet(null)}
                            className="mt-4 rounded border border-red-600 bg-red-900/80 px-8 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-red-800"
                        >
                            {language === 'es' ? 'CERRAR' : 'CLOSE'}
                        </button>
                    </div>
                </div>
            )}

            <div className="z-20 flex h-16 flex-none items-center justify-between border-b border-slate-800 bg-slate-900 px-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-xl font-bold text-gray-400 hover:text-white">
                        {'<'}
                    </button>
                    <h2 className={`text-xl font-black uppercase tracking-[0.2em] ${textColor}`}>
                        {language === 'es' ? 'RECLUTAMIENTO TACTICO' : 'TACTICAL RECRUITMENT'}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={language === 'es' ? 'BUSCAR AGENTE...' : 'SEARCH AGENT...'}
                            className="w-full rounded-sm border border-slate-700 bg-slate-950 p-2 pl-8 text-xs text-white outline-none focus:border-cyan-500"
                        />
                        <span className="absolute left-2 top-2 text-xs text-gray-500">Q</span>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={selectedHeroes.length === 0}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${selectedHeroes.length > 0 ? `${bgColor} text-white shadow-lg hover:brightness-110` : 'cursor-not-allowed bg-slate-800 text-gray-500'}`}
                    >
                        {language === 'es' ? `CONFIRMAR (${selectedHeroes.length})` : `CONFIRM (${selectedHeroes.length})`}
                    </button>
                </div>
            </div>

            <div className="relative flex flex-1 overflow-hidden">
                <div className="flex min-w-[250px] w-1/5 flex-col border-r border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">ARSENAL (EXPANSIONES)</h3>
                        <div className="flex gap-1">
                            <button onClick={() => onToggleAllExpansions(true)} className="px-1 text-[9px] text-cyan-500 hover:text-white">ALL</button>
                            <span className="text-gray-600">|</span>
                            <button onClick={() => onToggleAllExpansions(false)} className="px-1 text-[9px] text-gray-500 hover:text-white">NONE</button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {GAME_EXPANSIONS.map(exp => {
                            const isOwned = ownedExpansions.has(exp.id);

                            return (
                                <div
                                    key={exp.id}
                                    onClick={() => onToggleExpansion(exp.id)}
                                    className={`flex cursor-pointer items-center gap-3 border-l-2 p-3 transition-all ${isOwned ? `bg-slate-800 ${isZombie ? 'border-lime-500' : 'border-cyan-500'}` : 'border-transparent bg-transparent hover:bg-slate-800/50'}`}
                                >
                                    <div className={`flex h-4 w-4 items-center justify-center border ${isOwned ? `${isZombie ? 'border-lime-500 bg-lime-600' : 'border-cyan-500 bg-cyan-600'} text-black` : 'border-slate-600'}`}>
                                        {isOwned && <span className="text-[10px] font-bold">OK</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isOwned ? 'text-white' : 'text-gray-500'}`}>{exp.name}</span>
                                </div>
                            );
                        })}

                        <div className="flex cursor-default items-center gap-3 border-l-2 border-purple-500 bg-slate-800/30 p-3 opacity-80">
                            <div className="flex h-4 w-4 items-center justify-center bg-purple-600 text-[10px] font-bold text-black">OK</div>
                            <span className="text-[10px] font-bold uppercase text-purple-300">CUSTOM DATABASE</span>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-1 flex-col overflow-hidden bg-slate-950">
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-3">
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>AGENTES DISPONIBLES ({availableHeroes.length})</h3>
                        <div className="text-[10px] text-gray-500">
                            {language === 'es' ? 'ELIGE TU EQUIPO. MAGNETO, DOOM Y KINGPIN NO ESTAN DISPONIBLES.' : 'CHOOSE YOUR TEAM. MAGNETO, DOOM AND KINGPIN ARE UNAVAILABLE.'}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700">
                        {loadingDb ? (
                            <div className="flex h-full flex-col items-center justify-center animate-pulse text-gray-500">
                                <div className="mb-2 text-2xl">...</div>
                                <div className="text-xs tracking-widest">{language === 'es' ? 'CARGANDO AGENTES...' : 'LOADING AGENTS...'}</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {availableHeroes.map(hero => {
                                    const isSelected = selectedHeroes.some(h => h.id === hero.id);
                                    const isBlocked = isBlockedHero(hero);
                                    const transformAvailability = transformAvailabilityByHeroId.get(hero.id);
                                    const isMissingPair = !!transformAvailability && !transformAvailability.allowed;
                                    const isDisabled = isBlocked || isMissingPair || (!isSelected && selectedHeroes.length >= 6);
                                    const imgStyle = hero.imageParams ? {
                                        transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
                                    } : {};

                                    return (
                                        <div
                                            key={hero.id}
                                            onClick={() => !isDisabled && toggleHero(hero)}
                                            className={`
                                                relative aspect-[3/4] cursor-pointer overflow-hidden border transition-all duration-200
                                                ${isBlocked
                                                    ? 'cursor-not-allowed border-slate-800 opacity-35 grayscale'
                                                    : isSelected
                                                    ? `${borderColor} ring-2 ring-offset-2 ring-offset-slate-950 ${isZombie ? 'ring-lime-500/50' : 'ring-cyan-500/50'}`
                                                    : isDisabled
                                                        ? 'cursor-not-allowed border-slate-800 opacity-30 grayscale'
                                                        : 'border-slate-700 hover:z-10 hover:scale-[1.02] hover:border-white hover:shadow-xl'
                                                }
                                            `}
                                        >
                                            <div className="absolute inset-0 overflow-hidden">
                                                <img
                                                    src={hero.imageUrl}
                                                    alt={hero.alias}
                                                    className="h-full w-full object-cover"
                                                    style={imgStyle}
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
                                            {isBlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/55 pointer-events-none">
                                                    <span className="border border-slate-500 bg-slate-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                                        {language === 'es' ? 'BLOQUEADO' : 'LOCKED'}
                                                    </span>
                                                </div>
                                            )}
                                            {!isBlocked && isMissingPair && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                                                    <span className="border border-amber-500/70 bg-slate-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                                                        {language === 'es' ? 'SIN PAREJA' : 'NO PAIR'}
                                                    </span>
                                                </div>
                                            )}

                                            {hero.characterSheetUrl && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingSheet(hero.characterSheetUrl!);
                                                    }}
                                                    className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-sm border border-yellow-300 bg-yellow-600 text-black shadow-lg transition-transform hover:scale-110 hover:bg-yellow-400"
                                                    title={language === 'es' ? 'Ver ficha' : 'View sheet'}
                                                >
                                                    i
                                                </button>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
                                                <div className={`truncate text-[10px] font-black uppercase ${isSelected ? textColor : 'text-white'}`}>{hero.alias}</div>
                                                <div className="font-mono text-[8px] text-gray-400">{hero.class}</div>
                                            </div>

                                            {isSelected && (
                                                <div className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center ${bgColor} text-[10px] font-bold text-black shadow-lg`}>
                                                    OK
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex min-w-[200px] w-1/5 flex-col border-l border-slate-800 bg-slate-900">
                    <div className={`border-b border-slate-800 p-4 ${selectedHeroes.length === 6 ? 'bg-red-900/20' : 'bg-slate-950'}`}>
                        <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                            {language === 'es' ? 'EQUIPO ACTIVO' : 'ACTIVE SQUAD'}
                        </h3>
                        <div className={`text-2xl font-black ${selectedHeroes.length === 6 ? 'animate-pulse text-red-500' : textColor}`}>
                            {selectedHeroes.length} / 6
                        </div>
                        <div className="mt-1 text-[10px] text-gray-500">
                            {language === 'es'
                                ? 'Elige manualmente entre 1 y 6 personajes.'
                                : 'Choose manually between 1 and 6 characters.'}
                        </div>
                        {selectedHeroes.length > 0 && !hasTransformRuleAvailable && (
                            <div className="mt-3 border border-amber-700 bg-amber-950/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                                {language === 'es'
                                    ? 'Sin pares validos para la regla de cura / infeccion.'
                                    : 'No valid pairs for the cure / infection rule.'}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-700">
                        {[...Array(6)].map((_, i) => {
                            const hero = selectedHeroes[i];
                            const imgStyle = hero?.imageParams ? {
                                transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
                            } : {};

                            return (
                                <div
                                    key={i}
                                    className={`
                                        relative flex h-20 items-center justify-center border transition-all
                                        ${hero ? `${borderColor} group cursor-pointer bg-slate-800` : 'border-dashed border-slate-800 bg-slate-950/50'}
                                    `}
                                    onClick={() => hero && toggleHero(hero)}
                                >
                                    {hero ? (
                                        <>
                                            <div className="absolute inset-0 flex">
                                                <div className="relative h-full w-20 shrink-0 overflow-hidden">
                                                    <img
                                                        src={hero.imageUrl}
                                                        className="h-full w-full object-cover"
                                                        alt=""
                                                        style={imgStyle}
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-800 pointer-events-none" />
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col justify-center p-2">
                                                    <div className={`truncate text-[10px] font-bold ${textColor}`}>{hero.alias}</div>
                                                    <div className="text-[8px] text-gray-500">{hero.class}</div>
                                                </div>
                                            </div>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md">X</div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="select-none text-2xl font-black text-slate-700">{i + 1}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-slate-800 bg-slate-950 p-4">
                        <button
                            onClick={handleConfirm}
                            disabled={selectedHeroes.length === 0}
                            className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all ${selectedHeroes.length > 0 ? `${bgColor} text-white hover:brightness-110` : 'cursor-not-allowed bg-slate-800 text-gray-600'}`}
                        >
                            {language === 'es' ? `SEGUIR CON ${selectedHeroes.length}` : `CONTINUE WITH ${selectedHeroes.length}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
