import React, { useState, useMemo } from 'react';
import { HeroTemplate, Hero } from '../types';
import { translations, Language } from '../translations';

interface RecruitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRecruit: (hero: Hero) => void;
    templates: HeroTemplate[];
    existingHeroIds: Set<string>; // <--- NUEVO: Para evitar duplicados
    language: Language;
    playerAlignment: 'ALIVE' | 'ZOMBIE' | null;
}

export const RecruitModal: React.FC<RecruitModalProps> = ({ 
    isOpen, onClose, onRecruit, templates, existingHeroIds, language, playerAlignment 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState<'RECRUIT' | 'CAPTURE'>('RECRUIT'); // <--- NUEVO: Modo
    const t = translations[language].recruit;

    // Determinar colores según el bando y el modo
    const isZombiePlayer = playerAlignment === 'ZOMBIE';
    
    // Lógica de filtrado
    const filteredTemplates = useMemo(() => {
        return templates.filter(temp => {
            // 1. Filtro de búsqueda de texto
            const matchesSearch = temp.alias.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  temp.defaultName.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 2. Filtro de duplicados (si ya lo tienes, no sale)
            const isAlreadyOwned = existingHeroIds.has(temp.id);

            // 3. Filtro de Alineación según el modo
            let matchesAlignment = true;
            if (playerAlignment) {
                if (mode === 'RECRUIT') {
                    // Buscas gente de tu mismo bando
                    matchesAlignment = temp.defaultAlignment === playerAlignment;
                } else {
                    // CAPTURE: Buscas gente del bando contrario
                    matchesAlignment = temp.defaultAlignment !== playerAlignment;
                }
            }

            return matchesSearch && !isAlreadyOwned && matchesAlignment;
        });
    }, [templates, searchTerm, playerAlignment, existingHeroIds, mode]);

    const handleActionClick = (template: HeroTemplate) => {
        // Si estamos en modo CAPTURE, el estado inicial es CAPTURED, si no AVAILABLE
        const initialStatus = mode === 'CAPTURE' ? 'CAPTURED' : 'AVAILABLE';

        const newHero: Hero = {
            id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            templateId: template.id,
            name: template.defaultName,
            alias: template.alias,
            class: template.defaultClass,
            stats: template.defaultStats,
            imageUrl: template.imageUrl,
            bio: template.bio || '',
            status: initialStatus, // <--- Estado dinámico
            assignedMissionId: null,
            objectives: template.objectives || [],
            completedObjectiveIndices: [],
            currentStory: template.currentStory || ''
        };

        onRecruit(newHero);
        // No cerramos automáticamente para permitir reclutar varios seguidos si se quiere, 
        // o puedes descomentar onClose() si prefieres cerrar.
        // onClose(); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-4xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col max-h-[85vh] overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-cyan-300 font-black tracking-[0.2em] uppercase text-xl">
                            {t.title} // CEREBRO
                        </h3>
                        <p className="text-[10px] text-cyan-400 font-mono">
                            {isZombiePlayer ? 'BUSCANDO BIOMASA...' : 'BUSCANDO ACTIVOS...'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white font-bold text-2xl">✕</button>
                </div>

                {/* TABS DE MODO (RECLUTAR vs CAPTURAR) */}
                <div className="flex border-b border-cyan-900 bg-slate-950">
                    <button 
                        onClick={() => setMode('RECRUIT')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all border-r border-cyan-900
                            ${mode === 'RECRUIT' 
                                ? (isZombiePlayer ? 'bg-lime-900/40 text-lime-400' : 'bg-cyan-900/40 text-cyan-400') 
                                : 'text-gray-500 hover:text-white hover:bg-slate-800'}
                        `}
                    >
                        {isZombiePlayer ? 'EXTENDER LA COLMENA (ALIADOS)' : 'RECLUTAR AGENTES (ALIADOS)'}
                    </button>
                    <button 
                        onClick={() => setMode('CAPTURE')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all
                            ${mode === 'CAPTURE' 
                                ? 'bg-red-900/40 text-red-400' 
                                : 'text-gray-500 hover:text-white hover:bg-slate-800'}
                        `}
                    >
                        {isZombiePlayer ? 'CAZAR COMIDA (HUMANOS)' : 'CAPTURAR ZOMBIES (ENEMIGOS)'}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-slate-950 border-b border-cyan-900">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={language === 'es' ? "BUSCAR POR NOMBRE O ALIAS..." : "SEARCH BY NAME OR ALIAS..."}
                            className="w-full bg-slate-900 border border-cyan-700 p-3 pl-10 text-cyan-100 focus:border-cyan-400 outline-none font-mono uppercase"
                            autoFocus
                        />
                        <span className="absolute left-3 top-3 text-cyan-600">🔍</span>
                    </div>
                </div>

                {/* Grid de Resultados */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-cyan-900 bg-slate-950">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map(template => (
                            <div 
                                key={template.id} 
                                onClick={() => handleActionClick(template)}
                                className={`group relative border bg-slate-900/50 transition-all cursor-pointer flex gap-3 p-2 overflow-hidden
                                    ${mode === 'RECRUIT' 
                                        ? 'border-cyan-900 hover:bg-cyan-900/20 hover:border-cyan-500' 
                                        : 'border-red-900 hover:bg-red-900/20 hover:border-red-500'}
                                `}
                            >
                                {/* Imagen */}
                                <div className="w-16 h-16 shrink-0 border border-slate-700 group-hover:border-white overflow-hidden bg-black">
                                    <img src={template.imageUrl} alt={template.alias} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                {/* Info */}
                                <div className="flex flex-col justify-center min-w-0">
                                    <div className={`text-xs font-black truncate group-hover:text-white ${mode === 'RECRUIT' ? 'text-cyan-400' : 'text-red-400'}`}>
                                        {template.alias}
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-mono truncate">{template.defaultName}</div>
                                    <div className="mt-1 inline-block px-1.5 py-0.5 bg-slate-800 text-[8px] text-gray-400 border border-slate-700 uppercase font-bold w-fit">
                                        {template.defaultClass}
                                    </div>
                                </div>

                                {/* Botón Hover */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className={`w-8 h-8 flex items-center justify-center text-black font-bold text-lg shadow-lg ${mode === 'RECRUIT' ? 'bg-cyan-600' : 'bg-red-600'}`}>
                                        {mode === 'RECRUIT' ? '+' : '⛓'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {filteredTemplates.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-600 font-mono flex flex-col items-center gap-2">
                                <span className="text-2xl">∅</span>
                                <span>NO SE ENCONTRARON REGISTROS.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};