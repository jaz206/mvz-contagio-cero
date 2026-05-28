import React, { useMemo, useState } from 'react';
import { Hero, HeroTemplate } from '../types';
import { translations, Language } from '../translations';
import { isStoryLockedAlias } from '../services/storyLockService';

interface RecruitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecruit: (hero: Hero) => void;
    templates: HeroTemplate[];
    existingAliases: Set<string>;
    language: Language;
    playerAlignment: 'ALIVE' | 'ZOMBIE' | null;
}

const normalizeAlias = (alias: string) => {
    return alias.toLowerCase()
        .replace(/\(z\)/g, '')
        .replace(/\(zombie\)/g, '')
        .replace(/\(artist\)/g, '')
        .replace(/\(old man\)/g, '')
        .trim();
};

export const RecruitModal: React.FC<RecruitModalProps> = ({
    isOpen, onClose, onRecruit, templates, existingAliases, language, playerAlignment
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState<'RECRUIT' | 'CAPTURE'>('RECRUIT');
    const t = translations[language].recruit;
    const isZombiePlayer = playerAlignment === 'ZOMBIE';

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => {
            const matchesSearch = template.alias.toLowerCase().includes(searchTerm.toLowerCase())
                || template.defaultName.toLowerCase().includes(searchTerm.toLowerCase());

            const cleanCandidateAlias = normalizeAlias(template.alias);
            const isAlreadyOwned = existingAliases.has(cleanCandidateAlias);

            let matchesAlignment = true;
            if (playerAlignment) {
                matchesAlignment = mode === 'RECRUIT'
                    ? template.defaultAlignment === playerAlignment
                    : template.defaultAlignment !== playerAlignment;
            }

            return matchesSearch && !isAlreadyOwned && matchesAlignment;
        });
    }, [templates, searchTerm, playerAlignment, existingAliases, mode]);

    const handleActionClick = (template: HeroTemplate) => {
        const initialStatus = mode === 'CAPTURE' ? 'CAPTURED' : 'AVAILABLE';

        const newHero: Hero = {
            id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            templateId: template.id,
            name: template.defaultName,
            alias: template.alias,
            class: template.defaultClass,
            stats: template.defaultStats,
            imageUrl: template.imageUrl,
            characterSheetUrl: template.characterSheetUrl,
            bio: template.bio || '',
            status: initialStatus,
            assignedMissionId: null,
            objectives: template.objectives || [],
            completedObjectiveIndices: [],
            currentStory: template.currentStory || '',
            relatedHeroId: template.relatedHeroId,
            imageParams: template.imageParams,
            expansionId: template.expansionId,
            playableSheets: template.playableSheets
        };

        onRecruit(newHero);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border-2 border-cyan-500 bg-slate-900 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                <div className="flex items-center justify-between border-b border-cyan-600 bg-cyan-900/40 p-4 shrink-0">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-cyan-300">
                            {t.title} // CEREBRO
                        </h3>
                        <p className="font-mono text-[10px] text-cyan-400">
                            {isZombiePlayer ? 'BUSCANDO BIOMASA...' : 'BUSCANDO ACTIVOS...'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-2xl font-bold text-cyan-500 hover:text-white">X</button>
                </div>

                <div className="flex border-b border-cyan-900 bg-slate-950">
                    <button
                        onClick={() => setMode('RECRUIT')}
                        className={`flex-1 border-r border-cyan-900 py-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'RECRUIT'
                            ? (isZombiePlayer ? 'bg-lime-900/40 text-lime-400' : 'bg-cyan-900/40 text-cyan-400')
                            : 'text-gray-500 hover:bg-slate-800 hover:text-white'}`}
                    >
                        {isZombiePlayer ? 'EXTENDER LA COLMENA (ALIADOS)' : 'RECLUTAR AGENTES (ALIADOS)'}
                    </button>
                    <button
                        onClick={() => setMode('CAPTURE')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'CAPTURE'
                            ? 'bg-red-900/40 text-red-400'
                            : 'text-gray-500 hover:bg-slate-800 hover:text-white'}`}
                    >
                        {isZombiePlayer ? 'CAZAR COMIDA (HUMANOS)' : 'CAPTURAR ZOMBIES (ENEMIGOS)'}
                    </button>
                </div>

                <div className="border-b border-cyan-900 bg-slate-950 p-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={language === 'es' ? 'BUSCAR POR NOMBRE O ALIAS...' : 'SEARCH BY NAME OR ALIAS...'}
                            className="w-full border border-cyan-700 bg-slate-900 p-3 pl-10 font-mono uppercase text-cyan-100 outline-none focus:border-cyan-400"
                            autoFocus
                        />
                        <span className="absolute left-3 top-3 text-cyan-600">Q</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-950 p-4 scrollbar-thin scrollbar-thumb-cyan-900">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template) => {
                            const imgStyle = template.imageParams ? {
                                transform: `scale(${template.imageParams.scale}) translate(${template.imageParams.x}%, ${template.imageParams.y}%)`
                            } : {};
                            const isBlocked = isStoryLockedAlias(template.alias);

                            return (
                                <div
                                    key={template.id}
                                    onClick={() => {
                                        if (isBlocked) return;
                                        handleActionClick(template);
                                    }}
                                    className={`group relative flex gap-3 overflow-hidden border bg-slate-900/50 p-2 transition-all ${isBlocked
                                        ? 'cursor-not-allowed border-slate-800 opacity-40 grayscale'
                                        : `cursor-pointer ${mode === 'RECRUIT'
                                            ? 'border-cyan-900 hover:border-cyan-500 hover:bg-cyan-900/20'
                                            : 'border-red-900 hover:border-red-500 hover:bg-red-900/20'}`}`}
                                >
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-slate-700 bg-black group-hover:border-white">
                                        <img
                                            src={template.imageUrl}
                                            alt={template.alias}
                                            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                                            style={imgStyle}
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>

                                    <div className="flex min-w-0 flex-col justify-center">
                                        <div className={`truncate text-xs font-black ${mode === 'RECRUIT' ? 'text-cyan-400' : 'text-red-400'} group-hover:text-white`}>
                                            {template.alias}
                                        </div>
                                        <div className="truncate font-mono text-[9px] text-gray-500">{template.defaultName}</div>
                                        <div className="mt-1 inline-block w-fit border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[8px] font-bold uppercase text-gray-400">
                                            {template.defaultClass}
                                        </div>
                                    </div>

                                    {isBlocked ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 pointer-events-none">
                                            <span className="border border-slate-500 bg-slate-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                                {language === 'es' ? 'BLOQUEADO' : 'LOCKED'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className={`flex h-8 w-8 items-center justify-center text-lg font-bold text-black shadow-lg ${mode === 'RECRUIT' ? 'bg-cyan-600' : 'bg-red-600'}`}>
                                                {mode === 'RECRUIT' ? '+' : '!'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {filteredTemplates.length === 0 && (
                            <div className="col-span-full flex flex-col items-center gap-2 py-10 text-center font-mono text-gray-600">
                                <span className="text-2xl">O</span>
                                <span>NO SE ENCONTRARON REGISTROS COMPATIBLES O YA POSEES ESTE AGENTE.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
