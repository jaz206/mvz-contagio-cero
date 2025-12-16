import React from 'react';
import { GAME_EXPANSIONS } from '../data/gameContent';
import { Language } from '../translations';

interface ExpansionConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedExpansions: Set<string>;
    onToggle: (id: string) => void;
    onToggleAll: (select: boolean) => void;
    language: Language;
}

export const ExpansionConfigModal: React.FC<ExpansionConfigModalProps> = ({ 
    isOpen, onClose, ownedExpansions, onToggle, onToggleAll, language 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-cyan-300 font-bold tracking-widest uppercase text-lg">
                            {language === 'es' ? 'CONFIGURACIÓN TÁCTICA' : 'TACTICAL CONFIG'}
                        </h3>
                        <p className="text-[10px] text-cyan-400">
                            {language === 'es' ? 'SELECCIONA LAS EXPANSIONES DISPONIBLES' : 'SELECT AVAILABLE EXPANSIONS'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white font-bold text-xl">✕</button>
                </div>

                {/* Toolbar */}
                <div className="p-3 bg-slate-950 border-b border-cyan-900 flex gap-3 justify-end">
                    <button 
                        onClick={() => onToggleAll(true)}
                        className="text-[10px] bg-cyan-900/30 hover:bg-cyan-800 text-cyan-300 px-3 py-1 border border-cyan-700 rounded"
                    >
                        {language === 'es' ? 'MARCAR TODO' : 'SELECT ALL'}
                    </button>
                    <button 
                        onClick={() => onToggleAll(false)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-gray-400 px-3 py-1 border border-slate-600 rounded"
                    >
                        {language === 'es' ? 'DESMARCAR TODO' : 'DESELECT ALL'}
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-cyan-900">
                    {GAME_EXPANSIONS.map(exp => {
                        const isOwned = ownedExpansions.has(exp.id);
                        return (
                            <div 
                                key={exp.id} 
                                onClick={() => onToggle(exp.id)}
                                className={`
                                    flex items-center gap-3 p-3 border cursor-pointer transition-all
                                    ${isOwned 
                                        ? 'bg-cyan-900/20 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' 
                                        : 'bg-slate-950 border-slate-700 opacity-60 hover:opacity-100'}
                                `}
                            >
                                <div className={`
                                    w-5 h-5 border flex items-center justify-center transition-colors
                                    ${isOwned ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-slate-900 border-slate-600'}
                                `}>
                                    {isOwned && '✓'}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isOwned ? 'text-white' : 'text-gray-500'}`}>
                                    {exp.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-cyan-800 bg-slate-900 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                        {language === 'es' ? 'CONFIRMAR' : 'CONFIRM'}
                    </button>
                </div>
            </div>
        </div>
    );
};