import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface StoryModeProps {
    language: Language;
    onComplete: (choice: 'ALIVE' | 'ZOMBIE') => void;
    onSkip: () => void;
    startAtChoice?: boolean;
}

export const StoryMode: React.FC<StoryModeProps> = ({ language, onComplete, startAtChoice = false }) => {
    const t = translations[language].story;
    const slides = t.slides;

    const [currentIndex, setCurrentIndex] = useState(startAtChoice ? slides.length : 0);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [pageTurn, setPageTurn] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [selection, setSelection] = useState<'ALIVE' | 'ZOMBIE' | null>(null);

    const isChoiceScreen = currentIndex >= slides.length;

    useEffect(() => {
        const timer = setTimeout(() => setIsFolderOpen(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleSkipToChoice = () => {
        setCurrentIndex(slides.length);
    };

    const handleNext = () => {
        if (isAnimating || isChoiceScreen) return;

        setIsAnimating(true);
        setPageTurn('turning-next');

        setTimeout(() => {
            setCurrentIndex(prev => {
                const next = prev + 1;
                return next > slides.length ? slides.length : next;
            });
            setPageTurn('');
            setIsAnimating(false);
        }, 600);
    };

    const handlePrev = () => {
        if (isAnimating || currentIndex === 0) return;

        setIsAnimating(true);
        setPageTurn('turning-prev');

        setTimeout(() => {
            setCurrentIndex(prev => Math.max(0, prev - 1));
            setPageTurn('');
            setIsAnimating(false);
        }, 600);
    };

    const handleChoice = (choice: 'ALIVE' | 'ZOMBIE') => {
        if (selection) return;
        setSelection(choice);
        setTimeout(() => {
            onComplete(choice);
        }, 2000);
    };

    const renderContent = () => {
        // --- PANTALLA DE SELECCIÓN REDISEÑADA ---
        if (isChoiceScreen) {
            return (
                <div className="fixed inset-0 z-[70] bg-slate-950 flex flex-col font-mono overflow-hidden">
                    {/* Fondo de rejilla táctica */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(0deg,transparent_24%,rgba(6,182,212,0.3)_25%,rgba(6,182,212,0.3)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.3)_75%,rgba(6,182,212,0.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(6,182,212,0.3)_25%,rgba(6,182,212,0.3)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.3)_75%,rgba(6,182,212,0.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>

                    {/* Header */}
                    <div className="relative z-10 text-center pt-12 pb-6">
                        <h2 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {t.choose}
                        </h2>
                        <div className="w-64 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-4"></div>
                        <p className="text-cyan-500 text-xs mt-2 tracking-widest animate-pulse">SYSTEM OVERRIDE REQUIRED</p>
                    </div>

                    {/* Contenedor Dividido */}
                    <div className="flex-1 flex flex-col md:flex-row relative z-10">

                        {/* OPCIÓN: HÉROES (ALIVE) */}
                        <div
                            className={`flex-1 relative group cursor-pointer transition-all duration-700 border-r border-slate-800 overflow-hidden
                              ${selection === 'ZOMBIE' ? 'opacity-20 grayscale pointer-events-none' : ''}
                              ${selection === 'ALIVE' ? 'flex-[2] bg-cyan-950/30' : 'hover:flex-[1.5] hover:bg-cyan-900/10'}
                          `}
                            onClick={() => handleChoice('ALIVE')}
                        >
                            {/* Imagen de fondo sutil */}
                            <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 mix-blend-luminosity">
                                <img src="https://i.pinimg.com/736x/43/45/8b/43458b29272370723226334336066223.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                {/* LOGO SHIELD */}
                                <div className="w-24 h-24 rounded-full border-2 border-cyan-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-300 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                                    <img
                                        src="https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg"
                                        alt="SHIELD Logo"
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <h3 className="text-3xl font-black text-cyan-400 tracking-widest uppercase mb-2 group-hover:text-white transition-colors">S.H.I.E.L.D.</h3>
                                <p className="text-cyan-200/70 font-mono text-sm max-w-sm">"Salva lo que queda. Protege a los inocentes. Restaura el orden."</p>

                                <div className={`mt-8 px-8 py-3 border border-cyan-500 text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase transition-all duration-300 ${selection === 'ALIVE' ? 'bg-cyan-500 text-black scale-110' : 'group-hover:bg-cyan-500/20'}`}>
                                    {selection === 'ALIVE' ? 'ACCESS GRANTED' : 'INITIATE PROTOCOL'}
                                </div>
                            </div>
                        </div>

                        {/* Separador Central (Rayo) */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 z-20">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 border border-slate-700 rotate-45 flex items-center justify-center">
                                <span className="text-xs text-gray-500 -rotate-45 font-bold">VS</span>
                            </div>
                        </div>

                        {/* OPCIÓN: ZOMBIES (THE HUNGER) */}
                        <div
                            className={`flex-1 relative group cursor-pointer transition-all duration-700 border-l border-slate-800 overflow-hidden
                              ${selection === 'ALIVE' ? 'opacity-20 grayscale pointer-events-none' : ''}
                              ${selection === 'ZOMBIE' ? 'flex-[2] bg-lime-950/30' : 'hover:flex-[1.5] hover:bg-lime-900/10'}
                          `}
                            onClick={() => handleChoice('ZOMBIE')}
                        >
                            {/* Imagen de fondo sutil (ZOMBIE) */}
                            <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 mix-blend-luminosity">
                                <img src="https://ca-times.brightspotcdn.com/f2/8c/dc0c619b48c1871a27e77b6131f4/marvel-zombies-01.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                {/* LOGO ZOMBIE (CORREGIDO) */}
                                <div className="w-24 h-24 rounded-full border-2 border-lime-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(101,163,13,0.4)] group-hover:scale-110 transition-transform duration-300 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                                    <img
                                        src="https://i.pinimg.com/736x/7b/e8/d2/7be8d2f25242523d131ff8d81b1385fc.jpg"
                                        alt="Zombie Logo"
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <h3 className="text-3xl font-black text-lime-500 tracking-widest uppercase mb-2 group-hover:text-white transition-colors">THE HUNGER</h3>
                                <p className="text-lime-200/70 font-mono text-sm max-w-sm">"Consume todo. Expande la plaga. Evoluciona."</p>

                                <div className={`mt-8 px-8 py-3 border border-lime-600 text-lime-500 text-xs font-bold tracking-[0.3em] uppercase transition-all duration-300 ${selection === 'ZOMBIE' ? 'bg-lime-600 text-black scale-110' : 'group-hover:bg-lime-600/20'}`}>
                                    {selection === 'ZOMBIE' ? 'VIRUS RELEASED' : 'UNLEASH PATHOGEN'}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

        // --- PANTALLA DE HISTORIA (CARPETA) ---
        const slide = slides[currentIndex];
        if (!slide) return null;

        const rotation = currentIndex % 2 === 0 ? '-rotate-2' : 'rotate-1';

        return (
            <div className="flex flex-col md:flex-row h-full w-full bg-white shadow-inner">

                {/* IZQUIERDA: FOTO */}
                <div className="w-full md:w-[55%] h-1/2 md:h-full relative bg-[#2d3748] border-r border-slate-400 flex items-center justify-center overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
                    <div className={`relative bg-white p-3 pb-8 shadow-2xl transform transition-all duration-500 ease-out hover:rotate-0 hover:scale-105 cursor-zoom-in group ${rotation} max-w-[85%] max-h-[85%] flex flex-col`}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-16 rounded-full border-4 border-gray-300 z-20 shadow-md bg-transparent pointer-events-none"></div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-[#2d3748] z-10 pointer-events-none"></div>
                        <div className="relative overflow-hidden border border-gray-200 bg-black">
                            <img src={slide.image} alt="Evidence" className="w-full h-full object-contain max-h-[60vh]" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
                        </div>
                        <div className="mt-3 flex justify-between items-end px-2">
                            <div className="font-mono text-[10px] text-gray-500">FIG. {currentIndex + 1}A</div>
                            <div className="font-handwriting text-sm text-blue-900 rotate-[-1deg]" style={{ fontFamily: '"Courier New", monospace' }}>Evidence #{1024 + currentIndex}</div>
                        </div>
                    </div>
                </div>

                {/* DERECHA: INFORME */}
                <div className="w-full md:w-[45%] h-1/2 md:h-full p-6 md:p-10 flex flex-col bg-[#fdfbf7] relative">
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 2rem' }}></div>
                    <div className="relative z-10 flex-1 overflow-y-auto pr-2">
                        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2 mb-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Report</h4>
                                <h2 className="text-xl font-black text-slate-900 font-mono">FILE #{1024 + currentIndex}</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-mono text-slate-400">DATE: 2025-10-31</div>
                                <div className="text-xs font-bold text-red-700 border-2 border-red-700 px-1 inline-block mt-1 rotate-[-2deg] opacity-80">TOP SECRET</div>
                            </div>
                        </div>
                        <div className="font-mono text-sm md:text-base text-slate-900 leading-relaxed space-y-4 text-justify font-medium">
                            {slide.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between items-center">
                        <div className="text-[10px] font-bold text-slate-400 tracking-widest">S.H.I.E.L.D. ARCHIVES // DO NOT COPY</div>
                        <div className="text-xs font-mono text-slate-500">PG. {currentIndex + 1}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#0f172a] flex items-center justify-center perspective-[1500px] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {!isChoiceScreen && (
                <button
                    onClick={handleSkipToChoice}
                    className="absolute top-8 right-8 z-50 text-cyan-500 text-xs font-bold tracking-[0.2em] hover:text-white transition-colors border border-cyan-900 px-4 py-2 bg-slate-900/80 backdrop-blur"
                >
                    SKIP INTRO &gt;&gt;
                </button>
            )}

            {!isChoiceScreen && (
                <div className={`relative w-[95%] h-[85%] max-w-6xl bg-[#d1d5db] shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-1000 ease-out transform-style-3d rounded-r-md border-l-8 border-slate-400 ${isFolderOpen ? 'rotate-x-0 translate-y-0 opacity-100' : 'rotate-x-20 translate-y-[100px] opacity-0'}`}>
                    <div className="absolute -top-6 left-0 w-48 h-8 bg-[#9ca3af] rounded-t-lg border-t border-x border-white/20 flex items-center px-4 shadow-inner">
                        <span className="text-[10px] font-bold text-slate-800 tracking-widest">PROJECT: LAZARUS</span>
                    </div>

                    <div className="w-full h-full bg-white relative overflow-hidden flex rounded-r-sm">
                        {renderContent()}
                        {pageTurn && <div className={`absolute inset-0 bg-black/10 z-50 transition-opacity duration-500 ${pageTurn ? 'opacity-100' : 'opacity-0'}`}></div>}
                    </div>

                    {isFolderOpen && (
                        <div className="absolute -bottom-16 w-full flex justify-center gap-4">
                            <button onClick={handlePrev} disabled={currentIndex === 0 || isAnimating} className={`w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white hover:bg-cyan-600 transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>←</button>
                            <div className="h-12 px-6 bg-slate-900/90 border border-slate-700 rounded-full flex items-center justify-center text-cyan-400 font-mono text-xs tracking-widest shadow-lg">SLIDE {currentIndex + 1} / {slides.length}</div>
                            <button onClick={handleNext} disabled={isAnimating} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white hover:bg-cyan-600 transition-all">→</button>
                        </div>
                    )}
                </div>
            )}

            {/* Renderizar la pantalla de elección fuera del contenedor de la carpeta para que ocupe todo */}
            {isChoiceScreen && renderContent()}
        </div>
    );
};